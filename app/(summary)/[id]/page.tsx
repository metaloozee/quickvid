import type { Metadata, ResolvingMetadata } from "next"
import { eq } from "drizzle-orm"
import {
    Bot,
    BotMessageSquare,
    CornerDownLeft,
    Ellipsis,
    Eye,
    Tv,
    UserRound,
} from "lucide-react"
import ytdl from "ytdl-core"

import { db } from "@/lib/db"
import { summaries } from "@/lib/db/schema"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RegenerateSummaryButton } from "@/components/regenerate-btn"
import { VerifyFacts } from "@/components/verify-facts"
import { Embed } from "@/components/youtube-embed"

type Props = {
    params: { id: string }
}

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
        .select()
        .from(summaries)
        .where(eq(summaries.videoid, params.id!))
        .limit(1)

    const videoInfo = await ytdl.getInfo(params.id!)

    if (!videoInfo || !data) {
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
                    {data.summary}
                    <RegenerateSummaryButton videoid={data.videoid} />
                </div>
            </div>

            <div className="flex w-full flex-col gap-10">
                <VerifyFacts summary={data.summary!} />

                <div className="col-span-1 flex w-full flex-col gap-10">
                    <div className="flex w-full flex-col items-start gap-5 rounded-xl py-2 text-justify outline-dashed outline-2 outline-blue-400 md:text-left">
                        <div className="w-full border-b-2 border-dashed border-blue-400 pb-2">
                            <h1 className="flex items-center justify-center text-center text-blue-400">
                                <Bot />
                            </h1>
                        </div>

                        <div className="flex w-full flex-col gap-5 px-5">
                            <div className="flex flex-row items-center gap-4 py-2">
                                <div className="">
                                    <BotMessageSquare className="size-7 min-w-fit rounded-full rounded-bl-none bg-blue-400 p-1.5" />
                                </div>
                                <p className="text-xs">
                                    Ahoy matey! Got questions &apos;bout the
                                    video or anythin&apos; else? Use this chat
                                    to ask away, or walk the plank! Arrr! 🏴‍☠️🪝
                                </p>
                            </div>

                            <div className="flex flex-row-reverse items-center gap-4 py-2">
                                <div className="">
                                    <UserRound className="size-7 min-w-fit rounded-full rounded-br-none bg-primary p-1.5" />
                                </div>
                                <p className="text-right text-xs text-muted-foreground">
                                    What are fermions and bosons?
                                </p>
                            </div>

                            <div className="flex flex-row items-center gap-4 py-2">
                                <div className="">
                                    <BotMessageSquare className="size-7 min-w-fit rounded-full rounded-bl-none bg-blue-400 p-1.5" />
                                </div>

                                <p className="animate-pulse text-xs">
                                    <Ellipsis className="size-4" />
                                </p>
                            </div>
                        </div>

                        <div className="flex w-full items-center justify-center gap-2 px-5 py-4">
                            <Textarea
                                placeholder="ask me anything..."
                                className="min-h-12 resize-none text-xs focus-visible:ring-blue-400"
                            />
                            <Button className="h-full bg-blue-400 hover:bg-blue-500">
                                <CornerDownLeft className="size-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
