/**
 * @module Response
 *
 */
export default interface Interface {
	/**
	 * The function `Response` is an asynchronous function that returns a response object with a JSON
	 * stringified Message and a specified status code.
	 *
	 * @param [Message=null] - The `Message` parameter is the data that you want to send as a
	 * response. It can be of any type, but it will be converted to a JSON string before being sent.
	 *
	 * @param [Status=200] - The `status` parameter is an optional parameter that specifies the HTTP status
	 * code of the response. If no value is provided, it defaults to 200 (OK).
	 *
	 */
	// biome-ignore lint/suspicious/noExplicitAny:
	(Message: any, Status: number): Promise<Response>;
}

import type { Response } from "@cloudflare/workers-types/experimental/index.js";
