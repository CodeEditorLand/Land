/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare global {
	interface Window {
		__TAURI_ISOLATION_HOOK__: () => void;
	}
}
