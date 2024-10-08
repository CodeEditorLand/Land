/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { localize } from '../../../../nls.js';
import { ContextKeyExpr, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { TERMINAL_VIEW_ID } from './terminal.js';
export var TerminalContextKeys;
(function (TerminalContextKeys) {
    /** Whether there is at least one opened terminal. */
    TerminalContextKeys.isOpen = new RawContextKey("terminalIsOpen" /* TerminalContextKeyStrings.IsOpen */, false, true);
    /** Whether the terminal is focused. */
    TerminalContextKeys.focus = new RawContextKey("terminalFocus" /* TerminalContextKeyStrings.Focus */, false, localize('terminalFocusContextKey', "Whether the terminal is focused."));
    /** Whether any terminal is focused, including detached terminals used in other UI. */
    TerminalContextKeys.focusInAny = new RawContextKey("terminalFocusInAny" /* TerminalContextKeyStrings.FocusInAny */, false, localize('terminalFocusInAnyContextKey', "Whether any terminal is focused, including detached terminals used in other UI."));
    /** Whether a terminal in the editor area is focused. */
    TerminalContextKeys.editorFocus = new RawContextKey("terminalEditorFocus" /* TerminalContextKeyStrings.EditorFocus */, false, localize('terminalEditorFocusContextKey', "Whether a terminal in the editor area is focused."));
    /** The current number of terminals. */
    TerminalContextKeys.count = new RawContextKey("terminalCount" /* TerminalContextKeyStrings.Count */, 0, localize('terminalCountContextKey', "The current number of terminals."));
    /** The current number of terminal groups. */
    TerminalContextKeys.groupCount = new RawContextKey("terminalGroupCount" /* TerminalContextKeyStrings.GroupCount */, 0, true);
    /** Whether the terminal tabs view is narrow. */
    TerminalContextKeys.tabsNarrow = new RawContextKey("isTerminalTabsNarrow" /* TerminalContextKeyStrings.TabsNarrow */, false, true);
    /** Whether the terminal tabs view is narrow. */
    TerminalContextKeys.terminalHasFixedWidth = new RawContextKey("terminalHasFixedWidth" /* TerminalContextKeyStrings.HasFixedWidth */, false, true);
    /** Whether the terminal tabs widget is focused. */
    TerminalContextKeys.tabsFocus = new RawContextKey("terminalTabsFocus" /* TerminalContextKeyStrings.TabsFocus */, false, localize('terminalTabsFocusContextKey', "Whether the terminal tabs widget is focused."));
    /** Whether a web extension has contributed a profile */
    TerminalContextKeys.webExtensionContributedProfile = new RawContextKey("terminalWebExtensionContributedProfile" /* TerminalContextKeyStrings.WebExtensionContributedProfile */, false, true);
    /** Whether at least one terminal has been created */
    TerminalContextKeys.terminalHasBeenCreated = new RawContextKey("terminalHasBeenCreated" /* TerminalContextKeyStrings.TerminalHasBeenCreated */, false, true);
    /** Whether at least one terminal has been created */
    TerminalContextKeys.terminalEditorActive = new RawContextKey("terminalEditorActive" /* TerminalContextKeyStrings.TerminalEditorActive */, false, true);
    /** Whether the mouse is within the terminal tabs list. */
    TerminalContextKeys.tabsMouse = new RawContextKey("terminalTabsMouse" /* TerminalContextKeyStrings.TabsMouse */, false, true);
    /** The shell type of the active terminal, this is set if the type can be detected. */
    TerminalContextKeys.shellType = new RawContextKey("terminalShellType" /* TerminalContextKeyStrings.ShellType */, undefined, { type: 'string', description: localize('terminalShellTypeContextKey', "The shell type of the active terminal, this is set if the type can be detected.") });
    /** Whether the terminal's alt buffer is active. */
    TerminalContextKeys.altBufferActive = new RawContextKey("terminalAltBufferActive" /* TerminalContextKeyStrings.AltBufferActive */, false, localize('terminalAltBufferActive', "Whether the terminal's alt buffer is active."));
    /** Whether the terminal's suggest widget is visible. */
    TerminalContextKeys.suggestWidgetVisible = new RawContextKey("terminalSuggestWidgetVisible" /* TerminalContextKeyStrings.SuggestWidgetVisible */, false, localize('terminalSuggestWidgetVisible', "Whether the terminal's suggest widget is visible."));
    /** Whether the terminal is NOT focused. */
    TerminalContextKeys.notFocus = TerminalContextKeys.focus.toNegated();
    /** Whether the terminal view is showing. */
    TerminalContextKeys.viewShowing = new RawContextKey("terminalViewShowing" /* TerminalContextKeyStrings.ViewShowing */, false, localize('terminalViewShowing', "Whether the terminal view is showing"));
    /** Whether text is selected in the active terminal. */
    TerminalContextKeys.textSelected = new RawContextKey("terminalTextSelected" /* TerminalContextKeyStrings.TextSelected */, false, localize('terminalTextSelectedContextKey', "Whether text is selected in the active terminal."));
    /** Whether text is selected in a focused terminal. `textSelected` counts text selected in an active in a terminal view or an editor, where `textSelectedInFocused` simply counts text in an element with DOM focus. */
    TerminalContextKeys.textSelectedInFocused = new RawContextKey("terminalTextSelectedInFocused" /* TerminalContextKeyStrings.TextSelectedInFocused */, false, localize('terminalTextSelectedInFocusedContextKey', "Whether text is selected in a focused terminal."));
    /** Whether text is NOT selected in the active terminal. */
    TerminalContextKeys.notTextSelected = TerminalContextKeys.textSelected.toNegated();
    /** Whether the active terminal's find widget is visible. */
    TerminalContextKeys.findVisible = new RawContextKey("terminalFindVisible" /* TerminalContextKeyStrings.FindVisible */, false, true);
    /** Whether the active terminal's find widget is NOT visible. */
    TerminalContextKeys.notFindVisible = TerminalContextKeys.findVisible.toNegated();
    /** Whether the active terminal's find widget text input is focused. */
    TerminalContextKeys.findInputFocus = new RawContextKey("terminalFindInputFocused" /* TerminalContextKeyStrings.FindInputFocused */, false, true);
    /** Whether an element within the active terminal's find widget is focused. */
    TerminalContextKeys.findFocus = new RawContextKey("terminalFindFocused" /* TerminalContextKeyStrings.FindFocused */, false, true);
    /** Whether NO elements within the active terminal's find widget is focused. */
    TerminalContextKeys.notFindFocus = TerminalContextKeys.findInputFocus.toNegated();
    /** Whether terminal processes can be launched in the current workspace. */
    TerminalContextKeys.processSupported = new RawContextKey("terminalProcessSupported" /* TerminalContextKeyStrings.ProcessSupported */, false, localize('terminalProcessSupportedContextKey', "Whether terminal processes can be launched in the current workspace."));
    /** Whether one terminal is selected in the terminal tabs list. */
    TerminalContextKeys.tabsSingularSelection = new RawContextKey("terminalTabsSingularSelection" /* TerminalContextKeyStrings.TabsSingularSelection */, false, localize('terminalTabsSingularSelectedContextKey', "Whether one terminal is selected in the terminal tabs list."));
    /** Whether the focused tab's terminal is a split terminal. */
    TerminalContextKeys.splitTerminal = new RawContextKey("terminalSplitTerminal" /* TerminalContextKeyStrings.SplitTerminal */, false, localize('isSplitTerminalContextKey', "Whether the focused tab's terminal is a split terminal."));
    /** Whether the terminal run command picker is currently open. */
    TerminalContextKeys.inTerminalRunCommandPicker = new RawContextKey("inTerminalRunCommandPicker" /* TerminalContextKeyStrings.InTerminalRunCommandPicker */, false, localize('inTerminalRunCommandPickerContextKey', "Whether the terminal run command picker is currently open."));
    /** Whether shell integration is enabled in the active terminal. This only considers full VS Code shell integration. */
    TerminalContextKeys.terminalShellIntegrationEnabled = new RawContextKey("terminalShellIntegrationEnabled" /* TerminalContextKeyStrings.TerminalShellIntegrationEnabled */, false, localize('terminalShellIntegrationEnabled', "Whether shell integration is enabled in the active terminal"));
    TerminalContextKeys.shouldShowViewInlineActions = ContextKeyExpr.and(ContextKeyExpr.equals('view', TERMINAL_VIEW_ID), ContextKeyExpr.notEquals(`config.${"terminal.integrated.tabs.hideCondition" /* TerminalSettingId.TabsHideCondition */}`, 'never'), ContextKeyExpr.or(ContextKeyExpr.not(`config.${"terminal.integrated.tabs.enabled" /* TerminalSettingId.TabsEnabled */}`), ContextKeyExpr.and(ContextKeyExpr.equals(`config.${"terminal.integrated.tabs.showActions" /* TerminalSettingId.TabsShowActions */}`, 'singleTerminal'), ContextKeyExpr.equals("terminalGroupCount" /* TerminalContextKeyStrings.GroupCount */, 1)), ContextKeyExpr.and(ContextKeyExpr.equals(`config.${"terminal.integrated.tabs.showActions" /* TerminalSettingId.TabsShowActions */}`, 'singleTerminalOrNarrow'), ContextKeyExpr.or(ContextKeyExpr.equals("terminalGroupCount" /* TerminalContextKeyStrings.GroupCount */, 1), ContextKeyExpr.has("isTerminalTabsNarrow" /* TerminalContextKeyStrings.TabsNarrow */))), ContextKeyExpr.and(ContextKeyExpr.equals(`config.${"terminal.integrated.tabs.showActions" /* TerminalSettingId.TabsShowActions */}`, 'singleGroup'), ContextKeyExpr.equals("terminalGroupCount" /* TerminalContextKeyStrings.GroupCount */, 1)), ContextKeyExpr.equals(`config.${"terminal.integrated.tabs.showActions" /* TerminalSettingId.TabsShowActions */}`, 'always')));
})(TerminalContextKeys || (TerminalContextKeys = {}));
