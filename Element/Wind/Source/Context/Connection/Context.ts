import type { Type as Message } from "@Context/Connection/Messages";

import type { Context } from "solid-js";

export type Type = Context<{
	Messages: Message;
}>;

export const _Function = (await import("solid-js")).createContext({
	Messages: (await import("@Context/Connection/Messages")).default,
}) satisfies Type;

// biome-ignore lint/correctness/useHookAtTopLevel:
export default (await import("solid-js")).useContext(_Function);
