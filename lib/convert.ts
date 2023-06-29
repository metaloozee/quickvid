import ytdl from "ytdl-core"

import { supabase } from "@/lib/supabase"

const uploadAudio = async (youtubeLink: string) => {
  try {
    const videoInfo = await ytdl.getInfo(youtubeLink)
    const format = ytdl.chooseFormat(videoInfo.formats, { filter: "audioonly" })

    if (!format) {
      console.error("No audio format found for the YouTube video.")
      return null
    }

    const audioStream = ytdl.downloadFromInfo(videoInfo, { format: format })
    const audioBuffer = await streamToBuffer(audioStream)
    const audioFile = Buffer.from(audioBuffer)

    const { data: uploadedFile, error } = await supabase.storage
      .from("public")
      .upload(`audios/audio_${Date.now()}.mp3`, audioFile)

    if (error) {
      console.error(error)
      return null
    }

    if (uploadedFile) {
      const { data: supabaseFile } = supabase.storage
        .from("public")
        .getPublicUrl(uploadedFile.path)

      return { publicUrl: supabaseFile.publicUrl, filePath: uploadedFile.path }
    } else {
      console.error('Failed to get audio file key.');
      return null;
    }
  } catch (error) {
    console.error("Error:", error)
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

export { uploadAudio }
