import { NextApiRequest, NextApiResponse } from "next"

import { uploadAudio } from "@/lib/convert"

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> {
    const { youtubeLink } = req.query

    try {
        const path = await uploadAudio(youtubeLink as string)
        res.status(200).json({ path })
    } catch (error) {
        console.error("Error during conversion:", error)
        res.status(500).json({ error: "An error occurred during conversion" })
    }
}
