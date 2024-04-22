import Link from "next/link"
import { MoveRight } from "lucide-react"
import ytdl from "ytdl-core"

import { db } from "@/lib/db"
import { summaries } from "@/lib/db/schema"
import { VideoWidget } from "@/components/video-widget"

export default async function SummariesIndexPage() {
    const data = await db
        .select({ videoid: summaries.videoid })
        .from(summaries)
        .limit(2)

    return (
        <section className="container mt-10 flex w-screen flex-col items-start gap-5">
            <div className="flex w-full flex-row items-center gap-10 overflow-scroll md:overflow-visible">
                {data.map(async (d: (typeof data)[0]) => {
                    const videoInfo = await ytdl.getInfo(d.videoid)
                    return (
                        videoInfo && (
                            <Link
                                suppressHydrationWarning
                                href={`/${d.videoid}`}
                                className="w-full rounded-xl bg-secondary p-2 transition-all duration-200 hover:-translate-y-1 md:w-auto"
                            >
                                <VideoWidget
                                    title={videoInfo.videoDetails.title}
                                    thumbnail={
                                        videoInfo.videoDetails.thumbnails.reverse()[0]
                                            .url
                                    }
                                />
                            </Link>
                        )
                    )
                })}

                <Link
                    className="group flex items-center text-xs text-muted-foreground underline decoration-muted-foreground/50 underline-offset-4"
                    href={"/summaries"}
                >
                    View all
                    <MoveRight className="ml-2 h-3 w-3 transition-all duration-200 group-hover:ml-4" />
                </Link>
            </div>
        </section>
    )
}
