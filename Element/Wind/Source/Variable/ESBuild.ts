/**
 * @module ESBuild
 *
 */
export default {
	color: true,
	format: "esm",
	logLevel: "debug",
	metafile: true,
	minify: true,
	outdir: "Target",
	platform: "node",
	target: "esnext",
	tsconfig: "tsconfig.json",
	write: true,
	plugins: [
		{
			name: "Target",
			setup({ onStart, initialOptions: { outdir } }) {
				onStart(async () => {
					try {
						outdir
							? await (await import("fs/promises")).rm(outdir, {
									recursive: true,
								})
							: {};
					} catch (_Error) {
						console.log(_Error);
					}
				});
			},
		},
		(await import("esbuild-plugin-copy")).copy({
			resolveFrom: "out",
			assets: [
				{
					from: ["./Source/Script/Monaco/Theme/*.json"],
					to: ["./Script/Monaco/Theme/"],
				},
				{
					from: ["./Source/Stylesheet/**/*.scss"],
					to: ["./Stylesheet/"],
				},
			],
		}),
		(await import("esbuild-plugin-solid")).solidPlugin(),
	],
} satisfies BuildOptions as BuildOptions;

import type { BuildOptions } from "esbuild";
