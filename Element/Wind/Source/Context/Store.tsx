export default ({
	children,
	Data,
}: {
	children: JSX.Element;
	Data?: Map<Kind, Into>;
}) => {
	Data?.forEach(async (Name, Kind) => {
		const Current = new URL(document.location.href);

		const Search = Current.searchParams.get(Name);

		const Item: Item = (await import("@Library/Create.js")).default(
			(await import("@Library/Persist")).default([
				(await import("solid-js")).createSignal(""),
				Name,
			]),
			Search,
		);

		if (Search) {
			Current.searchParams.delete(Name);
			window.history.pushState({}, document.title, Current.href);
		}

		if (!Item[0]()) {
			switch (Kind) {
				case "Identifier": {
					Item[1](crypto.randomUUID());

					break;
				}

				case "Key": {
					crypto.subtle
						.generateKey({ name: "AES-GCM", length: 256 }, true, [
							"encrypt",
							"decrypt",
						])
						.then((Key) =>
							crypto.subtle
								.exportKey("jwk", Key)
								.then(({ k }) => Item[1](k ?? "")),
						);

					break;
				}

				default: {
					break;
				}
			}
		}

		(await import("@Context/Store/Context")).default.Items[0]().set(
			Name,
			Item,
		);
	});

	return (
		<_Function.Provider value={_Function.defaultValue}>
			{children}
		</_Function.Provider>
	);
};

export const { _Function } = await import("@Context/Store/Context");

import type Into from "@Context/Store/Into";
import type Item from "@Context/Store/Item";
import type Kind from "@Context/Store/Kind";

import type { JSX } from "solid-js";
