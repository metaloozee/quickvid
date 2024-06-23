import { env } from "@/env.mjs"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { LanguageModel, generateId, streamText } from "ai"
import {
    createAI,
    createStreamableUI,
    createStreamableValue,
    getMutableAIState,
    streamUI,
} from "ai/rsc"
import { Loader } from "lucide-react"
import { z } from "zod"

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

    uiStream.update(<Loader className="size-4 animate-spin" />)

    const messageHistory = aiState.get().messages.map((message: any) => ({
        role: message.role,
        content: message.content,
    }))

    ;(async () => {
        try {
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
                    You are a friendly pirate assistant that helps the user with their problems. You can give video recommendations based on the query.
                    
                    The user's current videoId is ${videoId} and the title is ${videoTitle}
                `,
            })

            let textContent = ""
            spinnerStream.done(null)

            for await (const delta of result.fullStream) {
                const { type } = delta

                if (type === "text-delta") {
                    const { textDelta } = delta

                    textContent += textDelta
                    messageStream.update(<div>{textContent}</div>)

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
                } else if (type === "tool-call") {
                    const { toolName, args } = delta

                    if (toolName === "showRelatedVideos") {
                        const { videoId, videoTitle } = args

                        uiStream.update(
                            <VideoWidget
                                title={videoTitle}
                                thumbnail="https://th.bing.com/th/id/OIP.iibAGrWeMov3xB5rVBi68gHaEK?rs=1&pid=ImgDetMain"
                            />
                        )

                        aiState.done({
                            ...aiState.get(),
                            interactions: [],
                            messages: [
                                ...aiState.get().messages,
                                {
                                    id: generateId(),
                                    role: "assistant",
                                    content: `Here is the video you requested`,
                                    display: {
                                        name: "showRelatedVideos",
                                        props: {
                                            videoId,
                                        },
                                    },
                                },
                            ],
                        })
                    }
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
// export const AI = createAI<ServerMessage[], ClientMessage[]>({
//     actions: {
//         continueConversation,
//     },
//     initialAIState: [],
//     initialUIState: [],
// })
