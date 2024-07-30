"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader, ShieldCheck, ShieldX } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import {
    generateQueries,
    seachWithTavily,
    verifyFacts,
} from "@/lib/core/search"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"

export const VerifyFactsFormSchema = z.object({
    summary: z.string(),
})

export const VerifyFacts: React.FC<{ summary: string }> = ({ summary }) => {
    const [isAccurate, setIsAccurate] = useState<true | false | null>(null)
    const [source, setSource] = useState<string | null>(null)
    const [output, setOutput] = useState<string | null>(null)

    const [status, setStatus] = useState<string | null>("Preparing...")
    const [time, setTime] = useState(0)
    const [isRunning, setIsRunning] = useState(false)

    useEffect(() => {
        let intervalId: NodeJS.Timeout
        if (isRunning) {
            intervalId = setInterval(() => setTime(time + 1), 10)
        }
        return () => clearInterval(intervalId)
    }, [isRunning, time])

    const seconds = Math.floor((time % 6000) / 100)
    const miliseconds = time % 100

    const stop = () => {
        setTime(0)
        setIsRunning(false)
    }

    const restart = () => {
        setTime(0)
        setIsRunning(true)
    }

    const verifyFactsForm = useForm<z.infer<typeof VerifyFactsFormSchema>>({
        resolver: zodResolver(VerifyFactsFormSchema),
        defaultValues: {
            summary,
        },
    })

    return (
        <Form {...verifyFactsForm}>
            <form
                className="flex w-full flex-col gap-5 rounded-xl border-primary p-5 outline-dashed outline-2 outline-primary"
                onSubmit={verifyFactsForm.handleSubmit(async (data) => {
                    setStatus("Generating Queries...")
                    await generateQueries(data.summary).then(
                        async ({ queries }) => {
                            if (!queries) {
                                stop()
                                return toast.error(
                                    "Couldn't generate search queries. Try again later."
                                )
                            }

                            restart()
                            setStatus("Searching...")

                            const documents = await seachWithTavily(queries)
                            if (!documents) {
                                stop()
                                return toast.error(
                                    "Couldn't search the internet. Try again later."
                                )
                            }

                            restart()
                            setStatus("Just a sec...")

                            const output = await verifyFacts({
                                documents,
                                summary,
                            })
                            if (!output) {
                                stop()
                                return toast.error(
                                    "Couldn't process the search results. Try again later."
                                )
                            }

                            setIsAccurate(output.grade)
                            return setOutput(output.explaination)
                        }
                    )
                })}
            >
                <p className="text-justify text-xs md:text-left">
                    {output ? (
                        <div className="flex flex-col gap-2">
                            <Badge className="max-w-fit">
                                {isAccurate ? (
                                    <>
                                        <ShieldCheck className="mr-2 size-4" />
                                        Accurate
                                    </>
                                ) : (
                                    <>
                                        <ShieldX className="mr-2 size-4" />
                                        Inaccurate
                                    </>
                                )}
                            </Badge>
                            <p className="mt-2">{output}</p>
                        </div>
                    ) : (
                        `
                                Our fact checker verifies video content by searching the
                                internet and comparing information from reliable
                                sources. It labels videos as accurate, partially
                                accurate, or inaccurate based on its analysis. Please
                                note that accuracy depends on available internet
                                information.
                                `
                    )}
                </p>

                {!output && (
                    <Button
                        disabled={
                            // process.env.NODE_ENV === "production" ||
                            verifyFactsForm.formState.isSubmitting
                        }
                        className="group w-full"
                        type="submit"
                    >
                        {verifyFactsForm.formState.isSubmitting ? (
                            <>
                                <Loader className="mr-2 size-4 animate-spin duration-1000" />{" "}
                                {status} {seconds}s {miliseconds}ms
                            </>
                        ) : (
                            <>Check For Truth</>
                        )}
                    </Button>
                )}
            </form>
        </Form>
    )
}
