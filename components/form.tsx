"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Bolt, ListVideo, RotateCw } from "lucide-react"
import { useForm } from "react-hook-form"
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
import { handleInitialFormSubmit } from "@/app/actions"

export const formSchema = z.object({
    link: z.string().describe("The YouTube Video you would like to summarize."),
    model: z.enum([
        "gpt-3.5-turbo",
        "gpt-4-turbo",
        "llama3-70b-8192",
        "mixtral-8x7b-32768",
    ]),
})

export const InitialForm: React.FC = () => {
    const router = useRouter()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            model: "gpt-3.5-turbo",
        },
    })

    return (
        <Form {...form}>
            <form
                className="flex w-full flex-col items-start gap-2 md:flex-row"
                onSubmit={form.handleSubmit(async (data) => {
                    await handleInitialFormSubmit(data).then(
                        (value: string | null) => {
                            if (value) {
                                return router.push(`/${value}`)
                            }

                            return
                        }
                    )
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
                                            <Bolt className="size-4 transition-all duration-500 group-hover:rotate-180" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56">
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
                                            <DropdownMenuRadioItem
                                                disabled
                                                value="gpt-4-turbo"
                                            >
                                                gpt-4-turbo (128k)
                                            </DropdownMenuRadioItem>
                                            <DropdownMenuSeparator />

                                            <DropdownMenuLabel>
                                                <Badge
                                                    className="text-xs"
                                                    variant={"secondary"}
                                                >
                                                    Experimental
                                                </Badge>
                                            </DropdownMenuLabel>
                                            <DropdownMenuRadioItem value="llama3-70b-8192">
                                                llama3-70b (8k){" "}
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
                </div>

                <Button
                    disabled={form.formState.isSubmitting}
                    className="group w-full md:max-w-fit"
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
