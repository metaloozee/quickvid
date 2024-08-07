import Link from "next/link"
import { desc } from "drizzle-orm"
import { MoveRight } from "lucide-react"
import ytdl from "ytdl-core"

import { db } from "@/lib/db"
import { summaries } from "@/lib/db/schema"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { VideoWidget } from "@/components/video-widget"

export const dynamic = "force-dynamic"

export default async function SummariesIndexPage() {
    const data = await db
        .select({ videoid: summaries.videoid })
        .from(summaries)
        .orderBy(desc(summaries.updated_at))
        .limit(3)

    return (
        <section className="container mt-10 flex w-screen flex-col items-start gap-5">
            <div className="flex w-full flex-row flex-wrap items-center justify-center gap-5 md:justify-start md:gap-10">
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

                <Button
                    variant={"link"}
                    asChild
                    className="text-xs text-muted-foreground"
                >
                    <Link
                        className="group underline decoration-muted-foreground/50 underline-offset-4"
                        href={"/summaries"}
                    >
                        View More
                        <MoveRight className="ml-2 size-3 transition-all duration-200 group-hover:ml-4" />
                    </Link>
                </Button>
            </div>
        </section>
    )
}
