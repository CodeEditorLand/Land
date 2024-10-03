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
var UtilityProcess_1;
import { MessageChannelMain, app, utilityProcess } from 'electron';
import { Disposable } from '../../../base/common/lifecycle.js';
import { Emitter, Event } from '../../../base/common/event.js';
import { ILogService } from '../../log/common/log.js';
import { StringDecoder } from 'string_decoder';
import { timeout } from '../../../base/common/async.js';
import { FileAccess } from '../../../base/common/network.js';
import { IWindowsMainService } from '../../windows/electron-main/windows.js';
import Severity from '../../../base/common/severity.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
import { ILifecycleMainService } from '../../lifecycle/electron-main/lifecycleMainService.js';
import { removeDangerousEnvVariables } from '../../../base/common/processes.js';
import { deepClone } from '../../../base/common/objects.js';
import { isWindows } from '../../../base/common/platform.js';
import { isUNCAccessRestrictionsDisabled, getUNCHostAllowlist } from '../../../base/node/unc.js';
import { upcast } from '../../../base/common/types.js';
function isWindowUtilityProcessConfiguration(config) {
    const candidate = config;
    return typeof candidate.responseWindowId === 'number';
}
let UtilityProcess = class UtilityProcess extends Disposable {
    static { UtilityProcess_1 = this; }
    static { this.ID_COUNTER = 0; }
    static { this.all = new Map(); }
    static getAll() {
        return Array.from(UtilityProcess_1.all.values());
    }
    constructor(logService, telemetryService, lifecycleMainService) {
        super();
        this.logService = logService;
        this.telemetryService = telemetryService;
        this.lifecycleMainService = lifecycleMainService;
        this.id = String(++UtilityProcess_1.ID_COUNTER);
        this._onStdout = this._register(new Emitter());
        this.onStdout = this._onStdout.event;
        this._onStderr = this._register(new Emitter());
        this.onStderr = this._onStderr.event;
        this._onMessage = this._register(new Emitter());
        this.onMessage = this._onMessage.event;
        this._onSpawn = this._register(new Emitter());
        this.onSpawn = this._onSpawn.event;
        this._onExit = this._register(new Emitter());
        this.onExit = this._onExit.event;
        this._onCrash = this._register(new Emitter());
        this.onCrash = this._onCrash.event;
        this.process = undefined;
        this.processPid = undefined;
        this.configuration = undefined;
        this.killed = false;
    }
    log(msg, severity) {
        let logMsg;
        if (this.configuration?.correlationId) {
            logMsg = `[UtilityProcess id: ${this.configuration?.correlationId}, type: ${this.configuration?.type}, pid: ${this.processPid ?? '<none>'}]: ${msg}`;
        }
        else {
            logMsg = `[UtilityProcess type: ${this.configuration?.type}, pid: ${this.processPid ?? '<none>'}]: ${msg}`;
        }
        switch (severity) {
            case Severity.Error:
                this.logService.error(logMsg);
                break;
            case Severity.Warning:
                this.logService.warn(logMsg);
                break;
            case Severity.Info:
                this.logService.trace(logMsg);
                break;
        }
    }
    validateCanStart() {
        if (this.process) {
            this.log('Cannot start utility process because it is already running...', Severity.Error);
            return false;
        }
        return true;
    }
    start(configuration) {
        const started = this.doStart(configuration);
        if (started && configuration.payload) {
            const posted = this.postMessage(configuration.payload);
            if (posted) {
                this.log('payload sent via postMessage()', Severity.Info);
            }
        }
        return started;
    }
    doStart(configuration) {
        if (!this.validateCanStart()) {
            return false;
        }
        this.configuration = configuration;
        const serviceName = `${this.configuration.type}-${this.id}`;
        const modulePath = FileAccess.asFileUri('bootstrap-fork.js').fsPath;
        const args = this.configuration.args ?? [];
        const execArgv = this.configuration.execArgv ?? [];
        const allowLoadingUnsignedLibraries = this.configuration.allowLoadingUnsignedLibraries;
        const respondToAuthRequestsFromMainProcess = this.configuration.respondToAuthRequestsFromMainProcess;
        const stdio = 'pipe';
        const env = this.createEnv(configuration);
        this.log('creating new...', Severity.Info);
        this.process = utilityProcess.fork(modulePath, args, upcast({
            serviceName,
            env,
            execArgv,
            allowLoadingUnsignedLibraries,
            respondToAuthRequestsFromMainProcess,
            stdio
        }));
        this.registerListeners(this.process, this.configuration, serviceName);
        return true;
    }
    createEnv(configuration) {
        const env = configuration.env ? { ...configuration.env } : { ...deepClone(process.env) };
        env['VSCODE_ESM_ENTRYPOINT'] = configuration.entryPoint;
        if (typeof configuration.parentLifecycleBound === 'number') {
            env['VSCODE_PARENT_PID'] = String(configuration.parentLifecycleBound);
        }
        env['VSCODE_CRASH_REPORTER_PROCESS_TYPE'] = configuration.type;
        if (isWindows) {
            if (isUNCAccessRestrictionsDisabled()) {
                env['NODE_DISABLE_UNC_ACCESS_CHECKS'] = '1';
            }
            else {
                env['NODE_UNC_HOST_ALLOWLIST'] = getUNCHostAllowlist().join('\\');
            }
        }
        removeDangerousEnvVariables(env);
        for (const key of Object.keys(env)) {
            env[key] = String(env[key]);
        }
        return env;
    }
    registerListeners(process, configuration, serviceName) {
        if (process.stdout) {
            const stdoutDecoder = new StringDecoder('utf-8');
            this._register(Event.fromNodeEventEmitter(process.stdout, 'data')(chunk => this._onStdout.fire(typeof chunk === 'string' ? chunk : stdoutDecoder.write(chunk))));
        }
        if (process.stderr) {
            const stderrDecoder = new StringDecoder('utf-8');
            this._register(Event.fromNodeEventEmitter(process.stderr, 'data')(chunk => this._onStderr.fire(typeof chunk === 'string' ? chunk : stderrDecoder.write(chunk))));
        }
        this._register(Event.fromNodeEventEmitter(process, 'message')(msg => this._onMessage.fire(msg)));
        this._register(Event.fromNodeEventEmitter(process, 'spawn')(() => {
            this.processPid = process.pid;
            if (typeof process.pid === 'number') {
                UtilityProcess_1.all.set(process.pid, { pid: process.pid, name: isWindowUtilityProcessConfiguration(configuration) ? `${configuration.type} [${configuration.responseWindowId}]` : configuration.type });
            }
            this.log('successfully created', Severity.Info);
            this._onSpawn.fire(process.pid);
        }));
        this._register(Event.fromNodeEventEmitter(process, 'exit')(code => {
            const normalizedCode = this.isNormalExit(code) ? 0 : code;
            this.log(`received exit event with code ${normalizedCode}`, Severity.Info);
            this._onExit.fire({ pid: this.processPid, code: normalizedCode, signal: 'unknown' });
            this.onDidExitOrCrashOrKill();
        }));
        this._register(Event.fromNodeEventEmitter(process, 'error', (type, location, report) => ({ type, location, report }))(({ type, location, report }) => {
            this.log(`crashed due to ${type} from V8 at ${location}`, Severity.Info);
            let addons = [];
            try {
                const reportJSON = JSON.parse(report);
                addons = reportJSON.sharedObjects
                    .filter((sharedObject) => sharedObject.endsWith('.node'))
                    .map((addon) => {
                    const index = addon.indexOf('extensions') === -1 ? addon.indexOf('node_modules') : addon.indexOf('extensions');
                    return addon.substring(index);
                });
            }
            catch (e) {
            }
            this.telemetryService.publicLog2('utilityprocessv8error', {
                processtype: configuration.type,
                error: type,
                location,
                addons
            });
        }));
        this._register(Event.fromNodeEventEmitter(app, 'child-process-gone', (event, details) => ({ event, details }))(({ details }) => {
            if (details.type === 'Utility' && details.name === serviceName && !this.isNormalExit(details.exitCode)) {
                this.log(`crashed with code ${details.exitCode} and reason '${details.reason}'`, Severity.Error);
                this.telemetryService.publicLog2('utilityprocesscrash', {
                    type: configuration.type,
                    reason: details.reason,
                    code: details.exitCode
                });
                this._onCrash.fire({ pid: this.processPid, code: details.exitCode, reason: details.reason });
                this.onDidExitOrCrashOrKill();
            }
        }));
    }
    once(message, callback) {
        const disposable = this._register(this._onMessage.event(msg => {
            if (msg === message) {
                disposable.dispose();
                callback();
            }
        }));
    }
    postMessage(message, transfer) {
        if (!this.process) {
            return false;
        }
        this.process.postMessage(message, transfer);
        return true;
    }
    connect(payload) {
        const { port1: outPort, port2: utilityProcessPort } = new MessageChannelMain();
        this.postMessage(payload, [utilityProcessPort]);
        return outPort;
    }
    enableInspectPort() {
        if (!this.process || typeof this.processPid !== 'number') {
            return false;
        }
        this.log('enabling inspect port', Severity.Info);
        const processExt = process;
        if (typeof processExt._debugProcess === 'function') {
            processExt._debugProcess(this.processPid);
            return true;
        }
        return false;
    }
    kill() {
        if (!this.process) {
            return;
        }
        this.log('attempting to kill the process...', Severity.Info);
        const killed = this.process.kill();
        if (killed) {
            this.log('successfully killed the process', Severity.Info);
            this.killed = true;
            this.onDidExitOrCrashOrKill();
        }
        else {
            this.log('unable to kill the process', Severity.Warning);
        }
    }
    isNormalExit(exitCode) {
        if (exitCode === 0) {
            return true;
        }
        return this.killed && exitCode === 15;
    }
    onDidExitOrCrashOrKill() {
        if (typeof this.processPid === 'number') {
            UtilityProcess_1.all.delete(this.processPid);
        }
        this.process = undefined;
    }
    async waitForExit(maxWaitTimeMs) {
        if (!this.process) {
            return;
        }
        this.log('waiting to exit...', Severity.Info);
        await Promise.race([Event.toPromise(this.onExit), timeout(maxWaitTimeMs)]);
        if (this.process) {
            this.log(`did not exit within ${maxWaitTimeMs}ms, will kill it now...`, Severity.Info);
            this.kill();
        }
    }
};
UtilityProcess = UtilityProcess_1 = __decorate([
    __param(0, ILogService),
    __param(1, ITelemetryService),
    __param(2, ILifecycleMainService),
    __metadata("design:paramtypes", [Object, Object, Object])
], UtilityProcess);
export { UtilityProcess };
let WindowUtilityProcess = class WindowUtilityProcess extends UtilityProcess {
    constructor(logService, windowsMainService, telemetryService, lifecycleMainService) {
        super(logService, telemetryService, lifecycleMainService);
        this.windowsMainService = windowsMainService;
    }
    start(configuration) {
        const responseWindow = this.windowsMainService.getWindowById(configuration.responseWindowId);
        if (!responseWindow?.win || responseWindow.win.isDestroyed() || responseWindow.win.webContents.isDestroyed()) {
            this.log('Refusing to start utility process because requesting window cannot be found or is destroyed...', Severity.Error);
            return true;
        }
        const started = super.doStart(configuration);
        if (!started) {
            return false;
        }
        this.registerWindowListeners(responseWindow.win, configuration);
        const windowPort = this.connect(configuration.payload);
        responseWindow.win.webContents.postMessage(configuration.responseChannel, configuration.responseNonce, [windowPort]);
        return true;
    }
    registerWindowListeners(window, configuration) {
        if (configuration.windowLifecycleBound) {
            this._register(Event.filter(this.lifecycleMainService.onWillLoadWindow, e => e.window.win === window)(() => this.kill()));
            this._register(Event.fromNodeEventEmitter(window, 'closed')(() => this.kill()));
        }
    }
};
WindowUtilityProcess = __decorate([
    __param(0, ILogService),
    __param(1, IWindowsMainService),
    __param(2, ITelemetryService),
    __param(3, ILifecycleMainService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], WindowUtilityProcess);
export { WindowUtilityProcess };
