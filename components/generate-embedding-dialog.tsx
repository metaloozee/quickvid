"use client"

import React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { embedTranscript } from "@/app/actions"

export const GenerateEmbeddingFormSchema = z.object({
    videoid: z.string().describe("The YouTube video's unique ID"),
    transcript: z.string(),
})

export const GenerateEmbedding = ({
    videoid,
    transcript,
}: {
    videoid: string
    transcript: string
}) => {
    const [isOpen, setIsOpen] = React.useState(true)

    const generateEmbeddingForm = useForm<
        z.infer<typeof GenerateEmbeddingFormSchema>
    >({
        resolver: zodResolver(GenerateEmbeddingFormSchema),
        defaultValues: {
            videoid,
            transcript,
        },
    })

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button className="hidden" variant="outline">
                    Show Dialog
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Embeddings Not Found</AlertDialogTitle>
                    <AlertDialogDescription>
                        We couldn&apos;t find the necessary embedding for this
                        video. In order to use the chatbot, kindly generate the
                        embeddings.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel asChild suppressHydrationWarning>
                        <Button
                            variant={"outline"}
                            disabled={
                                generateEmbeddingForm.formState.isSubmitting
                            }
                        >
                            Nevermind
                        </Button>
                    </AlertDialogCancel>
                    <AlertDialogAction asChild suppressHydrationWarning>
                        <Form {...generateEmbeddingForm}>
                            <form
                                onSubmit={generateEmbeddingForm.handleSubmit(
                                    async (data) => {
                                        const isEmbedded =
                                            await embedTranscript({
                                                videoId: data.videoid,
                                                transcript: data.transcript,
                                            })

                                        if (isEmbedded) {
                                            setIsOpen(false)
                                            return toast.success(
                                                "Successfully Generated Embeddings"
                                            )
                                        } else {
                                            return toast.error(
                                                "Failed to generate the embeddings"
                                            )
                                        }
                                    }
                                )}
                            >
                                <Button
                                    disabled={
                                        generateEmbeddingForm.formState
                                            .isSubmitting
                                    }
                                    className="group w-full"
                                    type="submit"
                                    suppressHydrationWarning
                                >
                                    {generateEmbeddingForm.formState
                                        .isSubmitting ? (
                                        <>
                                            <Loader className="mr-2 size-4 animate-spin duration-1000" />
                                            Generating
                                        </>
                                    ) : (
                                        <>Regenerate Summary</>
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
