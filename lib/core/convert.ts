import path from "path"
import { Readable } from "stream"
import { env } from "@/env.mjs"
import FormData from "form-data"
import fetch from "node-fetch"
import ytdl from "ytdl-core"

export const uploadAndTranscribe = async (link: string) => {
    try {
        const videoInfo = await ytdl.getInfo(link)

        const format = ytdl.chooseFormat(videoInfo.formats, {
            filter: "audioonly",
            quality: "lowest",
        })
        if (!format) {
            throw new Error(
                "No audio format found for the provided youtube video."
            )
        }

        const audioStream = ytdl.downloadFromInfo(videoInfo, { format: format })
        const audioBuffer = await streamToBuffer(audioStream)

        if (audioBuffer.length / (1024 * 1024) > 25) {
            throw new Error("Audio file is too large")
        }

        const audioFile = Buffer.from(audioBuffer)
        const audioFileStream = new Readable()
        audioFileStream.push(audioFile)
        audioFileStream.push(null)

        const formData = new FormData()
        formData.append("file", audioFileStream, {
            filename: path.basename(`${videoInfo.videoDetails.videoId}.mp3`),
            contentType: "audio/mpeg",
        })
        formData.append("model", "whisper-1")
        formData.append("timestamp_granularities", '["word"]')
        formData.append("response_format", "verbose_json")

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

        return transcription
    } catch (err) {
        console.error(err)
        return null
    }
}

const streamToBuffer = (stream: any): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = []

        stream.on("data", (chunk: Buffer) => {
            chunks.push(chunk)
        })

        stream.on("end", () => {
            const buffer = Buffer.concat(chunks)
            resolve(buffer)
        })

        stream.on("error", (error: Error) => {
            reject(error)
        })
    })
}
