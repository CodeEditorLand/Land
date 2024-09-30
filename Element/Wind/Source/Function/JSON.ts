/**
 * @module JSON
 *
 */
export default (async (...[File, From]: Parameters<Interface>) =>
	JSON.parse(
		(
			await (
				await import("fs/promises")
			).readFile(`${From ?? "."}/${File}`, "utf-8")
		).toString(),
	)) satisfies Interface as Interface;

import type Interface from "@Interface/JSON.js";
