/**
 * @module Action
 *
 */
export const _Function = (await import("solid-js")).createContext(
	// TODO: UNCOMMENT
	// 	{
	// 	Editors: (await import("@Context/Action/Editors")).default,
	// }
) satisfies Type;

// biome-ignore lint/correctness/useHookAtTopLevel:
export default (await import("solid-js")).useContext(_Function);

import type { Context } from "solid-js";

import type Editors from "@Interface/Context/Editors.js";

export type Type = Context<{
	Editors: Editors;
}>;
