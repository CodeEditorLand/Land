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
    const isOpen: RawContextKey<boolean>;
    const focus: RawContextKey<boolean>;
    const focusInAny: RawContextKey<boolean>;
    const editorFocus: RawContextKey<boolean>;
    const count: RawContextKey<number>;
    const groupCount: RawContextKey<number>;
    const tabsNarrow: RawContextKey<boolean>;
    const terminalHasFixedWidth: RawContextKey<boolean>;
    const tabsFocus: RawContextKey<boolean>;
    const webExtensionContributedProfile: RawContextKey<boolean>;
    const terminalHasBeenCreated: RawContextKey<boolean>;
    const terminalEditorActive: RawContextKey<boolean>;
    const tabsMouse: RawContextKey<boolean>;
    const shellType: RawContextKey<string>;
    const altBufferActive: RawContextKey<boolean>;
    const suggestWidgetVisible: RawContextKey<boolean>;
    const notFocus: import("../../../../platform/contextkey/common/contextkey.js").ContextKeyExpression;
    const viewShowing: RawContextKey<boolean>;
    const textSelected: RawContextKey<boolean>;
    const textSelectedInFocused: RawContextKey<boolean>;
    const notTextSelected: import("../../../../platform/contextkey/common/contextkey.js").ContextKeyExpression;
    const findVisible: RawContextKey<boolean>;
    const notFindVisible: import("../../../../platform/contextkey/common/contextkey.js").ContextKeyExpression;
    const findInputFocus: RawContextKey<boolean>;
    const findFocus: RawContextKey<boolean>;
    const notFindFocus: import("../../../../platform/contextkey/common/contextkey.js").ContextKeyExpression;
    const processSupported: RawContextKey<boolean>;
    const tabsSingularSelection: RawContextKey<boolean>;
    const splitTerminal: RawContextKey<boolean>;
    const inTerminalRunCommandPicker: RawContextKey<boolean>;
    const terminalShellIntegrationEnabled: RawContextKey<boolean>;
    const shouldShowViewInlineActions: import("../../../../platform/contextkey/common/contextkey.js").ContextKeyExpression | undefined;
}
