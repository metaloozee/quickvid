"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { ReloadIcon, RocketIcon } from "@radix-ui/react-icons"
import { ArrowRight, X } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
    openai_key: z.string(),
})

export function Dialog() {
    const router = useRouter()
    const [error, setError] = useState<null | string>(null)
    const [loading, setLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            openai_key: "",
        },
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true)

        if (values.openai_key.length <= 0) {
            setLoading(false)
            return setError("Please enter a valid key!")
        } else {
            try {
                const res = await fetch(
                    "https://api.openai.com/v1/completions",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${values.openai_key}`,
                        },
                        body: JSON.stringify({
                            model: "ada",
                            prompt: "say this is a test",
                            max_tokens: 7,
                            temperature: 0,
                        }),
                    }
                )

                if (res.ok) {
                    setError(null)
                    await localStorage.setItem(
                        "openai_key",
                        values.openai_key as string
                    )
                    await router.push("/summarize")
                    setLoading(false)
                } else {
                    throw new Error("Error: Invalid api token provided!")
                }
            } catch (err: any) {
                setLoading(false)
                setError(err.message as string)

                return
            }
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button>
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center justify-between">
                        <p>OpenAI API Key</p>
                        <AlertDialogTrigger>
                            <Button variant={"outline"}>
                                <X className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-5">
                        <p className="mt-3">
                            This is a open-sourced project and to be useful
                            enough we need to use your OpenAI API Key.
                        </p>
                        <p>
                            Worried about the privacy? The token you enter below
                            will be stored inside the browser&apos; local
                            storage, not our cloud database!
                        </p>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="flex flex-row gap-5"
                            >
                                <FormField
                                    control={form.control}
                                    name="openai_key"
                                    render={({ field }) => (
                                        <FormControl>
                                            <Input
                                                disabled={loading}
                                                placeholder="OpenAI API Key"
                                                {...field}
                                            />
                                        </FormControl>
                                    )}
                                />
                                {!loading ? (
                                    <Button type="submit">Submit</Button>
                                ) : (
                                    <Button
                                        className="min-w-fit"
                                        disabled
                                        type="submit"
                                    >
                                        <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                                        Please wait
                                    </Button>
                                )}
                            </form>

                            <p className="mt-3 text-sm text-red-800">
                                {error ?? null}
                            </p>
                        </Form>
                    </AlertDialogDescription>
                </AlertDialogHeader>
            </AlertDialogContent>
        </AlertDialog>
    )
}
