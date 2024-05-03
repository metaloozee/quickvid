import { NextResponse, type NextRequest } from "next/server"

export function middleware(request: NextRequest) {
    // Comment the below code if you are hosting it on your server.
    if (
        request.nextUrl.hostname !== "quickvid.oozee.me" &&
        request.nextUrl.hostname !== "localhost"
    ) {
        console.log("Redirecting user to quickvid.oozee.me ...")

        return NextResponse.redirect(
            new URL("https://quickvid.oozee.me", request.url)
        )
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
}
