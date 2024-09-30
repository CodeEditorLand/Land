import type { Type as Message } from "@Context/Connection/Messages";
import type { Context } from "solid-js";
export type Type = Context<{
    Messages: Message;
}>;
export declare const _Function: Context<{
    Messages: import("solid-js").Signal<import("./Message").Type>;
}>;
declare const _default: {
    Messages: import("solid-js").Signal<import("./Message").Type>;
};
export default _default;
