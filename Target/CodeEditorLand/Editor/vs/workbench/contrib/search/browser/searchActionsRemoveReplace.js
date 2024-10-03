import * as nls from '../../../../nls.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { getSelectionKeyboardEvent } from '../../../../platform/list/browser/listService.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
import { searchRemoveIcon, searchReplaceIcon } from './searchIcons.js';
import * as Constants from '../common/constants.js';
import { IReplaceService } from './replace.js';
import { arrayContainsElementOrParent, FileMatch, FolderMatch, Match, MatchInNotebook, SearchResult, TextSearchResult } from './searchModel.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { Action2, MenuId, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { category, getElementsToOperateOn, getSearchView, shouldRefocus } from './searchActionsBase.js';
import { equals } from '../../../../base/common/arrays.js';
registerAction2(class RemoveAction extends Action2 {
    constructor() {
        super({
            id: "search.action.remove",
            title: nls.localize2('RemoveAction.label', "Dismiss"),
            category,
            icon: searchRemoveIcon,
            keybinding: {
                weight: 200,
                when: ContextKeyExpr.and(Constants.SearchContext.SearchViewVisibleKey, Constants.SearchContext.FileMatchOrMatchFocusKey),
                primary: 20,
                mac: {
                    primary: 2048 | 1,
                },
            },
            menu: [
                {
                    id: MenuId.SearchContext,
                    group: 'search',
                    order: 2,
                },
                {
                    id: MenuId.SearchActionMenu,
                    group: 'inline',
                    order: 2,
                },
            ]
        });
    }
    async run(accessor, context) {
        const viewsService = accessor.get(IViewsService);
        const configurationService = accessor.get(IConfigurationService);
        const searchView = getSearchView(viewsService);
        if (!searchView) {
            return;
        }
        let element = context?.element;
        let viewer = context?.viewer;
        if (!viewer) {
            viewer = searchView.getControl();
        }
        if (!element) {
            element = viewer.getFocus()[0] ?? undefined;
        }
        const elementsToRemove = getElementsToOperateOn(viewer, element, configurationService.getValue('search'));
        let focusElement = viewer.getFocus()[0] ?? undefined;
        if (elementsToRemove.length === 0) {
            return;
        }
        if (!focusElement || (focusElement instanceof SearchResult)) {
            focusElement = element;
        }
        let nextFocusElement;
        const shouldRefocusMatch = shouldRefocus(elementsToRemove, focusElement);
        if (focusElement && shouldRefocusMatch) {
            nextFocusElement = await getElementToFocusAfterRemoved(viewer, focusElement, elementsToRemove);
        }
        const searchResult = searchView.searchResult;
        if (searchResult) {
            searchResult.batchRemove(elementsToRemove);
        }
        await searchView.refreshTreePromiseSerializer;
        if (focusElement && shouldRefocusMatch) {
            if (!nextFocusElement) {
                nextFocusElement = await getLastNodeFromSameType(viewer, focusElement);
            }
            if (nextFocusElement && !arrayContainsElementOrParent(nextFocusElement, elementsToRemove)) {
                viewer.reveal(nextFocusElement);
                viewer.setFocus([nextFocusElement], getSelectionKeyboardEvent());
                viewer.setSelection([nextFocusElement], getSelectionKeyboardEvent());
            }
        }
        else if (!equals(viewer.getFocus(), viewer.getSelection())) {
            viewer.setSelection(viewer.getFocus());
        }
        viewer.domFocus();
        return;
    }
});
registerAction2(class ReplaceAction extends Action2 {
    constructor() {
        super({
            id: "search.action.replace",
            title: nls.localize2('match.replace.label', "Replace"),
            category,
            keybinding: {
                weight: 200,
                when: ContextKeyExpr.and(Constants.SearchContext.SearchViewVisibleKey, Constants.SearchContext.ReplaceActiveKey, Constants.SearchContext.MatchFocusKey, Constants.SearchContext.IsEditableItemKey),
                primary: 1024 | 2048 | 22,
            },
            icon: searchReplaceIcon,
            menu: [
                {
                    id: MenuId.SearchContext,
                    when: ContextKeyExpr.and(Constants.SearchContext.ReplaceActiveKey, Constants.SearchContext.MatchFocusKey, Constants.SearchContext.IsEditableItemKey),
                    group: 'search',
                    order: 1
                },
                {
                    id: MenuId.SearchActionMenu,
                    when: ContextKeyExpr.and(Constants.SearchContext.ReplaceActiveKey, Constants.SearchContext.MatchFocusKey, Constants.SearchContext.IsEditableItemKey),
                    group: 'inline',
                    order: 1
                }
            ]
        });
    }
    async run(accessor, context) {
        return performReplace(accessor, context);
    }
});
registerAction2(class ReplaceAllAction extends Action2 {
    constructor() {
        super({
            id: "search.action.replaceAllInFile",
            title: nls.localize2('file.replaceAll.label', "Replace All"),
            category,
            keybinding: {
                weight: 200,
                when: ContextKeyExpr.and(Constants.SearchContext.SearchViewVisibleKey, Constants.SearchContext.ReplaceActiveKey, Constants.SearchContext.FileFocusKey, Constants.SearchContext.IsEditableItemKey),
                primary: 1024 | 2048 | 22,
                secondary: [2048 | 1024 | 3],
            },
            icon: searchReplaceIcon,
            menu: [
                {
                    id: MenuId.SearchContext,
                    when: ContextKeyExpr.and(Constants.SearchContext.ReplaceActiveKey, Constants.SearchContext.FileFocusKey, Constants.SearchContext.IsEditableItemKey),
                    group: 'search',
                    order: 1
                },
                {
                    id: MenuId.SearchActionMenu,
                    when: ContextKeyExpr.and(Constants.SearchContext.ReplaceActiveKey, Constants.SearchContext.FileFocusKey, Constants.SearchContext.IsEditableItemKey),
                    group: 'inline',
                    order: 1
                }
            ]
        });
    }
    async run(accessor, context) {
        return performReplace(accessor, context);
    }
});
registerAction2(class ReplaceAllInFolderAction extends Action2 {
    constructor() {
        super({
            id: "search.action.replaceAllInFolder",
            title: nls.localize2('file.replaceAll.label', "Replace All"),
            category,
            keybinding: {
                weight: 200,
                when: ContextKeyExpr.and(Constants.SearchContext.SearchViewVisibleKey, Constants.SearchContext.ReplaceActiveKey, Constants.SearchContext.FolderFocusKey, Constants.SearchContext.IsEditableItemKey),
                primary: 1024 | 2048 | 22,
                secondary: [2048 | 1024 | 3],
            },
            icon: searchReplaceIcon,
            menu: [
                {
                    id: MenuId.SearchContext,
                    when: ContextKeyExpr.and(Constants.SearchContext.ReplaceActiveKey, Constants.SearchContext.FolderFocusKey, Constants.SearchContext.IsEditableItemKey),
                    group: 'search',
                    order: 1
                },
                {
                    id: MenuId.SearchActionMenu,
                    when: ContextKeyExpr.and(Constants.SearchContext.ReplaceActiveKey, Constants.SearchContext.FolderFocusKey, Constants.SearchContext.IsEditableItemKey),
                    group: 'inline',
                    order: 1
                }
            ]
        });
    }
    async run(accessor, context) {
        return performReplace(accessor, context);
    }
});
async function performReplace(accessor, context) {
    const configurationService = accessor.get(IConfigurationService);
    const viewsService = accessor.get(IViewsService);
    const viewlet = getSearchView(viewsService);
    const viewer = context?.viewer ?? viewlet?.getControl();
    if (!viewer) {
        return;
    }
    const element = context?.element ?? viewer.getFocus()[0];
    const elementsToReplace = getElementsToOperateOn(viewer, element ?? undefined, configurationService.getValue('search'));
    let focusElement = viewer.getFocus()[0];
    if (!focusElement || (focusElement && !arrayContainsElementOrParent(focusElement, elementsToReplace)) || (focusElement instanceof SearchResult)) {
        focusElement = element;
    }
    if (elementsToReplace.length === 0) {
        return;
    }
    let nextFocusElement;
    if (focusElement) {
        nextFocusElement = await getElementToFocusAfterRemoved(viewer, focusElement, elementsToReplace);
    }
    const searchResult = viewlet?.searchResult;
    if (searchResult) {
        await searchResult.batchReplace(elementsToReplace);
    }
    await viewlet?.refreshTreePromiseSerializer;
    if (focusElement) {
        if (!nextFocusElement) {
            nextFocusElement = await getLastNodeFromSameType(viewer, focusElement);
        }
        if (nextFocusElement) {
            viewer.reveal(nextFocusElement);
            viewer.setFocus([nextFocusElement], getSelectionKeyboardEvent());
            viewer.setSelection([nextFocusElement], getSelectionKeyboardEvent());
            if (nextFocusElement instanceof Match) {
                const useReplacePreview = configurationService.getValue().search.useReplacePreview;
                if (!useReplacePreview || hasToOpenFile(accessor, nextFocusElement) || nextFocusElement instanceof MatchInNotebook) {
                    viewlet?.open(nextFocusElement, true);
                }
                else {
                    accessor.get(IReplaceService).openReplacePreview(nextFocusElement, true);
                }
            }
            else if (nextFocusElement instanceof FileMatch) {
                viewlet?.open(nextFocusElement, true);
            }
        }
    }
    viewer.domFocus();
}
function hasToOpenFile(accessor, currBottomElem) {
    if (!(currBottomElem instanceof Match)) {
        return false;
    }
    const activeEditor = accessor.get(IEditorService).activeEditor;
    const file = activeEditor?.resource;
    if (file) {
        return accessor.get(IUriIdentityService).extUri.isEqual(file, currBottomElem.parent().resource);
    }
    return false;
}
function compareLevels(elem1, elem2) {
    if (elem1 instanceof Match) {
        if (elem2 instanceof Match) {
            return 0;
        }
        else {
            return -1;
        }
    }
    else if (elem1 instanceof FileMatch) {
        if (elem2 instanceof Match) {
            return 1;
        }
        else if (elem2 instanceof FileMatch) {
            return 0;
        }
        else {
            return -1;
        }
    }
    else if (elem2 instanceof FolderMatch) {
        if (elem2 instanceof TextSearchResult) {
            return -1;
        }
        else if (elem2 instanceof FolderMatch) {
            return 0;
        }
        else {
            return 1;
        }
    }
    else {
        if (elem2 instanceof TextSearchResult) {
            return 0;
        }
        else {
            return 1;
        }
    }
}
export async function getElementToFocusAfterRemoved(viewer, element, elementsToRemove) {
    const navigator = viewer.navigate(element);
    if (element instanceof FolderMatch) {
        while (!!navigator.next() && (!(navigator.current() instanceof FolderMatch) || arrayContainsElementOrParent(navigator.current(), elementsToRemove))) { }
    }
    else if (element instanceof FileMatch) {
        while (!!navigator.next() && (!(navigator.current() instanceof FileMatch) || arrayContainsElementOrParent(navigator.current(), elementsToRemove))) {
            await viewer.expand(navigator.current());
        }
    }
    else {
        while (navigator.next() && (!(navigator.current() instanceof Match) || arrayContainsElementOrParent(navigator.current(), elementsToRemove))) {
            await viewer.expand(navigator.current());
        }
    }
    return navigator.current();
}
export async function getLastNodeFromSameType(viewer, element) {
    let lastElem = viewer.lastVisibleElement ?? null;
    while (lastElem) {
        const compareVal = compareLevels(element, lastElem);
        if (compareVal === -1) {
            const expanded = await viewer.expand(lastElem);
            if (!expanded) {
                return lastElem;
            }
            lastElem = viewer.lastVisibleElement;
        }
        else if (compareVal === 1) {
            const potentialLastElem = viewer.getParentElement(lastElem);
            if (potentialLastElem instanceof SearchResult) {
                break;
            }
            else {
                lastElem = potentialLastElem;
            }
        }
        else {
            return lastElem;
        }
    }
    return undefined;
}
