import { fontFamily } from "tailwindcss/defaultTheme";

const Common = "*.{astro,js,jsx,ts,tsx,vue,svelte,html}";

export default {
	content: [
		`./Public/**/${Common}`,
		`./Source/**/${Common}`,
		`./node_modules/@codeeditorland/wind/Target/**/${Common}`,
		`./node_modules/@codeeditorland/ecosystem/Target/**/${Common}`,
	],

	darkMode: "media",

	theme: {
		container: {
			center: true,
		},
		extend: {
			transitionTimingFunction: {
				Ease: "cubic-bezier(0.25, 0.1, 0.25, 1)",
			},
			fontFamily: {
				sans: ["Albert Sans", ...fontFamily.sans],
			},
			typography: {
				DEFAULT: {
					css: {
						a: {
							"font-weight": "400",
						},
					},
				},
			},
			ringWidth: {
				5: "5px",
			},
			colors: {
				backgroundLight: "var(--background-light)",
				backgroundDark: "var(--background-dark)",
			},
		},
	},

	variants: {},

	plugins: [
		require("@tailwindcss/forms"),
		require("@tailwindcss/typography"),
		require("@tailwindcss/aspect-ratio"),
	],
};
