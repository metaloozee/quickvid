"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Bolt, RotateCw } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

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
import { handleRegenerateSummary } from "@/app/actions"

export const RegenerateFormSchema = z.object({
    videoid: z.string().describe("The YouTube video's unique ID"),
    model: z.enum([
        "gpt-3.5-turbo",
        "llama3-8b-8192",
        "llama3-70b-8192",
        "mixtral-8x7b-32768",
    ]),
})

export const RegenerateSummaryButton: React.FC<{ videoid: string }> = ({
    videoid,
}) => {
    const regenerateForm = useForm<z.infer<typeof RegenerateFormSchema>>({
        resolver: zodResolver(RegenerateFormSchema),
        defaultValues: {
            videoid: videoid,
            model: "gpt-3.5-turbo",
        },
    })

    return (
        <Form {...regenerateForm}>
            <form
                className="flex w-full gap-2"
                onSubmit={regenerateForm.handleSubmit(async (data) => {
                    await handleRegenerateSummary(data)
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
                                        <Bolt className="size-4 transition-all duration-500 group-hover:rotate-180" />
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
                                        <DropdownMenuRadioItem value="gpt-3.5-turbo">
                                            gpt-3.5-turbo (16k)
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="llama3-8b-8192">
                                            llama3-8b (8k)
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="llama3-70b-8192">
                                            llama3-70b (8k)
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="mixtral-8x7b-32768">
                                            mixtral-8x7b (32k)
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
                            Please Wait
                            <RotateCw className="ml-2 size-4 animate-spin" />
                        </>
                    ) : (
                        <>Regenerate Summary</>
                    )}
                </Button>
            </form>
        </Form>
    )
}
