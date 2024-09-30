import type { JSX } from "solid-js/jsx-runtime";
export interface Property extends JSX.LinkHTMLAttributes<HTMLLinkElement> {
    Of?: string[];
}
declare const _default: ({ Of, rel, type, crossorigin }: Property) => JSX.Element;
export default _default;
