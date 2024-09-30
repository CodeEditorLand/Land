declare const _default: ({ children, Data, }: {
    children: JSX.Element;
    Data?: Map<Kind, Into>;
}) => JSX.Element;
export default _default;
export declare const _Function: import("solid-js").Context<{
    Items: import("solid-js").Signal<Map<import("../Interface/Create").default, Item>>;
}>;
import type Into from "@Context/Store/Into";
import type Item from "@Context/Store/Item";
import type Kind from "@Context/Store/Kind";
import type { JSX } from "solid-js";
