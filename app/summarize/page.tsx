"use client"

import Link from "next/link";
import { useLayoutEffect, useState } from "react"

export default function SummarizePage() {
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
    <section className="container flex h-screen items-center">
      <div className="flex max-w-[980px] flex-col items-start gap-5">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          OpenAI API Key Found
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          We use Artificial Intelligence to process the Youtube video and generate summary along with an audio clip.
        </p>
      </div>
    </section>
  )
}
