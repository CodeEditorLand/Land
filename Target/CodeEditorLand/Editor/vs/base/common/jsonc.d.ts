/**
 * Strips single and multi line JavaScript comments from JSON
 * content. Ignores characters in strings BUT doesn't support
 * string continuation across multiple lines since it is not
 * supported in JSON.
 *
 * @param content the content to strip comments from
 * @returns the content without comments
*/
export declare function stripComments(content: string): string;
/**
 * A drop-in replacement for JSON.parse that can parse
 * JSON with comments and trailing commas.
 *
 * @param content the content to strip comments from
 * @returns the parsed content as JSON
*/
export declare function parse<T>(content: string): T;
