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
import { Emitter } from '../../../../base/common/event.js';
import { isMacintosh, isWindows } from '../../../../base/common/platform.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ILocalPtyService, ITerminalLogService, TerminalExtensions, TerminalIpcChannels } from '../../../../platform/terminal/common/terminal.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { ITerminalInstanceService } from '../browser/terminal.js';
import { ITerminalProfileResolverService } from '../common/terminal.js';
import { LocalPty } from './localPty.js';
import { IConfigurationResolverService } from '../../../services/configurationResolver/common/configurationResolver.js';
import { IShellEnvironmentService } from '../../../services/environment/electron-sandbox/shellEnvironmentService.js';
import { IHistoryService } from '../../../services/history/common/history.js';
import * as terminalEnvironment from '../common/terminalEnvironment.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IEnvironmentVariableService } from '../common/environmentVariable.js';
import { BaseTerminalBackend } from '../browser/baseTerminalBackend.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';
import { Client as MessagePortClient } from '../../../../base/parts/ipc/common/ipc.mp.js';
import { acquirePort } from '../../../../base/parts/ipc/electron-sandbox/ipc.mp.js';
import { getDelayedChannel, ProxyChannel } from '../../../../base/parts/ipc/common/ipc.js';
import { mark } from '../../../../base/common/performance.js';
import { ILifecycleService } from '../../../services/lifecycle/common/lifecycle.js';
import { DeferredPromise } from '../../../../base/common/async.js';
import { IStatusbarService } from '../../../services/statusbar/browser/statusbar.js';
import { memoize } from '../../../../base/common/decorators.js';
import { StopWatch } from '../../../../base/common/stopwatch.js';
import { IRemoteAgentService } from '../../../services/remote/common/remoteAgentService.js';
import { shouldUseEnvironmentVariableCollection } from '../../../../platform/terminal/common/terminalEnvironment.js';
let LocalTerminalBackendContribution = class LocalTerminalBackendContribution {
    static { this.ID = 'workbench.contrib.localTerminalBackend'; }
    constructor(instantiationService, terminalInstanceService) {
        const backend = instantiationService.createInstance(LocalTerminalBackend);
        Registry.as(TerminalExtensions.Backend).registerTerminalBackend(backend);
        terminalInstanceService.didRegisterBackend(backend);
    }
};
LocalTerminalBackendContribution = __decorate([
    __param(0, IInstantiationService),
    __param(1, ITerminalInstanceService),
    __metadata("design:paramtypes", [Object, Object])
], LocalTerminalBackendContribution);
export { LocalTerminalBackendContribution };
let LocalTerminalBackend = class LocalTerminalBackend extends BaseTerminalBackend {
    /**
     * Communicate to the direct proxy (renderer<->ptyhost) if it's available, otherwise use the
     * indirect proxy (renderer<->main<->ptyhost). The latter may not need to actually launch the
     * pty host, for example when detecting profiles.
     */
    get _proxy() { return this._directProxy || this._localPtyService; }
    get whenReady() { return this._whenReady.p; }
    setReady() { this._whenReady.complete(); }
    constructor(workspaceContextService, _lifecycleService, logService, _localPtyService, _labelService, _shellEnvironmentService, _storageService, _configurationResolverService, _configurationService, _productService, _historyService, _terminalProfileResolverService, _environmentVariableService, historyService, _nativeHostService, statusBarService, _remoteAgentService) {
        super(_localPtyService, logService, historyService, _configurationResolverService, statusBarService, workspaceContextService);
        this._lifecycleService = _lifecycleService;
        this._localPtyService = _localPtyService;
        this._labelService = _labelService;
        this._shellEnvironmentService = _shellEnvironmentService;
        this._storageService = _storageService;
        this._configurationResolverService = _configurationResolverService;
        this._configurationService = _configurationService;
        this._productService = _productService;
        this._historyService = _historyService;
        this._terminalProfileResolverService = _terminalProfileResolverService;
        this._environmentVariableService = _environmentVariableService;
        this._nativeHostService = _nativeHostService;
        this._remoteAgentService = _remoteAgentService;
        this.remoteAuthority = undefined;
        this._ptys = new Map();
        this._whenReady = new DeferredPromise();
        this._onDidRequestDetach = this._register(new Emitter());
        this.onDidRequestDetach = this._onDidRequestDetach.event;
        this._register(this.onPtyHostRestart(() => {
            this._directProxy = undefined;
            this._directProxyClientEventually = undefined;
            this._connectToDirectProxy();
        }));
    }
    /**
     * Request a direct connection to the pty host, this will launch the pty host process if necessary.
     */
    async _connectToDirectProxy() {
        // Check if connecting is in progress
        if (this._directProxyClientEventually) {
            await this._directProxyClientEventually.p;
            return;
        }
        this._logService.debug('Starting pty host');
        const directProxyClientEventually = new DeferredPromise();
        this._directProxyClientEventually = directProxyClientEventually;
        const directProxy = ProxyChannel.toService(getDelayedChannel(this._directProxyClientEventually.p.then(client => client.getChannel(TerminalIpcChannels.PtyHostWindow))));
        this._directProxy = directProxy;
        // The pty host should not get launched until at least the window restored phase
        // if remote auth exists, don't await
        if (!this._remoteAgentService.getConnection()?.remoteAuthority) {
            await this._lifecycleService.when(3 /* LifecyclePhase.Restored */);
        }
        mark('code/terminal/willConnectPtyHost');
        this._logService.trace('Renderer->PtyHost#connect: before acquirePort');
        acquirePort('vscode:createPtyHostMessageChannel', 'vscode:createPtyHostMessageChannelResult').then(port => {
            mark('code/terminal/didConnectPtyHost');
            this._logService.trace('Renderer->PtyHost#connect: connection established');
            // There are two connections to the pty host; one to the regular shared process
            // _localPtyService, and one directly via message port _ptyHostDirectProxy. The former is
            // used for pty host management messages, it would make sense in the future to use a
            // separate interface/service for this one.
            const client = new MessagePortClient(port, `window:${this._nativeHostService.windowId}`);
            directProxyClientEventually.complete(client);
            this._onPtyHostConnected.fire();
            // Attach process listeners
            directProxy.onProcessData(e => this._ptys.get(e.id)?.handleData(e.event));
            directProxy.onDidChangeProperty(e => this._ptys.get(e.id)?.handleDidChangeProperty(e.property));
            directProxy.onProcessExit(e => {
                const pty = this._ptys.get(e.id);
                if (pty) {
                    pty.handleExit(e.event);
                    this._ptys.delete(e.id);
                }
            });
            directProxy.onProcessReady(e => this._ptys.get(e.id)?.handleReady(e.event));
            directProxy.onProcessReplay(e => this._ptys.get(e.id)?.handleReplay(e.event));
            directProxy.onProcessOrphanQuestion(e => this._ptys.get(e.id)?.handleOrphanQuestion());
            directProxy.onDidRequestDetach(e => this._onDidRequestDetach.fire(e));
            // Eagerly fetch the backend's environment for memoization
            this.getEnvironment();
        });
    }
    async requestDetachInstance(workspaceId, instanceId) {
        return this._proxy.requestDetachInstance(workspaceId, instanceId);
    }
    async acceptDetachInstanceReply(requestId, persistentProcessId) {
        if (!persistentProcessId) {
            this._logService.warn('Cannot attach to feature terminals, custom pty terminals, or those without a persistentProcessId');
            return;
        }
        return this._proxy.acceptDetachInstanceReply(requestId, persistentProcessId);
    }
    async persistTerminalState() {
        const ids = Array.from(this._ptys.keys());
        const serialized = await this._proxy.serializeTerminalState(ids);
        this._storageService.store("terminal.integrated.bufferState" /* TerminalStorageKeys.TerminalBufferState */, serialized, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
    }
    async updateTitle(id, title, titleSource) {
        await this._proxy.updateTitle(id, title, titleSource);
    }
    async updateIcon(id, userInitiated, icon, color) {
        await this._proxy.updateIcon(id, userInitiated, icon, color);
    }
    async updateProperty(id, property, value) {
        return this._proxy.updateProperty(id, property, value);
    }
    async createProcess(shellLaunchConfig, cwd, cols, rows, unicodeVersion, env, options, shouldPersist) {
        await this._connectToDirectProxy();
        const executableEnv = await this._shellEnvironmentService.getShellEnv();
        const id = await this._proxy.createProcess(shellLaunchConfig, cwd, cols, rows, unicodeVersion, env, executableEnv, options, shouldPersist, this._getWorkspaceId(), this._getWorkspaceName());
        const pty = new LocalPty(id, shouldPersist, this._proxy);
        this._ptys.set(id, pty);
        return pty;
    }
    async attachToProcess(id) {
        await this._connectToDirectProxy();
        try {
            await this._proxy.attachToProcess(id);
            const pty = new LocalPty(id, true, this._proxy);
            this._ptys.set(id, pty);
            return pty;
        }
        catch (e) {
            this._logService.warn(`Couldn't attach to process ${e.message}`);
        }
        return undefined;
    }
    async attachToRevivedProcess(id) {
        await this._connectToDirectProxy();
        try {
            const newId = await this._proxy.getRevivedPtyNewId(this._getWorkspaceId(), id) ?? id;
            return await this.attachToProcess(newId);
        }
        catch (e) {
            this._logService.warn(`Couldn't attach to process ${e.message}`);
        }
        return undefined;
    }
    async listProcesses() {
        await this._connectToDirectProxy();
        return this._proxy.listProcesses();
    }
    async getLatency() {
        const measurements = [];
        const sw = new StopWatch();
        if (this._directProxy) {
            await this._directProxy.getLatency();
            sw.stop();
            measurements.push({
                label: 'window<->ptyhost (message port)',
                latency: sw.elapsed()
            });
            sw.reset();
        }
        const results = await this._localPtyService.getLatency();
        sw.stop();
        measurements.push({
            label: 'window<->ptyhostservice<->ptyhost',
            latency: sw.elapsed()
        });
        return [
            ...measurements,
            ...results
        ];
    }
    async getPerformanceMarks() {
        return this._proxy.getPerformanceMarks();
    }
    async reduceConnectionGraceTime() {
        this._proxy.reduceConnectionGraceTime();
    }
    async getDefaultSystemShell(osOverride) {
        return this._proxy.getDefaultSystemShell(osOverride);
    }
    async getProfiles(profiles, defaultProfile, includeDetectedProfiles) {
        return this._localPtyService.getProfiles(this._workspaceContextService.getWorkspace().id, profiles, defaultProfile, includeDetectedProfiles) || [];
    }
    async getEnvironment() {
        return this._proxy.getEnvironment();
    }
    async getShellEnvironment() {
        return this._shellEnvironmentService.getShellEnv();
    }
    async getWslPath(original, direction) {
        return this._proxy.getWslPath(original, direction);
    }
    async setTerminalLayoutInfo(layoutInfo) {
        const args = {
            workspaceId: this._getWorkspaceId(),
            tabs: layoutInfo ? layoutInfo.tabs : []
        };
        await this._proxy.setTerminalLayoutInfo(args);
        // Store in the storage service as well to be used when reviving processes as normally this
        // is stored in memory on the pty host
        this._storageService.store("terminal.integrated.layoutInfo" /* TerminalStorageKeys.TerminalLayoutInfo */, JSON.stringify(args), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
    }
    async getTerminalLayoutInfo() {
        const workspaceId = this._getWorkspaceId();
        const layoutArgs = { workspaceId };
        // Revive processes if needed
        const serializedState = this._storageService.get("terminal.integrated.bufferState" /* TerminalStorageKeys.TerminalBufferState */, 1 /* StorageScope.WORKSPACE */);
        const reviveBufferState = this._deserializeTerminalState(serializedState);
        if (reviveBufferState && reviveBufferState.length > 0) {
            try {
                // Create variable resolver
                const activeWorkspaceRootUri = this._historyService.getLastActiveWorkspaceRoot();
                const lastActiveWorkspace = activeWorkspaceRootUri ? this._workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri) ?? undefined : undefined;
                const variableResolver = terminalEnvironment.createVariableResolver(lastActiveWorkspace, await this._terminalProfileResolverService.getEnvironment(this.remoteAuthority), this._configurationResolverService);
                // Re-resolve the environments and replace it on the state so local terminals use a fresh
                // environment
                mark('code/terminal/willGetReviveEnvironments');
                await Promise.all(reviveBufferState.map(state => new Promise(r => {
                    this._resolveEnvironmentForRevive(variableResolver, state.shellLaunchConfig).then(freshEnv => {
                        state.processLaunchConfig.env = freshEnv;
                        r();
                    });
                })));
                mark('code/terminal/didGetReviveEnvironments');
                mark('code/terminal/willReviveTerminalProcesses');
                await this._proxy.reviveTerminalProcesses(workspaceId, reviveBufferState, Intl.DateTimeFormat().resolvedOptions().locale);
                mark('code/terminal/didReviveTerminalProcesses');
                this._storageService.remove("terminal.integrated.bufferState" /* TerminalStorageKeys.TerminalBufferState */, 1 /* StorageScope.WORKSPACE */);
                // If reviving processes, send the terminal layout info back to the pty host as it
                // will not have been persisted on application exit
                const layoutInfo = this._storageService.get("terminal.integrated.layoutInfo" /* TerminalStorageKeys.TerminalLayoutInfo */, 1 /* StorageScope.WORKSPACE */);
                if (layoutInfo) {
                    mark('code/terminal/willSetTerminalLayoutInfo');
                    await this._proxy.setTerminalLayoutInfo(JSON.parse(layoutInfo));
                    mark('code/terminal/didSetTerminalLayoutInfo');
                    this._storageService.remove("terminal.integrated.layoutInfo" /* TerminalStorageKeys.TerminalLayoutInfo */, 1 /* StorageScope.WORKSPACE */);
                }
            }
            catch (e) {
                this._logService.warn('LocalTerminalBackend#getTerminalLayoutInfo Error', e && typeof e === 'object' && 'message' in e ? e.message : e);
            }
        }
        return this._proxy.getTerminalLayoutInfo(layoutArgs);
    }
    async _resolveEnvironmentForRevive(variableResolver, shellLaunchConfig) {
        const platformKey = isWindows ? 'windows' : (isMacintosh ? 'osx' : 'linux');
        const envFromConfigValue = this._configurationService.getValue(`terminal.integrated.env.${platformKey}`);
        const baseEnv = await (shellLaunchConfig.useShellEnvironment ? this.getShellEnvironment() : this.getEnvironment());
        const env = await terminalEnvironment.createTerminalEnvironment(shellLaunchConfig, envFromConfigValue, variableResolver, this._productService.version, this._configurationService.getValue("terminal.integrated.detectLocale" /* TerminalSettingId.DetectLocale */), baseEnv);
        if (shouldUseEnvironmentVariableCollection(shellLaunchConfig)) {
            const workspaceFolder = terminalEnvironment.getWorkspaceForTerminal(shellLaunchConfig.cwd, this._workspaceContextService, this._historyService);
            await this._environmentVariableService.mergedCollection.applyToProcessEnvironment(env, { workspaceFolder }, variableResolver);
        }
        return env;
    }
    _getWorkspaceName() {
        return this._labelService.getWorkspaceLabel(this._workspaceContextService.getWorkspace());
    }
    // #region Pty service contribution RPC calls
    installAutoReply(match, reply) {
        return this._proxy.installAutoReply(match, reply);
    }
    uninstallAllAutoReplies() {
        return this._proxy.uninstallAllAutoReplies();
    }
};
__decorate([
    memoize,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LocalTerminalBackend.prototype, "getEnvironment", null);
__decorate([
    memoize,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LocalTerminalBackend.prototype, "getShellEnvironment", null);
LocalTerminalBackend = __decorate([
    __param(0, IWorkspaceContextService),
    __param(1, ILifecycleService),
    __param(2, ITerminalLogService),
    __param(3, ILocalPtyService),
    __param(4, ILabelService),
    __param(5, IShellEnvironmentService),
    __param(6, IStorageService),
    __param(7, IConfigurationResolverService),
    __param(8, IConfigurationService),
    __param(9, IProductService),
    __param(10, IHistoryService),
    __param(11, ITerminalProfileResolverService),
    __param(12, IEnvironmentVariableService),
    __param(13, IHistoryService),
    __param(14, INativeHostService),
    __param(15, IStatusbarService),
    __param(16, IRemoteAgentService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], LocalTerminalBackend);
