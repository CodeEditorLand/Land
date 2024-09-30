export type Type = Signal<Map<ReturnType<Crypto["randomUUID"]>, Editor>>;

export type { Type as default };

import type Editor from "@Context/Action/Editor";

import type { Signal } from "solid-js";
