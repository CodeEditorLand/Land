/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
export var IOutlinePane;
(function (IOutlinePane) {
    IOutlinePane.Id = 'outline';
})(IOutlinePane || (IOutlinePane = {}));
// --- context keys
export const ctxFollowsCursor = new RawContextKey('outlineFollowsCursor', false);
export const ctxFilterOnType = new RawContextKey('outlineFiltersOnType', false);
export const ctxSortMode = new RawContextKey('outlineSortMode', 0 /* OutlineSortOrder.ByPosition */);
export const ctxAllCollapsed = new RawContextKey('outlineAllCollapsed', false);
