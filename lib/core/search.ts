"use server"

import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai"
import { TavilySearchAPIRetriever } from "@langchain/community/retrievers/tavily_search_api"
import { StructuredOutputParser } from "@langchain/core/output_parsers"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { RunnableSequence } from "@langchain/core/runnables"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { z } from "zod"

const llm = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash",
    temperature: 0,
    safetySettings: [
        {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        },
    ],
})

const retriever = new TavilySearchAPIRetriever({
    k: 3,
})

export const generateQueries = async (summary: string) => {
    const prompt = ChatPromptTemplate.fromMessages([
        [
            "system",
            `\
Generate 5 search queries based on the main topics discussed in a provided YouTube video summary. 
These queries should cover the key points mentioned in the summary. 
The purpose of these queries is to gather information from web sources, which will then be used to assess the accuracy and completeness of both the original video and its summary.
    
{format_instructions}
        `,
        ],
        ["human", "Summary: {summary}"],
    ])

    const parser = StructuredOutputParser.fromZodSchema(
        z.object({
            queries: z.string().array(),
        })
    )

    const chain = RunnableSequence.from([prompt, llm, parser])

    const response = await chain.invoke({
        summary,
        format_instructions: parser.getFormatInstructions(),
    })

    return response
}

export const seachWithTavily = async (queries: string[]) => {
    const docs: string[][] = []

    queries.forEach(async (query) => {
        const retrievedDocs = await retriever.invoke(query)

        return docs.push(retrievedDocs.map((m) => m.pageContent))
    })

    return docs
}

export const verifyFacts = async ({
    documents,
    summary,
}: {
    documents: string[][]
    summary: string
}) => {
    const prompt = ChatPromptTemplate.fromMessages([
        [
            "system",
            `\
    Analyze the accuracy of a provided YouTube video summary by comparing it to a set of related documents from the internet. 
    Evaluate the content of the summary against the information in these documents, and determine whether the summary contains false or misleading information. 
    Provide a judgment on the overall truthfulness of the summary based on this comparison.
    
    {format_instructions}
        `,
        ],
        [
            "human",
            `\
    Summary: {summary}
    
    Context: {context}
        `,
        ],
    ])

    const parser = StructuredOutputParser.fromZodSchema(
        z.object({
            grade: z
                .boolean()
                .describe(
                    "Accurace of the summary based on the provided context"
                ),
            explaination: z
                .string()
                .describe(
                    "Explaination or short description about your grading"
                ),
        })
    )

    const chain = RunnableSequence.from([prompt, llm, parser])

    const response = await chain.invoke({
        summary,
        context: documents,
        format_instructions: parser.getFormatInstructions(),
    })

    return response
}
