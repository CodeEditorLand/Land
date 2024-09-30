/**
 * @module Persist
 *
 */
export default interface Interface {
	/**
	 * The `Persist` function takes an item and a store, and saves the item to the store
	 * using Local Storage, while also returning the store and the item as a signal.
	 *
	 * TODO: Properly document
	 * @param  A signal representing the item to be persisted.
	 *
	 */
	<T>(
		[Store, [Item, _Item]]: Property<T>,
		// biome-ignore lint/suspicious/noExplicitAny:
		Value: any,
	): Promise<Return<T>>;
}

export type Property<T> = [string, Signal<T>];

export type Return<T> = Signal<T>;

import type { Signal } from "solid-js";
