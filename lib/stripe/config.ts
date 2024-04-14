import Stripe from "stripe"

export const stripe = new Stripe(
    process.env.STRIPE_SECRET_KEY_LIVE ?? process.env.STRIPE_SECRET_KEY ?? "",
    {
        // https://github.com/stripe/stripe-node#configuration
        // https://stripe.com/docs/api/versioning
        // @ts-ignore
        apiVersion: null,
        // Register this as an official Stripe plugin.
        // https://stripe.com/docs/building-plugins#setappinfo
        appInfo: {
            name: "QuickVid - Your AI Video Summarizer",
            version: "2.0.0",
            url: "https://github.com/metaloozee/quickvid",
        },
    }
)
