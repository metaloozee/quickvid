import { OpenAIEmbeddings } from "@langchain/openai"

const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-ada-002",
})

export const generateEmbedding = async (
    transcript: string
): Promise<number[]> => {
    const input = transcript.replaceAll("\n", " ")
    const res = await embeddings.embedQuery(input)

    return res
}
