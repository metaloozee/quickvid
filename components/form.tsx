"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { ListVideo, RotateCw } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { handleInitialFormSubmit } from "@/app/actions"

export const formSchema = z.object({
    link: z.string().describe("The YouTube Video you would like to summarize."),
})

export const InitialForm = () => {
    const { toast } = useToast()
    const router = useRouter()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    })

    return (
        <Form {...form}>
            <form
                className="flex w-full items-center space-x-2"
                onSubmit={form.handleSubmit(async (data) => {
                    await handleInitialFormSubmit(data).then(
                        (value: string | null) => {
                            if (value) {
                                return router.push(`/${value}`)
                            }

                            return toast({
                                title: "Uh Oh! An Error Occurred",
                                description:
                                    "An unexpected error occurred, kindly contact the administrator or try again later.",
                            })
                        }
                    )
                })}
            >
                <FormField
                    control={form.control}
                    name="link"
                    render={({ field }) => (
                        <FormItem className="w-full max-w-lg">
                            <FormControl>
                                <Input
                                    placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                                    {...field}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <Button
                    disabled={form.formState.isSubmitting}
                    className="group w-full max-w-fit"
                    type="submit"
                >
                    {form.formState.isSubmitting ? (
                        <>
                            Please Wait
                            <RotateCw className="ml-2 h-4 w-4 animate-spin" />
                        </>
                    ) : (
                        <>
                            Summarize
                            <ListVideo className="ml-2 h-4 w-4 transition-all duration-200 group-hover:ml-4" />
                        </>
                    )}
                </Button>
            </form>
        </Form>
    )
}
