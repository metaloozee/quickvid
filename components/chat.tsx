"use client"

import { useState } from "react"
import { readStreamableValue } from "ai/rsc"
import {
    Bot,
    BotMessageSquare,
    CornerDownLeft,
    Ellipsis,
    UserRound,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { continueConversation } from "@/app/actions"

export const dynamic = "force-dynamic"
export const maxDuration = 30

export interface Message {
    role: "user" | "assistant"
    content: string
}

export const Chat = () => {
    const [conversation, setConversation] = useState<Message[]>([])
    const [input, setInput] = useState<string>("")

    return (
        <div className="col-span-1 flex w-full flex-col gap-10">
            <div className="flex w-full flex-col items-start gap-5 rounded-xl py-2 text-justify outline-dashed outline-2 outline-blue-400 md:text-left">
                <div className="w-full border-b-2 border-dashed border-blue-400 pb-2">
                    <h1 className="flex items-center justify-center text-center text-blue-400">
                        <Bot />
                    </h1>
                </div>

                <div className="flex w-full flex-col gap-5 px-5">
                    <div className="flex flex-row items-center gap-4 py-2">
                        <div className="">
                            <BotMessageSquare className="size-7 min-w-fit rounded-full rounded-bl-none bg-blue-400 p-1.5" />
                        </div>
                        <p className="text-xs">
                            Ahoy matey! Got questions &apos;bout the video or
                            anythin&apos; else? Use this chat to ask away, or
                            walk the plank! Arrr! 🏴‍☠️🪝
                        </p>
                    </div>

                    {conversation.map((message, index) => {
                        if (message.role == "assistant")
                            return (
                                <div className="flex flex-row items-center gap-4 py-2">
                                    <div className="">
                                        <BotMessageSquare className="size-7 min-w-fit rounded-full rounded-bl-none bg-blue-400 p-1.5" />
                                    </div>
                                    <p className="text-xs">{message.content}</p>
                                </div>
                            )
                        else
                            return (
                                <div className="flex flex-row-reverse items-center gap-4 py-2">
                                    <div className="">
                                        <UserRound className="size-7 min-w-fit rounded-full rounded-br-none bg-primary p-1.5" />
                                    </div>
                                    <p className="text-right text-xs text-muted-foreground">
                                        {message.content}
                                    </p>
                                </div>
                            )
                    })}

                    {/* <div className="flex flex-row items-center gap-4 py-2">
                        <div className="">
                            <BotMessageSquare className="size-7 min-w-fit rounded-full rounded-bl-none bg-blue-400 p-1.5" />
                        </div>

                        <p className="animate-pulse text-xs">
                            <Ellipsis className="size-4" />
                        </p>
                    </div> */}
                </div>

                <form className="flex w-full items-center justify-center gap-2 px-5 py-4">
                    <Textarea
                        placeholder="ask me anything..."
                        className="min-h-12 resize-none text-xs focus-visible:ring-blue-400"
                        value={input}
                        onChange={(event) => {
                            setInput(event.target.value)
                        }}
                    />
                    <Button
                        type="submit"
                        className="h-full bg-blue-400 hover:bg-blue-500"
                        onClick={async (e: React.FormEvent) => {
                            e.preventDefault()

                            setInput("")

                            const { messages, newMessage } =
                                await continueConversation([
                                    ...conversation,
                                    { role: "user", content: input },
                                ])

                            let textContent = ""

                            for await (const delta of readStreamableValue(
                                newMessage
                            )) {
                                textContent = `${textContent}${delta}`

                                setConversation([
                                    ...messages,
                                    { role: "assistant", content: textContent },
                                ])
                            }
                        }}
                    >
                        <CornerDownLeft className="size-4" />
                    </Button>
                </form>
            </div>
        </div>
    )
}
