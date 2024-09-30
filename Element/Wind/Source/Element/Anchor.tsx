import Merge from "@Function/Merge.js";

import "@Stylesheet/Element/Anchor.scss";

import { children as Show } from "solid-js";

export type Type = HTMLButtonElement;

export interface Property {
	// biome-ignore lint/suspicious/noExplicitAny:
	children?: any;

	Type?: "submit" | "reset" | "button";

	Action?: (Fn: Type) => void;

	Class?: string | ((Fn: Type) => string);
}

export type Concrete<Type> = {
	[Key in keyof Type]-?: Type[Key];
};

export default (Property: Property) => {
	const { Action, Type, children, Class } = Merge(
		{
			children: "",
			Type: "button",
			Action: () => {},
			Class: "",
		} satisfies Property,
		Property,
	) as Concrete<Property> satisfies Concrete<Property>;

	let Fn: HTMLButtonElement;

	return (
		<button
			class={`Anchor ${
				typeof Class === "function" ? Class(Fn) : Class
			}`.trim()}
			onClick={() => {
				Action(Fn);
				Fn.blur();
			}}
			ref={Fn}
			type={Type}>
			{Show(() => children)()}
		</button>
	);
};
