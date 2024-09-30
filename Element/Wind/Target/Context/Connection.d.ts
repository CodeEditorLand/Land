declare const _default: ({ children }: {
    children?: JSX.Element;
}) => JSX.Element;
export default _default;
import type { JSX } from "solid-js";
export declare const createEffect: typeof import("solid-js").createEffect, on: typeof import("solid-js").on;
export declare const Connection: {
    Messages: import("solid-js").Signal<import("./Connection/Message").Type>;
}, _Function: import("solid-js").Context<{
    Messages: import("solid-js").Signal<import("./Connection/Message").Type>;
}>;
