import "@Stylesheet/Element/Button.scss";

export type Fn = HTMLButtonElement;

export interface Property {
	// biome-ignore lint/suspicious/noExplicitAny:
	children?: any;

	Type?: "submit" | "reset" | "button";

	Action?: (Fn?: Fn) => void;

	Class?: string | ((Fn?: Fn) => string);

	Label?: string;

	Fn?: Fn;
}

export type Concrete<Type> = {
	[Key in keyof Type]-?: Type[Key];
};

export default (Property: Property) => {
	const { Action, Type, children, Class, Label } = Merge(
		{
			children: "",
			Type: "button",
			// biome-ignore lint/suspicious/noEmptyBlockStatements:
			Action: () => {},
			Class: "",
			Label: "",
		} satisfies Property,
		Property,
	) as Concrete<Property> satisfies Concrete<Property>;

	return (
		<button
			class={`Button ${
				typeof Class === "function" ? Class(Property.Fn) : Class
			}`.trim()}
			onClick={() => {
				Action(Property.Fn);

				Property.Fn?.blur();
			}}
			// TODO: FIX THIS
			// ref={Property.Fn}
			type={Type}
			aria-label={Label}>
			{children(() => children)()}
		</button>
	);
};

export const { children } = await import("solid-js");

export const { default: Merge } = await import("@Function/Merge.js");
