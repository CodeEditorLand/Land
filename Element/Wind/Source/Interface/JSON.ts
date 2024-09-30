/**
 * @module JSON
 *
 */
export default interface Interface {
	/**
	 * The function 'JSON' is a TypeScript function that reads a JSON file and returns its
	 * parsed content.
	 *
	 * @param File - The `File` parameter is a string that represents the name or
	 * path of the JSON file that you want to parse.
	 *
	 * @param From - The `From` parameter is an optional string that represents
	 * the directory path from which the JSON file should be loaded. If `From` is provided,
	 * it will be used as the base directory path. If `From` is not provided, the current
	 * directory will be used as the base directory path.
	 *
	 */
	(File: string, From?: string): Promise<ReturnType<typeof JSON.parse>>;
}
