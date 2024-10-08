/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { KeybindingsRegistry } from '../../../../platform/keybinding/common/keybindingsRegistry.js';
import { ITerminalProfileResolverService } from '../common/terminal.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { BrowserTerminalProfileResolverService } from './terminalProfileResolverService.js';
import { TerminalContextKeys } from '../common/terminalContextKey.js';
registerSingleton(ITerminalProfileResolverService, BrowserTerminalProfileResolverService, 1 /* InstantiationType.Delayed */);
// Register standard external terminal keybinding as integrated terminal when in web as the
// external terminal is not available
KeybindingsRegistry.registerKeybindingRule({
    id: "workbench.action.terminal.new" /* TerminalCommandId.New */,
    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
    when: TerminalContextKeys.notFocus,
    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 33 /* KeyCode.KeyC */
});
