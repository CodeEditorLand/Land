/** @type {import('prettier').Config} */
export default {
	// =========================================================================
	// Core Formatting Options
	// =========================================================================
	// Max line length before wrapping. 80 is standard for readability.
	printWidth: 80,

	// Use tabs for indentation (accessibility friendly).
	useTabs: true,

	// Number of spaces per tab (visual width).
	tabWidth: 4,

	// Always use semicolons at end of statements.
	semi: true,

	// Use double quotes instead of single quotes.
	singleQuote: false,

	// Trailing commas wherever valid (ES5+). Helps git diffs.
	trailingComma: "all",

	// Put > on the same line as the last attribute in JSX/HTML.
	bracketSameLine: true,

	// Print spaces between brackets in object literals. { foo: bar }
	bracketSpacing: true,

	// Always include parens for arrow functions. (x) => x
	arrowParens: "always",

	// Line endings: Linux/macOS style (LF).
	endOfLine: "lf",

	// Wrap markdown text as-is/always since some renderers require it.
	proseWrap: "always",

	// Quote properties in objects only when necessary.
	quoteProps: "preserve",

	// =========================================================================
	// HTML / JSX Specifics
	// =========================================================================
	// CSS-style whitespace handling in HTML (respects display: inline).
	htmlWhitespaceSensitivity: "css",

	// Use double quotes in JSX attributes.
	jsxSingleQuote: false,

	// Indent script and style tags in Vue files.
	vueIndentScriptAndStyle: true,

	// Auto-format embedded code blocks (like in Markdown).
	embeddedLanguageFormatting: "auto",

	// =========================================================================
	// Plugins
	// =========================================================================
	// Note: 'prettier-plugin-tailwindcss' MUST be loaded last to work
	// correctly with other plugins.
	plugins: [
		"@ianvs/prettier-plugin-sort-imports",

		"prettier-plugin-astro",

		"prettier-plugin-organize-attributes",

		"prettier-plugin-packagejson",

		// Shell script support
		"prettier-plugin-sh",

		// TOML support
		"prettier-plugin-toml",

		// MUST BE LAST
		"prettier-plugin-tailwindcss",
	],

	// =========================================================================
	// Plugin: Organize Attributes
	// =========================================================================
	// Sort attributes alphabetically? "ASC" (A-Z) or false (disabled).
	attributeSort: "ASC",

	// Case sensitivity for attribute sorting.
	attributeIgnoreCase: false,

	// Group attributes using Regex. '$DEFAULT' catches everything else.
	attributeGroups: ["$DEFAULT", "^data-"],

	// =========================================================================
	// Plugin: Sort Imports (@ianvs/prettier-plugin-sort-imports)
	// =========================================================================
	// Define the order of imports. Empty strings create blank lines.
	importOrder: [
		// Core aliases
		"^@core/(.*)$",

		"",

		// Server aliases
		"^@server/(.*)$",

		"",

		// UI aliases
		"^@ui/(.*)$",

		"",

		// Everything not matched above
		"<THIRD_PARTY_MODULES>",

		"",

		// Relative imports
		"^[./]",
	],

	// parser plugins to enable for import sorting analysis.
	importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],

	importOrderTypeScriptVersion: "5.5.4",

	// =========================================================================
	// Plugin: Tailwind CSS
	// =========================================================================
	tailwindConfig: "./tailwind.config.js",

	// =========================================================================
	// File Overrides
	// =========================================================================
	overrides: [
		// JavaScript / JSX
		{
			files: "*.{js,mjs,cjs,jsx}",

			options: {
				parser: "babel",
			},
		},

		// TypeScript / TSX
		{
			files: "*.{ts,mts,cts,tsx}",

			options: {
				parser: "babel-ts",
			},
		},

		// Astro
		{
			files: "*.astro",

			options: {
				parser: "astro",
			},
		},

		// Svelte
		{
			files: "*.svelte",

			options: {
				parser: "svelte",
			},
		},

		// Lua (requires plugin, though not strictly standard prettier)
		{
			files: "*.lua",

			options: {
				parser: "lua",
			},
		},

		// TOML
		{
			files: "*.toml",

			options: {
				parser: "toml",
			},
		},

		// Markdown
		{
			files: "*.md",

			options: {
				parser: "markdown",
			},
		},

		// ---------------------------------------------------------------------
		// JSON Configuration
		// ---------------------------------------------------------------------
		// 1. package.json: STRICT JSON.
		// Must use "json-stringify" to forbid trailing commas/comments which break npm/node.
		{
			files: "package.json",

			options: {
				parser: "json-stringify",

				trailingComma: "none",
			},
		},

		// 2. Other JSONs (VSCode settings, tsconfig, etc.): LOOSE JSON.
		// Allows comments and trailing commas (JSONC).
		{
			files: "*.json",

			excludeFiles: ["package.json"],

			options: {
				// Prettier's 'json' parser allows comments by default
				parser: "json",

				// Optional: keep JSON standard compliant
				trailingComma: "none",
			},
		},
	],
};
