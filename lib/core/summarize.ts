import OpenAI from "openai"

const gpt = new OpenAI()

export const summarizeTranscript = async (transcript: string) => {
    try {
        const res = await gpt.chat.completions.create({
            model: "gpt-4-turbo",
            temperature: 0,
            messages: [
                {
                    role: "system",
                    content:
                        "You are a highly skilled AI trained in language comprehension and summarization. I would like you to read the following text and summarize it into a concise abstract paragraph. Aim to retain the most important points, providing a coherent and readable summary that could help a person understand the main points of the discussion without needing to read the entire text. Please avoid unnecessary details or tangential points.",
                },
                {
                    role: "user",
                    content: transcript,
                },
            ],
        })
        if (!res) {
            throw new Error(
                "An Error Occurred while Summarizing the transcript."
            )
        }

        return res.choices[0].message.content
    } catch (e) {
        console.error(e)
        return null
    }
}
