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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { handleInitialFormSubmit } from "@/app/actions"

export const formSchema = z.object({
    link: z.string().describe("The YouTube Video you would like to summarize."),
    // model: z.enum(["gpt-3.5-turbo", "gpt-4-turbo", "mixtral-8x7b"]),
})

export const InitialForm = () => {
    const { toast } = useToast()
    const router = useRouter()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        // defaultValues: {
        //     model: "gpt-4-turbo",
        // },
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
                    disabled={form.formState.isSubmitting}
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

                {/* <FormField
                    disabled={form.formState.isSubmitting}
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                        <FormItem>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select AI Model" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="gpt-3.5-turbo">
                                        gpt-3.5-turbo
                                    </SelectItem>
                                    <SelectItem value="gpt-4-turbo">
                                        gpt-4-turbo
                                    </SelectItem>
                                    <SelectItem value="mixtral-8x7b">
                                        mixtral-8x7b
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )}
                /> */}

                <Button
                    disabled={form.formState.isSubmitting}
                    className="group w-full max-w-fit"
                    type="submit"
                >
                    {form.formState.isSubmitting ? (
                        <>
                            Please Wait
                            <RotateCw className="ml-2 size-4 animate-spin" />
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
