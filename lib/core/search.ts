import { TavilySearchAPIRetriever } from "@langchain/community/retrievers/tavily_search_api"
import {
    ChatPromptTemplate,
    MessagesPlaceholder,
} from "@langchain/core/prompts"
import { RunnableSequence } from "@langchain/core/runnables"
import { DynamicTool } from "@langchain/core/tools"
import { convertToOpenAIFunction } from "@langchain/core/utils/function_calling"
import { ChatOpenAI } from "@langchain/openai"
import { AgentExecutor } from "langchain/agents"
import type { FunctionsAgentAction } from "langchain/agents/openai/output_parser"
import {
    AIMessage,
    FunctionMessage,
    type AgentFinish,
    type AgentStep,
    type BaseMessage,
} from "langchain/schema"
import { z } from "zod"
import { zodToJsonSchema } from "zod-to-json-schema"

import { searchResponseSchema } from "@/lib/schemas"

const llm = new ChatOpenAI({
    model: "gpt-3.5-turbo",
})

const searchTool = new DynamicTool({
    name: "web-search-tool",
    description: "Tool for getting the latest information from the web",
    func: async (searchQuery: string, runManager) => {
        const retriever = new TavilySearchAPIRetriever()
        const docs = await retriever.invoke(searchQuery, runManager?.getChild())
        return docs.map((doc) => doc.pageContent).join("\n-----\n")
    },
})

const responseOpenAIFunction = {
    name: "response",
    description: "Return the response to the user",
    parameters: zodToJsonSchema(searchResponseSchema),
}

const prompt = ChatPromptTemplate.fromMessages([
    [
        "system",
        `You're a seasoned web researcher, adept at ferreting out information from the vast expanse of the internet. Your expertise is being enlisted to assess the veracity of a summary extracted from a YouTube video.

        The user will furnish you with a concise overview gleaned from the video in question. Your task is to formulate an effective search query to ascertain the accuracy of the summary. Your evaluation should focus on determining whether the summary is founded on genuine internet facts or mere speculation.
        `,
    ],
    ["human", "{input}"],
    new MessagesPlaceholder("agent_scratchpad"),
])

const structuredOutputParser = (
    message: AIMessage
): FunctionsAgentAction | AgentFinish => {
    if (message.content && typeof message.content !== "string") {
        throw new Error("This agent cannot parse non-string model responses.")
    }
    if (message.additional_kwargs.function_call) {
        const { function_call } = message.additional_kwargs
        try {
            const toolInput = function_call.arguments
                ? JSON.parse(function_call.arguments)
                : {}
            // If the function call name is `response` then we know it's used our final
            // response function and can return an instance of `AgentFinish`
            if (function_call.name === "response") {
                return { returnValues: { ...toolInput }, log: message.content }
            }
            return {
                tool: function_call.name,
                toolInput,
                log: `Invoking "${function_call.name}" with ${
                    function_call.arguments ?? "{}"
                }\n${message.content}`,
                messageLog: [message],
            }
        } catch (error) {
            throw new Error(
                `Failed to parse function arguments from chat model response. Text: "${function_call.arguments}". ${error}`
            )
        }
    } else {
        return {
            returnValues: { output: message.content },
            log: message.content,
        }
    }
}

const formatAgentSteps = (steps: AgentStep[]): BaseMessage[] =>
    steps.flatMap(({ action, observation }) => {
        if ("messageLog" in action && action.messageLog !== undefined) {
            const log = action.messageLog as BaseMessage[]
            return log.concat(new FunctionMessage(observation, action.tool))
        } else {
            return [new AIMessage(action.log)]
        }
    })

const llmWithTools = llm.bind({
    functions: [convertToOpenAIFunction(searchTool), responseOpenAIFunction],
})

const runnableAgent = RunnableSequence.from<{
    input: string
    steps: Array<AgentStep>
}>([
    {
        input: (i) => i.input,
        agent_scratchpad: (i) => formatAgentSteps(i.steps),
    },
    prompt,
    llmWithTools,
    structuredOutputParser,
])

export const searchUsingTavilly = async (summary: string) => {
    const executor = AgentExecutor.fromAgentAndTools({
        agent: runnableAgent,
        tools: [searchTool],
    })

    const result = await executor.invoke({
        input: summary,
    })

    return JSON.stringify(result)
}
