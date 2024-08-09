import type { Metadata, ResolvingMetadata } from "next"
import { eq } from "drizzle-orm"
import { Eye, Tv } from "lucide-react"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import ytdl from "ytdl-core"

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

type Props = {
    params: { id: string }
}
export const dynamic = "force-dynamic"

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const id = params.id

    const [data] = await db
        .select()
        .from(summaries)
        .where(eq(summaries.videoid, id!))
        .limit(1)

    const videoInfo = await ytdl.getInfo(id)

    if (!data || !videoInfo) {
        return {
            title: "404 - Not Found",
        }
    }

    return {
        title:
            videoInfo.videoDetails.title.length > 20
                ? videoInfo.videoDetails.title.slice(0, 20).concat("...")
                : videoInfo.videoDetails.title,
        description: data.summary?.slice(0, 100).concat("..."),
        keywords: [
            "YouTube Summary",
            "Video Summary",
            "Summary",
            videoInfo.videoDetails.title,
            videoInfo.videoDetails.author.name,
        ],
        openGraph: {
            images: [videoInfo.videoDetails.thumbnails.reverse()[0].url],
        },
    }
}

export default async function SummaryIndexPage({ params }: Props) {
    const [data] = await db
        .select({
            summary: summaries.summary,
            embeddingVideoId: embeddings.videoid,
            transcript: videos.transcript,
        })
        .from(summaries)
        .fullJoin(embeddings, eq(summaries.videoid, embeddings.videoid))
        .fullJoin(videos, eq(summaries.videoid, videos.videoid))
        .where(eq(summaries.videoid, params.id))
        .limit(1)

    const videoInfo = await ytdl.getInfo(params.id!)

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
                            link={videoInfo.videoDetails.video_url}
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
                    <RegenerateSummaryButton videoid={params.id} />
                </div>
            </div>

            <div className="flex w-full flex-col gap-10">
                <VerifyFacts summary={data.summary!} />

                <AI>
                    <Chat
                        videoId={params.id}
                        videoTitle={videoInfo.videoDetails.title}
                        videoAuthor={videoInfo.videoDetails.author.name}
                    />
                </AI>
            </div>

            {!data.embeddingVideoId &&
                process.env.NODE_ENV !== "production" && (
                    <GenerateEmbedding
                        transcript={data.transcript!}
                        videoid={params.id}
                    />
                )}
        </section>
    )
}
