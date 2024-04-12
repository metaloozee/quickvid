"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { ListVideo } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

export const formSchema = z.object({
    link: z.string().describe("The YouTube Video you would like to summarize."),
    userid: z.string().describe("The User's UUID"),
})

export const InitialForm = ({ userid }: { userid: string }) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            userid: userid,
        },
    })

    return (
        <Form {...form}>
            <form
                className="flex w-full items-center space-x-2"
                onSubmit={form.handleSubmit(() => console.log("hi"))}
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
                    Summarize
                    <ListVideo className="ml-2 h-4 w-4 transition-all duration-200 group-hover:ml-4" />
                </Button>
            </form>
        </Form>
    )
}
