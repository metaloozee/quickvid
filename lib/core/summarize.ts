import { ChatPromptTemplate } from "@langchain/core/prompts"
import { ChatOpenAI } from "@langchain/openai"
import { config } from "dotenv"
import { TokenTextSplitter } from "langchain/text_splitter"

config({ path: ".env.local" })

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
        console.log(res)
        return res.content
    } catch (e) {
        console.error(e)
        return null
    }
}

// export const summarizeTranscript = async (transcript: string) => {
//     try {
//         const res = await gpt.chat.completions.create({
//             model: "gpt-4-turbo",
//             temperature: 0,
//             messages: [
//                 {
//                     role: "system",
//                     content:
//                         "You are a highly skilled AI trained in language comprehension and summarization. I would like you to read the following transcript from a youtube video and summarize it into a concise abstract paragraph. Aim to retain the most important points, providing a coherent and readable summary that could help a person understand the main points of the discussion without needing to read the entire text. Please avoid unnecessary details or tangential points.",
//                 },
//                 {
//                     role: "user",
//                     content: transcript,
//                 },
//             ],
//         })
//         if (!res) {
//             throw new Error(
//                 "An Error Occurred while Summarizing the transcript."
//             )
//         }

//         return res.choices[0].message.content
//     } catch (e) {
//         console.error(e)
//         return null
//     }
// }

// export const summarizeTranscriptWithGroq = async (transcript: string) => {
//     try {
//         const res = await groq.chat.completions.create({
//             messages: [
//                 {
//                     role: "system",
//                     content:
//                         "You are a highly skilled AI trained in language comprehension and summarization. I would like you to read the following transcript from a youtube video and summarize it into a concise abstract paragraph. Aim to retain the most important points, providing a coherent and readable summary that could help a person understand the main points of the discussion without needing to read the entire text. Please avoid unnecessary details or tangential points.",
//                 },
//                 {
//                     role: "user",
//                     content: transcript,
//                 },
//             ],
//             model: "mixtral-8x7b-32768",
//             stream: false,
//         })
//         if (!res) {
//             throw new Error(
//                 "An Error Occurred while Summarizing the transcript."
//             )
//         }

//         return res.choices[0].message.content
//     } catch (e) {
//         console.error(e)
//         return null
//     }
// }
