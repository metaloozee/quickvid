import React from "react"

export const AnnouncementBanner = ({ text }: { text: string }) => {
    return (
        <div className={"bg-primary p-2 text-left text-xs"}>
            <div className="text-justify md:text-center">{text}</div>
        </div>
    )
}
