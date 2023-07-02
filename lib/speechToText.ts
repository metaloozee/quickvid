import path from "path"
import { Readable } from "stream"
import axios from "axios"
import FormData from "form-data"

import { supabase } from "@/lib/supabase"

const speechToTranscript = async (audioPath: string, openAIKey: string) => {
    try {
        const { data, error } = await supabase.storage
            .from("public")
            .download(audioPath)
        if (error) {
            console.error("Error downloading audio file:", error)
            return null
        }

        const arrayBuffer = await data.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const audioStream = new Readable()
        audioStream.push(buffer)
        audioStream.push(null)

        const formData = new FormData()
        formData.append("file", audioStream, {
            filename: path.basename(audioPath),
            contentType: "audio/mpeg",
        })
        formData.append("model", "whisper-1")
        formData.append("language", "en")

        const config = {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${openAIKey}`,
            },
        }

        const response = await axios.post(
            "https://api.openai.com/v1/audio/transcriptions",
            formData,
            config
        )

        return response.data.text
    } catch (err) {
        console.error("Error processing speech to transcript:", err)
        return null
    }
}

export { speechToTranscript }
