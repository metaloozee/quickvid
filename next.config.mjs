/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: "standalone",
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "i.ytimg.com",
            },
        ],
    },
}

export default nextConfig
