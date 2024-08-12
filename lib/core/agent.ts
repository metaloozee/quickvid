import ytdl, { type Agent } from "@distube/ytdl-core"
import { kv } from "@vercel/kv"

// // Run this code in order to set the cookies in your redis
// import fs from "node:fs"
// import { config } from "dotenv"
// config({ path: ".env.local"})

// ;(async () => {
//     try {
//         const cookies = JSON.parse(fs.readFileSync("cookies.json").toString())
//         await kv.set("YOUTUBE_COOKIES", cookies)

//         return console.log("Successfully updated the cookies.")
//     } catch (e) {
//         return console.error(e)
//     }
// })()

let agent: Agent | undefined
let agentPromise: Promise<Agent | undefined>

if (!agent) {
    agentPromise = kv
        .get("YOUTUBE_COOKIES")
        .then((cookies) => {
            if (!cookies) {
                throw new Error("YOUTUBE_COOKIES not found")
            }

            agent = ytdl.createAgent(JSON.parse(cookies.toString()))
            return agent
        })
        .catch((error) => {
            console.error("Failed to initialize agent:", error)
            return undefined
        })
} else {
    agentPromise = Promise.resolve(agent)
}

export default agentPromise
