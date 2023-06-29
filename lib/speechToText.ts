import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";

import { supabase } from "@/lib/supabase";

const downloadAudioFile = async (audioPath: string) => {
  const id = Date.now();
  const filePath = path.join(process.cwd(), "tmp", `audio_${id}.mp3`);

  const { data, error } = await supabase.storage.from("public").download(audioPath);

  if (error) {
    console.error("Error downloading audio file:", error);
    return null;
  }

  const arrayBuffer = await data.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  fs.writeFileSync(filePath, buffer);

  return id;
};

const transcribeAudio = async (audioFilePath: string, openAIKey: string) => {
  const audioStream = fs.createReadStream(audioFilePath);

  const formData = new FormData();
  formData.append("file", audioStream, {
    filename: path.basename(audioFilePath),
    contentType: "audio/mpeg",
  });
  formData.append("model", "whisper-1");
  formData.append("language", "en");

  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${openAIKey}`,
    },
  };

  try {
    const response = await axios.post("https://api.openai.com/v1/audio/transcriptions", formData, config);
    return response.data.text;
  } catch (err) {
    console.error("Error transcribing audio:", err);
    return null;
  }
};

const deleteAudioFile = async (filePath: string) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Error deleting audio file:", err);
    }
  });
};

const speechToTranscript = async (audioPath: string, openAIKey: string) => {
  try {
    const fileId = await downloadAudioFile(audioPath);

    if (!fileId) {
      console.error("Error downloading audio file");
      return null;
    }

    const filePath = path.join(process.cwd(), "tmp", `audio_${fileId}.mp3`);

    const transcript = await transcribeAudio(filePath, openAIKey);

    deleteAudioFile(filePath);

    return transcript;
  } catch (err) {
    console.error("Error processing speech to transcript:", err);
    return null;
  }
};

export { speechToTranscript };
