import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
export var IOutlinePane;
(function (IOutlinePane) {
    IOutlinePane.Id = 'outline';
})(IOutlinePane || (IOutlinePane = {}));
export const ctxFollowsCursor = new RawContextKey('outlineFollowsCursor', false);
export const ctxFilterOnType = new RawContextKey('outlineFiltersOnType', false);
export const ctxSortMode = new RawContextKey('outlineSortMode', 0);
export const ctxAllCollapsed = new RawContextKey('outlineAllCollapsed', false);
