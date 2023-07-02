import { NextApiRequest, NextApiResponse } from "next"

import { uploadAudio } from "@/lib/convert"

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> {
    const { youtubeLink } = req.query

    try {
        // const audioPath = await convertVideoToAudio(youtubeLink as string);
        // const publicUrl = audioPath.replace('./public/tmp', '/public/tmp');

        // const { data, error } = await supabase.storage.from('audios').upload(publicUrl, new File([audioPath], publicUrl))

        // res.status(200).json({ audioUrl: data?.path });

        const path = await uploadAudio(youtubeLink as string)
        res.status(200).json({ path })
    } catch (error) {
        console.error("Error during conversion:", error)
        res.status(500).json({ error: "An error occurred during conversion" })
    }
}
