"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { ListVideo, Loader, Settings2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    handleInitialFormSubmit,
    summarizeTranscript,
    uploadSummary,
    uploadTranscript,
} from "@/app/actions"

export const formSchema = z.object({
    link: z.string().describe("The YouTube Video you would like to summarize."),
    model: z.enum([
        "gemini-1.5-flash",
        "gpt-3.5-turbo",
        "gpt-4o",
        "llama3-70b-8192",
        "mixtral-8x7b-32768",
    ]),
})

export const InitialForm = () => {
    const router = useRouter()

    const [status, setStatus] = useState<string | null>("Loading...")
    const [time, setTime] = useState(0)
    const [isRunning, setIsRunning] = useState(false)

    useEffect(() => {
        let intervalId: NodeJS.Timeout
        if (isRunning) {
            intervalId = setInterval(() => setTime(time + 1), 10)
        }
        return () => clearInterval(intervalId)
    }, [isRunning, time])

    const seconds = Math.floor((time % 6000) / 100)
    const miliseconds = time % 100

    const stop = () => {
        setTime(0)
        setIsRunning(false)
    }

    const restart = () => {
        setTime(0)
        setIsRunning(true)
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            model: "gemini-1.5-flash",
        },
    })

    return (
        <Form {...form}>
            <form
                className="flex w-full flex-col items-start gap-2 md:flex-row"
                onSubmit={form.handleSubmit(async (data) => {
                    await handleInitialFormSubmit(data).then(async (value) => {
                        if (value) {
                            restart()
                            setStatus("Give me some more time...")

                            if (value.summary && value.transcript) {
                                stop()
                                setStatus(null)

                                toast.success("Successfully Summarized")

                                return router.push(`/${value.videoId}`)
                            }

                            if (!value.summary && value.transcript) {
                                restart()
                                setStatus("Processing the Transcript...")

                                const res = await uploadTranscript({
                                    transcript: value.transcript,
                                    videoId: value.videoId,
                                    videoTitle: value.videoTitle,
                                })

                                if (!res) {
                                    stop()
                                    setStatus(null)

                                    return toast.error(
                                        "An unknown error occurred while processing the transcript."
                                    )
                                }

                                restart()
                                setStatus("Summarizing...")

                                const summary = await summarizeTranscript({
                                    transcript: value.transcript,
                                    model: data.model,
                                    videoTitle: value.videoTitle,
                                    videoAuthor: value.videoAuthor,
                                })

                                if (!summary) {
                                    stop()
                                    setStatus(null)

                                    return toast.error(
                                        "An unknown error occurred while summarizing.",
                                        {
                                            description:
                                                "If this occurs again, it's more likely to be Vercel's Timeout.",
                                        }
                                    )
                                }

                                restart()
                                setStatus("Saving the Summary...")

                                const vid = await uploadSummary({
                                    summary: summary,
                                    videoId: value.videoId,
                                })

                                if (vid) {
                                    stop()
                                    setStatus(null)

                                    toast.success("Successfully Summarized")
                                    return router.push(`/${vid}`)
                                } else {
                                    stop()
                                    setStatus(null)

                                    return toast.error(
                                        "An unknown error occurred while saving the summary."
                                    )
                                }
                            }
                        }
                    })
                })}
            >
                <div className="flex w-full gap-2 md:max-w-2xl">
                    <FormField
                        disabled={form.formState.isSubmitting}
                        control={form.control}
                        name="link"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <Input
                                        placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                                        {...field}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        disabled={form.formState.isSubmitting}
                        control={form.control}
                        name="model"
                        render={({ field }) => (
                            <FormItem>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            disabled={
                                                form.formState.isSubmitting
                                            }
                                            className="group"
                                            variant="secondary"
                                            size={"icon"}
                                        >
                                            <Settings2 className="size-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-full">
                                        <DropdownMenuLabel>
                                            Choose your AI Model
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuRadioGroup
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <DropdownMenuRadioItem value="gemini-1.5-flash">
                                                gemini-1.5-flash
                                            </DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem
                                                disabled={
                                                    process.env.NODE_ENV ===
                                                    "production"
                                                }
                                                value="gpt-3.5-turbo"
                                            >
                                                gpt-3.5-turbo
                                            </DropdownMenuRadioItem>

                                            <DropdownMenuRadioItem
                                                disabled={
                                                    process.env.NODE_ENV ===
                                                    "production"
                                                }
                                                value="gpt-4o"
                                            >
                                                gpt-4o
                                            </DropdownMenuRadioItem>

                                            <DropdownMenuRadioItem
                                                disabled={
                                                    process.env.NODE_ENV ===
                                                    "production"
                                                }
                                                value="llama3-70b-8192"
                                            >
                                                llama3-70b
                                                <Badge
                                                    className="ml-2 text-xs"
                                                    variant={"secondary"}
                                                >
                                                    Experimental
                                                </Badge>
                                            </DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem
                                                disabled={
                                                    process.env.NODE_ENV ===
                                                    "production"
                                                }
                                                value="mixtral-8x7b-32768"
                                            >
                                                mixtral-8x7b
                                                <Badge
                                                    className="ml-2 text-xs"
                                                    variant={"secondary"}
                                                >
                                                    Experimental
                                                </Badge>
                                            </DropdownMenuRadioItem>
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </FormItem>
                        )}
                    />
                </div>

                <Button
                    disabled={form.formState.isSubmitting}
                    className="group w-full md:max-w-fit"
                    type="submit"
                >
                    {form.formState.isSubmitting ? (
                        <>
                            <Loader className="mr-2 size-4 animate-spin duration-1000" />{" "}
                            {status} {seconds}s {miliseconds}ms
                        </>
                    ) : (
                        <>
                            Summarize
                            <ListVideo className="ml-2 size-4 transition-all duration-200 group-hover:ml-4" />
                        </>
                    )}
                </Button>
            </form>
        </Form>
    )
}
