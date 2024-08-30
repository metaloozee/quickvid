import { Innertube } from "youtubei.js/web"

import { uploadAndTranscribe } from "@/lib/core/convert"

export const transcribeVideo = async (link: string) => {
    const youtube = await Innertube.create({
        location: "US",
        lang: "en",
        retrieve_player: false,
    })

    // try {
    const videoId = new URL(link).searchParams.get("v") as string
    const info = await youtube.getInfo(videoId)
    const transcriptData = await info.getTranscript()

    if (!transcriptData) {
        throw new Error("No transcript data found")
    }

    return transcriptData?.transcript?.content?.body?.initial_segments
        .map((segment) => segment.snippet.text)
        .join(" ")
    // } catch (e) {
    //     try {
    //         console.log("Couldnt find captions... running whsiper...")
    //         const transcript = await uploadAndTranscribe(link)
    //         if (!transcript) {
    //             throw new Error(
    //                 "An error occurred in whisper while transcribing the audio."
    //             )
    //         }

    //         return transcript
    //     } catch (e) {
    //         console.error(e)
    //         return null
    //     }
    // }
}
