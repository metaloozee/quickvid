"use client"

import Image from "next/image"
import LiteYouTubeEmbed from "react-lite-youtube-embed"

import { AspectRatio } from "@/components/ui/aspect-ratio"

export const Embed = ({ thumbnail }: { thumbnail: string }) => {
    return (
        <div className="w-[450px] border-spacing-1 rounded-sm outline outline-offset-4 outline-primary">
            <AspectRatio ratio={16 / 9}>
                <Image
                    src={thumbnail}
                    alt="Image"
                    className="rounded-md object-cover"
                    fill
                />
            </AspectRatio>
        </div>
    )
}
