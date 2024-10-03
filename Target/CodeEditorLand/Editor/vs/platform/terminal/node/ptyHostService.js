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
import { Emitter, Event } from '../../../base/common/event.js';
import { Disposable, toDisposable } from '../../../base/common/lifecycle.js';
import { OS, isWindows } from '../../../base/common/platform.js';
import { ProxyChannel } from '../../../base/parts/ipc/common/ipc.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { ILogService, ILoggerService, LogLevel } from '../../log/common/log.js';
import { RemoteLoggerChannelClient } from '../../log/common/logIpc.js';
import { getResolvedShellEnv } from '../../shell/node/shellEnv.js';
import { RequestStore } from '../common/requestStore.js';
import { HeartbeatConstants, TerminalIpcChannels } from '../common/terminal.js';
import { registerTerminalPlatformConfiguration } from '../common/terminalPlatformConfiguration.js';
import { detectAvailableProfiles } from './terminalProfiles.js';
import { getSystemShell } from '../../../base/node/shell.js';
import { StopWatch } from '../../../base/common/stopwatch.js';
var Constants;
(function (Constants) {
    Constants[Constants["MaxRestarts"] = 5] = "MaxRestarts";
})(Constants || (Constants = {}));
let PtyHostService = class PtyHostService extends Disposable {
    get _connection() {
        this._ensurePtyHost();
        return this.__connection;
    }
    get _proxy() {
        this._ensurePtyHost();
        return this.__proxy;
    }
    get _optionalProxy() {
        return this.__proxy;
    }
    _ensurePtyHost() {
        if (!this.__connection) {
            this._startPtyHost();
        }
    }
    constructor(_ptyHostStarter, _configurationService, _logService, _loggerService) {
        super();
        this._ptyHostStarter = _ptyHostStarter;
        this._configurationService = _configurationService;
        this._logService = _logService;
        this._loggerService = _loggerService;
        this._wasQuitRequested = false;
        this._restartCount = 0;
        this._isResponsive = true;
        this._onPtyHostExit = this._register(new Emitter());
        this.onPtyHostExit = this._onPtyHostExit.event;
        this._onPtyHostStart = this._register(new Emitter());
        this.onPtyHostStart = this._onPtyHostStart.event;
        this._onPtyHostUnresponsive = this._register(new Emitter());
        this.onPtyHostUnresponsive = this._onPtyHostUnresponsive.event;
        this._onPtyHostResponsive = this._register(new Emitter());
        this.onPtyHostResponsive = this._onPtyHostResponsive.event;
        this._onPtyHostRequestResolveVariables = this._register(new Emitter());
        this.onPtyHostRequestResolveVariables = this._onPtyHostRequestResolveVariables.event;
        this._onProcessData = this._register(new Emitter());
        this.onProcessData = this._onProcessData.event;
        this._onProcessReady = this._register(new Emitter());
        this.onProcessReady = this._onProcessReady.event;
        this._onProcessReplay = this._register(new Emitter());
        this.onProcessReplay = this._onProcessReplay.event;
        this._onProcessOrphanQuestion = this._register(new Emitter());
        this.onProcessOrphanQuestion = this._onProcessOrphanQuestion.event;
        this._onDidRequestDetach = this._register(new Emitter());
        this.onDidRequestDetach = this._onDidRequestDetach.event;
        this._onDidChangeProperty = this._register(new Emitter());
        this.onDidChangeProperty = this._onDidChangeProperty.event;
        this._onProcessExit = this._register(new Emitter());
        this.onProcessExit = this._onProcessExit.event;
        registerTerminalPlatformConfiguration();
        this._register(this._ptyHostStarter);
        this._register(toDisposable(() => this._disposePtyHost()));
        this._resolveVariablesRequestStore = this._register(new RequestStore(undefined, this._logService));
        this._register(this._resolveVariablesRequestStore.onCreateRequest(this._onPtyHostRequestResolveVariables.fire, this._onPtyHostRequestResolveVariables));
        if (this._ptyHostStarter.onRequestConnection) {
            this._register(Event.once(this._ptyHostStarter.onRequestConnection)(() => this._ensurePtyHost()));
        }
        if (this._ptyHostStarter.onWillShutdown) {
            this._register(this._ptyHostStarter.onWillShutdown(() => this._wasQuitRequested = true));
        }
    }
    get _ignoreProcessNames() {
        return this._configurationService.getValue("terminal.integrated.ignoreProcessNames");
    }
    async _refreshIgnoreProcessNames() {
        return this._optionalProxy?.refreshIgnoreProcessNames?.(this._ignoreProcessNames);
    }
    async _resolveShellEnv() {
        if (isWindows) {
            return process.env;
        }
        try {
            return await getResolvedShellEnv(this._configurationService, this._logService, { _: [] }, process.env);
        }
        catch (error) {
            this._logService.error('ptyHost was unable to resolve shell environment', error);
            return {};
        }
    }
    _startPtyHost() {
        const connection = this._ptyHostStarter.start();
        const client = connection.client;
        if (this._logService.getLevel() === LogLevel.Trace) {
            this._logService.trace('PtyHostService#_startPtyHost', new Error().stack?.replace(/^Error/, ''));
        }
        const heartbeatService = ProxyChannel.toService(client.getChannel(TerminalIpcChannels.Heartbeat));
        heartbeatService.onBeat(() => this._handleHeartbeat());
        this._handleHeartbeat(true);
        this._register(connection.onDidProcessExit(e => {
            this._onPtyHostExit.fire(e.code);
            if (!this._wasQuitRequested && !this._store.isDisposed) {
                if (this._restartCount <= Constants.MaxRestarts) {
                    this._logService.error(`ptyHost terminated unexpectedly with code ${e.code}`);
                    this._restartCount++;
                    this.restartPtyHost();
                }
                else {
                    this._logService.error(`ptyHost terminated unexpectedly with code ${e.code}, giving up`);
                }
            }
        }));
        const proxy = ProxyChannel.toService(client.getChannel(TerminalIpcChannels.PtyHost));
        this._register(proxy.onProcessData(e => this._onProcessData.fire(e)));
        this._register(proxy.onProcessReady(e => this._onProcessReady.fire(e)));
        this._register(proxy.onProcessExit(e => this._onProcessExit.fire(e)));
        this._register(proxy.onDidChangeProperty(e => this._onDidChangeProperty.fire(e)));
        this._register(proxy.onProcessReplay(e => this._onProcessReplay.fire(e)));
        this._register(proxy.onProcessOrphanQuestion(e => this._onProcessOrphanQuestion.fire(e)));
        this._register(proxy.onDidRequestDetach(e => this._onDidRequestDetach.fire(e)));
        this._register(new RemoteLoggerChannelClient(this._loggerService, client.getChannel(TerminalIpcChannels.Logger)));
        this.__connection = connection;
        this.__proxy = proxy;
        this._onPtyHostStart.fire();
        this._register(this._configurationService.onDidChangeConfiguration(async (e) => {
            if (e.affectsConfiguration("terminal.integrated.ignoreProcessNames")) {
                await this._refreshIgnoreProcessNames();
            }
        }));
        this._refreshIgnoreProcessNames();
        return [connection, proxy];
    }
    async createProcess(shellLaunchConfig, cwd, cols, rows, unicodeVersion, env, executableEnv, options, shouldPersist, workspaceId, workspaceName) {
        const timeout = setTimeout(() => this._handleUnresponsiveCreateProcess(), HeartbeatConstants.CreateProcessTimeout);
        const id = await this._proxy.createProcess(shellLaunchConfig, cwd, cols, rows, unicodeVersion, env, executableEnv, options, shouldPersist, workspaceId, workspaceName);
        clearTimeout(timeout);
        return id;
    }
    updateTitle(id, title, titleSource) {
        return this._proxy.updateTitle(id, title, titleSource);
    }
    updateIcon(id, userInitiated, icon, color) {
        return this._proxy.updateIcon(id, userInitiated, icon, color);
    }
    attachToProcess(id) {
        return this._proxy.attachToProcess(id);
    }
    detachFromProcess(id, forcePersist) {
        return this._proxy.detachFromProcess(id, forcePersist);
    }
    shutdownAll() {
        return this._proxy.shutdownAll();
    }
    listProcesses() {
        return this._proxy.listProcesses();
    }
    async getPerformanceMarks() {
        return this._optionalProxy?.getPerformanceMarks() ?? [];
    }
    async reduceConnectionGraceTime() {
        return this._optionalProxy?.reduceConnectionGraceTime();
    }
    start(id) {
        return this._proxy.start(id);
    }
    shutdown(id, immediate) {
        return this._proxy.shutdown(id, immediate);
    }
    input(id, data) {
        return this._proxy.input(id, data);
    }
    processBinary(id, data) {
        return this._proxy.processBinary(id, data);
    }
    resize(id, cols, rows) {
        return this._proxy.resize(id, cols, rows);
    }
    clearBuffer(id) {
        return this._proxy.clearBuffer(id);
    }
    acknowledgeDataEvent(id, charCount) {
        return this._proxy.acknowledgeDataEvent(id, charCount);
    }
    setUnicodeVersion(id, version) {
        return this._proxy.setUnicodeVersion(id, version);
    }
    getInitialCwd(id) {
        return this._proxy.getInitialCwd(id);
    }
    getCwd(id) {
        return this._proxy.getCwd(id);
    }
    async getLatency() {
        const sw = new StopWatch();
        const results = await this._proxy.getLatency();
        sw.stop();
        return [
            {
                label: 'ptyhostservice<->ptyhost',
                latency: sw.elapsed()
            },
            ...results
        ];
    }
    orphanQuestionReply(id) {
        return this._proxy.orphanQuestionReply(id);
    }
    installAutoReply(match, reply) {
        return this._proxy.installAutoReply(match, reply);
    }
    uninstallAllAutoReplies() {
        return this._proxy.uninstallAllAutoReplies();
    }
    getDefaultSystemShell(osOverride) {
        return this._optionalProxy?.getDefaultSystemShell(osOverride) ?? getSystemShell(osOverride ?? OS, process.env);
    }
    async getProfiles(workspaceId, profiles, defaultProfile, includeDetectedProfiles = false) {
        const shellEnv = await this._resolveShellEnv();
        return detectAvailableProfiles(profiles, defaultProfile, includeDetectedProfiles, this._configurationService, shellEnv, undefined, this._logService, this._resolveVariables.bind(this, workspaceId));
    }
    async getEnvironment() {
        if (!this.__proxy) {
            return { ...process.env };
        }
        return this._proxy.getEnvironment();
    }
    getWslPath(original, direction) {
        return this._proxy.getWslPath(original, direction);
    }
    getRevivedPtyNewId(workspaceId, id) {
        return this._proxy.getRevivedPtyNewId(workspaceId, id);
    }
    setTerminalLayoutInfo(args) {
        return this._proxy.setTerminalLayoutInfo(args);
    }
    async getTerminalLayoutInfo(args) {
        return this._optionalProxy?.getTerminalLayoutInfo(args);
    }
    async requestDetachInstance(workspaceId, instanceId) {
        return this._proxy.requestDetachInstance(workspaceId, instanceId);
    }
    async acceptDetachInstanceReply(requestId, persistentProcessId) {
        return this._proxy.acceptDetachInstanceReply(requestId, persistentProcessId);
    }
    async freePortKillProcess(port) {
        if (!this._proxy.freePortKillProcess) {
            throw new Error('freePortKillProcess does not exist on the pty proxy');
        }
        return this._proxy.freePortKillProcess(port);
    }
    async serializeTerminalState(ids) {
        return this._proxy.serializeTerminalState(ids);
    }
    async reviveTerminalProcesses(workspaceId, state, dateTimeFormatLocate) {
        return this._proxy.reviveTerminalProcesses(workspaceId, state, dateTimeFormatLocate);
    }
    async refreshProperty(id, property) {
        return this._proxy.refreshProperty(id, property);
    }
    async updateProperty(id, property, value) {
        return this._proxy.updateProperty(id, property, value);
    }
    async restartPtyHost() {
        this._disposePtyHost();
        this._isResponsive = true;
        this._startPtyHost();
    }
    _disposePtyHost() {
        this._proxy.shutdownAll();
        this._connection.store.dispose();
    }
    _handleHeartbeat(isConnecting) {
        this._clearHeartbeatTimeouts();
        this._heartbeatFirstTimeout = setTimeout(() => this._handleHeartbeatFirstTimeout(), isConnecting ? HeartbeatConstants.ConnectingBeatInterval : (HeartbeatConstants.BeatInterval * HeartbeatConstants.FirstWaitMultiplier));
        if (!this._isResponsive) {
            this._isResponsive = true;
            this._onPtyHostResponsive.fire();
        }
    }
    _handleHeartbeatFirstTimeout() {
        this._logService.warn(`No ptyHost heartbeat after ${HeartbeatConstants.BeatInterval * HeartbeatConstants.FirstWaitMultiplier / 1000} seconds`);
        this._heartbeatFirstTimeout = undefined;
        this._heartbeatSecondTimeout = setTimeout(() => this._handleHeartbeatSecondTimeout(), HeartbeatConstants.BeatInterval * HeartbeatConstants.SecondWaitMultiplier);
    }
    _handleHeartbeatSecondTimeout() {
        this._logService.error(`No ptyHost heartbeat after ${(HeartbeatConstants.BeatInterval * HeartbeatConstants.FirstWaitMultiplier + HeartbeatConstants.BeatInterval * HeartbeatConstants.FirstWaitMultiplier) / 1000} seconds`);
        this._heartbeatSecondTimeout = undefined;
        if (this._isResponsive) {
            this._isResponsive = false;
            this._onPtyHostUnresponsive.fire();
        }
    }
    _handleUnresponsiveCreateProcess() {
        this._clearHeartbeatTimeouts();
        this._logService.error(`No ptyHost response to createProcess after ${HeartbeatConstants.CreateProcessTimeout / 1000} seconds`);
        if (this._isResponsive) {
            this._isResponsive = false;
            this._onPtyHostUnresponsive.fire();
        }
    }
    _clearHeartbeatTimeouts() {
        if (this._heartbeatFirstTimeout) {
            clearTimeout(this._heartbeatFirstTimeout);
            this._heartbeatFirstTimeout = undefined;
        }
        if (this._heartbeatSecondTimeout) {
            clearTimeout(this._heartbeatSecondTimeout);
            this._heartbeatSecondTimeout = undefined;
        }
    }
    _resolveVariables(workspaceId, text) {
        return this._resolveVariablesRequestStore.createRequest({ workspaceId, originalText: text });
    }
    async acceptPtyHostResolvedVariables(requestId, resolved) {
        this._resolveVariablesRequestStore.acceptReply(requestId, resolved);
    }
};
PtyHostService = __decorate([
    __param(1, IConfigurationService),
    __param(2, ILogService),
    __param(3, ILoggerService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], PtyHostService);
export { PtyHostService };
