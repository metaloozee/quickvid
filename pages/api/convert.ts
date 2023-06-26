import { NextApiRequest, NextApiResponse } from 'next';
import { cleanupExpiredFiles, convertVideoToAudio, uploadAudio } from '@/lib/convert';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { youtubeLink } = req.query;

  try {
    // const audioPath = await convertVideoToAudio(youtubeLink as string);
    // const publicUrl = audioPath.replace('./public/tmp', '/public/tmp');

    // const { data, error } = await supabase.storage.from('audios').upload(publicUrl, new File([audioPath], publicUrl))

    // res.status(200).json({ audioUrl: data?.path });

    const path = await uploadAudio(youtubeLink as string);
    res.status(200).json({ audioUrl: path })

    setTimeout(() => {
      cleanupExpiredFiles().catch((error) => {
        console.error('Error cleaning up expired files:', error);
      });
    }, 5000);
  } catch (error) {
    console.error('Error during conversion:', error);
    res.status(500).json({ error: 'An error occurred during conversion' });
  }
}
