/**
 * @module Create
 *
 */
export default interface Interface {
	/**
	 * The function `Create` is a TypeScript function that creates a signal and initializes
	 * it with a value from a store, or a default value if the store is empty.
	 *
	 * @param [Store, [Item, _Item]] - `Store`: The storage location where the data will be stored.
	 *
	 * @param [Value=null] - The `Value` parameter is an optional argument that
	 * represents the initial value for the `Item` signal. If no value is provided, it
	 * defaults to `null`.
	 *
	 */
	<T>(
		[Store, [Item, _Item]]: Property<T>,
		// biome-ignore lint/suspicious/noExplicitAny:
		Value: any,
	): Return<T>;
}

export type Property<T> = [string, Signal<T>];

export type Return<T> = Signal<T>;

import type { Signal } from "solid-js";
