import type Items from "@Interface/Items.js";
import type { Context } from "solid-js";
export type Type = Context<{
    Items: Items;
}>;
export declare const _Function: Context<{
    Items: import("solid-js").Signal<Map<import("../../Interface/Create").default, import("./Item").Type>>;
}>;
declare const _default: {
    Items: import("solid-js").Signal<Map<import("../../Interface/Create").default, import("./Item").Type>>;
};
export default _default;
