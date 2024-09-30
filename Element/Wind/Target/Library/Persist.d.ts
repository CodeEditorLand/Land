/**
 * @module Persist
 *
 */
declare const _default: <T>([[Item, _Item], Store]: Property<T>) => Return<T>;
export default _default;
import type { Signal } from "solid-js";
export declare const Local: StoreJsAPI;
export type Property<T> = [Signal<T>, string];
export type Return<T> = [string, Signal<T>];
export declare const createEffect: typeof import("solid-js").createEffect, on: typeof import("solid-js").on;
