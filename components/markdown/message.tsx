"use client"

import { StreamableValue } from "ai/rsc"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"

import { useStreamableText } from "@/lib/hooks/use-streamable-text"
import { cn } from "@/lib/utils"

import { CodeBlock } from "./codeblock"
import { MemoizedReactMarkdown } from "./markdown"

export function BotMessage({
    content,
    className,
}: {
    content: string | StreamableValue<string>
    className?: string
}) {
    const text = useStreamableText(content)

    return (
        <MemoizedReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            components={{
                strong({ children }) {
                    return <strong>{children}</strong>
                },
                p({ children }) {
                    return <p>{children}</p>
                },
            }}
        >
            {text}
        </MemoizedReactMarkdown>
    )
}
