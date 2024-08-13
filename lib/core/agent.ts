import { env } from "@/env.mjs"
import ytdl, { type Agent } from "@distube/ytdl-core"

const proxies = [
    "152.26.229.42:9443",
    "152.26.229.66:9443",
    "152.26.229.86:9443",
    "152.26.229.88:9443",
    "152.26.231.42:9443",
    "152.26.231.77:9443",
    "152.26.231.86:9443",
]

let agent: Agent

if (env.NODE_ENV !== "development") {
    agent = ytdl.createProxyAgent({
        uri: "http://" + proxies[Math.floor(Math.random() * proxies.length)],
    })
} else {
    agent = ytdl.createAgent()
}

export default agent
