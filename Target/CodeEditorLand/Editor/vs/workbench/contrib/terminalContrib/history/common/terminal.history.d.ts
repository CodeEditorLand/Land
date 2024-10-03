import type { IStringDictionary } from '../../../../../base/common/collections.js';
import type { IConfigurationPropertySchema } from '../../../../../platform/configuration/common/configurationRegistry.js';
export declare const enum TerminalHistoryCommandId {
    ClearPreviousSessionHistory = "workbench.action.terminal.clearPreviousSessionHistory",
    GoToRecentDirectory = "workbench.action.terminal.goToRecentDirectory",
    RunRecentCommand = "workbench.action.terminal.runRecentCommand"
}
export declare const defaultTerminalHistoryCommandsToSkipShell: TerminalHistoryCommandId[];
export declare const enum TerminalHistorySettingId {
    ShellIntegrationCommandHistory = "terminal.integrated.shellIntegration.history"
}
export declare const terminalHistoryConfiguration: IStringDictionary<IConfigurationPropertySchema>;
