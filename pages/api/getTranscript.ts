import type { NextApiRequest, NextApiResponse } from "next"

import { speechToTranscript } from "@/lib/speechToText"

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(500).json({ error: "Invalid method." })
    }

    const { audioPath, openAIKey } = req.body

    if (!openAIKey || !audioPath) {
        return res.status(500).json({ error: "Invalid body provided." })
    }

    try {
        const response = await speechToTranscript(
            audioPath as string,
            openAIKey as string
        )

        if (response) {
            return res.status(200).json({ response })
        } else {
            return res.status(500).json({ error: "Unknown error" })
        }
    } catch (err) {
        console.error("Error in getTranscript.ts:", err)
        return res.status(500).json({
            error: "An error occurred during speech-to-text conversion",
        })
    }
}
