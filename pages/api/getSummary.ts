import type { NextApiRequest, NextApiResponse } from "next"
import { loadSummarizationChain } from "langchain/chains"
import { OpenAI } from "langchain/llms/openai"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(500).json({ error: "Invalid method." })
  }

  const { transcript } = req.body

  if (!transcript) {
    return res.status(500).json({ error: "Invalid body provided." })
  }

  const model = new OpenAI({ temperature: 0 })
  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 })
  const doc = await textSplitter.createDocuments([transcript as string])
  const chain = loadSummarizationChain(model, { type: "map_reduce" })

  try {
    const result = await chain.call({
      input_documents: doc,
    })

    return res.status(200).json({ result })
  } catch (err) {
    console.error("Error in getSummary.ts: ", err)
    return res
      .status(500)
      .json({ error: "An error occurred during summar generation" })
  }
}
