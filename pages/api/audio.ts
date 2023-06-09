import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import { join } from 'path';

const CACHE_DIR = './cache';

export default function handler(req: NextApiRequest, res: NextApiResponse): void {
  const { fileName } = req.query;

  const filePath = join(CACHE_DIR, fileName as string);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.status(404).json({ error: 'Audio file not found' });
    } else {
      const fileStream = fs.createReadStream(filePath);
      res.setHeader('Content-Type', 'audio/mpeg');
      fileStream.pipe(res);
    }
  });
}
