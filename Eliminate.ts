import type Interface from "@playform/eliminate/Target/Interface/Option.js";

export const On = process.env["NODE_ENV"] === "development";

/**
 * @module Option
 *
 */
export default (
	await import("@playform/eliminate/Target/Function/Merge.js")
).default((await import("@playform/pipe/Target/Variable/Option.js")).default, {
	Action: {
		Read: async ({ Input }) => {
			console.log(`Processing: ${Input}`);

			return await (
				await import("node:fs/promises")
			).readFile(Input, {
				encoding: "utf-8",
			});
		},

		Wrote: async ({ Buffer }) => {
			try {
				return (
					await import(
						"@playform/eliminate/Target/Function/Output.js"
					)
				).default(Buffer.toString(), {
					Comment: true,
				});
			} catch (_Error) {
				console.log(_Error);

				return Buffer;
			}
		},

		Failed: async ({ Input }, _Error) => {
			console.log(_Error);

			return `Error: Cannot process file ${Input}`;
		},
	},

	Path: new Map([
		[
			"./Dependency/Microsoft/Dependency/Editor/build",

			"./Dependency/Microsoft/Dependency/Editor/build",
		],

		[
			"./Dependency/Microsoft/Dependency/Editor/extensions",

			"./Dependency/Microsoft/Dependency/Editor/extensions",
		],

		[
			"./Dependency/Microsoft/Dependency/Editor/scripts",

			"./Dependency/Microsoft/Dependency/Editor/scripts",
		],

		[
			"./Dependency/Microsoft/Dependency/Editor/Source",

			"./Dependency/Microsoft/Dependency/Editor/Source",
		],

		[
			"./Dependency/Microsoft/Dependency/Editor/src",

			"./Dependency/Microsoft/Dependency/Editor/src",
		],
	]),

	File: "**/*.ts",

	Exclude: (File) =>
		[
			".d.ts",

			"/test/",

			"/tests/",

			"/spec/",

			"/mock/",

			"/example/",

			"/demo/",
		].some((Pattern) => File.toLowerCase().indexOf(Pattern) !== -1),
} satisfies Interface);
