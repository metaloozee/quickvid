import ytdl from "ytdl-core"

const uploadAudio = async (link: string) => {
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
    } catch (err) {}
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
