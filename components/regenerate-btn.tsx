"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { RotateCw } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { toast } from "@/components/ui/use-toast"
import { handleRegenerateSummary } from "@/app/actions"

export const RegenerateFormSchema = z.object({
    videoid: z.string().describe("The YouTube video's unique ID"),
})
export const RegenerateSummaryButton = ({ videoid }: { videoid: string }) => {
    const regenerateForm = useForm<z.infer<typeof RegenerateFormSchema>>({
        resolver: zodResolver(RegenerateFormSchema),
        defaultValues: {
            videoid: videoid,
        },
    })

    return (
        <Form {...regenerateForm}>
            <form
                className="w-full"
                onSubmit={regenerateForm.handleSubmit(async (data) => {
                    await handleRegenerateSummary(data).then(
                        (value: boolean) => {
                            if (!value) {
                                return toast({
                                    title: "Uh Oh! An Error Occured!",
                                    description:
                                        "An unexpected error occurred, kindly contact the administrator or try again later.",
                                })
                            }
                        }
                    )
                })}
            >
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
