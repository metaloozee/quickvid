"use client"

import Image from "next/image"

import { AspectRatio } from "@/components/ui/aspect-ratio"

export const Embed = ({ thumbnail }: { thumbnail: string }) => {
    return (
        <div className="w-full md:w-[400px]">
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
