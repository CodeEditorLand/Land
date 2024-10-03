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
import { IEnvironmentMainService } from '../../environment/electron-main/environmentMainService.js';
import { parsePtyHostDebugPort } from '../../environment/node/environmentService.js';
import { ILifecycleMainService } from '../../lifecycle/electron-main/lifecycleMainService.js';
import { ILogService } from '../../log/common/log.js';
import { NullTelemetryService } from '../../telemetry/common/telemetryUtils.js';
import { UtilityProcess } from '../../utilityProcess/electron-main/utilityProcess.js';
import { Client as MessagePortClient } from '../../../base/parts/ipc/electron-main/ipc.mp.js';
import { validatedIpcMain } from '../../../base/parts/ipc/electron-main/ipcMain.js';
import { Disposable, DisposableStore, toDisposable } from '../../../base/common/lifecycle.js';
import { Emitter } from '../../../base/common/event.js';
import { deepClone } from '../../../base/common/objects.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { Schemas } from '../../../base/common/network.js';
let ElectronPtyHostStarter = class ElectronPtyHostStarter extends Disposable {
    constructor(_reconnectConstants, _configurationService, _environmentMainService, _lifecycleMainService, _logService) {
        super();
        this._reconnectConstants = _reconnectConstants;
        this._configurationService = _configurationService;
        this._environmentMainService = _environmentMainService;
        this._lifecycleMainService = _lifecycleMainService;
        this._logService = _logService;
        this.utilityProcess = undefined;
        this._onRequestConnection = new Emitter();
        this.onRequestConnection = this._onRequestConnection.event;
        this._onWillShutdown = new Emitter();
        this.onWillShutdown = this._onWillShutdown.event;
        this._register(this._lifecycleMainService.onWillShutdown(() => this._onWillShutdown.fire()));
        validatedIpcMain.on('vscode:createPtyHostMessageChannel', (e, nonce) => this._onWindowConnection(e, nonce));
        this._register(toDisposable(() => {
            validatedIpcMain.removeHandler('vscode:createPtyHostMessageChannel');
        }));
    }
    start() {
        this.utilityProcess = new UtilityProcess(this._logService, NullTelemetryService, this._lifecycleMainService);
        const inspectParams = parsePtyHostDebugPort(this._environmentMainService.args, this._environmentMainService.isBuilt);
        const execArgv = inspectParams.port ? [
            '--nolazy',
            `--inspect${inspectParams.break ? '-brk' : ''}=${inspectParams.port}`
        ] : undefined;
        this.utilityProcess.start({
            type: 'ptyHost',
            entryPoint: 'vs/platform/terminal/node/ptyHostMain',
            execArgv,
            args: ['--logsPath', this._environmentMainService.logsHome.with({ scheme: Schemas.file }).fsPath],
            env: this._createPtyHostConfiguration()
        });
        const port = this.utilityProcess.connect();
        const client = new MessagePortClient(port, 'ptyHost');
        const store = new DisposableStore();
        store.add(client);
        store.add(toDisposable(() => {
            this.utilityProcess?.kill();
            this.utilityProcess?.dispose();
            this.utilityProcess = undefined;
        }));
        return {
            client,
            store,
            onDidProcessExit: this.utilityProcess.onExit
        };
    }
    _createPtyHostConfiguration() {
        this._environmentMainService.unsetSnapExportedVariables();
        const config = {
            ...deepClone(process.env),
            VSCODE_ESM_ENTRYPOINT: 'vs/platform/terminal/node/ptyHostMain',
            VSCODE_PIPE_LOGGING: 'true',
            VSCODE_VERBOSE_LOGGING: 'true',
            VSCODE_RECONNECT_GRACE_TIME: String(this._reconnectConstants.graceTime),
            VSCODE_RECONNECT_SHORT_GRACE_TIME: String(this._reconnectConstants.shortGraceTime),
            VSCODE_RECONNECT_SCROLLBACK: String(this._reconnectConstants.scrollback),
        };
        const simulatedLatency = this._configurationService.getValue("terminal.integrated.developer.ptyHost.latency");
        if (simulatedLatency && typeof simulatedLatency === 'number') {
            config.VSCODE_LATENCY = String(simulatedLatency);
        }
        const startupDelay = this._configurationService.getValue("terminal.integrated.developer.ptyHost.startupDelay");
        if (startupDelay && typeof startupDelay === 'number') {
            config.VSCODE_STARTUP_DELAY = String(startupDelay);
        }
        this._environmentMainService.restoreSnapExportedVariables();
        return config;
    }
    _onWindowConnection(e, nonce) {
        this._onRequestConnection.fire();
        const port = this.utilityProcess.connect();
        if (e.sender.isDestroyed()) {
            port.close();
            return;
        }
        e.sender.postMessage('vscode:createPtyHostMessageChannelResult', nonce, [port]);
    }
};
ElectronPtyHostStarter = __decorate([
    __param(1, IConfigurationService),
    __param(2, IEnvironmentMainService),
    __param(3, ILifecycleMainService),
    __param(4, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], ElectronPtyHostStarter);
export { ElectronPtyHostStarter };
