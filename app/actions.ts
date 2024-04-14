"use server"

import ytdl from "ytdl-core"
import { z } from "zod"

import { uploadAudio } from "@/lib/core/convert"
import { speechToText } from "@/lib/core/stt"
import { summarizeTranscript } from "@/lib/core/summarize"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { formSchema } from "@/components/form"

export const handleInitialFormSubmit = async (
    formData: z.infer<typeof formSchema>
) => {
    const supabase = await createSupabaseServerClient()

    try {
        const videoInfo = await ytdl.getInfo(formData.link)
        const videoId = videoInfo.videoDetails.videoId

        const { data: existingVideo, error: existingVideoError } =
            await supabase
                .from("videos")
                .select("videoid, transcript")
                .eq("videoid", videoId)
                .maybeSingle()
        if (existingVideoError) {
            throw new Error(existingVideoError.message)
        }
        if (existingVideo) {
            const {
                data: existingUserSummary,
                error: existingUserSummaryError,
            } = await supabase
                .from("summaries")
                .select("summary, videoid, users(id)")
                .eq("videoid", videoId)
                .eq("userid", formData.userid)
                .maybeSingle()
            if (existingUserSummaryError) {
                throw new Error(existingUserSummaryError.message)
            }
            if (existingUserSummary) {
                return existingUserSummary.videoid
            }

            const { data: existingSummary, error: existingSummaryError } =
                await supabase
                    .from("summaries")
                    .select("summary, videoid, users(id)")
                    .eq("videoid", videoId)
                    .limit(1)
            if (existingSummaryError) {
                throw new Error(existingSummaryError.message)
            }
            if (existingSummary) {
                const { error } = await supabase.from("summaries").insert({
                    userid: formData.userid,
                    summary: existingSummary[0].summary,
                    videoid: videoId,
                })
                if (error) {
                    throw new Error(error.message)
                }

                return videoId
            }
        }

        const isAudioUploaded = await uploadAudio(formData.link)
        if (!isAudioUploaded) {
            throw new Error("Couldn't upload the Audio into the Bucket.")
        }

        const transcript = await speechToText(videoId)
        if (!transcript) {
            throw new Error("Couldn't transcribe the Audio.")
        }

        const { error: transcriptError } = await supabase
            .from("videos")
            .insert({
                videoid: videoId,
                videotitle: videoInfo.videoDetails.title,
                transcript: transcript,
            })
        if (transcriptError) {
            throw new Error(transcriptError.message)
        }

        const summary = await summarizeTranscript(transcript)
        if (!summary) {
            throw new Error("Couldn't summarize the Transcript.")
        }

        const { error: summaryError } = await supabase
            .from("summaries")
            .insert({
                userid: formData.userid,
                videoid: videoId,
                summary: summary,
            })
        if (summaryError) {
            throw new Error(summaryError.message)
        }

        return videoId
    } catch (e: any) {
        console.error(e)
        return null
    }
}
