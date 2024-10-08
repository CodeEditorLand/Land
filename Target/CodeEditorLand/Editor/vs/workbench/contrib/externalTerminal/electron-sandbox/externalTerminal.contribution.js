/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import * as nls from '../../../../nls.js';
import * as paths from '../../../../base/common/path.js';
import { DEFAULT_TERMINAL_OSX } from '../../../../platform/externalTerminal/common/externalTerminal.js';
import { MenuId, MenuRegistry } from '../../../../platform/actions/common/actions.js';
import { IHistoryService } from '../../../services/history/common/history.js';
import { KeybindingsRegistry } from '../../../../platform/keybinding/common/keybindingsRegistry.js';
import { Schemas } from '../../../../base/common/network.js';
import { Extensions } from '../../../../platform/configuration/common/configurationRegistry.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { Extensions as WorkbenchExtensions } from '../../../common/contributions.js';
import { IExternalTerminalService } from '../../../../platform/externalTerminal/electron-sandbox/externalTerminalService.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { TerminalContextKeys } from '../../terminal/common/terminalContextKey.js';
import { IRemoteAuthorityResolverService } from '../../../../platform/remote/common/remoteAuthorityResolver.js';
const OPEN_NATIVE_CONSOLE_COMMAND_ID = 'workbench.action.terminal.openNativeConsole';
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: OPEN_NATIVE_CONSOLE_COMMAND_ID,
    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 33 /* KeyCode.KeyC */,
    when: TerminalContextKeys.notFocus,
    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
    handler: async (accessor) => {
        const historyService = accessor.get(IHistoryService);
        // Open external terminal in local workspaces
        const terminalService = accessor.get(IExternalTerminalService);
        const configurationService = accessor.get(IConfigurationService);
        const remoteAuthorityResolverService = accessor.get(IRemoteAuthorityResolverService);
        const root = historyService.getLastActiveWorkspaceRoot();
        const config = configurationService.getValue('terminal.external');
        // It's a local workspace, open the root
        if (root?.scheme === Schemas.file) {
            terminalService.openTerminal(config, root.fsPath);
            return;
        }
        // If it's a remote workspace, open the canonical URI if it is a local folder
        try {
            if (root?.scheme === Schemas.vscodeRemote) {
                const canonicalUri = await remoteAuthorityResolverService.getCanonicalURI(root);
                if (canonicalUri.scheme === Schemas.file) {
                    terminalService.openTerminal(config, canonicalUri.fsPath);
                    return;
                }
            }
        }
        catch { }
        // Open the current file's folder if it's local or its canonical URI is local
        // Opens current file's folder, if no folder is open in editor
        const activeFile = historyService.getLastActiveFile(Schemas.file);
        if (activeFile?.scheme === Schemas.file) {
            terminalService.openTerminal(config, paths.dirname(activeFile.fsPath));
            return;
        }
        try {
            if (activeFile?.scheme === Schemas.vscodeRemote) {
                const canonicalUri = await remoteAuthorityResolverService.getCanonicalURI(activeFile);
                if (canonicalUri.scheme === Schemas.file) {
                    terminalService.openTerminal(config, canonicalUri.fsPath);
                    return;
                }
            }
        }
        catch { }
        // Fallback to opening without a cwd which will end up using the local home path
        terminalService.openTerminal(config, undefined);
    }
});
MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
    command: {
        id: OPEN_NATIVE_CONSOLE_COMMAND_ID,
        title: nls.localize2('globalConsoleAction', "Open New External Terminal")
    }
});
let ExternalTerminalContribution = class ExternalTerminalContribution {
    constructor(_externalTerminalService) {
        this._externalTerminalService = _externalTerminalService;
        this._updateConfiguration();
    }
    async _updateConfiguration() {
        const terminals = await this._externalTerminalService.getDefaultTerminalForPlatforms();
        const configurationRegistry = Registry.as(Extensions.Configuration);
        configurationRegistry.registerConfiguration({
            id: 'externalTerminal',
            order: 100,
            title: nls.localize('terminalConfigurationTitle', "External Terminal"),
            type: 'object',
            properties: {
                'terminal.explorerKind': {
                    type: 'string',
                    enum: [
                        'integrated',
                        'external',
                        'both'
                    ],
                    enumDescriptions: [
                        nls.localize('terminal.explorerKind.integrated', "Use VS Code's integrated terminal."),
                        nls.localize('terminal.explorerKind.external', "Use the configured external terminal."),
                        nls.localize('terminal.explorerKind.both', "Use the other two together.")
                    ],
                    description: nls.localize('explorer.openInTerminalKind', "When opening a file from the Explorer in a terminal, determines what kind of terminal will be launched"),
                    default: 'integrated'
                },
                'terminal.sourceControlRepositoriesKind': {
                    type: 'string',
                    enum: [
                        'integrated',
                        'external',
                        'both'
                    ],
                    enumDescriptions: [
                        nls.localize('terminal.sourceControlRepositoriesKind.integrated', "Use VS Code's integrated terminal."),
                        nls.localize('terminal.sourceControlRepositoriesKind.external', "Use the configured external terminal."),
                        nls.localize('terminal.sourceControlRepositoriesKind.both', "Use the other two together.")
                    ],
                    description: nls.localize('sourceControlRepositories.openInTerminalKind', "When opening a repository from the Source Control Repositories view in a terminal, determines what kind of terminal will be launched"),
                    default: 'integrated'
                },
                'terminal.external.windowsExec': {
                    type: 'string',
                    description: nls.localize('terminal.external.windowsExec', "Customizes which terminal to run on Windows."),
                    default: terminals.windows,
                    scope: 1 /* ConfigurationScope.APPLICATION */
                },
                'terminal.external.osxExec': {
                    type: 'string',
                    description: nls.localize('terminal.external.osxExec', "Customizes which terminal application to run on macOS."),
                    default: DEFAULT_TERMINAL_OSX,
                    scope: 1 /* ConfigurationScope.APPLICATION */
                },
                'terminal.external.linuxExec': {
                    type: 'string',
                    description: nls.localize('terminal.external.linuxExec', "Customizes which terminal to run on Linux."),
                    default: terminals.linux,
                    scope: 1 /* ConfigurationScope.APPLICATION */
                }
            }
        });
    }
};
ExternalTerminalContribution = __decorate([
    __param(0, IExternalTerminalService),
    __metadata("design:paramtypes", [Object])
], ExternalTerminalContribution);
export { ExternalTerminalContribution };
// Register workbench contributions
const workbenchRegistry = Registry.as(WorkbenchExtensions.Workbench);
workbenchRegistry.registerWorkbenchContribution(ExternalTerminalContribution, 3 /* LifecyclePhase.Restored */);
