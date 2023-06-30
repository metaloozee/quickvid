"use client"

import { useLayoutEffect, useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { ReloadIcon, RocketIcon, TextAlignJustifyIcon } from "@radix-ui/react-icons"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  yt_link: z.string(),
})

export default function SummarizePage() {
  const [preLoading, setPreLoading] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioPath, setAudioPath] = useState<string | null>(null)

  const [isGenerating, setIsGenerating] = useState(false)
  const [transcript, setTranscript] = useState<string | null>(null)
  const [summary, setSummary] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      yt_link: "",
    },
  })

  const [isKey, setIsKey] = useState<boolean>(false)
  const [key, setKey] = useState<string | null>(null)

  useLayoutEffect(() => {
    setPreLoading(true)
    const key = localStorage.getItem("openai_key")
    if (key) {
      setPreLoading(false)
      setIsKey(true)
      setKey(key)
    } else {
      setPreLoading(false)
      setIsKey(false)
      setKey(null)
    }
  }, [])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true)
    const youtubeLinkRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+/

    if (
      values.yt_link.length <= 0 ||
      youtubeLinkRegex.test(values.yt_link) != true
    ) {
      setLoading(false)
      setError("Please enter a valid link!")
    } else {
      setError(null)
      const response = await fetch(
        `/api/convert?youtubeLink=${encodeURIComponent(values.yt_link)}`
      )

      if (response.ok) {
        const { path } = await response.json()
        setAudioPath(path.filePath)
        setLoading(false)
      } else {
        setLoading(false)
        setError("An error occurred! Please try again later.")
        console.error(response.statusText)
      }
    }
  }

  const onClear = () => {
    setLoading(false)
    setAudioPath(null)
    setError(null)
    form.reset()
  }

  const onGenerate = async () => {
    setIsGenerating(true)

    try {
      if (!key || !audioPath) {
        throw new Error("OpenAI API Key or the Audio Path is missing!")
      }

      const response = await fetch(
        `/api/getTranscript?audioPath=${encodeURIComponent(
          `public/${audioPath}`
        )}&openAIKey=${encodeURIComponent(key)}`
      )

      if (response.ok) {
        const data = await response.json()
        setTranscript(data.response)

        if (data) {
          const summaryRes = await fetch(
            `/api/getSummary?transcript=${encodeURIComponent(
              data.response
            )}&openAIKey=${encodeURIComponent(key)}`
          )

          if (summaryRes.ok) {
            const summarizedData = await summaryRes.json()
            setSummary(summarizedData.result.text)
          } else {
            setError("An error occurred! Please try again later.")
            throw new Error(summaryRes.statusText)
          }
        }
      } else {
        setError("An error occurred! Please try again later.")

        throw new Error(response.statusText)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsGenerating(false)
      setAudioPath(null)
      setLoading(false)
    }
  }

  if (preLoading) {
    return (
      <section className="container flex h-screen items-center">
        <div className="flex max-w-[980px] flex-col items-start gap-5">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
            Loading
          </h1>
        </div>
      </section>
    )
  }

  if (!isKey) {
    return (
      <section className="container flex h-screen items-center">
        <div className="flex max-w-[980px] flex-col items-start gap-5">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
            OpenAI API Token Not Found
          </h1>
          <p className="max-w-[700px] text-lg text-muted-foreground">
            Please{" "}
            <Link className="underline" href="/">
              click here
            </Link>{" "}
            to go back and set the OpenAI API Token
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-32">
      <div className="flex max-w-[980px] flex-col items-start gap-5">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          Enter YouTube video&apos;s link below!
        </h1>

        <div className="w-full">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-row gap-5"
            >
              <FormField
                control={form.control}
                name="yt_link"
                render={({ field }) => (
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                      {...field}
                    />
                  </FormControl>
                )}
              />
              {!loading ? (
                <Button type="submit">Submit</Button>
              ) : (
                <Button className="min-w-fit" disabled type="submit">
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </Button>
              )}
            </form>

            <p className="mt-3 text-sm text-red-800">{error ?? null}</p>
          </Form>

          {audioPath && (
            <Alert className="mt-10">
              <RocketIcon className="h-4 w-4" />
              <AlertTitle>Heads up!</AlertTitle>
              <AlertDescription className="flex flex-col gap-2">
                <span>
                  Your audio is generated! Do you want to generate a short
                  summary?
                </span>
                <div className="mt-3 flex flex-wrap gap-2 md:mt-2 md:gap-5">
                  {!isGenerating ? (
                    <>
                      <Button
                        onClick={onGenerate}
                        disabled={isGenerating}
                        type="submit"
                      >
                        Generate
                      </Button>
                      <Button
                        onClick={onClear}
                        variant="outline"
                        disabled={isGenerating}
                        type="submit"
                      >
                        Nevermind
                      </Button>
                    </>
                  ) : (
                    <Button className="min-w-fit" disabled type="submit">
                      <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                      Cooking...
                    </Button>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          {/* 
          {transcript && (
            <div>
              {transcript}
            </div>
          )} */}

          {summary && (
            <Alert>
              {/* <TextAlignJustifyIcon className="h-4 w-4" /> */}
              <AlertTitle>Summary:</AlertTitle>
              <AlertDescription className="mt-2">{summary}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </section>
  )
}
