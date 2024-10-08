import type { IConfigurationNode } from '../../../platform/configuration/common/configurationRegistry.js';
import { TerminalAccessibilityCommandId } from '../terminalContrib/accessibility/common/terminal.accessibility.js';
export declare const enum TerminalContribCommandId {
    A11yFocusAccessibleBuffer = "workbench.action.terminal.focusAccessibleBuffer",
    DeveloperRestartPtyHost = "workbench.action.terminal.restartPtyHost"
}
export declare const enum TerminalContribSettingId {
    SuggestEnabled = "terminal.integrated.suggest.enabled",
    StickyScrollEnabled = "terminal.integrated.stickyScroll.enabled"
}
export declare const terminalContribConfiguration: IConfigurationNode['properties'];
export declare const defaultTerminalContribCommandsToSkipShell: (TerminalAccessibilityCommandId | import("../terminalContrib/find/common/terminal.find.js").TerminalFindCommandId | import("../terminalContrib/history/common/terminal.history.js").TerminalHistoryCommandId | import("../terminalContrib/suggest/common/terminal.suggest.js").TerminalSuggestCommandId)[];
