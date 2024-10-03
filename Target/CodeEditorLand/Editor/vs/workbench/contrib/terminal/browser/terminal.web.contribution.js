import { KeybindingsRegistry } from '../../../../platform/keybinding/common/keybindingsRegistry.js';
import { ITerminalProfileResolverService } from '../common/terminal.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { BrowserTerminalProfileResolverService } from './terminalProfileResolverService.js';
import { TerminalContextKeys } from '../common/terminalContextKey.js';
registerSingleton(ITerminalProfileResolverService, BrowserTerminalProfileResolverService, 1);
KeybindingsRegistry.registerKeybindingRule({
    id: "workbench.action.terminal.new",
    weight: 200,
    when: TerminalContextKeys.notFocus,
    primary: 2048 | 1024 | 33
});
