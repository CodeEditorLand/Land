import type { editor } from "monaco-editor";
import type { JSX } from "solid-js";

self.MonacoEnvironment = {
	createTrustedTypesPolicy: () => undefined,
	getWorker: async (_WorkerID, Label) => {
		switch (Label) {
			case "css":
				return new (
					await import(
						// @ts-expect-error
						"monaco-editor/esm/vs/language/css/css.worker?worker"
					)
				).default();

			case "html":
				return new (
					await import(
						// @ts-expect-error
						"monaco-editor/esm/vs/language/html/html.worker?worker"
					)
				).default();

			case "typescript":
				return new (
					await import(
						// @ts-expect-error
						"monaco-editor/esm/vs/language/typescript/ts.worker?worker"
					)
				).default();

			default:
				return new (
					await import(
						// @ts-expect-error
						"monaco-editor/esm/vs/editor/editor.worker?worker"
					)
				).default();
		}
	},
};

export default ({ children }: { children?: JSX.Element }) => (
	<_Function.Provider value={_Function.defaultValue}>
		<link
			rel="stylesheet"
			media="print"
			onload={(Event) => {
				Event.target.removeAttribute("onload");
				Event.target.removeAttribute("media");
			}}
			href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400&display=swap"
		/>

		{children}
	</_Function.Provider>
);

// TODO: IMPORT AND SET ASYNC
export const { editor: Monaco, languages } = await import("monaco-editor");

languages.typescript.typescriptDefaults.setEagerModelSync(true);

Monaco.defineTheme(
	"Light",
	(await import("@Script/Monaco/Theme/Active4D.json"))
		.default as editor.IStandaloneThemeData,
);

Monaco.defineTheme(
	"Dark",
	(await import("@Script/Monaco/Theme/Amoled.json"))
		.default as editor.IStandaloneThemeData,
);
// TODO: END IMPORT AND SET ASYNC

// TODO: WATCH THIS ASYNC
window
	.matchMedia("(prefers-color-scheme: dark)")
	.addEventListener("change", ({ matches }) =>
		Monaco.setTheme(matches ? "Dark" : "Light"),
	);
// TODO: END WATCH THIS ASYNC

export const { _Function } = await import("@Context/Action/Context");
