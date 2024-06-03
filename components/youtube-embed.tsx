"use client"

import { HTMLAttributes } from "react"
import Image from "next/image"

import { cn } from "@/lib/utils"
import { AspectRatio } from "@/components/ui/aspect-ratio"

export const Embed = ({
    thumbnail,
    className,
}: {
    thumbnail: string
    className?: string
}) => {
    return (
        <div className="w-full md:w-[400px]">
            <AspectRatio ratio={16 / 9}>
                <Image
                    src={thumbnail}
                    alt="Image"
                    className={cn("rounded-md object-cover", className)}
                    fill
                />
            </AspectRatio>
        </div>
    )
}
