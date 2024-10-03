import { KeybindingsRegistry } from '../../../../platform/keybinding/common/keybindingsRegistry.js';
import { TerminalContextKeys } from '../common/terminalContextKey.js';
import { terminalSendSequenceCommand } from './terminalActions.js';
export function registerSendSequenceKeybinding(text, rule) {
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: "workbench.action.terminal.sendSequence",
        weight: 200,
        when: rule.when || TerminalContextKeys.focus,
        primary: rule.primary,
        mac: rule.mac,
        linux: rule.linux,
        win: rule.win,
        handler: terminalSendSequenceCommand,
        args: { text }
    });
}
