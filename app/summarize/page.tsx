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
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      yt_link: "",
    },
  });

  const [isKey, setIsKey] = useState<boolean>(false);

  useLayoutEffect(() => {
    const key = localStorage.getItem('openai_key');
    if (key) {
      setIsKey(true);
    } else {
      setIsKey(false);
    }
  }, [])

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
            <form onSubmit={() => console.log("form submitted")} className="flex flex-row gap-5">
              <FormField
                control={form.control}
                name="yt_link"
                render={({ field }) => (
                  <FormControl>
                    <Input placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ" {...field} />
                  </FormControl>
                )}
              />
              <Button type="submit">Submit</Button>
            </form>

            {/* <p className="mt-3 text-sm text-red-800">{error ?? null}</p> */}
          </Form>
        </div>
      </div>
    </section>
  )
}
