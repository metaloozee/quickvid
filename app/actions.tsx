"use server"

import { revalidatePath } from "next/cache"
import { env } from "@/env.mjs"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { type MessageContent } from "@langchain/core/messages"
import { LanguageModel, streamText } from "ai"
import { createStreamableUI, createStreamableValue } from "ai/rsc"
import { eq } from "drizzle-orm"
import { Loader } from "lucide-react"
import ytdl from "ytdl-core"
import { z } from "zod"

import { uploadAndTranscribe } from "@/lib/core/convert"
import { searchUsingTavilly } from "@/lib/core/search"
import {
    summarizeTranscriptWithGemini,
    summarizeTranscriptWithGpt,
    summarizeTranscriptWithGroq,
} from "@/lib/core/summarize"
import { transcribeVideo } from "@/lib/core/transcribe"
import { db } from "@/lib/db"
import { summaries, videos } from "@/lib/db/schema"
import { Message } from "@/components/chat"
import { formSchema } from "@/components/form"
import { RegenerateFormSchema } from "@/components/regenerate-btn"
import { VerifyFactsFormSchema } from "@/components/verify-facts"

export type FactCheckerResponse = {
    input: "string"
    isAccurate: "true" | "false"
    source: string
    text: string
}

const google = createGoogleGenerativeAI({
    apiKey: env.GOOGLE_API_KEY,
})

export const continueConversation = async (history: Message[]) => {
    "use server"

    const stream = createStreamableValue()
    const spinnerStream = createStreamableUI(
        <Loader className="animate-spin" />
    )

    ;(async () => {
        try {
            const { textStream } = await streamText({
                model: google(
                    "models/gemini-1.5-flash-latest"
                ) as LanguageModel,
                system: "You are a dude that doesn't drop character until the DVD commentary.",
                messages: history,
            })

            spinnerStream.done()

            for await (const text of textStream) {
                stream.update(text)
            }

            stream.done()
        } catch (e: any) {
            console.error(e)
            const error = new Error(e.message ?? "An unknown error occurred")
            stream.error(error)
        }
    })()

    return {
        messages: history,
        newMessage: stream.value,
    }
}

export const summarizeTranscript = async ({
    transcript,
    model,
    videoTitle,
    videoAuthor,
}: {
    transcript: string
    model:
        | "gemini-1.5-flash"
        | "gpt-3.5-turbo"
        | "gpt-4o"
        | "llama3-70b-8192"
        | "mixtral-8x7b-32768"
    videoTitle: string
    videoAuthor: string
}) => {
    try {
        let summary: MessageContent | null = null
        if (model == "gpt-3.5-turbo" || model == "gpt-4o") {
            summary = await summarizeTranscriptWithGpt(transcript, model)
        } else if (model == "gemini-1.5-flash") {
            summary = await summarizeTranscriptWithGemini(
                transcript,
                model,
                videoTitle,
                videoAuthor
            )
        } else {
            summary = await summarizeTranscriptWithGroq(transcript, model)
        }

        return summary as string
    } catch (e) {
        console.error(e)
        return null
    }
}
export const updateSummary = async ({
    summary,
    videoId,
}: {
    summary: string
    videoId: string
}) => {
    try {
        await db
            .update(summaries)
            .set({ summary: summary })
            .where(eq(summaries.videoid, videoId))

        return true
    } catch (e) {
        console.error(e)
        return false
    } finally {
        revalidatePath(`/${videoId}`)
    }
}
export const uploadSummary = async ({
    summary,
    videoId,
}: {
    summary: string
    videoId: string
}) => {
    try {
        await db.insert(summaries).values({
            videoid: videoId,
            summary: summary as string,
        })

        return videoId
    } catch (e) {
        console.error(e)
        return null
    } finally {
        revalidatePath("/")
        revalidatePath("/summaries")
    }
}

export const uploadTranscript = async ({
    transcript,
    videoId,
    videoTitle,
}: {
    transcript: string
    videoId: string
    videoTitle: string
}) => {
    try {
        await db
            .insert(videos)
            .values({
                videoid: videoId,
                videotitle: videoTitle,
                transcript: transcript,
            })
            .onConflictDoNothing()

        return true
    } catch (e) {
        console.error(e)
        return false
    }
}

export const handleInitialFormSubmit = async (
    formData: z.infer<typeof formSchema>
) => {
    try {
        const videoInfo = await ytdl.getInfo(formData.link)
        const videoId = videoInfo.videoDetails.videoId

        const [existingVideo] = await db
            .select({
                summary: summaries.summary,
                transcript: videos.transcript,
            })
            .from(videos)
            .fullJoin(summaries, eq(videos.videoid, summaries.videoid))
            .where(eq(videos.videoid, videoId))
            .limit(1)

        if (
            existingVideo &&
            existingVideo.summary &&
            existingVideo.transcript
        ) {
            return {
                videoId: videoId,
                videoTitle: videoInfo.videoDetails.title,
                videoAuthor: videoInfo.videoDetails.author.name,
                summary: existingVideo.summary,
                transcript: existingVideo.transcript,
            }
        } else if (
            existingVideo &&
            !existingVideo.summary &&
            existingVideo.transcript
        ) {
            return {
                videoId: videoId,
                videoTitle: videoInfo.videoDetails.title,
                videoAuthor: videoInfo.videoDetails.author.name,
                summary: null,
                transcript: existingVideo.transcript,
            }
        } else {
            const transcript = await transcribeVideo(formData.link)
            if (!transcript) {
                throw new Error("Couldn't transcribe the Video.")
            }

            return {
                videoId: videoId,
                videoTitle: videoInfo.videoDetails.title,
                videoAuthor: videoInfo.videoDetails.author.name,
                summary: null,
                transcript: transcript,
            }
        }
    } catch (e) {
        console.error(e)
        return null
    }
}

export const handleRegenerateSummary = async (
    formData: z.infer<typeof RegenerateFormSchema>
) => {
    try {
        const videoInfo = await ytdl.getBasicInfo(
            "https://www.youtube.com/watch?v=" + formData.videoid
        )

        const [data] = await db
            .select({
                transcript: videos.transcript,
            })
            .from(videos)
            .where(eq(videos.videoid, formData.videoid))
            .limit(1)
        if (!data) {
            throw new Error("Couldn't find the transcription of this video.")
        }

        return {
            videoId: formData.videoid,
            transcript: data.transcript,
            videoTitle: videoInfo.videoDetails.title,
            videoAuthor: videoInfo.videoDetails.author.name,
        }
    } catch (e: any) {
        console.error(e)
        return false
    }
}

export const checkFacts = async (
    formData: z.infer<typeof VerifyFactsFormSchema>
) => {
    try {
        const res = await searchUsingTavilly(formData.summary)
        return await JSON.parse(res)
    } catch (e) {
        console.error(e)
        return null
    }
}
