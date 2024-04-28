import { eq } from "drizzle-orm"
import { Eye, Tv } from "lucide-react"
import ytdl from "ytdl-core"

import { db } from "@/lib/db"
import { summaries } from "@/lib/db/schema"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RegenerateSummaryButton } from "@/components/regenerate-btn"
import { VerifyFacts } from "@/components/verify-facts"
import { Embed } from "@/components/youtube-embed"

export default async function SummaryIndexPage({ params }: { params: any }) {
    const [data] = await db
        .select()
        .from(summaries)
        .where(eq(summaries.videoid, params.id!))
        .limit(1)

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

    const videoInfo = await ytdl.getInfo(data?.videoid ?? "")

    return (
        <section className="container mt-10 grid w-full grid-cols-1 gap-10 md:grid-cols-3">
            <div className="flex flex-col gap-10 md:col-span-2">
                <div className="flex flex-col items-start gap-5 rounded-xl bg-secondary p-5">
                    <div className="flex w-full flex-col items-center justify-between gap-5 md:flex-row md:items-center">
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
                                {videoInfo.videoDetails.description &&
                                videoInfo.videoDetails.description?.length > 100
                                    ? videoInfo.videoDetails.description
                                          ?.slice(0, 100)
                                          .concat("...")
                                    : videoInfo.videoDetails.description}
                            </p>
                            <div className="mt-3 flex flex-row items-center justify-center gap-4 md:items-start md:justify-start">
                                <Badge>
                                    <Tv className="mr-2 size-3" />{" "}
                                    {videoInfo.videoDetails.author.name}
                                </Badge>
                                <Badge variant="outline">
                                    <Eye className="mr-2 size-3" />{" "}
                                    {videoInfo.videoDetails.viewCount}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex w-full flex-col items-start gap-5 rounded-xl p-5 text-justify outline-dashed outline-2 outline-secondary md:text-left">
                    {data.summary}
                    <RegenerateSummaryButton videoid={data.videoid} />
                </div>
            </div>

            <div className="flex w-full flex-col gap-10">
                <VerifyFacts summary={data.summary!} />
            </div>
        </section>
    )
}
