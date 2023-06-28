import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from "@/lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { data: audios, error: listError } = await supabase.storage
            .from('public')
            .list('audios')
        if (listError) {
            throw listError
        }

        const fileName = audios.map((file: any) => file.name);
        const { data, error } = await supabase.storage
            .from('public')
            .remove(fileName);
        if (error) {
            throw error;
        }

        res.status(200).json({ message: "Audio files deleted successfully!"})
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "An error occurred, please check the console." });
    }
}
