import { TriangleAlert } from "lucide-react"

import { InitialForm } from "@/components/form"

export default async function IndexPage() {
    return (
        <section className="container mt-10 flex items-center md:mt-28">
            <div className="flex max-w-5xl flex-col items-start gap-5">
                <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
                    Save time and get the essence of any YouTube video with our
                    intelligent summarization.
                </h1>
                <p className="text-sm text-muted-foreground">
                    Using cutting-edge Artificial Intelligence technology, our
                    application intelligently analyzes the contents of a YouTube
                    video and generates a concise summary that captures the
                    essence of the video.
                </p>

                <div className="mt-4 w-full">
                    <InitialForm />
                    {/* <p className="mt-4 flex items-center text-xs text-yellow-600">
                        <TriangleAlert className="mr-2 size-4" />
                        If you need to summarize a long video, it&apos;s best to
                        use the GPT-4-Turbo model.
                    </p> */}
                </div>
            </div>
        </section>
    )
}
