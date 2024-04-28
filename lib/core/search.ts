import { TavilySearchResults } from "@langchain/community/tools/tavily_search"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { ChatOpenAI } from "@langchain/openai"
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents"

const tools = [
    new TavilySearchResults({
        maxResults: 1,
    }),
]

const prompt = ChatPromptTemplate.fromMessages([
    [
        "system",
        `You're a seasoned web researcher, adept at ferreting out information from the vast expanse of the internet. Your expertise is being enlisted to assess the veracity of a summary extracted from a YouTube video.

        The user will furnish you with a concise overview gleaned from the video in question. Your task is to formulate an effective search query to ascertain the accuracy of the summary. Your evaluation should focus on determining whether the summary is founded on genuine internet facts or mere speculation.
        
        Please provide your assessment in the JSON format outlined below:
        
        {format}
        `,
    ],
    ["human", "{input}"],
    ["placeholder", "{agent_scratchpad}"],
])

const llm = new ChatOpenAI({
    model: "gpt-3.5-turbo",
    temperature: 0,
})

export const searchUsingTavilly = async (summary: string) => {
    const agent = await createOpenAIFunctionsAgent({
        llm,
        tools,
        prompt,
    })

    const agentExecutor = new AgentExecutor({
        agent,
        tools,
    })

    const result = await agentExecutor.invoke({
        format: `
            {
                "isAccurate": "true if the summary aligns with internet facts, false otherwise. (as a string)",
                "source": "the origin of the verified information (should be a url)",
                "text": "string"
            }
        `,
        input: summary,
    })

    return result.output
}
