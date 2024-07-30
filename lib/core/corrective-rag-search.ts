import { TavilySearchAPIRetriever } from "@langchain/community/retrievers/tavily_search_api"
import { StructuredOutputParser } from "@langchain/core/output_parsers"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { RunnableSequence } from "@langchain/core/runnables"
import { ChatOpenAI } from "@langchain/openai"
import { config } from "dotenv"
import { z } from "zod"

config({ path: ".env.local" })

const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
})

const retriever = new TavilySearchAPIRetriever({
    k: 3,
})

const summary = `\
## Summary

This YouTube video, "Smoking Causes Cancer, Heart Disease, Emphysema" by Nucleus Medical Media, highlights the devastating health consequences of smoking cigarettes. It emphasizes that smoking exposes your body to thousands of harmful chemicals, including carcinogens, which can damage your DNA and lead to various cancers, particularly lung cancer. The video also explains how smoking increases the risk of heart disease, stroke, and chronic obstructive pulmonary disease (COPD). It further emphasizes the negative impact of smoking during pregnancy, increasing the risk of complications for both the mother and the developing fetus. The video concludes by highlighting the addictive nature of nicotine and the significantly increased risk of serious health problems and premature death associated with smoking.

## Notes
- Carcinogens: Cigarette smoke contains over 40 known carcinogens, which are substances that can cause cancer. These chemicals damage DNA, leading to various cancers, including lung cancer, the most common type worldwide.
- Heart Disease and Stroke: Smoking increases the risk of heart disease and stroke by damaging blood vessels and increasing blood pressure.
- Chronic Obstructive Pulmonary Disease (COPD): Smoking damages the airways and lungs, making it difficult to breathe and leading to COPD, a chronic lung disease.
- Pregnancy Risks: Smoking during pregnancy can harm the developing fetus, increasing the risk of low birth weight, premature birth, and stillbirth.
- Nicotine Addiction: Nicotine in cigarettes is highly addictive, making it difficult to quit smoking.
- Other Health Risks: The video also mentions other health risks associated with smoking, including tooth loss, weakened immune system, delayed wound healing, and sexual dysfunction in men.
`

const generateQueries = async (summary: string) => {
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

const seachWithTavily = async (queries: string[]) => {
    const docs: string[][] = []

    queries.forEach(async (query) => {
        const retrievedDocs = await retriever.invoke(query)

        return docs.push(retrievedDocs.map((m) => m.pageContent))
    })

    return docs
}

;(async () => {
    const { queries } = await generateQueries(summary)
    const documents = await seachWithTavily(queries)

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

    console.log(response)
})()
