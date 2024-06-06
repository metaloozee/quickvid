"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Bolt, Loader, Settings2, Zap } from "lucide-react"
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
import {
    handleRegenerateSummary,
    summarizeTranscript,
    updateSummary,
} from "@/app/actions"

export const RegenerateFormSchema = z.object({
    videoid: z.string().describe("The YouTube video's unique ID"),
    model: z.enum([
        "gemini-1.5-flash",
        "gpt-3.5-turbo",
        "gpt-4o",
        "llama3-70b-8192",
        "mixtral-8x7b-32768",
    ]),
})

export const RegenerateSummaryButton: React.FC<{
    videoid: string
}> = ({ videoid }) => {
    const regenerateForm = useForm<z.infer<typeof RegenerateFormSchema>>({
        resolver: zodResolver(RegenerateFormSchema),
        defaultValues: {
            videoid: videoid,
            model: "gemini-1.5-flash",
        },
    })

    return (
        <Form {...regenerateForm}>
            <form
                className="flex w-full gap-2"
                onSubmit={regenerateForm.handleSubmit(async (data) => {
                    await handleRegenerateSummary(data).then(async (value) => {
                        if (value) {
                            const status = toast.loading(
                                "Give me some more time..."
                            )

                            if (value.transcript && value.videoId) {
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

                                const vid = await updateSummary({
                                    summary,
                                    videoId: value.videoId,
                                })

                                if (vid) {
                                    return toast.success(
                                        "Successfully Re Generated the Summary",
                                        { id: status }
                                    )
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
                <FormField
                    disabled={regenerateForm.formState.isSubmitting}
                    control={regenerateForm.control}
                    name="model"
                    render={({ field }) => (
                        <FormItem>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        disabled={
                                            regenerateForm.formState
                                                .isSubmitting
                                        }
                                        className="group"
                                        variant="secondary"
                                        size={"icon"}
                                    >
                                        <Settings2 className="size-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
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
                                            llama3-70b0
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

                <Button
                    disabled={regenerateForm.formState.isSubmitting}
                    className="group w-full"
                    type="submit"
                    variant={"secondary"}
                >
                    {regenerateForm.formState.isSubmitting ? (
                        <>
                            <Loader className="size-4 animate-spin duration-1000" />
                        </>
                    ) : (
                        <>Regenerate Summary</>
                    )}
                </Button>
            </form>
        </Form>
    )
}
