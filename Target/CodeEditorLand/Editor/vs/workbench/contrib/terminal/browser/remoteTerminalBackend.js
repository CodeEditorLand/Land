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
import { DeferredPromise } from '../../../../base/common/async.js';
import { Emitter } from '../../../../base/common/event.js';
import { revive } from '../../../../base/common/marshalling.js';
import { mark } from '../../../../base/common/performance.js';
import { StopWatch } from '../../../../base/common/stopwatch.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { IRemoteAuthorityResolverService } from '../../../../platform/remote/common/remoteAuthorityResolver.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITerminalLogService, TerminalExtensions } from '../../../../platform/terminal/common/terminal.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { BaseTerminalBackend } from './baseTerminalBackend.js';
import { RemotePty } from './remotePty.js';
import { ITerminalInstanceService } from './terminal.js';
import { RemoteTerminalChannelClient, REMOTE_TERMINAL_CHANNEL_NAME } from '../common/remote/remoteTerminalChannel.js';
import { TERMINAL_CONFIG_SECTION } from '../common/terminal.js';
import { IConfigurationResolverService } from '../../../services/configurationResolver/common/configurationResolver.js';
import { IHistoryService } from '../../../services/history/common/history.js';
import { IRemoteAgentService } from '../../../services/remote/common/remoteAgentService.js';
import { IStatusbarService } from '../../../services/statusbar/browser/statusbar.js';
let RemoteTerminalBackendContribution = class RemoteTerminalBackendContribution {
    static { this.ID = 'remoteTerminalBackend'; }
    constructor(instantiationService, remoteAgentService, terminalInstanceService) {
        const connection = remoteAgentService.getConnection();
        if (connection?.remoteAuthority) {
            const channel = instantiationService.createInstance(RemoteTerminalChannelClient, connection.remoteAuthority, connection.getChannel(REMOTE_TERMINAL_CHANNEL_NAME));
            const backend = instantiationService.createInstance(RemoteTerminalBackend, connection.remoteAuthority, channel);
            Registry.as(TerminalExtensions.Backend).registerTerminalBackend(backend);
            terminalInstanceService.didRegisterBackend(backend);
        }
    }
};
RemoteTerminalBackendContribution = __decorate([
    __param(0, IInstantiationService),
    __param(1, IRemoteAgentService),
    __param(2, ITerminalInstanceService),
    __metadata("design:paramtypes", [Object, Object, Object])
], RemoteTerminalBackendContribution);
export { RemoteTerminalBackendContribution };
let RemoteTerminalBackend = class RemoteTerminalBackend extends BaseTerminalBackend {
    get whenReady() { return this._whenConnected.p; }
    setReady() { this._whenConnected.complete(); }
    constructor(remoteAuthority, _remoteTerminalChannel, _remoteAgentService, _instantiationService, logService, _commandService, _storageService, _remoteAuthorityResolverService, workspaceContextService, configurationResolverService, _historyService, _configurationService, statusBarService) {
        super(_remoteTerminalChannel, logService, _historyService, configurationResolverService, statusBarService, workspaceContextService);
        this.remoteAuthority = remoteAuthority;
        this._remoteTerminalChannel = _remoteTerminalChannel;
        this._remoteAgentService = _remoteAgentService;
        this._instantiationService = _instantiationService;
        this._commandService = _commandService;
        this._storageService = _storageService;
        this._remoteAuthorityResolverService = _remoteAuthorityResolverService;
        this._historyService = _historyService;
        this._configurationService = _configurationService;
        this._ptys = new Map();
        this._whenConnected = new DeferredPromise();
        this._onDidRequestDetach = this._register(new Emitter());
        this.onDidRequestDetach = this._onDidRequestDetach.event;
        this._onRestoreCommands = this._register(new Emitter());
        this.onRestoreCommands = this._onRestoreCommands.event;
        this._remoteTerminalChannel.onProcessData(e => this._ptys.get(e.id)?.handleData(e.event));
        this._remoteTerminalChannel.onProcessReplay(e => {
            this._ptys.get(e.id)?.handleReplay(e.event);
            if (e.event.commands.commands.length > 0) {
                this._onRestoreCommands.fire({ id: e.id, commands: e.event.commands.commands });
            }
        });
        this._remoteTerminalChannel.onProcessOrphanQuestion(e => this._ptys.get(e.id)?.handleOrphanQuestion());
        this._remoteTerminalChannel.onDidRequestDetach(e => this._onDidRequestDetach.fire(e));
        this._remoteTerminalChannel.onProcessReady(e => this._ptys.get(e.id)?.handleReady(e.event));
        this._remoteTerminalChannel.onDidChangeProperty(e => this._ptys.get(e.id)?.handleDidChangeProperty(e.property));
        this._remoteTerminalChannel.onProcessExit(e => {
            const pty = this._ptys.get(e.id);
            if (pty) {
                pty.handleExit(e.event);
                this._ptys.delete(e.id);
            }
        });
        const allowedCommands = ['_remoteCLI.openExternal', '_remoteCLI.windowOpen', '_remoteCLI.getSystemStatus', '_remoteCLI.manageExtensions'];
        this._remoteTerminalChannel.onExecuteCommand(async (e) => {
            // Ensure this request for for this window
            const pty = this._ptys.get(e.persistentProcessId);
            if (!pty) {
                return;
            }
            const reqId = e.reqId;
            const commandId = e.commandId;
            if (!allowedCommands.includes(commandId)) {
                this._remoteTerminalChannel.sendCommandResult(reqId, true, 'Invalid remote cli command: ' + commandId);
                return;
            }
            const commandArgs = e.commandArgs.map(arg => revive(arg));
            try {
                const result = await this._commandService.executeCommand(e.commandId, ...commandArgs);
                this._remoteTerminalChannel.sendCommandResult(reqId, false, result);
            }
            catch (err) {
                this._remoteTerminalChannel.sendCommandResult(reqId, true, err);
            }
        });
        this._onPtyHostConnected.fire();
    }
    async requestDetachInstance(workspaceId, instanceId) {
        if (!this._remoteTerminalChannel) {
            throw new Error(`Cannot request detach instance when there is no remote!`);
        }
        return this._remoteTerminalChannel.requestDetachInstance(workspaceId, instanceId);
    }
    async acceptDetachInstanceReply(requestId, persistentProcessId) {
        if (!this._remoteTerminalChannel) {
            throw new Error(`Cannot accept detached instance when there is no remote!`);
        }
        else if (!persistentProcessId) {
            this._logService.warn('Cannot attach to feature terminals, custom pty terminals, or those without a persistentProcessId');
            return;
        }
        return this._remoteTerminalChannel.acceptDetachInstanceReply(requestId, persistentProcessId);
    }
    async persistTerminalState() {
        if (!this._remoteTerminalChannel) {
            throw new Error(`Cannot persist terminal state when there is no remote!`);
        }
        const ids = Array.from(this._ptys.keys());
        const serialized = await this._remoteTerminalChannel.serializeTerminalState(ids);
        this._storageService.store("terminal.integrated.bufferState" /* TerminalStorageKeys.TerminalBufferState */, serialized, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
    }
    async createProcess(shellLaunchConfig, cwd, // TODO: This is ignored
    cols, rows, unicodeVersion, env, // TODO: This is ignored
    options, shouldPersist) {
        if (!this._remoteTerminalChannel) {
            throw new Error(`Cannot create remote terminal when there is no remote!`);
        }
        // Fetch the environment to check shell permissions
        const remoteEnv = await this._remoteAgentService.getEnvironment();
        if (!remoteEnv) {
            // Extension host processes are only allowed in remote extension hosts currently
            throw new Error('Could not fetch remote environment');
        }
        const terminalConfig = this._configurationService.getValue(TERMINAL_CONFIG_SECTION);
        const configuration = {
            'terminal.integrated.env.windows': this._configurationService.getValue("terminal.integrated.env.windows" /* TerminalSettingId.EnvWindows */),
            'terminal.integrated.env.osx': this._configurationService.getValue("terminal.integrated.env.osx" /* TerminalSettingId.EnvMacOs */),
            'terminal.integrated.env.linux': this._configurationService.getValue("terminal.integrated.env.linux" /* TerminalSettingId.EnvLinux */),
            'terminal.integrated.cwd': this._configurationService.getValue("terminal.integrated.cwd" /* TerminalSettingId.Cwd */),
            'terminal.integrated.detectLocale': terminalConfig.detectLocale
        };
        const shellLaunchConfigDto = {
            name: shellLaunchConfig.name,
            executable: shellLaunchConfig.executable,
            args: shellLaunchConfig.args,
            cwd: shellLaunchConfig.cwd,
            env: shellLaunchConfig.env,
            useShellEnvironment: shellLaunchConfig.useShellEnvironment,
            reconnectionProperties: shellLaunchConfig.reconnectionProperties,
            type: shellLaunchConfig.type,
            isFeatureTerminal: shellLaunchConfig.isFeatureTerminal
        };
        const activeWorkspaceRootUri = this._historyService.getLastActiveWorkspaceRoot();
        const result = await this._remoteTerminalChannel.createProcess(shellLaunchConfigDto, configuration, activeWorkspaceRootUri, options, shouldPersist, cols, rows, unicodeVersion);
        const pty = this._instantiationService.createInstance(RemotePty, result.persistentTerminalId, shouldPersist, this._remoteTerminalChannel);
        this._ptys.set(result.persistentTerminalId, pty);
        return pty;
    }
    async attachToProcess(id) {
        if (!this._remoteTerminalChannel) {
            throw new Error(`Cannot create remote terminal when there is no remote!`);
        }
        try {
            await this._remoteTerminalChannel.attachToProcess(id);
            const pty = this._instantiationService.createInstance(RemotePty, id, true, this._remoteTerminalChannel);
            this._ptys.set(id, pty);
            return pty;
        }
        catch (e) {
            this._logService.trace(`Couldn't attach to process ${e.message}`);
        }
        return undefined;
    }
    async attachToRevivedProcess(id) {
        if (!this._remoteTerminalChannel) {
            throw new Error(`Cannot create remote terminal when there is no remote!`);
        }
        try {
            const newId = await this._remoteTerminalChannel.getRevivedPtyNewId(id) ?? id;
            return await this.attachToProcess(newId);
        }
        catch (e) {
            this._logService.trace(`Couldn't attach to process ${e.message}`);
        }
        return undefined;
    }
    async listProcesses() {
        return this._remoteTerminalChannel.listProcesses();
    }
    async getLatency() {
        const sw = new StopWatch();
        const results = await this._remoteTerminalChannel.getLatency();
        sw.stop();
        return [
            {
                label: 'window<->ptyhostservice<->ptyhost',
                latency: sw.elapsed()
            },
            ...results
        ];
    }
    async updateProperty(id, property, value) {
        await this._remoteTerminalChannel.updateProperty(id, property, value);
    }
    async updateTitle(id, title, titleSource) {
        await this._remoteTerminalChannel.updateTitle(id, title, titleSource);
    }
    async updateIcon(id, userInitiated, icon, color) {
        await this._remoteTerminalChannel.updateIcon(id, userInitiated, icon, color);
    }
    async getDefaultSystemShell(osOverride) {
        return this._remoteTerminalChannel.getDefaultSystemShell(osOverride) || '';
    }
    async getProfiles(profiles, defaultProfile, includeDetectedProfiles) {
        return this._remoteTerminalChannel.getProfiles(profiles, defaultProfile, includeDetectedProfiles) || [];
    }
    async getEnvironment() {
        return this._remoteTerminalChannel.getEnvironment() || {};
    }
    async getShellEnvironment() {
        const connection = this._remoteAgentService.getConnection();
        if (!connection) {
            return undefined;
        }
        const resolverResult = await this._remoteAuthorityResolverService.resolveAuthority(connection.remoteAuthority);
        return resolverResult.options?.extensionHostEnv;
    }
    async getWslPath(original, direction) {
        const env = await this._remoteAgentService.getEnvironment();
        if (env?.os !== 1 /* OperatingSystem.Windows */) {
            return original;
        }
        return this._remoteTerminalChannel.getWslPath(original, direction) || original;
    }
    async setTerminalLayoutInfo(layout) {
        if (!this._remoteTerminalChannel) {
            throw new Error(`Cannot call setActiveInstanceId when there is no remote`);
        }
        return this._remoteTerminalChannel.setTerminalLayoutInfo(layout);
    }
    async reduceConnectionGraceTime() {
        if (!this._remoteTerminalChannel) {
            throw new Error('Cannot reduce grace time when there is no remote');
        }
        return this._remoteTerminalChannel.reduceConnectionGraceTime();
    }
    async getTerminalLayoutInfo() {
        if (!this._remoteTerminalChannel) {
            throw new Error(`Cannot call getActiveInstanceId when there is no remote`);
        }
        const workspaceId = this._getWorkspaceId();
        // Revive processes if needed
        const serializedState = this._storageService.get("terminal.integrated.bufferState" /* TerminalStorageKeys.TerminalBufferState */, 1 /* StorageScope.WORKSPACE */);
        const reviveBufferState = this._deserializeTerminalState(serializedState);
        if (reviveBufferState && reviveBufferState.length > 0) {
            try {
                // Note that remote terminals do not get their environment re-resolved unlike in local terminals
                mark('code/terminal/willReviveTerminalProcessesRemote');
                await this._remoteTerminalChannel.reviveTerminalProcesses(workspaceId, reviveBufferState, Intl.DateTimeFormat().resolvedOptions().locale);
                mark('code/terminal/didReviveTerminalProcessesRemote');
                this._storageService.remove("terminal.integrated.bufferState" /* TerminalStorageKeys.TerminalBufferState */, 1 /* StorageScope.WORKSPACE */);
                // If reviving processes, send the terminal layout info back to the pty host as it
                // will not have been persisted on application exit
                const layoutInfo = this._storageService.get("terminal.integrated.layoutInfo" /* TerminalStorageKeys.TerminalLayoutInfo */, 1 /* StorageScope.WORKSPACE */);
                if (layoutInfo) {
                    mark('code/terminal/willSetTerminalLayoutInfoRemote');
                    await this._remoteTerminalChannel.setTerminalLayoutInfo(JSON.parse(layoutInfo));
                    mark('code/terminal/didSetTerminalLayoutInfoRemote');
                    this._storageService.remove("terminal.integrated.layoutInfo" /* TerminalStorageKeys.TerminalLayoutInfo */, 1 /* StorageScope.WORKSPACE */);
                }
            }
            catch (e) {
                this._logService.warn('RemoteTerminalBackend#getTerminalLayoutInfo Error', e && typeof e === 'object' && 'message' in e ? e.message : e);
            }
        }
        return this._remoteTerminalChannel.getTerminalLayoutInfo();
    }
    async getPerformanceMarks() {
        return this._remoteTerminalChannel.getPerformanceMarks();
    }
    installAutoReply(match, reply) {
        return this._remoteTerminalChannel.installAutoReply(match, reply);
    }
    uninstallAllAutoReplies() {
        return this._remoteTerminalChannel.uninstallAllAutoReplies();
    }
};
RemoteTerminalBackend = __decorate([
    __param(2, IRemoteAgentService),
    __param(3, IInstantiationService),
    __param(4, ITerminalLogService),
    __param(5, ICommandService),
    __param(6, IStorageService),
    __param(7, IRemoteAuthorityResolverService),
    __param(8, IWorkspaceContextService),
    __param(9, IConfigurationResolverService),
    __param(10, IHistoryService),
    __param(11, IConfigurationService),
    __param(12, IStatusbarService),
    __metadata("design:paramtypes", [Object, RemoteTerminalChannelClient, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], RemoteTerminalBackend);
