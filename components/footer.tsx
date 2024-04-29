import Link from "next/link"

export const Footer = () => {
    return (
        <p className="container my-10 font-mono text-xs text-neutral-500">
            made with ❤️ by{" "}
            <Link
                className="underline"
                target="_blank"
                rel="noopener noreferrer"
                href="https://github.com/metaloozee/"
            >
                metaloozee
            </Link>{" "}
            •{" "}
            <Link
                className="underline"
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.buymeacoffee.com/metaloozee"
            >
                support
            </Link>
        </p>
    )
}
