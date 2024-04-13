"use server"

import ytdl from "ytdl-core"
import { z } from "zod"

import { uploadAudio } from "@/lib/core/convert"
import { speechToText } from "@/lib/core/stt"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { formSchema } from "@/components/form"

export const handleInitialFormSubmit = async (
    formData: z.infer<typeof formSchema>
) => {
    const supabase = await createSupabaseServerClient()

    try {
        const videoInfo = await ytdl.getInfo(formData.link)
        const videoId = videoInfo.videoDetails.videoId

        const { data: existingData, error: existingDataError } = await supabase
            .from("summaries")
            .select("video, summary, userid, users(id)")
            .eq("video", videoId)
            .limit(1)

        if (existingDataError) {
            throw new Error(existingDataError.message)
        }

        if (existingData[0]) {
            if (existingData[0].users?.id == formData.userid) {
                return existingData[0].video
            }

            const { data, error } = await supabase
                .from("summaries")
                .insert({
                    video: existingData[0].video,
                    summary: existingData[0].summary,
                    userid: formData.userid,
                })
                .select("video")
                .single()

            if (error) {
                throw new Error(error.message)
            }

            return data?.video
        }

        const { data, error } = await supabase
            .from("summaries")
            .insert({
                video: videoId,
                userid: formData.userid,
            })
            .select("video")
            .single()

        if (error) {
            throw new Error(error.message)
        }

        // Upload the audio in a bucket
        const isAudioUploaded = await uploadAudio(formData.link)
        if (!isAudioUploaded) {
            throw new Error("Couldn't upload the Audio into the Bucket.")
        }

        // Transcribe the uploaded audio
        const transcript = await speechToText(videoId)
        if (!transcript) {
            throw new Error("Couldn't transcribe the Audio.")
        }

        const { error: updateSummaryError } = await supabase
            .from("summaries")
            .update({
                transcription: transcript,
            })
            .eq("video", videoId)
            .eq("userid", formData.userid)
        if (updateSummaryError) {
            throw new Error(updateSummaryError.message)
        }

        return data?.video
    } catch (e: any) {
        console.error(e)
        return null
    }
}
