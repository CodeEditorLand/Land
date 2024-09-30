/**
 * @module Create
 *
 */
export default (
	...[[Store, [Item, _Item]], Value = null]: Parameters<Interface>
) => {
	let Existing = get(Store);

	try {
		Existing = Get(JSON.parse(get(Store)));
	} catch (_Error) {
		console.log(_Error);
	}

	_Item(Value ?? Existing);

	return [Item, _Item];
};

import type Interface from "@Interface/Create.js";

export const { get } = await import("store");

export const { default: Get } = await import(
	"@codeeditorland/common/Target/Function/Get.js"
);
