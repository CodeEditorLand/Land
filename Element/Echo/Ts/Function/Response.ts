/**
 * @module Response
 *
 */
export default (async (
	...[Message = null, Status = 200]: Parameters<Interface>
) =>
	new Response(JSON.stringify(Message), {
		status: Status,
		headers: {
			"Content-Type": "application/json;charset=utf-8",
		},
	})) satisfies Interface;

import type Interface from "../Interface/Response.js";

export const { Response } = await import(
	"@cloudflare/workers-types/experimental/index.js"
);
