import { getToken } from "@phocks/mastodon-auth";
import { FreshContext } from "$fresh/server.ts";

export const handler = async (
  _req: Request,
  _ctx: FreshContext,
): Promise<Response> => {
  const body = await getToken("masto.byrd.ws");
  return new Response(JSON.stringify(body), {
    headers: {
      "Content-Type": "application/json",
    },
    status: 500,
  });
};
