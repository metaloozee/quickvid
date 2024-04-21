export const AnnouncementBanner = ({ text }: { text: string }) => {
    return (
        <div className="bg-primary py-1 text-left text-xs md:py-1">
            <div className="container text-justify md:text-center">{text}</div>
        </div>
    )
}
