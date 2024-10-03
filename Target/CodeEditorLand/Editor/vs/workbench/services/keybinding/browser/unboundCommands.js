import { CommandsRegistry } from '../../../../platform/commands/common/commands.js';
import { isNonEmptyArray } from '../../../../base/common/arrays.js';
import { EditorExtensionsRegistry } from '../../../../editor/browser/editorExtensions.js';
import { MenuRegistry, MenuId, isIMenuItem } from '../../../../platform/actions/common/actions.js';
export function getAllUnboundCommands(boundCommands) {
    const unboundCommands = [];
    const seenMap = new Map();
    const addCommand = (id, includeCommandWithArgs) => {
        if (seenMap.has(id)) {
            return;
        }
        seenMap.set(id, true);
        if (id[0] === '_' || id.indexOf('vscode.') === 0) {
            return;
        }
        if (boundCommands.get(id) === true) {
            return;
        }
        if (!includeCommandWithArgs) {
            const command = CommandsRegistry.getCommand(id);
            if (command && typeof command.metadata === 'object'
                && isNonEmptyArray(command.metadata.args)) {
                return;
            }
        }
        unboundCommands.push(id);
    };
    for (const menuItem of MenuRegistry.getMenuItems(MenuId.CommandPalette)) {
        if (isIMenuItem(menuItem)) {
            addCommand(menuItem.command.id, true);
        }
    }
    for (const editorAction of EditorExtensionsRegistry.getEditorActions()) {
        addCommand(editorAction.id, true);
    }
    for (const id of CommandsRegistry.getCommands().keys()) {
        addCommand(id, false);
    }
    return unboundCommands;
}
