import * as DOM from '../../../../base/browser/dom.js';
import * as nls from '../../../../nls.js';
import { FileMatch, FolderMatch, Match, searchComparer } from './searchModel.js';
import { VIEW_ID } from '../../../services/search/common/search.js';
export const category = nls.localize2('search', "Search");
export function isSearchViewFocused(viewsService) {
    const searchView = getSearchView(viewsService);
    return !!(searchView && DOM.isAncestorOfActiveElement(searchView.getContainer()));
}
export function appendKeyBindingLabel(label, inputKeyBinding) {
    return doAppendKeyBindingLabel(label, inputKeyBinding);
}
export function getSearchView(viewsService) {
    return viewsService.getActiveViewWithId(VIEW_ID);
}
export function getElementsToOperateOn(viewer, currElement, sortConfig) {
    let elements = viewer.getSelection().filter((x) => x !== null).sort((a, b) => searchComparer(a, b, sortConfig.sortOrder));
    if (currElement && !(elements.length > 1 && elements.includes(currElement))) {
        elements = [currElement];
    }
    return elements;
}
export function shouldRefocus(elements, focusElement) {
    if (!focusElement) {
        return false;
    }
    return !focusElement || elements.includes(focusElement) || hasDownstreamMatch(elements, focusElement);
}
function hasDownstreamMatch(elements, focusElement) {
    for (const elem of elements) {
        if ((elem instanceof FileMatch && focusElement instanceof Match && elem.matches().includes(focusElement)) ||
            (elem instanceof FolderMatch && ((focusElement instanceof FileMatch && elem.getDownstreamFileMatch(focusElement.resource)) ||
                (focusElement instanceof Match && elem.getDownstreamFileMatch(focusElement.parent().resource))))) {
            return true;
        }
    }
    return false;
}
export function openSearchView(viewsService, focus) {
    return viewsService.openView(VIEW_ID, focus).then(view => (view ?? undefined));
}
function doAppendKeyBindingLabel(label, keyBinding) {
    return keyBinding ? label + ' (' + keyBinding.getLabel() + ')' : label;
}
