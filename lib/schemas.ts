import { z } from "zod"

export const searchResponseSchema = z.object({
    isAccurate: z
        .enum(["true", "false"])
        .describe("Whether the video is accurate or not."),
    source: z
        .string()
        .url()
        .describe(
            "The actual source on the Internet about the information present in the video."
        ),
    text: z
        .string()
        .describe(
            "An extra information or correct information about the video based on the Internet source."
        ),
})
