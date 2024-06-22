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
    input: string
): Promise<ClientMessage> => {
    "use server"

    const history = getMutableAIState()

    const result = await streamUI({
        model: google("models/gemini-1.5-flash-latest") as LanguageModel,
        system: "You are a dude that doesn't drop character until the DVD commentary.",
        messages: [...history.get(), { role: "user", content: input }],
        text: ({ content, done }) => {
            if (done) {
                history.done((messages: ServerMessage[]) => [
                    ...messages,
                    { role: "assistant", content },
                ])
            }

            return <div>{content}</div>
        },
        tools: {
            showRelatedVideos: {
                description: "Get the videos related to the user's query.",
                parameters: z.object({
                    videoId: z.string(),
                    videoTitle: z.string(),
                }),
                generate: async function* ({ videoId, videoTitle }) {
                    yield (
                        <Loader className="size-4 animate-spin transition-all duration-1000" />
                    )

                    history.done((messages: ServerMessage[]) => [
                        ...messages,
                        {
                            role: "assistant",
                            content: "Showing related videos",
                        },
                    ])

                    console.log("tool called")

                    return (
                        <VideoWidget
                            title={videoTitle}
                            thumbnail={
                                "https://wallpaperaccess.com/full/481675.jpg"
                            }
                        />
                    )
                },
            },
        },
    })

    return {
        id: generateId(),
        role: "assistant",
        display: result.value,
    }
}

export const AI = createAI<ServerMessage[], ClientMessage[]>({
    actions: {
        continueConversation,
    },
    initialAIState: [],
    initialUIState: [],
})
