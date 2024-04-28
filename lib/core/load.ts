import { YoutubeLoader } from "langchain/document_loaders/web/youtube"

const loader = YoutubeLoader.createFromUrl(
    "https://www.youtube.com/watch?v=tkZ-ajarTks",
    { addVideoInfo: true }
)

;(async () => {
    const docs = await loader.load()
    console.log(docs)
})()
