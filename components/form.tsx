"use client"

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
                            const status = toast.loading(
                                "Give me some more time..."
                            )

                            if (value.summary && value.transcript) {
                                toast.success("Successfully Summarized", {
                                    id: status,
                                })
                                return router.push(`/${value.videoId}`)
                            }

                            if (!value.summary && value.transcript) {
                                toast.loading("Processing the Transcript...", {
                                    id: status,
                                })
                                const res = await uploadTranscript({
                                    transcript: value.transcript,
                                    videoId: value.videoId,
                                    videoTitle: value.videoTitle,
                                })

                                if (!res) {
                                    return toast.error(
                                        "An unknown error occurred while processing the transcript.",
                                        { id: status }
                                    )
                                }

                                toast.loading("Summarizing...", { id: status })
                                const summary = await summarizeTranscript({
                                    transcript: value.transcript,
                                    model: data.model,
                                })

                                if (!summary) {
                                    return toast.error(
                                        "An unknown error occurred while summarizing.",
                                        {
                                            description:
                                                "If this occurs again, it's more likely to be Vercel's Timeout.",
                                            id: status,
                                        }
                                    )
                                }

                                toast.loading("Saving the Summary...", {
                                    id: status,
                                })
                                const vid = await uploadSummary({
                                    summary: summary,
                                    videoId: value.videoId,
                                })

                                if (vid) {
                                    toast.success("Successfully Summarized", {
                                        id: status,
                                    })
                                    return router.push(`/${vid}`)
                                } else {
                                    return toast.error(
                                        "An unknown error occurred while saving the summary.",
                                        { id: status }
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
                            <Loader className="size-4 animate-spin duration-1000" />
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
