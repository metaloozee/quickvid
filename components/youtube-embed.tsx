"use client"

import Image from "next/image"
import Link from "next/link"
import { YoutubeIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Button } from "@/components/ui/button"

export const Embed = ({
    thumbnail,
    link,
    className,
}: {
    thumbnail: string
    link?: string
    className?: string
}) => {
    return (
        <div className="w-full md:w-[400px]">
            <AspectRatio ratio={16 / 9} className="transition-all duration-300">
                <Image
                    src={thumbnail}
                    alt="Image"
                    className={cn("rounded-md object-cover", className)}
                    fill
                />

                {link ? (
                    <div className="absolute flex size-full items-center justify-center rounded-md">
                        <Button
                            size={null}
                            className="rounded-full bg-muted/50 p-3 backdrop-blur-md"
                        >
                            <Link
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <YoutubeIcon className="size-6" />
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <></>
                )}
            </AspectRatio>
        </div>
    )
}
