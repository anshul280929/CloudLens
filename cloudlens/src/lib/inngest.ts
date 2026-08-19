import { Inngest } from "inngest";

/**
 * CloudLens Inngest client.
 *
 * This is the single shared instance used to:
 *   - Define Inngest functions (`inngest.createFunction()`)
 *   - Send events from server actions / API routes (`inngest.send()`)
 *
 * In development, set `INNGEST_DEV=1` in `.env.local` so the SDK
 * connects to the local Inngest Dev Server instead of Inngest Cloud.
 */
export const inngest = new Inngest({ id: "cloudlens" });
