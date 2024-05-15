import { YoutubeLoader } from "langchain/document_loaders/web/youtube"

import { uploadAndTranscribe } from "@/lib/core/convert"

export const transcribeVideo = async (link: string) => {
    const loader = YoutubeLoader.createFromUrl(link, { addVideoInfo: true })

    try {
        const docs = await loader.load()
        if (!docs[0].pageContent) {
            throw new Error("An error occurred while transcribing the audio.")
        }

        return docs[0].pageContent
    } catch (e) {
        try {
            console.log("Couldnt find captions... running whsiper...")
            const transcript = await uploadAndTranscribe(link)
            if (!transcript) {
                throw new Error(
                    "An error occurred in whisper while transcribing the audio."
                )
            }

            return transcript
        } catch (e) {
            console.error(e)
            return null
        }
    }
}
