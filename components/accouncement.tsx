"use client"

import React from "react"
import { CircleX } from "lucide-react"

export const AnnouncementBanner = ({ text }: { text: string }) => {
    const [isClosed, setIsClosed] = React.useState(false)

    return (
        <div
            className={
                !isClosed
                    ? "bg-primary py-1 text-left text-xs md:py-1"
                    : "hidden"
            }
        >
            <div className="container flex items-center justify-between gap-5">
                <div className="text-justify md:text-center">{text}</div>
                <button onClick={() => setIsClosed(true)}>
                    <CircleX className="size-3" />
                </button>
            </div>
        </div>
    )
}
