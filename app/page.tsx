import Link from "next/link"
import { Dialog } from "@/components/dialog";

export default function IndexPage() {
  return (
    <section className="container flex h-screen items-center">
      <div className="flex max-w-[980px] flex-col items-start gap-5">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          Save time and get the essence of any YouTube video with SummarizeAI&apos;s intelligent summarization.
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          We use Artificial Intelligence to process the Youtube video and generate summary along with an audio clip.
        </p>
        <Dialog />        
      </div>
    </section>
  )
}
