import type { defineConfig } from "astro/config";
import type { ViteDevServer } from "vite";

export const Tauri = typeof process.env["TAURI_ENV_ARCH"] !== "undefined";

export const On =
	process.env["NODE_ENV"] === "development" ||
	process.env["TAURI_ENV_DEBUG"] === "true";

export default (await import("astro/config")).defineConfig({
	srcDir: "./Source",
	publicDir: "./Public",
	outDir: "./Target",
	site: Tauri
		? On
			? "tauri://localhost"
			: "https://tauri.localhost"
		: On
			? "http://localhost"
			: "https://editor.land",
	compressHTML: !On,
	prefetch: {
		defaultStrategy: "hover",
		prefetchAll: true,
	},
	server: {
		port: 9999,
	},
	integrations: [
		(await import("@astrojs/solid-js")).default({
			// @ts-ignore
			devtools: On,
		}),
		Tauri ? null : (await import("@astrojs/sitemap")).default(),
		On ? null : (await import("@playform/inline")).default({ Logger: 1 }),
		(await import("@astrojs/prefetch")).default(),
		On ? null : (await import("@playform/compress")).default({ Logger: 1 }),
	],
	experimental: {
		directRenderScript: true,
		clientPrerender: true,
		globalRoutePriority: true,
		serverIslands: true,
	},
	vite: {
		build: {
			sourcemap: On,
			manifest: true,
			minify: !On,
			cssMinify: !On,
			// terserOptions: Development ? {
			// 	compress: false,
			// 	ecma: 2020,
			// 	enclose: false,
			// 	format: {
			// 		ascii_only: false,
			// 		braces
			// 	}
			// } : {}
		},
		optimizeDeps: {
			...(On
				? {
						exclude: [
							"@codeeditorland/common",
							"@codeeditorland/wind",
							"@codeeditorland/ecosystem",
						],
					}
				: {}),
		},
		resolve: {
			preserveSymlinks: true,
		},
		css: {
			devSourcemap: On,
			transformer: "postcss",
		},
		plugins: [
			(await import("vite-plugin-top-level-await")).default(),
			((Module: string[]) => ({
				name: "NodeModules",
				configureServer: (server: ViteDevServer): void => {
					server.watcher.options = {
						...server.watcher.options,
						ignored: [
							new RegExp(
								`/node_modules\\/(?!${Module.join("|")}).*/`,
							),
							"**/.git/**",
						],
					};
				},
			}))([
				"@codeeditorland/common",
				"@codeeditorland/wind",
				"@codeeditorland/ecosystem",
			]),
		],
	},
}) as typeof defineConfig;
