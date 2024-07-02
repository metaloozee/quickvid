"use client"

import { useEffect, useRef, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { generateId } from "ai"
import { useActions, useUIState } from "ai/rsc"
import {
    Bot,
    BotMessageSquare,
    CornerDownLeft,
    Loader,
    Plus,
} from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { UserMessage } from "@/components/markdown/message"
import { AI } from "@/app/ai-actions"

export const chatFormSchema = z.object({
    query: z.string().describe("The query you want to send it to the LLM"),
})

export const Chat = ({
    videoId,
    videoTitle,
    videoAuthor,
}: {
    videoId: string
    videoTitle: string
    videoAuthor: string
}) => {
    const [selectedText, setSelectedText] = useState<string>("")
    const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 })
    const [isPopoverOpen, setIsPopoverOpen] = useState(false)
    const textRef = useRef<HTMLDivElement>(null)

    const [messages, setMessages] = useUIState<typeof AI>()
    const { continueConversation } = useActions()

    const form = useForm<z.infer<typeof chatFormSchema>>({
        resolver: zodResolver(chatFormSchema),
    })

    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (textRef.current && !textRef.current.contains(event.target)) {
                setIsPopoverOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    return (
        <div className="col-span-1 flex w-full flex-col gap-10">
            <div className="flex w-full flex-col items-start gap-5 rounded-xl py-2 text-justify outline-dashed outline-2 outline-blue-400 md:text-left">
                <div className="w-full border-b-2 border-dashed border-blue-400 pb-2">
                    <h1 className="flex items-center justify-center text-center text-blue-400">
                        <Bot />
                    </h1>
                </div>

                <div className="flex w-full flex-col gap-5 px-5">
                    {messages.map((message) => (
                        <div
                            ref={textRef}
                            key={message.id}
                            onMouseUp={() => {
                                const selection = window.getSelection()
                                const text = selection?.toString().trim()
                                if (text) {
                                    setSelectedText(text)
                                    const range = selection?.getRangeAt(0)
                                    const rect = range?.getBoundingClientRect()

                                    setPopoverPosition({
                                        top: rect?.bottom! + window.scrollY,
                                        left: rect?.left! + window.scrollX,
                                    })

                                    console.log(popoverPosition)
                                    setIsPopoverOpen(true)
                                } else {
                                    setIsPopoverOpen(false)
                                }
                            }}
                        >
                            {message.spinner}
                            {message.display}
                            {message.attachments}
                        </div>
                    ))}
                    <Popover
                        open={isPopoverOpen}
                        onOpenChange={setIsPopoverOpen}
                    >
                        <PopoverTrigger asChild>
                            <div
                                style={{
                                    position: "absolute",
                                    top: `${popoverPosition.top}px`,
                                    left: `${popoverPosition.left}px`,
                                }}
                            />
                        </PopoverTrigger>
                        <PopoverContent asChild>
                            <Button
                                className="text-xs"
                                onClick={async () => {
                                    try {
                                        setMessages((currentConversation) => [
                                            ...currentConversation,
                                            {
                                                id: generateId(),
                                                display: (
                                                    <UserMessage>
                                                        {selectedText}
                                                    </UserMessage>
                                                ),
                                            },
                                        ])

                                        const message =
                                            await continueConversation(
                                                selectedText,
                                                videoId,
                                                videoTitle,
                                                videoAuthor
                                            )

                                        setMessages((currentConversation) => [
                                            ...currentConversation,
                                            message,
                                        ])
                                    } catch (e: any) {
                                        console.error(e)
                                        return toast.error(e.message)
                                    }
                                }}
                            >
                                <Plus className="mr-2 size-3" />
                                Ask Follow-Up
                            </Button>
                        </PopoverContent>
                    </Popover>
                </div>
                <Form {...form}>
                    <form
                        className="flex w-full items-center justify-center gap-2 px-5 py-4"
                        onSubmit={form.handleSubmit(async (data) => {
                            try {
                                setMessages((currentConversation) => [
                                    ...currentConversation,
                                    {
                                        id: generateId(),
                                        display: (
                                            <UserMessage>
                                                {data.query}
                                            </UserMessage>
                                        ),
                                    },
                                ])

                                const message = await continueConversation(
                                    data.query,
                                    videoId,
                                    videoTitle,
                                    videoAuthor
                                )

                                setMessages((currentConversation) => [
                                    ...currentConversation,
                                    message,
                                ])
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
