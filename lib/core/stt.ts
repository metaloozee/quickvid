import path from "path"
import { Readable } from "stream"
import { env } from "@/env.mjs"
import FormData from "form-data"
import fetch from "node-fetch"

import { createSupabaseServerClient } from "@/lib/supabase/server"

export const speechToText = async (videoId: string) => {
    const supabase = await createSupabaseServerClient()

    try {
        console.log("downloading the audio")
        const { data, error } = await supabase.storage
            .from("audios")
            .download(`${videoId}.mp3`)
        if (error) {
            throw new Error(error.message)
        }
        if (!data) {
            throw new Error("Couldn't download the audio file.")
        }

        console.log("converting the blob to File")
        const arrayBuffer = await data.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const audioStream = new Readable()
        audioStream.push(buffer)
        audioStream.push(null)

        const formData = new FormData()
        formData.append("file", audioStream, {
            filename: path.basename(`${videoId}.mp3`),
            contentType: "audio/mpeg",
        })
        formData.append("model", "whisper-1")
        formData.append("timestamp_granularities", '["word"]')
        formData.append("response_format", "verbose_json")

        console.log("transcribing the audio now...")
        const res = await fetch(
            "https://api.openai.com/v1/audio/transcriptions",
            {
                method: "POST",
                body: formData,
                headers: {
                    Authorization: `Bearer ${env.OPENAI_API_KEY}`,
                    ...formData.getHeaders(),
                },
            }
        )

        const response: any = await res.json()
        const transcription = response.text

        // const transcription = await openai.audio.transcriptions.create({
        //     file: ,
        //     model: "whisper-1",
        //     response_format: "verbose_json",
        //     timestamp_granularities: ["word"]
        // })

        console.log(transcription)
        return transcription
    } catch (e) {
        console.error(e)
        return null
    }
}
