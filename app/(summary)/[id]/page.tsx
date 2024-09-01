import type { Metadata, ResolvingMetadata } from "next"
import { env } from "@/env.mjs"
import { eq } from "drizzle-orm"
import { Eye, Tv } from "lucide-react"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import { Innertube } from "youtubei.js"

import { db } from "@/lib/db"
import { embeddings, summaries, videos } from "@/lib/db/schema"
import { Badge } from "@/components/ui/badge"
import { Chat } from "@/components/chat"
import { GenerateEmbedding } from "@/components/generate-embedding-dialog"
import { MemoizedReactMarkdown } from "@/components/markdown/markdown"
import { RegenerateSummaryButton } from "@/components/regenerate-btn"
import { VerifyFacts } from "@/components/verify-facts"
import { Embed } from "@/components/youtube-embed"
import { AI } from "@/app/ai-actions"

export const dynamic = "force-dynamic"

type Props = {
    params: { id: string | null }
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const youtube = await Innertube.create({
        location: "US",
        lang: "en",
        retrieve_player: false,
    })

    if (!params.id) {
        return {
            title: "404 - Not Found",
        }
    }

    const id = params.id

    const [data] = await db
        .select({
            summary: summaries.summary,
            videoTitle: videos.videotitle,
        })
        .from(summaries)
        .fullJoin(videos, eq(summaries.videoid, videos.videoid))
        .where(eq(summaries.videoid, id!))
        .limit(1)

    const videoInfo = await youtube.getInfo(id, "IOS")

    if (!data || !videoInfo) {
        return {
            title: "404 - Not Found",
        }
    }

    return {
        title:
            data.videoTitle!.length > 20
                ? data.videoTitle!.slice(0, 20).concat("...")
                : data.videoTitle!,
        description: data.summary?.slice(0, 100).concat("..."),
        keywords: [
            "YouTube Summary",
            "Video Summary",
            "Summary",
            data.videoTitle!,
            videoInfo.basic_info.author ?? "undefined",
        ],
        openGraph: {
            images: [
                videoInfo.basic_info.thumbnail?.[0]?.url ?? "/placeholder.png",
            ],
        },
    }
}

export default async function SummaryIndexPage({ params }: Props) {
    const youtube = await Innertube.create({
        location: "US",
        lang: "en",
        retrieve_player: false,
    })

    const [data] = await db
        .select({
            title: videos.videotitle,
            summary: summaries.summary,
            embeddingVideoId: embeddings.videoid,
            transcript: videos.transcript,
        })
        .from(summaries)
        .fullJoin(embeddings, eq(summaries.videoid, embeddings.videoid))
        .fullJoin(videos, eq(summaries.videoid, videos.videoid))
        .where(eq(summaries.videoid, params!.id as string))
        .limit(1)

    const videoInfo = await youtube.getInfo(params.id!, "IOS")

    if (!videoInfo || !data.summary) {
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
        <section className="container mt-10 grid w-full grid-cols-1 gap-10 md:grid-cols-3">
            <div className="flex flex-col gap-10 md:col-span-2">
                <div className="flex flex-col items-start gap-5 rounded-xl bg-secondary p-5">
                    <div className="flex w-full flex-col items-center justify-between gap-5 md:flex-row md:items-center">
                        <Embed
                            link={`https://www.youtube.com/watch?v=${params.id}`}
                            thumbnail={
                                videoInfo.basic_info.thumbnail?.[0]?.url ??
                                "/placeholder.png"
                            }
                        />
                        <div className="flex w-full flex-col gap-2">
                            <h1 className="text-md text-center font-extrabold leading-tight tracking-tighter md:text-left md:text-lg">
                                {data.title}
                            </h1>
                            <p className="text-center text-xs text-muted-foreground md:text-left">
                                {(videoInfo.basic_info.short_description &&
                                videoInfo.basic_info.short_description?.length >
                                    100
                                    ? videoInfo.basic_info.short_description
                                          ?.slice(0, 100)
                                          .concat("...")
                                    : videoInfo.basic_info.short_description) ??
                                    "undefined"}
                            </p>
                            <div className="mt-3 flex flex-row items-center justify-center gap-4 md:items-start md:justify-start">
                                <Badge>
                                    <Tv className="mr-2 size-3" />{" "}
                                    {videoInfo.basic_info.author ?? "undefined"}
                                </Badge>
                                <Badge variant="outline">
                                    <Eye className="mr-2 size-3" />{" "}
                                    {videoInfo.basic_info.view_count ??
                                        "undefined"}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex w-full flex-col items-start gap-5 rounded-xl p-5 text-justify outline-dashed outline-2 outline-secondary md:text-left">
                    <MemoizedReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        components={{
                            h1({ children }) {
                                return (
                                    <h1 className="text-xl font-bold">
                                        {children}
                                    </h1>
                                )
                            },
                            h2({ children }) {
                                return (
                                    <h2 className="text-xl font-bold">
                                        {children}
                                    </h2>
                                )
                            },
                            strong({ children }) {
                                return (
                                    <strong className="underline decoration-primary underline-offset-4">
                                        {children}
                                    </strong>
                                )
                            },
                            li({ children }) {
                                return (
                                    <li className="list-inside list-disc">
                                        {children}
                                    </li>
                                )
                            },
                            ul({ children }) {
                                return <ul className="list-item">{children}</ul>
                            },
                            ol({ children }) {
                                return <ol className="list-item">{children}</ol>
                            },
                            p({ children }) {
                                return <p>{children}</p>
                            },
                        }}
                    >
                        {data.summary}
                    </MemoizedReactMarkdown>
                    <RegenerateSummaryButton videoid={params.id as string} />
                </div>
            </div>

            <div className="flex w-full flex-col gap-10">
                <VerifyFacts summary={data.summary!} />

                <AI>
                    <Chat
                        videoId={params.id as string}
                        videoTitle={data.title!}
                        videoAuthor={videoInfo.basic_info.author ?? "undefined"}
                    />
                </AI>
            </div>

            {!data.embeddingVideoId &&
                process.env.NODE_ENV !== "production" && (
                    <GenerateEmbedding
                        transcript={data.transcript!}
                        videoid={params.id as string}
                    />
                )}
        </section>
    )
}
