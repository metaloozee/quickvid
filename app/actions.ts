"use server"

import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import ytdl from "ytdl-core"
import { z } from "zod"

import { uploadAndTranscribe } from "@/lib/core/convert"
import {
    summarizeTranscript,
    summarizeTranscriptWithGroq,
} from "@/lib/core/summarize"
import { db } from "@/lib/db"
import { summaries, videos } from "@/lib/db/schema"
import { formSchema } from "@/components/form"
import { RegenerateFormSchema } from "@/components/regenerate-btn"

export const handleInitialFormSubmit = async (
    formData: z.infer<typeof formSchema>
) => {
    try {
        const videoInfo = await ytdl.getInfo(formData.link)
        const videoId = videoInfo.videoDetails.videoId

        const [existingVideo] = await db
            .select()
            .from(videos)
            .where(eq(videos.videoid, videoId))
            .limit(1)

        if (existingVideo) {
            const [existingSummary] = await db
                .select()
                .from(summaries)
                .where(eq(summaries.videoid, existingVideo.videoid!))
                .limit(1)
            if (existingSummary) {
                return existingSummary.videoid
            }
        }

        const transcript = await uploadAndTranscribe(formData.link)
        if (!transcript) {
            throw new Error("Couldn't transcribe the Audio.")
        }

        await db.insert(videos).values({
            videoid: videoId,
            videotitle: videoInfo.videoDetails.title,
            transcript: transcript,
        })

        const summary = await summarizeTranscriptWithGroq(transcript)
        if (!summary) {
            throw new Error("Couldn't summarize the Transcript.")
        }

        await db.insert(summaries).values({
            videoid: videoId,
            summary: summary,
        })

        return videoId
    } catch (e: any) {
        console.error(e)
        return null
    } finally {
        revalidatePath("/")
        revalidatePath("/summaries")
    }
}

export const handleRegenerateSummary = async (
    formData: z.infer<typeof RegenerateFormSchema>
) => {
    try {
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

        const summary = await summarizeTranscriptWithGroq(data.transcript!)
        if (!summary) {
            throw new Error("Couldn't summarize the Transcript.")
        }

        await db
            .update(summaries)
            .set({ summary: summary })
            .where(eq(summaries.videoid, formData.videoid))

        return true
    } catch (e) {
        console.error(e)
        return false
    } finally {
        revalidatePath(`/${formData.videoid}`)
    }
}
