import { ChatPromptTemplate } from "@langchain/core/prompts"
import { ChatOpenAI } from "@langchain/openai"
import { TokenTextSplitter } from "langchain/text_splitter"

const gpt = new ChatOpenAI({
    model: "gpt-3.5-turbo",
    temperature: 0,
    streaming: false,
})

export const summarizeTranscriptWithGpt = async (transcript: string) => {
    const splitter = new TokenTextSplitter({
        encodingName: "gpt2",
        chunkSize: 500,
        chunkOverlap: 0,
    })

    try {
        const outputs = await splitter.createDocuments([transcript])
        const messages: ["human", string][] = outputs.map((output) => [
            "human",
            output.pageContent,
        ])

        const prompt = ChatPromptTemplate.fromMessages([
            [
                "system",
                "You are a highly skilled AI trained in language comprehension and summarization. I would like you to read the following transcript from a youtube video and summarize it into a concise abstract paragraph. Aim to retain the most important points, providing a coherent and readable summary that could help a person understand the main points of the video without needing to read the entire text. Please avoid unnecessary details or tangential points.",
            ],
            ...messages,
        ])

        const chain = prompt.pipe(gpt)
        const res = await chain.invoke({})

        if (!res) {
            throw new Error(
                "An Error Occurred while Summarizing the transcript."
            )
        }

        return res.content
    } catch (e) {
        console.error(e)
        return null
    }
}
