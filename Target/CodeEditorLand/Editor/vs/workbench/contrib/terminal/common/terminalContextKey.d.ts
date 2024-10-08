import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
export declare const enum TerminalContextKeyStrings {
    IsOpen = "terminalIsOpen",
    Count = "terminalCount",
    GroupCount = "terminalGroupCount",
    TabsNarrow = "isTerminalTabsNarrow",
    HasFixedWidth = "terminalHasFixedWidth",
    ProcessSupported = "terminalProcessSupported",
    Focus = "terminalFocus",
    FocusInAny = "terminalFocusInAny",
    AccessibleBufferFocus = "terminalAccessibleBufferFocus",
    AccessibleBufferOnLastLine = "terminalAccessibleBufferOnLastLine",
    EditorFocus = "terminalEditorFocus",
    TabsFocus = "terminalTabsFocus",
    WebExtensionContributedProfile = "terminalWebExtensionContributedProfile",
    TerminalHasBeenCreated = "terminalHasBeenCreated",
    TerminalEditorActive = "terminalEditorActive",
    TabsMouse = "terminalTabsMouse",
    AltBufferActive = "terminalAltBufferActive",
    SuggestWidgetVisible = "terminalSuggestWidgetVisible",
    A11yTreeFocus = "terminalA11yTreeFocus",
    ViewShowing = "terminalViewShowing",
    TextSelected = "terminalTextSelected",
    TextSelectedInFocused = "terminalTextSelectedInFocused",
    FindVisible = "terminalFindVisible",
    FindInputFocused = "terminalFindInputFocused",
    FindFocused = "terminalFindFocused",
    TabsSingularSelection = "terminalTabsSingularSelection",
    SplitTerminal = "terminalSplitTerminal",
    ShellType = "terminalShellType",
    InTerminalRunCommandPicker = "inTerminalRunCommandPicker",
    TerminalShellIntegrationEnabled = "terminalShellIntegrationEnabled"
}
export declare namespace TerminalContextKeys {
    /** Whether there is at least one opened terminal. */
    const isOpen: RawContextKey<boolean>;
    /** Whether the terminal is focused. */
    const focus: RawContextKey<boolean>;
    /** Whether any terminal is focused, including detached terminals used in other UI. */
    const focusInAny: RawContextKey<boolean>;
    /** Whether a terminal in the editor area is focused. */
    const editorFocus: RawContextKey<boolean>;
    /** The current number of terminals. */
    const count: RawContextKey<number>;
    /** The current number of terminal groups. */
    const groupCount: RawContextKey<number>;
    /** Whether the terminal tabs view is narrow. */
    const tabsNarrow: RawContextKey<boolean>;
    /** Whether the terminal tabs view is narrow. */
    const terminalHasFixedWidth: RawContextKey<boolean>;
    /** Whether the terminal tabs widget is focused. */
    const tabsFocus: RawContextKey<boolean>;
    /** Whether a web extension has contributed a profile */
    const webExtensionContributedProfile: RawContextKey<boolean>;
    /** Whether at least one terminal has been created */
    const terminalHasBeenCreated: RawContextKey<boolean>;
    /** Whether at least one terminal has been created */
    const terminalEditorActive: RawContextKey<boolean>;
    /** Whether the mouse is within the terminal tabs list. */
    const tabsMouse: RawContextKey<boolean>;
    /** The shell type of the active terminal, this is set if the type can be detected. */
    const shellType: RawContextKey<string>;
    /** Whether the terminal's alt buffer is active. */
    const altBufferActive: RawContextKey<boolean>;
    /** Whether the terminal's suggest widget is visible. */
    const suggestWidgetVisible: RawContextKey<boolean>;
    /** Whether the terminal is NOT focused. */
    const notFocus: import("../../../../platform/contextkey/common/contextkey.js").ContextKeyExpression;
    /** Whether the terminal view is showing. */
    const viewShowing: RawContextKey<boolean>;
    /** Whether text is selected in the active terminal. */
    const textSelected: RawContextKey<boolean>;
    /** Whether text is selected in a focused terminal. `textSelected` counts text selected in an active in a terminal view or an editor, where `textSelectedInFocused` simply counts text in an element with DOM focus. */
    const textSelectedInFocused: RawContextKey<boolean>;
    /** Whether text is NOT selected in the active terminal. */
    const notTextSelected: import("../../../../platform/contextkey/common/contextkey.js").ContextKeyExpression;
    /** Whether the active terminal's find widget is visible. */
    const findVisible: RawContextKey<boolean>;
    /** Whether the active terminal's find widget is NOT visible. */
    const notFindVisible: import("../../../../platform/contextkey/common/contextkey.js").ContextKeyExpression;
    /** Whether the active terminal's find widget text input is focused. */
    const findInputFocus: RawContextKey<boolean>;
    /** Whether an element within the active terminal's find widget is focused. */
    const findFocus: RawContextKey<boolean>;
    /** Whether NO elements within the active terminal's find widget is focused. */
    const notFindFocus: import("../../../../platform/contextkey/common/contextkey.js").ContextKeyExpression;
    /** Whether terminal processes can be launched in the current workspace. */
    const processSupported: RawContextKey<boolean>;
    /** Whether one terminal is selected in the terminal tabs list. */
    const tabsSingularSelection: RawContextKey<boolean>;
    /** Whether the focused tab's terminal is a split terminal. */
    const splitTerminal: RawContextKey<boolean>;
    /** Whether the terminal run command picker is currently open. */
    const inTerminalRunCommandPicker: RawContextKey<boolean>;
    /** Whether shell integration is enabled in the active terminal. This only considers full VS Code shell integration. */
    const terminalShellIntegrationEnabled: RawContextKey<boolean>;
    const shouldShowViewInlineActions: import("../../../../platform/contextkey/common/contextkey.js").ContextKeyExpression | undefined;
}
