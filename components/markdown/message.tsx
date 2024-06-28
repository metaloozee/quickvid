"use client"

import React from "react"
import { StreamableValue } from "ai/rsc"
import { BotMessageSquare, Loader, UserRound } from "lucide-react"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"

import { useStreamableText } from "@/lib/hooks/use-streamable-text"
import { cn } from "@/lib/utils"

import { CodeBlock } from "./codeblock"
import { MemoizedReactMarkdown } from "./markdown"

export function UserMessage({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-row-reverse items-start gap-4 py-2">
            <div>
                <UserRound className="size-7 min-w-fit rounded-full rounded-br-none bg-primary p-1.5" />
            </div>
            <p className="text-right text-xs text-muted-foreground">
                {children}
            </p>
        </div>
    )
}

export function BotMessage({
    content,
}: {
    content: string | StreamableValue<string>
}) {
    // const text = useStreamableText(content)

    return (
        <div className="flex flex-row items-start gap-4 py-2">
            <div>
                <BotMessageSquare className="size-7 min-w-fit rounded-full rounded-bl-none bg-blue-400 p-1.5" />
            </div>

            <MemoizedReactMarkdown
                className="prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 break-words text-xs"
                remarkPlugins={[remarkGfm, remarkMath]}
                components={{
                    strong({ children }) {
                        return (
                            <strong className="underline decoration-primary underline-offset-4">
                                {children}
                            </strong>
                        )
                    },
                    li({ children }) {
                        return (
                            <li className="list-inside list-disc">
                                {children}
                            </li>
                        )
                    },
                    ul({ children }) {
                        return <ul className="list-item">{children}</ul>
                    },
                    ol({ children }) {
                        return <ol className="list-item">{children}</ol>
                    },
                    p({ children }) {
                        return <p>{children}</p>
                    },
                }}
            >
                {content as string}
            </MemoizedReactMarkdown>
        </div>
    )
}

export function Spinner() {
    return (
        <div className="flex flex-row items-start gap-4 py-2">
            <div>
                <BotMessageSquare className="size-7 min-w-fit rounded-full rounded-bl-none bg-blue-400 p-1.5" />
            </div>

            <Loader className="size-4 animate-spin" />
        </div>
    )
}
