import { KeybindingsRegistry } from '../../../../platform/keybinding/common/keybindingsRegistry.js';
import { ITerminalGroupService } from './terminal.js';
export function setupTerminalCommands() {
    registerOpenTerminalAtIndexCommands();
}
function registerOpenTerminalAtIndexCommands() {
    for (let i = 0; i < 9; i++) {
        const terminalIndex = i;
        const visibleIndex = i + 1;
        KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: `workbench.action.terminal.focusAtIndex${visibleIndex}`,
            weight: 200,
            when: undefined,
            primary: 0,
            handler: accessor => {
                accessor.get(ITerminalGroupService).setActiveInstanceByIndex(terminalIndex);
                return accessor.get(ITerminalGroupService).showPanel(true);
            }
        });
    }
}
