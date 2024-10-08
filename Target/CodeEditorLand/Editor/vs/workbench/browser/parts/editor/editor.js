/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Dimension } from '../../../../base/browser/dom.js';
import { isObject } from '../../../../base/common/types.js';
import { BooleanVerifier, EnumVerifier, NumberVerifier, ObjectVerifier, SetVerifier, verifyObject } from '../../../../base/common/verifier.js';
export const DEFAULT_EDITOR_MIN_DIMENSIONS = new Dimension(220, 70);
export const DEFAULT_EDITOR_MAX_DIMENSIONS = new Dimension(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
export const DEFAULT_EDITOR_PART_OPTIONS = {
    showTabs: 'multiple',
    highlightModifiedTabs: false,
    tabActionLocation: 'right',
    tabActionCloseVisibility: true,
    tabActionUnpinVisibility: true,
    alwaysShowEditorActions: false,
    tabSizing: 'fit',
    tabSizingFixedMinWidth: 50,
    tabSizingFixedMaxWidth: 160,
    pinnedTabSizing: 'normal',
    pinnedTabsOnSeparateRow: false,
    tabHeight: 'default',
    preventPinnedEditorClose: 'keyboardAndMouse',
    titleScrollbarSizing: 'default',
    focusRecentEditorAfterClose: true,
    showIcons: true,
    hasIcons: true, // 'vs-seti' is our default icon theme
    enablePreview: true,
    openPositioning: 'right',
    openSideBySideDirection: 'right',
    closeEmptyGroups: true,
    labelFormat: 'default',
    splitSizing: 'auto',
    splitOnDragAndDrop: true,
    dragToOpenWindow: true,
    centeredLayoutFixedWidth: false,
    doubleClickTabToToggleEditorGroupSizes: 'expand',
    editorActionsLocation: 'default',
    wrapTabs: false,
    enablePreviewFromQuickOpen: false,
    scrollToSwitchTabs: false,
    enablePreviewFromCodeNavigation: false,
    closeOnFileDelete: false,
    mouseBackForwardToNavigate: true,
    restoreViewState: true,
    splitInGroupLayout: 'horizontal',
    revealIfOpen: false,
    // Properties that are Objects have to be defined as getters
    // to ensure no consumer modifies the default values
    get limit() { return { enabled: false, value: 10, perEditorGroup: false, excludeDirty: false }; },
    get decorations() { return { badges: true, colors: true }; },
    get autoLockGroups() { return new Set(); }
};
export function impactsEditorPartOptions(event) {
    return event.affectsConfiguration('workbench.editor') || event.affectsConfiguration('workbench.iconTheme') || event.affectsConfiguration('window.density');
}
export function getEditorPartOptions(configurationService, themeService) {
    const options = {
        ...DEFAULT_EDITOR_PART_OPTIONS,
        hasIcons: themeService.getFileIconTheme().hasFileIcons
    };
    const config = configurationService.getValue();
    if (config?.workbench?.editor) {
        // Assign all primitive configuration over
        Object.assign(options, config.workbench.editor);
        // Special handle array types and convert to Set
        if (isObject(config.workbench.editor.autoLockGroups)) {
            options.autoLockGroups = DEFAULT_EDITOR_PART_OPTIONS.autoLockGroups;
            for (const [editorId, enablement] of Object.entries(config.workbench.editor.autoLockGroups)) {
                if (enablement === true) {
                    options.autoLockGroups.add(editorId);
                }
            }
        }
        else {
            options.autoLockGroups = DEFAULT_EDITOR_PART_OPTIONS.autoLockGroups;
        }
    }
    const windowConfig = configurationService.getValue();
    if (windowConfig?.window?.density?.editorTabHeight) {
        options.tabHeight = windowConfig.window.density.editorTabHeight;
    }
    return validateEditorPartOptions(options);
}
function validateEditorPartOptions(options) {
    // Migrate: Show tabs (config migration kicks in very late and can cause flicker otherwise)
    if (typeof options.showTabs === 'boolean') {
        options.showTabs = options.showTabs ? 'multiple' : 'single';
    }
    return verifyObject({
        'wrapTabs': new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS['wrapTabs']),
        'scrollToSwitchTabs': new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS['scrollToSwitchTabs']),
        'highlightModifiedTabs': new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS['highlightModifiedTabs']),
        'tabActionCloseVisibility': new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS['tabActionCloseVisibility']),
        'tabActionUnpinVisibility': new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS['tabActionUnpinVisibility']),
        'alwaysShowEditorActions': new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS['alwaysShowEditorActions']),
        'pinnedTabsOnSeparateRow': new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS['pinnedTabsOnSeparateRow']),
        'focusRecentEditorAfterClose': new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS['focusRecentEditorAfterClose']),
        'showIcons': new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS['showIcons']),
        'enablePreview': new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS['enablePreview']),
        'enablePreviewFromQuickOpen': new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS['enablePreviewFromQuickOpen']),
        'enablePreviewFromCodeNavigation': new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS['enablePreviewFromCodeNavigation']),
        'closeOnFileDelete': new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS['closeOnFileDelete']),
        'closeEmptyGroups': new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS['closeEmptyGroups']),
        'revealIfOpen': new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS['revealIfOpen']),
        'mouseBackForwardToNavigate': new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS['mouseBackForwardToNavigate']),
        'restoreViewState': new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS['restoreViewState']),
        'splitOnDragAndDrop': new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS['splitOnDragAndDrop']),
        'dragToOpenWindow': new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS['dragToOpenWindow']),
        'centeredLayoutFixedWidth': new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS['centeredLayoutFixedWidth']),
        'hasIcons': new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS['hasIcons']),
        'tabSizingFixedMinWidth': new NumberVerifier(DEFAULT_EDITOR_PART_OPTIONS['tabSizingFixedMinWidth']),
        'tabSizingFixedMaxWidth': new NumberVerifier(DEFAULT_EDITOR_PART_OPTIONS['tabSizingFixedMaxWidth']),
        'showTabs': new EnumVerifier(DEFAULT_EDITOR_PART_OPTIONS['showTabs'], ['multiple', 'single', 'none']),
        'tabActionLocation': new EnumVerifier(DEFAULT_EDITOR_PART_OPTIONS['tabActionLocation'], ['left', 'right']),
        'tabSizing': new EnumVerifier(DEFAULT_EDITOR_PART_OPTIONS['tabSizing'], ['fit', 'shrink', 'fixed']),
        'pinnedTabSizing': new EnumVerifier(DEFAULT_EDITOR_PART_OPTIONS['pinnedTabSizing'], ['normal', 'compact', 'shrink']),
        'tabHeight': new EnumVerifier(DEFAULT_EDITOR_PART_OPTIONS['tabHeight'], ['default', 'compact']),
        'preventPinnedEditorClose': new EnumVerifier(DEFAULT_EDITOR_PART_OPTIONS['preventPinnedEditorClose'], ['keyboardAndMouse', 'keyboard', 'mouse', 'never']),
        'titleScrollbarSizing': new EnumVerifier(DEFAULT_EDITOR_PART_OPTIONS['titleScrollbarSizing'], ['default', 'large']),
        'openPositioning': new EnumVerifier(DEFAULT_EDITOR_PART_OPTIONS['openPositioning'], ['left', 'right', 'first', 'last']),
        'openSideBySideDirection': new EnumVerifier(DEFAULT_EDITOR_PART_OPTIONS['openSideBySideDirection'], ['right', 'down']),
        'labelFormat': new EnumVerifier(DEFAULT_EDITOR_PART_OPTIONS['labelFormat'], ['default', 'short', 'medium', 'long']),
        'splitInGroupLayout': new EnumVerifier(DEFAULT_EDITOR_PART_OPTIONS['splitInGroupLayout'], ['vertical', 'horizontal']),
        'splitSizing': new EnumVerifier(DEFAULT_EDITOR_PART_OPTIONS['splitSizing'], ['distribute', 'split', 'auto']),
        'doubleClickTabToToggleEditorGroupSizes': new EnumVerifier(DEFAULT_EDITOR_PART_OPTIONS['doubleClickTabToToggleEditorGroupSizes'], ['maximize', 'expand', 'off']),
        'editorActionsLocation': new EnumVerifier(DEFAULT_EDITOR_PART_OPTIONS['editorActionsLocation'], ['default', 'titleBar', 'hidden']),
        'autoLockGroups': new SetVerifier(DEFAULT_EDITOR_PART_OPTIONS['autoLockGroups']),
        'limit': new ObjectVerifier(DEFAULT_EDITOR_PART_OPTIONS['limit'], {
            'enabled': new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS['limit']['enabled']),
            'value': new NumberVerifier(DEFAULT_EDITOR_PART_OPTIONS['limit']['value']),
            'perEditorGroup': new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS['limit']['perEditorGroup']),
            'excludeDirty': new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS['limit']['excludeDirty'])
        }),
        'decorations': new ObjectVerifier(DEFAULT_EDITOR_PART_OPTIONS['decorations'], {
            'badges': new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS['decorations']['badges']),
            'colors': new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS['decorations']['colors'])
        }),
    }, options);
}
export function fillActiveEditorViewState(group, expectedActiveEditor, presetOptions) {
    if (!expectedActiveEditor || !group.activeEditor || expectedActiveEditor.matches(group.activeEditor)) {
        const options = {
            ...presetOptions,
            viewState: group.activeEditorPane?.getViewState()
        };
        return options;
    }
    return presetOptions || Object.create(null);
}
