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
import { Registry } from '../../../../platform/registry/common/platform.js';
import { IRemoteAgentService, remoteConnectionLatencyMeasurer } from '../../../services/remote/common/remoteAgentService.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { isMacintosh, isWindows } from '../../../../base/common/platform.js';
import { KeyChord } from '../../../../base/common/keyCodes.js';
import { KeybindingsRegistry } from '../../../../platform/keybinding/common/keybindingsRegistry.js';
import { Extensions as WorkbenchContributionsExtensions, registerWorkbenchContribution2 } from '../../../common/contributions.js';
import { ILifecycleService } from '../../../services/lifecycle/common/lifecycle.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { Schemas } from '../../../../base/common/network.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { ipcRenderer } from '../../../../base/parts/sandbox/electron-sandbox/globals.js';
import { INativeWorkbenchEnvironmentService } from '../../../services/environment/electron-sandbox/environmentService.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { Extensions as ConfigurationExtensions } from '../../../../platform/configuration/common/configurationRegistry.js';
import { IRemoteAuthorityResolverService } from '../../../../platform/remote/common/remoteAuthorityResolver.js';
import { OpenLocalFileFolderCommand, OpenLocalFileCommand, OpenLocalFolderCommand, SaveLocalFileCommand, RemoteFileDialogContext } from '../../../services/dialogs/browser/simpleFileDialog.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { TELEMETRY_SETTING_ID } from '../../../../platform/telemetry/common/telemetry.js';
import { getTelemetryLevel } from '../../../../platform/telemetry/common/telemetryUtils.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
let RemoteAgentDiagnosticListener = class RemoteAgentDiagnosticListener {
    constructor(remoteAgentService, labelService) {
        ipcRenderer.on('vscode:getDiagnosticInfo', (event, request) => {
            const connection = remoteAgentService.getConnection();
            if (connection) {
                const hostName = labelService.getHostLabel(Schemas.vscodeRemote, connection.remoteAuthority);
                remoteAgentService.getDiagnosticInfo(request.args)
                    .then(info => {
                    if (info) {
                        info.hostName = hostName;
                        if (remoteConnectionLatencyMeasurer.latency?.high) {
                            info.latency = {
                                average: remoteConnectionLatencyMeasurer.latency.average,
                                current: remoteConnectionLatencyMeasurer.latency.current
                            };
                        }
                    }
                    ipcRenderer.send(request.replyChannel, info);
                })
                    .catch(e => {
                    const errorMessage = e && e.message ? `Connection to '${hostName}' could not be established  ${e.message}` : `Connection to '${hostName}' could not be established `;
                    ipcRenderer.send(request.replyChannel, { hostName, errorMessage });
                });
            }
            else {
                ipcRenderer.send(request.replyChannel);
            }
        });
    }
};
RemoteAgentDiagnosticListener = __decorate([
    __param(0, IRemoteAgentService),
    __param(1, ILabelService),
    __metadata("design:paramtypes", [Object, Object])
], RemoteAgentDiagnosticListener);
let RemoteExtensionHostEnvironmentUpdater = class RemoteExtensionHostEnvironmentUpdater {
    constructor(remoteAgentService, remoteResolverService, extensionService) {
        const connection = remoteAgentService.getConnection();
        if (connection) {
            connection.onDidStateChange(async (e) => {
                if (e.type === 4 /* PersistentConnectionEventType.ConnectionGain */) {
                    const resolveResult = await remoteResolverService.resolveAuthority(connection.remoteAuthority);
                    if (resolveResult.options && resolveResult.options.extensionHostEnv) {
                        await extensionService.setRemoteEnvironment(resolveResult.options.extensionHostEnv);
                    }
                }
            });
        }
    }
};
RemoteExtensionHostEnvironmentUpdater = __decorate([
    __param(0, IRemoteAgentService),
    __param(1, IRemoteAuthorityResolverService),
    __param(2, IExtensionService),
    __metadata("design:paramtypes", [Object, Object, Object])
], RemoteExtensionHostEnvironmentUpdater);
let RemoteTelemetryEnablementUpdater = class RemoteTelemetryEnablementUpdater extends Disposable {
    static { this.ID = 'workbench.contrib.remoteTelemetryEnablementUpdater'; }
    constructor(remoteAgentService, configurationService) {
        super();
        this.remoteAgentService = remoteAgentService;
        this.configurationService = configurationService;
        this.updateRemoteTelemetryEnablement();
        this._register(configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(TELEMETRY_SETTING_ID)) {
                this.updateRemoteTelemetryEnablement();
            }
        }));
    }
    updateRemoteTelemetryEnablement() {
        return this.remoteAgentService.updateTelemetryLevel(getTelemetryLevel(this.configurationService));
    }
};
RemoteTelemetryEnablementUpdater = __decorate([
    __param(0, IRemoteAgentService),
    __param(1, IConfigurationService),
    __metadata("design:paramtypes", [Object, Object])
], RemoteTelemetryEnablementUpdater);
let RemoteEmptyWorkbenchPresentation = class RemoteEmptyWorkbenchPresentation extends Disposable {
    static { this.ID = 'workbench.contrib.remoteEmptyWorkbenchPresentation'; }
    constructor(environmentService, remoteAuthorityResolverService, configurationService, commandService, contextService) {
        super();
        function shouldShowExplorer() {
            const startupEditor = configurationService.getValue('workbench.startupEditor');
            return startupEditor !== 'welcomePage' && startupEditor !== 'welcomePageInEmptyWorkbench';
        }
        function shouldShowTerminal() {
            return shouldShowExplorer();
        }
        const { remoteAuthority, filesToDiff, filesToMerge, filesToOpenOrCreate, filesToWait } = environmentService;
        if (remoteAuthority && contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */ && !filesToDiff?.length && !filesToMerge?.length && !filesToOpenOrCreate?.length && !filesToWait) {
            remoteAuthorityResolverService.resolveAuthority(remoteAuthority).then(() => {
                if (shouldShowExplorer()) {
                    commandService.executeCommand('workbench.view.explorer');
                }
                if (shouldShowTerminal()) {
                    commandService.executeCommand('workbench.action.terminal.toggleTerminal');
                }
            });
        }
    }
};
RemoteEmptyWorkbenchPresentation = __decorate([
    __param(0, INativeWorkbenchEnvironmentService),
    __param(1, IRemoteAuthorityResolverService),
    __param(2, IConfigurationService),
    __param(3, ICommandService),
    __param(4, IWorkspaceContextService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], RemoteEmptyWorkbenchPresentation);
/**
 * Sets the 'wslFeatureInstalled' context key if the WSL feature is or was installed on this machine.
 */
let WSLContextKeyInitializer = class WSLContextKeyInitializer extends Disposable {
    static { this.ID = 'workbench.contrib.wslContextKeyInitializer'; }
    constructor(contextKeyService, nativeHostService, storageService, lifecycleService) {
        super();
        const contextKeyId = 'wslFeatureInstalled';
        const storageKey = 'remote.wslFeatureInstalled';
        const defaultValue = storageService.getBoolean(storageKey, -1 /* StorageScope.APPLICATION */, undefined);
        const hasWSLFeatureContext = new RawContextKey(contextKeyId, !!defaultValue, nls.localize('wslFeatureInstalled', "Whether the platform has the WSL feature installed"));
        const contextKey = hasWSLFeatureContext.bindTo(contextKeyService);
        if (defaultValue === undefined) {
            lifecycleService.when(4 /* LifecyclePhase.Eventually */).then(async () => {
                nativeHostService.hasWSLFeatureInstalled().then(res => {
                    if (res) {
                        contextKey.set(true);
                        // once detected, set to true
                        storageService.store(storageKey, true, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                    }
                });
            });
        }
    }
};
WSLContextKeyInitializer = __decorate([
    __param(0, IContextKeyService),
    __param(1, INativeHostService),
    __param(2, IStorageService),
    __param(3, ILifecycleService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], WSLContextKeyInitializer);
const workbenchContributionsRegistry = Registry.as(WorkbenchContributionsExtensions.Workbench);
workbenchContributionsRegistry.registerWorkbenchContribution(RemoteAgentDiagnosticListener, 4 /* LifecyclePhase.Eventually */);
workbenchContributionsRegistry.registerWorkbenchContribution(RemoteExtensionHostEnvironmentUpdater, 4 /* LifecyclePhase.Eventually */);
registerWorkbenchContribution2(RemoteTelemetryEnablementUpdater.ID, RemoteTelemetryEnablementUpdater, 2 /* WorkbenchPhase.BlockRestore */);
registerWorkbenchContribution2(RemoteEmptyWorkbenchPresentation.ID, RemoteEmptyWorkbenchPresentation, 2 /* WorkbenchPhase.BlockRestore */);
if (isWindows) {
    registerWorkbenchContribution2(WSLContextKeyInitializer.ID, WSLContextKeyInitializer, 2 /* WorkbenchPhase.BlockRestore */);
}
Registry.as(ConfigurationExtensions.Configuration)
    .registerConfiguration({
    id: 'remote',
    title: nls.localize('remote', "Remote"),
    type: 'object',
    properties: {
        'remote.downloadExtensionsLocally': {
            type: 'boolean',
            markdownDescription: nls.localize('remote.downloadExtensionsLocally', "When enabled extensions are downloaded locally and installed on remote."),
            default: false
        },
    }
});
if (isMacintosh) {
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: OpenLocalFileFolderCommand.ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 2048 /* KeyMod.CtrlCmd */ | 45 /* KeyCode.KeyO */,
        when: RemoteFileDialogContext,
        metadata: { description: OpenLocalFileFolderCommand.LABEL, args: [] },
        handler: OpenLocalFileFolderCommand.handler()
    });
}
else {
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: OpenLocalFileCommand.ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 2048 /* KeyMod.CtrlCmd */ | 45 /* KeyCode.KeyO */,
        when: RemoteFileDialogContext,
        metadata: { description: OpenLocalFileCommand.LABEL, args: [] },
        handler: OpenLocalFileCommand.handler()
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: OpenLocalFolderCommand.ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: KeyChord(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 45 /* KeyCode.KeyO */),
        when: RemoteFileDialogContext,
        metadata: { description: OpenLocalFolderCommand.LABEL, args: [] },
        handler: OpenLocalFolderCommand.handler()
    });
}
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: SaveLocalFileCommand.ID,
    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 49 /* KeyCode.KeyS */,
    when: RemoteFileDialogContext,
    metadata: { description: SaveLocalFileCommand.LABEL, args: [] },
    handler: SaveLocalFileCommand.handler()
});
