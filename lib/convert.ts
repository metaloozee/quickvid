import fs from 'fs';
import ytdl from 'ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

const TEMP_DIR = './public/tmp/audio';

const convertVideoToAudio = async (youtubeLink: string): Promise<string> => {
  const videoInfo = await ytdl.getInfo(youtubeLink);
  const format = ytdl.chooseFormat(videoInfo.formats, { quality: 'highestaudio' });

  const video = ytdl(youtubeLink, { format });

  const outputPath = `${TEMP_DIR}/audio_${Date.now()}.mp3`;

  return new Promise((resolve, reject) => {
    ffmpeg(video)
      .noVideo()
      .audioBitrate(128)
      .save(outputPath)
      .on('end', async () => {
        console.log('Conversion complete');
        resolve(outputPath);

        // try {
        //   await writeFile(outputPath, ''); // Create an empty file to mark its existence
        //   resolve(outputPath);
        // } catch (error) {
        //   console.error('Error creating empty file:', error);
        //   reject(error);
        // }
      })
      .on('error', (err) => {
        console.error('Error during conversion:', err);
        reject(err);
      });
  });
};

const cleanupExpiredFiles = async () => {
  const files = await fs.promises.readdir(TEMP_DIR);

  const currentTime = Date.now();
  const expirationTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  files.forEach(async (file) => {
    const filePath = `${TEMP_DIR}/${file}`;
    const { birthtimeMs } = await fs.promises.stat(filePath);
    const elapsedTime = currentTime - birthtimeMs;

    if (elapsedTime >= expirationTime) {
      try {
        await unlink(filePath);
        console.log(`Deleted expired file: ${filePath}`);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
  });
};

export { convertVideoToAudio, cleanupExpiredFiles };
