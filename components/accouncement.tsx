export const AnnouncementBanner = ({ text }: { text: string }) => {
    return (
        <div className="flex h-5 items-center justify-center bg-primary py-5 text-center text-xs md:py-0">
            {text}
        </div>
    )
}
