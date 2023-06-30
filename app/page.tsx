import Link from "next/link"

import { Dialog } from "@/components/dialog"

export default function IndexPage() {
  return (
    <section className="container mt-40 flex items-center">
      <div className="flex max-w-[980px] flex-col items-start gap-5">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          Save time and get the essence of any YouTube video with our
          intelligent summarization.
        </h1>
        <p className="text-md text-muted-foreground">
          Using cutting-edge Artificial Intelligence technology, our application
          intelligently analyzes the contents of a YouTube video and generates a
          concise summary that captures the essence of the video.
        </p>
        <Dialog />
        <p className="mt-10 font-mono text-xs text-neutral-500">
          made with ❤️ by{" "}
          <Link
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/metaloozee/"
          >
            metaloozee
          </Link>
        </p>
      </div>
    </section>
  )
}
