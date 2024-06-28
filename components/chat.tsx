"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Message, generateId } from "ai"
import { useActions, useUIState } from "ai/rsc"
import {
    Bot,
    BotMessageSquare,
    CornerDownLeft,
    Loader,
    UserRound,
} from "lucide-react"
import { useForm } from "react-hook-form"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { type ClientMessage } from "@/app/ai-actions"

import { MemoizedReactMarkdown } from "./markdown/markdown"

export const dynamic = "force-dynamic"
export const maxDuration = 30

export const chatFormSchema = z.object({
    query: z.string().describe("The query you want to send it to the LLM"),
})

export const Chat = ({
    videoId,
    videoTitle,
}: {
    videoId: string
    videoTitle: string
}) => {
    const [conversation, setConversation] = useUIState()
    const { continueConversation } = useActions()

    const form = useForm<z.infer<typeof chatFormSchema>>({
        resolver: zodResolver(chatFormSchema),
    })

    return (
        <div className="col-span-1 flex w-full flex-col gap-10">
            <div className="flex w-full flex-col items-start gap-5 rounded-xl py-2 text-justify outline-dashed outline-2 outline-blue-400 md:text-left">
                <div className="w-full border-b-2 border-dashed border-blue-400 pb-2">
                    <h1 className="flex items-center justify-center text-center text-blue-400">
                        <Bot />
                    </h1>
                </div>

                <div className="flex w-full flex-col gap-5 px-5">
                    <div className="flex flex-row items-start gap-4 py-2">
                        <div className="">
                            <BotMessageSquare className="size-7 min-w-fit rounded-full rounded-bl-none bg-blue-400 p-1.5" />
                        </div>
                        <p className="text-xs">
                            Ahoy matey! Got questions &apos;bout the video or
                            anythin&apos; else? Use this chat to ask away, or
                            walk the plank! Arrr! 🏴‍☠️🪝
                        </p>
                    </div>

                    {conversation.map((message: ClientMessage) => {
                        if (message.role == "user")
                            return (
                                <div
                                    key={message.id!}
                                    className="flex flex-row-reverse items-start gap-4 py-2"
                                >
                                    <div>
                                        <UserRound className="size-7 min-w-fit rounded-full rounded-br-none bg-primary p-1.5" />
                                    </div>
                                    <p className="text-right text-xs text-muted-foreground">
                                        {message.display}
                                    </p>
                                </div>
                            )
                        else
                            return (
                                <div
                                    key={message.id}
                                    className="flex flex-row items-start gap-4 py-2"
                                >
                                    <div>
                                        <BotMessageSquare className="size-7 min-w-fit rounded-full rounded-bl-none bg-blue-400 p-1.5" />
                                    </div>
                                    <p className="text-xs">{message.display}</p>
                                </div>
                            )
                    })}
                </div>
                <Form {...form}>
                    <form
                        className="flex w-full items-center justify-center gap-2 px-5 py-4"
                        onSubmit={form.handleSubmit(async (data) => {
                            try {
                                setConversation(
                                    (currentConversation: ClientMessage[]) => [
                                        ...currentConversation,
                                        {
                                            id: generateId(),
                                            role: "user",
                                            display: data.query,
                                        },
                                    ]
                                )

                                const message = await continueConversation(
                                    data.query,
                                    videoId,
                                    videoTitle
                                )

                                setConversation(
                                    (currentConversation: ClientMessage[]) => [
                                        ...currentConversation,
                                        message,
                                    ]
                                )
                            } catch (e: any) {
                                console.error(e)
                                return toast.error(e.message)
                            }
                        })}
                    >
                        <FormField
                            disabled={
                                process.env.NODE_ENV === "production" ||
                                form.formState.isSubmitting
                            }
                            control={form.control}
                            name="query"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormControl>
                                        <Textarea
                                            autoFocus
                                            placeholder="ask me anything..."
                                            className="min-h-12 resize-none text-xs focus-visible:ring-blue-400"
                                            {...field}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <Button
                            disabled={
                                process.env.NODE_ENV === "production" ||
                                form.formState.isSubmitting
                            }
                            type="submit"
                            className="h-full bg-blue-400 hover:bg-blue-500"
                        >
                            {form.formState.isSubmitting ? (
                                <>
                                    <Loader className="size-4 animate-spin duration-1000" />
                                </>
                            ) : (
                                <>
                                    <CornerDownLeft className="size-4" />
                                </>
                            )}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}
