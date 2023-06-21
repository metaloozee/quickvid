"use client"

import Link from "next/link";
import { useLayoutEffect, useState } from "react"

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  yt_link: z.string()
});

export default function SummarizePage() {
  const [preLoading, setPreLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      yt_link: "",
    },
  });

  const [isKey, setIsKey] = useState<boolean>(false);

  useLayoutEffect(() => {
    setPreLoading(true);
    const key = localStorage.getItem('openai_key');
    if (key) {
      setPreLoading(false);
      setIsKey(true);
    } else {
      setPreLoading(false);
      setIsKey(false);
    }
  }, [])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    const youtubeLinkRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+/;

    if (values.yt_link.length <= 0 || youtubeLinkRegex.test(values.yt_link) != true) {
      setLoading(false);
      setError("Please enter a valid link!");
    } else {
      setError(null);

      const response = await fetch(`/api/convert?youtubeLink=${encodeURIComponent(values.yt_link)}`);

      if (response.ok) {
        const { audioUrl } = await response.json();
        setAudioURL(audioUrl);
        setLoading(false);
      } else {
        setLoading(false);
        setError("An error occurred! Please try again later.");
        console.error(response.statusText);
      }
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
            Please <Link className="underline" href="/">click here</Link> to go back and set the OpenAI API Token
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-32">
      <div className="flex max-w-[980px] flex-col items-start gap-5">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          Enter your link below!
        </h1>

        <div className="w-full">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-row gap-5">
              <FormField
                control={form.control}
                name="yt_link"
                render={({ field }) => (
                  <FormControl>
                    <Input placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ" {...field} />
                  </FormControl>
                )}
              />
              <Button disabled={loading} type="submit">Submit</Button>
            </form>

            <p className="mt-3 text-sm text-red-800">{error ?? null}</p>
            
            {audioURL && (
              <audio controls src={audioURL as string} />
            )}
          </Form>
        </div>

      </div>
    </section>
  )
}
