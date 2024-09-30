import type { Signal } from "solid-js";

export type Type<T = "Data"> = T extends "Data"
	? Signal<Map<string, string>>
	: never;

export type { Type as default };
