import type Items from "@Interface/Items.js";

import type { Context } from "solid-js";

export type Type = Context<{
	Items: Items;
}>;

export const _Function = (await import("solid-js")).createContext({
	Items: (await import("@Context/Store/Items")).default,
}) satisfies Type;

// biome-ignore lint/correctness/useHookAtTopLevel:
export default (await import("solid-js")).useContext(_Function);
