import type { BuildOptions } from "esbuild";

/**
 * @module ESBuild
 *
 */
export default (await import("deepmerge-ts")(
	(await import("./ESBuild.js")).default,
	{
		bundle: true,

		external: [
			// TODO: LOG WHERE THEY'RE USED

			// Local project files related to terminal functionality and webview messaging
			"../../../terminal/browser/xterm-private.js",
			"../xterm-private.js",
			"./webviewMessages.js",

			// Microsoft's 1DS (One Data Strategy) telemetry system
			"@microsoft/1ds-core-js",
			"@microsoft/1ds-post-js",

			// File watcher used by Parcel bundler
			"@parcel/watcher",

			// VS Code-specific packages for various functionalities
			"@vscode/iconv-lite-umd", // Character encoding
			"@vscode/policy-watcher", // Policy watching
			"@vscode/proxy-agent", // Proxy handling
			"@vscode/ripgrep", // Text searching
			"@vscode/sudo-prompt", // Elevated permissions
			"@vscode/windows-mutex", // Windows-specific utility
			"@vscode/windows-process-tree", // Windows process management
			"@vscode/windows-registry", // Windows registry access

			// Add-ons for xterm.js terminal emulator
			"@xterm/addon-serialize", // Serialization support
			"@xterm/addon-unicode11", // Unicode 11 support
			"@xterm/headless", // Headless functionality

			// Framework for building cross-platform desktop applications
			"electron",

			// Native Node.js addons
			"native-is-elevated", // Checking elevated permissions
			"native-keymap", // Handling keymaps
			"native-watchdog", // Watchdog functionality

			// Pseudoterminal (pty) support for Node.js
			"node-pty",

			// Access to original Node.js 'fs' module
			"original-fs",

			// Profiling tool for V8 JavaScript engine
			"v8-inspect-profiler",

			// VS Code extension API
			"vscode",

			// Regular expression parser and AST generator
			"vscode-regexpp",

			// Libraries for reading (yauzl) and writing (yazl) ZIP files
			"yauzl",
			"yazl",
		],
	},
)) satisfies BuildOptions as BuildOptions;

export const { sep, posix } = await import("path");
