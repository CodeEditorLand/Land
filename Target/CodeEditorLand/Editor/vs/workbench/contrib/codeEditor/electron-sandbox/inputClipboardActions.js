import { KeybindingsRegistry } from '../../../../platform/keybinding/common/keybindingsRegistry.js';
import * as platform from '../../../../base/common/platform.js';
import { getActiveWindow } from '../../../../base/browser/dom.js';
if (platform.isMacintosh) {
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'execCut',
        primary: 2048 | 54,
        handler: bindExecuteCommand('cut'),
        weight: 0,
        when: undefined,
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'execCopy',
        primary: 2048 | 33,
        handler: bindExecuteCommand('copy'),
        weight: 0,
        when: undefined,
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'execPaste',
        primary: 2048 | 52,
        handler: bindExecuteCommand('paste'),
        weight: 0,
        when: undefined,
    });
    function bindExecuteCommand(command) {
        return () => {
            getActiveWindow().document.execCommand(command);
        };
    }
}
