import { env } from "@/env.mjs"
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { RunnableMap } from "@langchain/core/runnables"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { ChatGroq } from "@langchain/groq"
import { ChatOpenAI } from "@langchain/openai"
import { TokenTextSplitter } from "langchain/text_splitter"

const splitter = new TokenTextSplitter({
    encodingName: "gpt2",
    chunkSize: 5000,
    chunkOverlap: 0,
})

export const summarizeTranscriptWithGemini = async (
    transcript: string,
    model: "gemini-1.5-flash",
    videoTitle: string,
    videoAuthor: string
) => {
    const gemini = new ChatGoogleGenerativeAI({
        model: model,
        temperature: 0,
        streaming: false,
        safetySettings: [
            {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
        ],
    })

    try {
        const outputs = await splitter.createDocuments([transcript])

        const chains = outputs.map((output: { pageContent: string }) => {
            const prompt = ChatPromptTemplate.fromMessages([
                [
                    "system",
                    "You are a highly skilled AI trained in language comprehension. I would like you to read the following sub-section of a transcript from a youtube video retain the most important points, providing a coherent and readable paragraph that could help a person understand the main points of the video without needing to read the entire text or watch the video. Please avoid unnecessary details or tangential points. The output should only be in English language.",
                ],
                ["human", output.pageContent],
            ])
            return prompt.pipe(gemini)
        })

        const mapChain = RunnableMap.from(chains)
        const pointers = await mapChain.invoke({})

        if (!pointers) {
            throw new Error(
                "An Error Occurred while Processing the Sub-Sections of the transcript"
            )
        }

        const prompt = ChatPromptTemplate.fromMessages([
            [
                "system",
                "You are a highly skilled AI trained in language comprehension and summarization. I would like you to read the following array of concise description generated from sub-sections of a transcript from a youtube video entitled {title} by {author}; summarize it into a concise abstract paragraph. Aim to retain the most important points, providing a coherent and readable summary that could help a person understand the main points of the video without needing to read the entire text. Please avoid unnecessary details or tangential points and make sure to include the video's title and author in the summary. The output should only be in English language.",
            ],
            [
                "human",
                Object.values(pointers)
                    .map((m) => m.content)
                    .toString(),
            ],
        ])

        const chain = prompt.pipe(gemini)
        const res = await chain.invoke({
            title: videoTitle,
            author: videoAuthor,
        })

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

export const summarizeTranscriptWithGroq = async (
    transcript: string,
    model: "llama3-70b-8192" | "mixtral-8x7b-32768"
) => {
    const groq = new ChatGroq({
        model,
        temperature: 0,
        streaming: false,
        apiKey: env.GROQ_API_KEY,
    })

    try {
        const outputs = await splitter.createDocuments([transcript])

        const summaryPromises = outputs.map(
            async (output: { pageContent: string }) => {
                const prompt = ChatPromptTemplate.fromMessages([
                    [
                        "system",
                        "You are a highly skilled AI trained in language comprehension. I would like you to read the following sub-section of a transcript from a youtube video retain the most important points, providing a coherent and readable paragraph that could help a person understand the main points of the video without needing to read the entire text or watch the video. Please avoid unnecessary details or tangential points. The output should only be in English language.",
                    ],
                    ["human", output.pageContent],
                ])

                const chain = prompt.pipe(groq)
                const res = await chain.invoke({})
                if (!res) {
                    throw new Error(
                        "An Error Occurred while Summarizing the Sub-section of the transcript"
                    )
                }

                return res.content as string
            }
        )

        const summaries = await Promise.all(summaryPromises)
        const prompt = ChatPromptTemplate.fromMessages([
            [
                "system",
                "You are a highly skilled AI trained in language comprehension and summarization. I would like you to read the following array of concise description generated from sub-sections of a transcript from a youtube video; summarize it into a concise abstract paragraph. Aim to retain the most important points, providing a coherent and readable summary that could help a person understand the main points of the video without needing to read the entire text. Please avoid unnecessary details or tangential points. The output should only be in English language.",
            ],
            ["human", summaries.join()],
        ])

        const chain = prompt.pipe(groq)
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

export const summarizeTranscriptWithGpt = async (
    transcript: string,
    model: "gpt-3.5-turbo" | "gpt-4o"
) => {
    const gpt = new ChatOpenAI({
        model,
        temperature: 0,
    })

    try {
        const outputs = await splitter.createDocuments([transcript])

        const chains = outputs.map((output: { pageContent: string }) => {
            const prompt = ChatPromptTemplate.fromMessages([
                [
                    "system",
                    "You are a highly skilled AI trained in language comprehension. I would like you to read the following sub-section of a transcript from a youtube video retain the most important points, providing a coherent and readable paragraph that could help a person understand the main points of the video without needing to read the entire text or watch the video. Please avoid unnecessary details or tangential points. The output should only be in English language.",
                ],
                ["human", output.pageContent],
            ])
            return prompt.pipe(gpt)
        })

        const mapChain = RunnableMap.from(chains)
        const pointers = await mapChain.invoke({})

        if (!pointers) {
            throw new Error(
                "An Error Occurred while Processing the Sub-Sections of the transcript"
            )
        }

        const prompt = ChatPromptTemplate.fromMessages([
            [
                "system",
                "You are a highly skilled AI trained in language comprehension and summarization. I would like you to read the following array of concise description generated from sub-sections of a transcript from a youtube video; summarize it into a concise abstract paragraph. Aim to retain the most important points, providing a coherent and readable summary that could help a person understand the main points of the video without needing to read the entire text. Please avoid unnecessary details or tangential points. The output should only be in English language.",
            ],
            [
                "human",
                Object.values(pointers)
                    .map((m) => m.content)
                    .toString(),
            ],
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
