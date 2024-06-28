import { env } from "@/env.mjs"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { openai } from "@ai-sdk/openai"
import { LanguageModel, embed, generateId, streamText } from "ai"
import {
    createAI,
    createStreamableUI,
    createStreamableValue,
    getMutableAIState,
    streamUI,
} from "ai/rsc"
import { and, cosineDistance, desc, eq, gt, sql } from "drizzle-orm"
import { Loader } from "lucide-react"
import { z } from "zod"

import { db } from "@/lib/db"
import { embeddings } from "@/lib/db/schema"
import { BotMessage } from "@/components/markdown/message"
import { VideoWidget } from "@/components/video-widget"

const google = createGoogleGenerativeAI({
    apiKey: env.GOOGLE_API_KEY,
})

export interface ServerMessage {
    role: "user" | "assistant"
    content: string
}

export interface ClientMessage {
    id: string
    role: "user" | "assistant"
    display: React.ReactNode
}

export const continueConversation = async (
    input: string,
    videoId: string,
    videoTitle: string
) => {
    "use server"

    const aiState = getMutableAIState()

    const textStream = createStreamableValue("")
    const spinnerStream = createStreamableUI(
        <Loader className="size-4 animate-spin" />
    )
    const messageStream = createStreamableUI(null)
    const uiStream = createStreamableUI()

    aiState.update({
        ...aiState.get(),
        messages: [
            ...aiState.get().messages,
            {
                id: generateId(),
                role: "user",
                content: `${aiState
                    .get()
                    .interactions.join("\n\n")}\n\n${input}`,
            },
        ],
    })

    messageStream.update(<Loader className="size-4 animate-spin opacity-50" />)

    const messageHistory = aiState.get().messages.map((message: any) => ({
        role: message.role,
        content: message.content,
    }))

    ;(async () => {
        try {
            const query = input.replaceAll("\n", " ")

            const { embedding } = await embed({
                model: openai.embedding("text-embedding-ada-002"),
                value: query,
            })

            const similarity = sql<number>`1 - (${cosineDistance(
                embeddings.embedding,
                embedding
            )})`

            const contexts = await db
                .select({ content: embeddings.content, similarity })
                .from(embeddings)
                .where(
                    and(eq(embeddings.videoid, videoId), gt(similarity, 0.5))
                )
                .orderBy((t) => desc(t.similarity))
                .limit(2)

            const result = await streamText({
                model: google(
                    "models/gemini-1.5-flash-latest"
                ) as LanguageModel,
                messages: [...messageHistory],
                tools: {
                    showRelatedVideos: {
                        description:
                            "Get the videos related to the user's query.",
                        parameters: z.object({
                            videoId: z.string(),
                            videoTitle: z.string(),
                        }),
                    },
                },
                system: `\

                You are a friendly pirate AI agent specialized in answering users' questions based on a particular video. 
                Your job is to respond to users' queries using relevant contexts from the provided video.
                If you are unable to understand the contexts then just let the user know about it.
                    
                The user's current videoId is ${videoId} and the title is ${videoTitle}.

                Query: ${input}
                Contexts: ${contexts.map((c) => c.content)}
                `,
            })

            let textContent = ""
            spinnerStream.done(null)

            for await (const delta of result.fullStream) {
                const { type } = delta

                if (type === "text-delta") {
                    const { textDelta } = delta

                    textContent += textDelta
                    messageStream.update(textContent)

                    aiState.update({
                        ...aiState.get(),
                        messages: [
                            ...aiState.get().messages,
                            {
                                id: generateId(),
                                role: "assistant",
                                content: textContent,
                            },
                        ],
                    })
                }
            }

            uiStream.done()
            textStream.done()
            messageStream.done()
        } catch (e) {
            console.error(e)

            const error = new Error(
                "The AI got rate limited, please try again later."
            )
            uiStream.error(error)
            spinnerStream.error(error)
            messageStream.error(error)
            aiState.done(aiState.get())
        }
    })()

    return {
        id: generateId(),
        attachments: uiStream.value,
        spinner: spinnerStream.value,
        display: messageStream.value,
    }
}

export type Message = {
    role: "user" | "assistant" | "system" | "function" | "data" | "tool"
    content: string
    id?: string
    name?: string
    display?: {
        name: string
        props: Record<string, any>
    }
}

export type AIState = {
    chatId: string
    interactions?: string[]
    messages: Message[]
}

export type UIState = {
    id: string
    display: React.ReactNode
    spinner?: React.ReactNode
    attachments?: React.ReactNode
}[]

export const AI = createAI<AIState, UIState>({
    actions: {
        continueConversation,
    },
    initialUIState: [],
    initialAIState: { chatId: generateId(), interactions: [], messages: [] },
})
