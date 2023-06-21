import { NextApiRequest, NextApiResponse } from 'next';
import { cleanupExpiredFiles, convertVideoToAudio } from '@/lib/convert';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { youtubeLink } = req.query;

  try {
    const audioPath = await convertVideoToAudio(youtubeLink as string);
    const publicUrl = audioPath.replace('./public/tmp', '/public/tmp');
    res.status(200).json({ audioUrl: publicUrl });

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
