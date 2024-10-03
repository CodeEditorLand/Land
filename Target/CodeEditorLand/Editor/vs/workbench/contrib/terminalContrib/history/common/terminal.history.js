import { localize } from '../../../../../nls.js';
export const defaultTerminalHistoryCommandsToSkipShell = [
    "workbench.action.terminal.goToRecentDirectory",
    "workbench.action.terminal.runRecentCommand"
];
export const terminalHistoryConfiguration = {
    ["terminal.integrated.shellIntegration.history"]: {
        restricted: true,
        markdownDescription: localize('terminal.integrated.shellIntegration.history', "Controls the number of recently used commands to keep in the terminal command history. Set to 0 to disable terminal command history."),
        type: 'number',
        default: 100
    },
};
