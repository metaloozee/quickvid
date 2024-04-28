"use client"

import React, { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { RotateCw, ShieldCheck, ShieldX } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { checkFacts, type FactCheckerResponse } from "@/app/actions"

export const VerifyFactsFormSchema = z.object({
    summary: z.string(),
})

export const VerifyFacts: React.FC<{ summary: string }> = ({ summary }) => {
    const [isAccurate, setIsAccurate] = useState<"true" | "false" | null>(null)
    const [source, setSource] = useState<string | null>(null)
    const [output, setOutput] = useState<string | null>(null)

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
                    await checkFacts(data).then(
                        (value: FactCheckerResponse | null) => {
                            if (!value) {
                                return console.log("Couldn't Verify the facts.")
                            }

                            setIsAccurate(value.isAccurate)
                            setSource(value.source)
                            return setOutput(value.text)
                        }
                    )
                })}
            >
                <p className="text-justify text-xs md:text-left">
                    {output ? (
                        <div className="flex flex-col gap-2">
                            <Badge className="max-w-fit">
                                {isAccurate == "true" ? (
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
                            <p className="mt-4">{output}</p>
                            <Link
                                href={source!}
                                className="mt-2 text-xs text-muted-foreground"
                            >
                                {source}
                            </Link>
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
                        disabled={verifyFactsForm.formState.isSubmitting}
                        className="group w-full"
                        type="submit"
                    >
                        {verifyFactsForm.formState.isSubmitting ? (
                            <>
                                Please Wait
                                <RotateCw className="ml-2 size-4 animate-spin" />
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
