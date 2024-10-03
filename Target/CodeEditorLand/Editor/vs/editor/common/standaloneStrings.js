import * as nls from '../../nls.js';
export var AccessibilityHelpNLS;
(function (AccessibilityHelpNLS) {
    AccessibilityHelpNLS.accessibilityHelpTitle = nls.localize('accessibilityHelpTitle', "Accessibility Help");
    AccessibilityHelpNLS.openingDocs = nls.localize("openingDocs", "Opening the Accessibility documentation page.");
    AccessibilityHelpNLS.readonlyDiffEditor = nls.localize("readonlyDiffEditor", "You are in a read-only pane of a diff editor.");
    AccessibilityHelpNLS.editableDiffEditor = nls.localize("editableDiffEditor", "You are in a pane of a diff editor.");
    AccessibilityHelpNLS.readonlyEditor = nls.localize("readonlyEditor", "You are in a read-only code editor.");
    AccessibilityHelpNLS.editableEditor = nls.localize("editableEditor", "You are in a code editor.");
    AccessibilityHelpNLS.changeConfigToOnMac = nls.localize("changeConfigToOnMac", "Configure the application to be optimized for usage with a Screen Reader (Command+E).");
    AccessibilityHelpNLS.changeConfigToOnWinLinux = nls.localize("changeConfigToOnWinLinux", "Configure the application to be optimized for usage with a Screen Reader (Control+E).");
    AccessibilityHelpNLS.auto_on = nls.localize("auto_on", "The application is configured to be optimized for usage with a Screen Reader.");
    AccessibilityHelpNLS.auto_off = nls.localize("auto_off", "The application is configured to never be optimized for usage with a Screen Reader.");
    AccessibilityHelpNLS.screenReaderModeEnabled = nls.localize("screenReaderModeEnabled", "Screen Reader Optimized Mode enabled.");
    AccessibilityHelpNLS.screenReaderModeDisabled = nls.localize("screenReaderModeDisabled", "Screen Reader Optimized Mode disabled.");
    AccessibilityHelpNLS.tabFocusModeOnMsg = nls.localize("tabFocusModeOnMsg", "Pressing Tab in the current editor will move focus to the next focusable element. Toggle this behavior{0}.", '<keybinding:editor.action.toggleTabFocusMode>');
    AccessibilityHelpNLS.tabFocusModeOffMsg = nls.localize("tabFocusModeOffMsg", "Pressing Tab in the current editor will insert the tab character. Toggle this behavior{0}.", '<keybinding:editor.action.toggleTabFocusMode>');
    AccessibilityHelpNLS.stickScroll = nls.localize("stickScrollKb", "Focus Sticky Scroll{0} to focus the currently nested scopes.", '<keybinding:editor.action.focusStickyDebugConsole>');
    AccessibilityHelpNLS.codeFolding = nls.localize("codeFolding", "Use code folding to collapse blocks of code and focus on the code you're interested in via the Toggle Folding Command{0}.", '<keybinding:editor.toggleFold>');
    AccessibilityHelpNLS.intellisense = nls.localize("intellisense", "Use Intellisense to improve coding efficiency and reduce errors. Trigger suggestions{0}.", '<keybinding:editor.action.triggerSuggest>');
    AccessibilityHelpNLS.showOrFocusHover = nls.localize("showOrFocusHover", "Show or focus the hover{0} to read information about the current symbol.", '<keybinding:editor.action.showHover>');
    AccessibilityHelpNLS.goToSymbol = nls.localize("goToSymbol", "Go to Symbol{0} to quickly navigate between symbols in the current file.", '<keybinding:workbench.action.gotoSymbol>');
    AccessibilityHelpNLS.showAccessibilityHelpAction = nls.localize("showAccessibilityHelpAction", "Show Accessibility Help");
    AccessibilityHelpNLS.listSignalSounds = nls.localize("listSignalSoundsCommand", "Run the command: List Signal Sounds for an overview of all sounds and their current status.");
    AccessibilityHelpNLS.listAlerts = nls.localize("listAnnouncementsCommand", "Run the command: List Signal Announcements for an overview of announcements and their current status.");
    AccessibilityHelpNLS.quickChat = nls.localize("quickChatCommand", "Toggle quick chat{0} to open or close a chat session.", '<keybinding:workbench.action.quickchat.toggle>');
    AccessibilityHelpNLS.startInlineChat = nls.localize("startInlineChatCommand", "Start inline chat{0} to create an in editor chat session.", '<keybinding:inlineChat.start>');
    AccessibilityHelpNLS.startDebugging = nls.localize('debug.startDebugging', "The Debug: Start Debugging command{0} will start a debug session.", '<keybinding:workbench.action.debug.start>');
    AccessibilityHelpNLS.setBreakpoint = nls.localize('debugConsole.setBreakpoint', "The Debug: Inline Breakpoint command{0} will set or unset a breakpoint at the current cursor position in the active editor.", '<keybinding:editor.debug.action.toggleInlineBreakpoint>');
    AccessibilityHelpNLS.addToWatch = nls.localize('debugConsole.addToWatch', "The Debug: Add to Watch command{0} will add the selected text to the watch view.", '<keybinding:editor.debug.action.selectionToWatch>');
    AccessibilityHelpNLS.debugExecuteSelection = nls.localize('debugConsole.executeSelection', "The Debug: Execute Selection command{0} will execute the selected text in the debug console.", '<keybinding:editor.debug.action.selectionToRepl>');
})(AccessibilityHelpNLS || (AccessibilityHelpNLS = {}));
export var InspectTokensNLS;
(function (InspectTokensNLS) {
    InspectTokensNLS.inspectTokensAction = nls.localize('inspectTokens', "Developer: Inspect Tokens");
})(InspectTokensNLS || (InspectTokensNLS = {}));
export var GoToLineNLS;
(function (GoToLineNLS) {
    GoToLineNLS.gotoLineActionLabel = nls.localize('gotoLineActionLabel', "Go to Line/Column...");
})(GoToLineNLS || (GoToLineNLS = {}));
export var QuickHelpNLS;
(function (QuickHelpNLS) {
    QuickHelpNLS.helpQuickAccessActionLabel = nls.localize('helpQuickAccess', "Show all Quick Access Providers");
})(QuickHelpNLS || (QuickHelpNLS = {}));
export var QuickCommandNLS;
(function (QuickCommandNLS) {
    QuickCommandNLS.quickCommandActionLabel = nls.localize('quickCommandActionLabel', "Command Palette");
    QuickCommandNLS.quickCommandHelp = nls.localize('quickCommandActionHelp', "Show And Run Commands");
})(QuickCommandNLS || (QuickCommandNLS = {}));
export var QuickOutlineNLS;
(function (QuickOutlineNLS) {
    QuickOutlineNLS.quickOutlineActionLabel = nls.localize('quickOutlineActionLabel', "Go to Symbol...");
    QuickOutlineNLS.quickOutlineByCategoryActionLabel = nls.localize('quickOutlineByCategoryActionLabel', "Go to Symbol by Category...");
})(QuickOutlineNLS || (QuickOutlineNLS = {}));
export var StandaloneCodeEditorNLS;
(function (StandaloneCodeEditorNLS) {
    StandaloneCodeEditorNLS.editorViewAccessibleLabel = nls.localize('editorViewAccessibleLabel', "Editor content");
})(StandaloneCodeEditorNLS || (StandaloneCodeEditorNLS = {}));
export var ToggleHighContrastNLS;
(function (ToggleHighContrastNLS) {
    ToggleHighContrastNLS.toggleHighContrast = nls.localize('toggleHighContrast', "Toggle High Contrast Theme");
})(ToggleHighContrastNLS || (ToggleHighContrastNLS = {}));
export var StandaloneServicesNLS;
(function (StandaloneServicesNLS) {
    StandaloneServicesNLS.bulkEditServiceSummary = nls.localize('bulkEditServiceSummary', "Made {0} edits in {1} files");
})(StandaloneServicesNLS || (StandaloneServicesNLS = {}));
