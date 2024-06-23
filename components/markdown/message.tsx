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
                // code({ node, inline, className, children, ...props }) {
                //     if (children.length) {
                //         if (children[0] == "▍") {
                //             return (
                //                 <span className="mt-1 animate-pulse cursor-default">
                //                     ▍
                //                 </span>
                //             )
                //         }

                //         children[0] = (children[0] as string).replace(
                //             "`▍`",
                //             "▍"
                //         )
                //     }

                //     const match = /language-(\w+)/.exec(className || "")

                //     if (inline) {
                //         return (
                //             <code className={className} {...props}>
                //                 {children}
                //             </code>
                //         )
                //     }

                //     return (
                //         <CodeBlock
                //             key={Math.random()}
                //             language={(match && match[1]) || ""}
                //             value={String(children).replace(/\n$/, "")}
                //             {...props}
                //         />
                //     )
                // },
            }}
        >
            {text}
        </MemoizedReactMarkdown>
    )
}
