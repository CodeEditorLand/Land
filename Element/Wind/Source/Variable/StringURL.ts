/**
 * @module StringURL
 *
 */
export default (await import("zod"))
	.string()
	.url("Must be a URL.")
	.endsWith("/", { message: "URL must end with /." });
