import Link from "next/link"
import ytdl from "@distube/ytdl-core"
import { desc, eq, sql } from "drizzle-orm"
import { Eye, Tv } from "lucide-react"
import { Innertube } from "youtubei.js/web"

import agent from "@/lib/core/agent"
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
    const youtube = await Innertube.create({
        location: "US",
        lang: "en",
        retrieve_player: false,
    })

    const query = searchParams?.query

    let data: {
        videoid: string | null
        videotitle: string | null
    }[]

    query
        ? (data = await db
              .select({
                  videoid: summaries.videoid,
                  videotitle: videos.videotitle,
              })
              .from(summaries)
              .leftJoin(videos, eq(videos.videoid, summaries.videoid))
              .orderBy(desc(summaries.updated_at))
              .where(
                  sql`to_tsvector('simple', ${videos.videotitle}) @@ plainto_tsquery('simple', ${query})`
              ))
        : (data = await db
              .select({
                  videoid: summaries.videoid,
                  videotitle: videos.videotitle,
              })
              .from(summaries)
              .leftJoin(videos, eq(videos.videoid, summaries.videoid))
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
                    const videoInfo = await youtube.getInfo(d.videoid!)

                    if (!videoInfo) {
                        return <></>
                    }

                    return (
                        <Link
                            suppressHydrationWarning
                            className="group flex w-full flex-col items-start gap-5 rounded-xl bg-secondary/30 p-5 transition-all duration-300 hover:bg-secondary/60"
                            href={`/${d.videoid}`}
                        >
                            <div className="flex max-w-3xl flex-col items-center justify-between gap-5 md:flex-row md:items-center">
                                <Embed
                                    className="outline-none transition-all duration-300 group-hover:outline-2 group-hover:outline-primary"
                                    thumbnail={
                                        videoInfo.basic_info.thumbnail?.[0]
                                            ?.url ?? "/placeholder.png"
                                    }
                                />
                                <div className="flex w-full flex-col gap-2">
                                    <h1 className="text-md text-center font-extrabold leading-tight tracking-tighter transition-all duration-300 group-hover:text-primary md:text-left md:text-lg">
                                        {d.videotitle}
                                    </h1>
                                    <p className="text-center text-xs text-muted-foreground md:text-left">
                                        {(videoInfo.basic_info
                                            .short_description &&
                                        videoInfo.basic_info.short_description
                                            ?.length > 100
                                            ? videoInfo.basic_info.short_description
                                                  ?.slice(0, 100)
                                                  .concat("...")
                                            : videoInfo.basic_info
                                                  .short_description) ??
                                            "undefined"}
                                    </p>
                                    <div className="mt-3 flex flex-row items-center justify-center gap-4 md:items-start md:justify-start">
                                        <Badge>
                                            <Tv className="mr-2 size-3" />{" "}
                                            {videoInfo.basic_info.author ??
                                                "undefined"}
                                        </Badge>
                                        <Badge variant="outline">
                                            <Eye className="mr-2 size-3" />{" "}
                                            {videoInfo.basic_info.view_count ??
                                                "undefined"}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </section>
    )
}
