import "@Stylesheet/Element/Anchor.scss";
export type Type = HTMLButtonElement;
export interface Property {
    children?: any;
    Type?: "submit" | "reset" | "button";
    Action?: (Fn: Type) => void;
    Class?: string | ((Fn: Type) => string);
}
export type Concrete<Type> = {
    [Key in keyof Type]-?: Type[Key];
};
declare const _default: (Property: Property) => import("solid-js").JSX.Element;
export default _default;
