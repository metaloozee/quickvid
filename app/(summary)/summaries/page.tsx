import Link from "next/link"
import { desc, eq, sql } from "drizzle-orm"
import { Eye, Tv } from "lucide-react"
import ytdl from "ytdl-core"

import { db } from "@/lib/db"
import { summaries, videos } from "@/lib/db/schema"
import { Badge } from "@/components/ui/badge"
import { Search } from "@/components/search"
import { Embed } from "@/components/youtube-embed"

export default async function SummariesIndexPage({
    searchParams,
}: {
    searchParams?: {
        query?: string
    }
}) {
    const query = searchParams?.query

    let data: any

    query
        ? (data = await db
              .select({
                  videoid: summaries.videoid,
                  videotitle: videos.videotitle,
              })
              .from(summaries)
              .leftJoin(videos, eq(videos.videoid, summaries.videoid))
              .orderBy(desc(summaries.updated_at))
              .limit(5)
              .where(
                  sql`to_tsvector('simple', ${videos.videotitle}) @@ plainto_tsquery('simple', ${query})`
              ))
        : (data = await db
              .select({ videoid: summaries.videoid })
              .from(summaries)
              .orderBy(desc(summaries.updated_at))
              .limit(5))

    if (!data) {
        return (
            <section className="container mt-40 flex items-center">
                <div className="flex max-w-5xl flex-col items-start gap-5">
                    <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
                        No Data Found
                    </h1>
                    <p className="text-muted-foreground">
                        We apologize for the inconvenience; your video request
                        cannot be processed. Please reach out to the
                        administrator or attempt again.
                    </p>
                </div>
            </section>
        )
    }

    return (
        <section className="container mt-10 flex w-screen items-center">
            <div className="flex w-full flex-col items-start gap-5">
                <Search placeholder="How to not get Rick Rolled?" />
                {data.map(async (d: (typeof data)[0]) => {
                    const videoInfo = await ytdl.getInfo(d.videoid)
                    return (
                        videoInfo && (
                            <Link
                                suppressHydrationWarning
                                className="flex w-full flex-col items-start gap-5 rounded-xl bg-secondary/30 p-5 transition-all duration-300 hover:bg-secondary/60"
                                href={`/${d.videoid}`}
                            >
                                <div className="flex max-w-3xl flex-col items-center justify-between gap-5 md:flex-row md:items-center">
                                    <Embed
                                        thumbnail={
                                            videoInfo.videoDetails.thumbnails.reverse()[0]
                                                .url
                                        }
                                    />
                                    <div className="flex w-full flex-col gap-2">
                                        <h1 className="text-md text-center font-extrabold leading-tight tracking-tighter md:text-left md:text-lg">
                                            {videoInfo.videoDetails.title}
                                        </h1>
                                        <p className="text-center text-xs text-muted-foreground md:text-left">
                                            {videoInfo.videoDetails
                                                .description &&
                                            videoInfo.videoDetails.description
                                                ?.length > 100
                                                ? videoInfo.videoDetails.description
                                                      ?.slice(0, 100)
                                                      .concat("...")
                                                : videoInfo.videoDetails
                                                      .description}
                                        </p>
                                        <div className="mt-3 flex flex-row items-center justify-center gap-4 md:items-start md:justify-start">
                                            <Badge>
                                                <Tv className="mr-2 size-3" />{" "}
                                                {
                                                    videoInfo.videoDetails
                                                        .author.name
                                                }
                                            </Badge>
                                            <Badge variant="outline">
                                                <Eye className="mr-2 size-3" />{" "}
                                                {
                                                    videoInfo.videoDetails
                                                        .viewCount
                                                }
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )
                    )
                })}
            </div>
        </section>
    )
}
