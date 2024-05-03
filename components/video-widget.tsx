"use client"

import Image from "next/image"

import { AspectRatio } from "@/components/ui/aspect-ratio"

export const VideoWidget = ({
    title,
    thumbnail,
}: {
    title: string
    thumbnail: string
}) => {
    return (
        <div className="w-full rounded-lg md:w-[300px]">
            <AspectRatio
                suppressHydrationWarning
                ratio={16 / 9}
                className="relative rounded-lg"
            >
                <Image
                    src={thumbnail}
                    alt={title}
                    className="rounded-lg object-cover"
                    fill
                />

                <div className="absolute bottom-0 w-full rounded-b-md bg-background/50 px-4 py-3 backdrop-blur-xl">
                    <p className="text-xs">{title}</p>
                </div>
            </AspectRatio>
        </div>
    )
}
