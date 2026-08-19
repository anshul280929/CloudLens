import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";
import { repoScanFunction } from "@/lib/inngest/functions";

/**
 * Inngest serve route.
 *
 * Exposes GET (introspection), POST (event execution), and PUT (sync)
 * handlers so that the Inngest Dev Server (local) or Inngest Cloud
 * can discover and invoke our functions.
 *
 * All registered Inngest functions must be listed in the `functions`
 * array below.
 */
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [repoScanFunction],
});
