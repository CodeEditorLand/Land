import { isMacintosh } from '../../../../base/common/platform.js';
import * as nls from '../../../../nls.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
import * as Constants from '../common/constants.js';
import * as SearchEditorConstants from '../../searchEditor/browser/constants.js';
import { FolderMatch } from './searchModel.js';
import { SearchEditorInput } from '../../searchEditor/browser/searchEditorInput.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { ContextKeyExpr, IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { assertIsDefined } from '../../../../base/common/types.js';
import { Action2, MenuId, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ToggleCaseSensitiveKeybinding, TogglePreserveCaseKeybinding, ToggleRegexKeybinding, ToggleWholeWordKeybinding } from '../../../../editor/contrib/find/browser/findModel.js';
import { category, getSearchView, openSearchView } from './searchActionsBase.js';
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED } from '../../../../platform/accessibility/common/accessibility.js';
import { getActiveElement } from '../../../../base/browser/dom.js';
registerAction2(class ToggleQueryDetailsAction extends Action2 {
    constructor() {
        super({
            id: "workbench.action.search.toggleQueryDetails",
            title: nls.localize2('ToggleQueryDetailsAction.label', "Toggle Query Details"),
            category,
            keybinding: {
                weight: 200,
                when: ContextKeyExpr.or(Constants.SearchContext.SearchViewFocusedKey, SearchEditorConstants.InSearchEditor),
                primary: 2048 | 1024 | 40,
            },
        });
    }
    run(accessor, ...args) {
        const contextService = accessor.get(IContextKeyService).getContext(getActiveElement());
        if (contextService.getValue(SearchEditorConstants.InSearchEditor.serialize())) {
            accessor.get(IEditorService).activeEditorPane.toggleQueryDetails(args[0]?.show);
        }
        else if (contextService.getValue(Constants.SearchContext.SearchViewFocusedKey.serialize())) {
            const searchView = getSearchView(accessor.get(IViewsService));
            assertIsDefined(searchView).toggleQueryDetails(undefined, args[0]?.show);
        }
    }
});
registerAction2(class CloseReplaceAction extends Action2 {
    constructor() {
        super({
            id: "closeReplaceInFilesWidget",
            title: nls.localize2('CloseReplaceWidget.label', "Close Replace Widget"),
            category,
            keybinding: {
                weight: 200,
                when: ContextKeyExpr.and(Constants.SearchContext.SearchViewVisibleKey, Constants.SearchContext.ReplaceInputBoxFocusedKey),
                primary: 9,
            },
        });
    }
    run(accessor) {
        const searchView = getSearchView(accessor.get(IViewsService));
        if (searchView) {
            searchView.searchAndReplaceWidget.toggleReplace(false);
            searchView.searchAndReplaceWidget.focus();
        }
        return Promise.resolve(null);
    }
});
registerAction2(class ToggleCaseSensitiveCommandAction extends Action2 {
    constructor() {
        super({
            id: "toggleSearchCaseSensitive",
            title: nls.localize2('ToggleCaseSensitiveCommandId.label', "Toggle Case Sensitive"),
            category,
            keybinding: Object.assign({
                weight: 200,
                when: isMacintosh ? ContextKeyExpr.and(Constants.SearchContext.SearchViewFocusedKey, Constants.SearchContext.FileMatchOrFolderMatchFocusKey.toNegated()) : Constants.SearchContext.SearchViewFocusedKey,
            }, ToggleCaseSensitiveKeybinding)
        });
    }
    async run(accessor) {
        toggleCaseSensitiveCommand(accessor);
    }
});
registerAction2(class ToggleWholeWordCommandAction extends Action2 {
    constructor() {
        super({
            id: "toggleSearchWholeWord",
            title: nls.localize2('ToggleWholeWordCommandId.label', "Toggle Whole Word"),
            keybinding: Object.assign({
                weight: 200,
                when: Constants.SearchContext.SearchViewFocusedKey,
            }, ToggleWholeWordKeybinding),
            category,
        });
    }
    async run(accessor) {
        return toggleWholeWordCommand(accessor);
    }
});
registerAction2(class ToggleRegexCommandAction extends Action2 {
    constructor() {
        super({
            id: "toggleSearchRegex",
            title: nls.localize2('ToggleRegexCommandId.label', "Toggle Regex"),
            keybinding: Object.assign({
                weight: 200,
                when: Constants.SearchContext.SearchViewFocusedKey,
            }, ToggleRegexKeybinding),
            category,
        });
    }
    async run(accessor) {
        return toggleRegexCommand(accessor);
    }
});
registerAction2(class TogglePreserveCaseAction extends Action2 {
    constructor() {
        super({
            id: "toggleSearchPreserveCase",
            title: nls.localize2('TogglePreserveCaseId.label', "Toggle Preserve Case"),
            keybinding: Object.assign({
                weight: 200,
                when: Constants.SearchContext.SearchViewFocusedKey,
            }, TogglePreserveCaseKeybinding),
            category,
        });
    }
    async run(accessor) {
        return togglePreserveCaseCommand(accessor);
    }
});
registerAction2(class OpenMatchAction extends Action2 {
    constructor() {
        super({
            id: "search.action.openResult",
            title: nls.localize2('OpenMatch.label', "Open Match"),
            category,
            keybinding: {
                weight: 200,
                when: ContextKeyExpr.and(Constants.SearchContext.SearchViewVisibleKey, Constants.SearchContext.FileMatchOrMatchFocusKey),
                primary: 3,
                mac: {
                    primary: 3,
                    secondary: [2048 | 18]
                },
            },
        });
    }
    run(accessor) {
        const searchView = getSearchView(accessor.get(IViewsService));
        if (searchView) {
            const tree = searchView.getControl();
            const viewer = searchView.getControl();
            const focus = tree.getFocus()[0];
            if (focus instanceof FolderMatch) {
                viewer.toggleCollapsed(focus);
            }
            else {
                searchView.open(tree.getFocus()[0], false, false, true);
            }
        }
    }
});
registerAction2(class OpenMatchToSideAction extends Action2 {
    constructor() {
        super({
            id: "search.action.openResultToSide",
            title: nls.localize2('OpenMatchToSide.label', "Open Match To Side"),
            category,
            keybinding: {
                weight: 200,
                when: ContextKeyExpr.and(Constants.SearchContext.SearchViewVisibleKey, Constants.SearchContext.FileMatchOrMatchFocusKey),
                primary: 2048 | 3,
                mac: {
                    primary: 256 | 3
                },
            },
        });
    }
    run(accessor) {
        const searchView = getSearchView(accessor.get(IViewsService));
        if (searchView) {
            const tree = searchView.getControl();
            searchView.open(tree.getFocus()[0], false, true, true);
        }
    }
});
registerAction2(class AddCursorsAtSearchResultsAction extends Action2 {
    constructor() {
        super({
            id: "addCursorsAtSearchResults",
            title: nls.localize2('AddCursorsAtSearchResults.label', "Add Cursors at Search Results"),
            keybinding: {
                weight: 200,
                when: ContextKeyExpr.and(Constants.SearchContext.SearchViewVisibleKey, Constants.SearchContext.FileMatchOrMatchFocusKey),
                primary: 2048 | 1024 | 42,
            },
            category,
        });
    }
    async run(accessor) {
        const searchView = getSearchView(accessor.get(IViewsService));
        if (searchView) {
            const tree = searchView.getControl();
            searchView.openEditorWithMultiCursor(tree.getFocus()[0]);
        }
    }
});
registerAction2(class FocusNextInputAction extends Action2 {
    constructor() {
        super({
            id: "search.focus.nextInputBox",
            title: nls.localize2('FocusNextInputAction.label', "Focus Next Input"),
            category,
            keybinding: {
                weight: 200,
                when: ContextKeyExpr.or(ContextKeyExpr.and(SearchEditorConstants.InSearchEditor, Constants.SearchContext.InputBoxFocusedKey), ContextKeyExpr.and(Constants.SearchContext.SearchViewVisibleKey, Constants.SearchContext.InputBoxFocusedKey)),
                primary: 2048 | 18,
            },
        });
    }
    async run(accessor) {
        const editorService = accessor.get(IEditorService);
        const input = editorService.activeEditor;
        if (input instanceof SearchEditorInput) {
            editorService.activeEditorPane.focusNextInput();
        }
        const searchView = getSearchView(accessor.get(IViewsService));
        searchView?.focusNextInputBox();
    }
});
registerAction2(class FocusPreviousInputAction extends Action2 {
    constructor() {
        super({
            id: "search.focus.previousInputBox",
            title: nls.localize2('FocusPreviousInputAction.label', "Focus Previous Input"),
            category,
            keybinding: {
                weight: 200,
                when: ContextKeyExpr.or(ContextKeyExpr.and(SearchEditorConstants.InSearchEditor, Constants.SearchContext.InputBoxFocusedKey), ContextKeyExpr.and(Constants.SearchContext.SearchViewVisibleKey, Constants.SearchContext.InputBoxFocusedKey, Constants.SearchContext.SearchInputBoxFocusedKey.toNegated())),
                primary: 2048 | 16,
            },
        });
    }
    async run(accessor) {
        const editorService = accessor.get(IEditorService);
        const input = editorService.activeEditor;
        if (input instanceof SearchEditorInput) {
            editorService.activeEditorPane.focusPrevInput();
        }
        const searchView = getSearchView(accessor.get(IViewsService));
        searchView?.focusPreviousInputBox();
    }
});
registerAction2(class FocusSearchFromResultsAction extends Action2 {
    constructor() {
        super({
            id: "search.action.focusSearchFromResults",
            title: nls.localize2('FocusSearchFromResults.label', "Focus Search From Results"),
            category,
            keybinding: {
                weight: 200,
                when: ContextKeyExpr.and(Constants.SearchContext.SearchViewVisibleKey, ContextKeyExpr.or(Constants.SearchContext.FirstMatchFocusKey, CONTEXT_ACCESSIBILITY_MODE_ENABLED)),
                primary: 2048 | 16,
            },
        });
    }
    run(accessor) {
        const searchView = getSearchView(accessor.get(IViewsService));
        searchView?.focusPreviousInputBox();
    }
});
registerAction2(class ToggleSearchOnTypeAction extends Action2 {
    static { this.searchOnTypeKey = 'search.searchOnType'; }
    constructor() {
        super({
            id: "workbench.action.toggleSearchOnType",
            title: nls.localize2('toggleTabs', "Toggle Search on Type"),
            category,
        });
    }
    async run(accessor) {
        const configurationService = accessor.get(IConfigurationService);
        const searchOnType = configurationService.getValue(ToggleSearchOnTypeAction.searchOnTypeKey);
        return configurationService.updateValue(ToggleSearchOnTypeAction.searchOnTypeKey, !searchOnType);
    }
});
registerAction2(class FocusSearchListCommandAction extends Action2 {
    constructor() {
        super({
            id: "search.action.focusSearchList",
            title: nls.localize2('focusSearchListCommandLabel', "Focus List"),
            category,
            f1: true
        });
    }
    async run(accessor) {
        focusSearchListCommand(accessor);
    }
});
registerAction2(class FocusNextSearchResultAction extends Action2 {
    constructor() {
        super({
            id: "search.action.focusNextSearchResult",
            title: nls.localize2('FocusNextSearchResult.label', "Focus Next Search Result"),
            keybinding: [{
                    primary: 62,
                    weight: 200,
                }],
            category,
            f1: true,
            precondition: ContextKeyExpr.or(Constants.SearchContext.HasSearchResults, SearchEditorConstants.InSearchEditor),
        });
    }
    async run(accessor) {
        return await focusNextSearchResult(accessor);
    }
});
registerAction2(class FocusPreviousSearchResultAction extends Action2 {
    constructor() {
        super({
            id: "search.action.focusPreviousSearchResult",
            title: nls.localize2('FocusPreviousSearchResult.label', "Focus Previous Search Result"),
            keybinding: [{
                    primary: 1024 | 62,
                    weight: 200,
                }],
            category,
            f1: true,
            precondition: ContextKeyExpr.or(Constants.SearchContext.HasSearchResults, SearchEditorConstants.InSearchEditor),
        });
    }
    async run(accessor) {
        return await focusPreviousSearchResult(accessor);
    }
});
registerAction2(class ReplaceInFilesAction extends Action2 {
    constructor() {
        super({
            id: "workbench.action.replaceInFiles",
            title: nls.localize2('replaceInFiles', "Replace in Files"),
            keybinding: [{
                    primary: 2048 | 1024 | 38,
                    weight: 200,
                }],
            category,
            f1: true,
            menu: [{
                    id: MenuId.MenubarEditMenu,
                    group: '4_find_global',
                    order: 2
                }],
        });
    }
    async run(accessor) {
        return await findOrReplaceInFiles(accessor, true);
    }
});
function toggleCaseSensitiveCommand(accessor) {
    const searchView = getSearchView(accessor.get(IViewsService));
    searchView?.toggleCaseSensitive();
}
function toggleWholeWordCommand(accessor) {
    const searchView = getSearchView(accessor.get(IViewsService));
    searchView?.toggleWholeWords();
}
function toggleRegexCommand(accessor) {
    const searchView = getSearchView(accessor.get(IViewsService));
    searchView?.toggleRegex();
}
function togglePreserveCaseCommand(accessor) {
    const searchView = getSearchView(accessor.get(IViewsService));
    searchView?.togglePreserveCase();
}
const focusSearchListCommand = accessor => {
    const viewsService = accessor.get(IViewsService);
    openSearchView(viewsService).then(searchView => {
        searchView?.moveFocusToResults();
    });
};
async function focusNextSearchResult(accessor) {
    const editorService = accessor.get(IEditorService);
    const input = editorService.activeEditor;
    if (input instanceof SearchEditorInput) {
        return editorService.activeEditorPane.focusNextResult();
    }
    return openSearchView(accessor.get(IViewsService)).then(searchView => searchView?.selectNextMatch());
}
async function focusPreviousSearchResult(accessor) {
    const editorService = accessor.get(IEditorService);
    const input = editorService.activeEditor;
    if (input instanceof SearchEditorInput) {
        return editorService.activeEditorPane.focusPreviousResult();
    }
    return openSearchView(accessor.get(IViewsService)).then(searchView => searchView?.selectPreviousMatch());
}
async function findOrReplaceInFiles(accessor, expandSearchReplaceWidget) {
    return openSearchView(accessor.get(IViewsService), false).then(openedView => {
        if (openedView) {
            const searchAndReplaceWidget = openedView.searchAndReplaceWidget;
            searchAndReplaceWidget.toggleReplace(expandSearchReplaceWidget);
            const updatedText = openedView.updateTextFromFindWidgetOrSelection({ allowUnselectedWord: !expandSearchReplaceWidget });
            openedView.searchAndReplaceWidget.focus(undefined, updatedText, updatedText);
        }
    });
}
