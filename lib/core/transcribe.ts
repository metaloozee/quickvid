import { YoutubeLoader } from "langchain/document_loaders/web/youtube"

export const transcribeVideo = async (videoId: string) => {
    const loader = YoutubeLoader.createFromUrl(
        `https://www.youtube.com/watch?v=${videoId}`,
        { addVideoInfo: true }
    )

    try {
        const docs = await loader.load()
        if (!docs[0].pageContent) {
            throw new Error("An error occurred while transcribing the audio.")
        }

        return docs[0].pageContent
    } catch (e) {
        console.error(e)
        return null
    }
}
