import { localize } from '../../../../../nls.js';
export const terminalCommandGuideConfigSection = 'terminal.integrated.shellIntegration';
export const terminalCommandGuideConfiguration = {
    ["terminal.integrated.shellIntegration.showCommandGuide"]: {
        restricted: true,
        markdownDescription: localize('showCommandGuide', "Whether to show the command guide when hovering over a command in the terminal."),
        type: 'boolean',
        default: true,
    },
};
