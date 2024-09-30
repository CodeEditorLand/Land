export default ({ children }: { children?: JSX.Element }) => {
	// TODO: LISTEN TO CHANGES FROM @tauri-apps/api/event
	// (await import('@tauri-apps/api/event')).listen?.addEventListener("message", async (Message) =>
	// 	Connection.Messages[1](
	// 		(await import("@Function/Merge.js")).default(
	// 			Connection.Messages[0](),
	// 			await (
	// 				await import(
	// 					"@codeeditorland/common/Target/Function/Get.js"
	// 				)
	// 			).default(JSON.parse(Message.data)),
	// 		),
	// 	),
	// );

	return (
		<_Function.Provider value={_Function.defaultValue}>
			{children}
		</_Function.Provider>
	);
};

import type { JSX } from "solid-js";

export const { createEffect, on } = await import("solid-js");

export const { default: Connection, _Function } = await import(
	"@Context/Connection/Context.js"
);
