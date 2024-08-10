export default function HomeLayout({
    children,
    summaries,
}: {
    children: React.ReactNode
    summaries: React.ReactNode
}) {
    return (
        <div>
            {children}
            {summaries}
        </div>
    )
}
