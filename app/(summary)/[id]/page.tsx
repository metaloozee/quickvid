import { Eye, Tv } from "lucide-react"
import ytdl from "ytdl-core"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Embed } from "@/components/youtube-embed"

export default async function SummaryIndexPage({ params }: { params: any }) {
    const supabase = await createSupabaseServerClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const { data } = await supabase
        .from("summaries")
        .select("*, users(avatar_url, full_name)")
        .eq("video", params.id)
        .eq("userid", user?.id)
        .single()

    const videoInfo = await ytdl.getInfo(data?.video ?? "")

    return (
        <section className="container mt-10 grid w-full grid-cols-1 gap-10 md:grid-cols-3">
            <div className="col-span-2 flex flex-col gap-10">
                <div>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Consequatur ipsam, alias similique omnis cum unde nam eos,
                    repellat facilis non nostrum. Ex autem odio dicta corrupti
                    modi ipsum, hic laborum! Lorem ipsum dolor sit amet,
                    consectetur adipisicing elit. Tempore neque vitae debitis
                    nemo voluptatum qui ad fuga sit et, itaque libero? Ex sed
                    dolorum esse laborum incidunt eveniet id rem? Lorem ipsum
                    dolor sit amet consectetur adipisicing elit. Repellat quidem
                    nihil molestias eos sapiente aperiam distinctio earum id est
                    magni inventore vel doloribus nam enim ut dolor, repellendus
                    cupiditate tempora. Lorem ipsum dolor sit amet, consectetur
                    adipisicing elit. Magnam dolore cumque praesentium rem odit
                    labore aspernatur, dignissimos reprehenderit harum
                    voluptatibus error est iusto eum minima magni alias earum
                    culpa qui? Lorem ipsum dolor, sit amet consectetur
                    adipisicing elit. Eos fugiat nemo tempora vero aliquam
                    illum! Facere repudiandae obcaecati impedit neque
                    perspiciatis repellat magnam? Consectetur, minima autem
                    totam aperiam dolore voluptate.
                </div>
                <Button variant={"secondary"}>Regenerate Summary</Button>
            </div>
            <div className="flex w-full flex-col gap-10">
                <div className="flex flex-col items-start gap-5 rounded-xl bg-secondary p-5">
                    <div className="flex w-full flex-col items-center justify-between gap-5 md:flex-row md:items-start">
                        <Embed
                            thumbnail={
                                videoInfo.videoDetails.thumbnails.reverse()[0]
                                    .url
                            }
                        />
                        <div className="flex w-full flex-col gap-2">
                            <h1 className="text-md text-center font-extrabold leading-tight tracking-tighter md:text-left md:text-lg">
                                {videoInfo.videoDetails.title.length > 40
                                    ? videoInfo.videoDetails.title
                                          .slice(0, 40)
                                          .concat("...")
                                    : videoInfo.videoDetails.title}
                            </h1>
                        </div>
                    </div>
                    <div className="flex flex-row items-center gap-4 md:items-start">
                        <Badge>
                            <Tv className="mr-2 h-3 w-3" />{" "}
                            {videoInfo.videoDetails.author.name}
                        </Badge>
                        <Badge variant="outline">
                            <Eye className="mr-2 h-3 w-3" />{" "}
                            {videoInfo.videoDetails.viewCount}
                        </Badge>
                    </div>
                </div>

                <div className="flex w-full flex-col gap-5 rounded-xl border-primary p-5 outline-dashed outline-2 outline-primary">
                    <p className="text-sm">
                        Our fact checker verifies video content by searching the
                        internet and comparing information from reliable
                        sources. It labels videos as accurate, partially
                        accurate, or inaccurate based on its analysis. Please
                        note that accuracy depends on available internet
                        information.
                    </p>
                    <Button>Verify Now</Button>
                </div>
            </div>
        </section>
    )
}
