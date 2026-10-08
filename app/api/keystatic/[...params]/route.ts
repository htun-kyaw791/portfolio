import { makeRouteHandler } from "@keystatic/next/route-handler";
import config from "../../../../keystatic.config";
import { keystaticEnabled } from "@/lib/keystatic-enabled";

const notFound = () => new Response("Not Found", { status: 404 });

// Only build the handler when enabled: in GitHub mode it throws at startup without credentials.
const handler = keystaticEnabled ? makeRouteHandler({ config }) : { GET: notFound, POST: notFound };

export const { GET, POST } = handler;
