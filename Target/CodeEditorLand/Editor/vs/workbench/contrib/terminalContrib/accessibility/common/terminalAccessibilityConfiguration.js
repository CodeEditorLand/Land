import { localize } from '../../../../../nls.js';
export const terminalAccessibilityConfiguration = {
    ["terminal.integrated.accessibleViewPreserveCursorPosition"]: {
        markdownDescription: localize('terminal.integrated.accessibleViewPreserveCursorPosition', "Preserve the cursor position on reopen of the terminal's accessible view rather than setting it to the bottom of the buffer."),
        type: 'boolean',
        default: false
    },
    ["terminal.integrated.accessibleViewFocusOnCommandExecution"]: {
        markdownDescription: localize('terminal.integrated.accessibleViewFocusOnCommandExecution', "Focus the terminal accessible view when a command is executed."),
        type: 'boolean',
        default: false
    },
};
