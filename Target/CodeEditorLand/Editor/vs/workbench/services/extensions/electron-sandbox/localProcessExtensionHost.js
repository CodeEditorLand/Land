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
import { timeout } from '../../../../base/common/async.js';
import { VSBuffer } from '../../../../base/common/buffer.js';
import { CancellationError } from '../../../../base/common/errors.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { DisposableStore, toDisposable } from '../../../../base/common/lifecycle.js';
import * as objects from '../../../../base/common/objects.js';
import * as platform from '../../../../base/common/platform.js';
import { removeDangerousEnvVariables } from '../../../../base/common/processes.js';
import { StopWatch } from '../../../../base/common/stopwatch.js';
import { URI } from '../../../../base/common/uri.js';
import { generateUuid } from '../../../../base/common/uuid.js';
import { BufferedEmitter } from '../../../../base/parts/ipc/common/ipc.net.js';
import { acquirePort } from '../../../../base/parts/ipc/electron-sandbox/ipc.mp.js';
import * as nls from '../../../../nls.js';
import { IExtensionHostDebugService } from '../../../../platform/debug/common/extensionHostDebug.js';
import { IExtensionHostStarter } from '../../../../platform/extensions/common/extensionHostStarter.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { ILogService, ILoggerService } from '../../../../platform/log/common/log.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';
import { INotificationService, NotificationPriority, Severity } from '../../../../platform/notification/common/notification.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { isLoggingOnly } from '../../../../platform/telemetry/common/telemetryUtils.js';
import { IUserDataProfilesService } from '../../../../platform/userDataProfile/common/userDataProfile.js';
import { IWorkspaceContextService, isUntitledWorkspace } from '../../../../platform/workspace/common/workspace.js';
import { INativeWorkbenchEnvironmentService } from '../../environment/electron-sandbox/environmentService.js';
import { IShellEnvironmentService } from '../../environment/electron-sandbox/shellEnvironmentService.js';
import { MessagePortExtHostConnection, writeExtHostConnection } from '../common/extensionHostEnv.js';
import { UIKind, isMessageOfType } from '../common/extensionHostProtocol.js';
import { LocalProcessRunningLocation } from '../common/extensionRunningLocation.js';
import { IHostService } from '../../host/browser/host.js';
import { ILifecycleService } from '../../lifecycle/common/lifecycle.js';
import { parseExtensionDevOptions } from '../common/extensionDevOptions.js';
export class ExtensionHostProcess {
    get onStdout() {
        return this._extensionHostStarter.onDynamicStdout(this._id);
    }
    get onStderr() {
        return this._extensionHostStarter.onDynamicStderr(this._id);
    }
    get onMessage() {
        return this._extensionHostStarter.onDynamicMessage(this._id);
    }
    get onExit() {
        return this._extensionHostStarter.onDynamicExit(this._id);
    }
    constructor(id, _extensionHostStarter) {
        this._extensionHostStarter = _extensionHostStarter;
        this._id = id;
    }
    start(opts) {
        return this._extensionHostStarter.start(this._id, opts);
    }
    enableInspectPort() {
        return this._extensionHostStarter.enableInspectPort(this._id);
    }
    kill() {
        return this._extensionHostStarter.kill(this._id);
    }
}
let NativeLocalProcessExtensionHost = class NativeLocalProcessExtensionHost {
    constructor(runningLocation, startup, _initDataProvider, _contextService, _notificationService, _nativeHostService, _lifecycleService, _environmentService, _userDataProfilesService, _telemetryService, _logService, _loggerService, _labelService, _extensionHostDebugService, _hostService, _productService, _shellEnvironmentService, _extensionHostStarter) {
        this.runningLocation = runningLocation;
        this.startup = startup;
        this._initDataProvider = _initDataProvider;
        this._contextService = _contextService;
        this._notificationService = _notificationService;
        this._nativeHostService = _nativeHostService;
        this._lifecycleService = _lifecycleService;
        this._environmentService = _environmentService;
        this._userDataProfilesService = _userDataProfilesService;
        this._telemetryService = _telemetryService;
        this._logService = _logService;
        this._loggerService = _loggerService;
        this._labelService = _labelService;
        this._extensionHostDebugService = _extensionHostDebugService;
        this._hostService = _hostService;
        this._productService = _productService;
        this._shellEnvironmentService = _shellEnvironmentService;
        this._extensionHostStarter = _extensionHostStarter;
        this.pid = null;
        this.remoteAuthority = null;
        this.extensions = null;
        this._onExit = new Emitter();
        this.onExit = this._onExit.event;
        this._onDidSetInspectPort = new Emitter();
        this._toDispose = new DisposableStore();
        const devOpts = parseExtensionDevOptions(this._environmentService);
        this._isExtensionDevHost = devOpts.isExtensionDevHost;
        this._isExtensionDevDebug = devOpts.isExtensionDevDebug;
        this._isExtensionDevDebugBrk = devOpts.isExtensionDevDebugBrk;
        this._isExtensionDevTestFromCli = devOpts.isExtensionDevTestFromCli;
        this._terminating = false;
        this._inspectListener = null;
        this._extensionHostProcess = null;
        this._messageProtocol = null;
        this._toDispose.add(this._onExit);
        this._toDispose.add(this._lifecycleService.onWillShutdown(e => this._onWillShutdown(e)));
        this._toDispose.add(this._extensionHostDebugService.onClose(event => {
            if (this._isExtensionDevHost && this._environmentService.debugExtensionHost.debugId === event.sessionId) {
                this._nativeHostService.closeWindow();
            }
        }));
        this._toDispose.add(this._extensionHostDebugService.onReload(event => {
            if (this._isExtensionDevHost && this._environmentService.debugExtensionHost.debugId === event.sessionId) {
                this._hostService.reload();
            }
        }));
    }
    dispose() {
        if (this._terminating) {
            return;
        }
        this._terminating = true;
        this._toDispose.dispose();
    }
    start() {
        if (this._terminating) {
            throw new CancellationError();
        }
        if (!this._messageProtocol) {
            this._messageProtocol = this._start();
        }
        return this._messageProtocol;
    }
    async _start() {
        const [extensionHostCreationResult, portNumber, processEnv] = await Promise.all([
            this._extensionHostStarter.createExtensionHost(),
            this._tryFindDebugPort(),
            this._shellEnvironmentService.getShellEnv(),
        ]);
        this._extensionHostProcess = new ExtensionHostProcess(extensionHostCreationResult.id, this._extensionHostStarter);
        const env = objects.mixin(processEnv, {
            VSCODE_ESM_ENTRYPOINT: 'vs/workbench/api/node/extensionHostProcess',
            VSCODE_HANDLES_UNCAUGHT_ERRORS: true
        });
        if (this._environmentService.debugExtensionHost.env) {
            objects.mixin(env, this._environmentService.debugExtensionHost.env);
        }
        removeDangerousEnvVariables(env);
        if (this._isExtensionDevHost) {
            delete env['VSCODE_CODE_CACHE_PATH'];
        }
        const opts = {
            responseWindowId: this._nativeHostService.windowId,
            responseChannel: 'vscode:startExtensionHostMessagePortResult',
            responseNonce: generateUuid(),
            env,
            detached: !!platform.isWindows,
            execArgv: undefined,
            silent: true
        };
        const inspectHost = '127.0.0.1';
        if (portNumber !== 0) {
            opts.execArgv = [
                '--nolazy',
                (this._isExtensionDevDebugBrk ? '--inspect-brk=' : '--inspect=') + `${inspectHost}:${portNumber}`
            ];
        }
        else {
            opts.execArgv = ['--inspect-port=0'];
        }
        if (this._environmentService.extensionTestsLocationURI) {
            opts.execArgv.unshift('--expose-gc');
        }
        if (this._environmentService.args['prof-v8-extensions']) {
            opts.execArgv.unshift('--prof');
        }
        opts.execArgv.unshift('--dns-result-order=ipv4first');
        const onStdout = this._handleProcessOutputStream(this._extensionHostProcess.onStdout, this._toDispose);
        const onStderr = this._handleProcessOutputStream(this._extensionHostProcess.onStderr, this._toDispose);
        const onOutput = Event.any(Event.map(onStdout.event, o => ({ data: `%c${o}`, format: [''] })), Event.map(onStderr.event, o => ({ data: `%c${o}`, format: ['color: red'] })));
        const onDebouncedOutput = Event.debounce(onOutput, (r, o) => {
            return r
                ? { data: r.data + o.data, format: [...r.format, ...o.format] }
                : { data: o.data, format: o.format };
        }, 100);
        this._toDispose.add(onDebouncedOutput(output => {
            const inspectorUrlMatch = output.data && output.data.match(/ws:\/\/([^\s]+):(\d+)\/[^\s]+/);
            if (inspectorUrlMatch) {
                const [, host, port] = inspectorUrlMatch;
                if (!this._environmentService.isBuilt && !this._isExtensionDevTestFromCli) {
                    console.log(`%c[Extension Host] %cdebugger inspector at devtools://devtools/bundled/inspector.html?experiments=true&v8only=true&ws=${inspectorUrlMatch[1]}`, 'color: blue', 'color:');
                }
                if (!this._inspectListener) {
                    this._inspectListener = { host, port: Number(port) };
                    this._onDidSetInspectPort.fire();
                }
            }
            else {
                if (!this._isExtensionDevTestFromCli) {
                    console.group('Extension Host');
                    console.log(output.data, ...output.format);
                    console.groupEnd();
                }
            }
        }));
        this._toDispose.add(this._extensionHostProcess.onExit(({ code, signal }) => this._onExtHostProcessExit(code, signal)));
        if (portNumber) {
            if (this._isExtensionDevHost && this._isExtensionDevDebug && this._environmentService.debugExtensionHost.debugId) {
                this._extensionHostDebugService.attachSession(this._environmentService.debugExtensionHost.debugId, portNumber);
            }
            this._inspectListener = { port: portNumber, host: inspectHost };
            this._onDidSetInspectPort.fire();
        }
        let startupTimeoutHandle;
        if (!this._environmentService.isBuilt && !this._environmentService.remoteAuthority || this._isExtensionDevHost) {
            startupTimeoutHandle = setTimeout(() => {
                this._logService.error(`[LocalProcessExtensionHost]: Extension host did not start in 10 seconds (debugBrk: ${this._isExtensionDevDebugBrk})`);
                const msg = this._isExtensionDevDebugBrk
                    ? nls.localize('extensionHost.startupFailDebug', "Extension host did not start in 10 seconds, it might be stopped on the first line and needs a debugger to continue.")
                    : nls.localize('extensionHost.startupFail', "Extension host did not start in 10 seconds, that might be a problem.");
                this._notificationService.prompt(Severity.Warning, msg, [{
                        label: nls.localize('reloadWindow', "Reload Window"),
                        run: () => this._hostService.reload()
                    }], {
                    sticky: true,
                    priority: NotificationPriority.URGENT
                });
            }, 10000);
        }
        const protocol = await this._establishProtocol(this._extensionHostProcess, opts);
        await this._performHandshake(protocol);
        clearTimeout(startupTimeoutHandle);
        return protocol;
    }
    async _tryFindDebugPort() {
        if (typeof this._environmentService.debugExtensionHost.port !== 'number') {
            return 0;
        }
        const expected = this._environmentService.debugExtensionHost.port;
        const port = await this._nativeHostService.findFreePort(expected, 10, 5000, 2048);
        if (!this._isExtensionDevTestFromCli) {
            if (!port) {
                console.warn('%c[Extension Host] %cCould not find a free port for debugging', 'color: blue', 'color:');
            }
            else {
                if (port !== expected) {
                    console.warn(`%c[Extension Host] %cProvided debugging port ${expected} is not free, using ${port} instead.`, 'color: blue', 'color:');
                }
                if (this._isExtensionDevDebugBrk) {
                    console.warn(`%c[Extension Host] %cSTOPPED on first line for debugging on port ${port}`, 'color: blue', 'color:');
                }
                else {
                    console.info(`%c[Extension Host] %cdebugger listening on port ${port}`, 'color: blue', 'color:');
                }
            }
        }
        return port || 0;
    }
    _establishProtocol(extensionHostProcess, opts) {
        writeExtHostConnection(new MessagePortExtHostConnection(), opts.env);
        const portPromise = acquirePort(undefined, opts.responseChannel, opts.responseNonce);
        return new Promise((resolve, reject) => {
            const handle = setTimeout(() => {
                reject('The local extension host took longer than 60s to connect.');
            }, 60 * 1000);
            portPromise.then((port) => {
                this._toDispose.add(toDisposable(() => {
                    port.close();
                }));
                clearTimeout(handle);
                const onMessage = new BufferedEmitter();
                port.onmessage = ((e) => {
                    if (e.data) {
                        onMessage.fire(VSBuffer.wrap(e.data));
                    }
                });
                port.start();
                resolve({
                    onMessage: onMessage.event,
                    send: message => port.postMessage(message.buffer),
                });
            });
            const sw = StopWatch.create(false);
            extensionHostProcess.start(opts).then(({ pid }) => {
                if (pid) {
                    this.pid = pid;
                }
                this._logService.info(`Started local extension host with pid ${pid}.`);
                const duration = sw.elapsed();
                if (platform.isCI) {
                    this._logService.info(`IExtensionHostStarter.start() took ${duration} ms.`);
                }
            }, (err) => {
                reject(err);
            });
        });
    }
    _performHandshake(protocol) {
        return new Promise((resolve, reject) => {
            let timeoutHandle;
            const installTimeoutCheck = () => {
                timeoutHandle = setTimeout(() => {
                    reject('The local extension host took longer than 60s to send its ready message.');
                }, 60 * 1000);
            };
            const uninstallTimeoutCheck = () => {
                clearTimeout(timeoutHandle);
            };
            installTimeoutCheck();
            const disposable = protocol.onMessage(msg => {
                if (isMessageOfType(msg, 1)) {
                    uninstallTimeoutCheck();
                    this._createExtHostInitData().then(data => {
                        installTimeoutCheck();
                        protocol.send(VSBuffer.fromString(JSON.stringify(data)));
                    });
                    return;
                }
                if (isMessageOfType(msg, 0)) {
                    uninstallTimeoutCheck();
                    disposable.dispose();
                    resolve();
                    return;
                }
                console.error(`received unexpected message during handshake phase from the extension host: `, msg);
            });
        });
    }
    async _createExtHostInitData() {
        const initData = await this._initDataProvider.getInitData();
        this.extensions = initData.extensions;
        const workspace = this._contextService.getWorkspace();
        return {
            commit: this._productService.commit,
            version: this._productService.version,
            quality: this._productService.quality,
            parentPid: 0,
            environment: {
                isExtensionDevelopmentDebug: this._isExtensionDevDebug,
                appRoot: this._environmentService.appRoot ? URI.file(this._environmentService.appRoot) : undefined,
                appName: this._productService.nameLong,
                appHost: this._productService.embedderIdentifier || 'desktop',
                appUriScheme: this._productService.urlProtocol,
                extensionTelemetryLogResource: this._environmentService.extHostTelemetryLogFile,
                isExtensionTelemetryLoggingOnly: isLoggingOnly(this._productService, this._environmentService),
                appLanguage: platform.language,
                extensionDevelopmentLocationURI: this._environmentService.extensionDevelopmentLocationURI,
                extensionTestsLocationURI: this._environmentService.extensionTestsLocationURI,
                globalStorageHome: this._userDataProfilesService.defaultProfile.globalStorageHome,
                workspaceStorageHome: this._environmentService.workspaceStorageHome,
                extensionLogLevel: this._environmentService.extensionLogLevel
            },
            workspace: this._contextService.getWorkbenchState() === 1 ? undefined : {
                configuration: workspace.configuration ?? undefined,
                id: workspace.id,
                name: this._labelService.getWorkspaceLabel(workspace),
                isUntitled: workspace.configuration ? isUntitledWorkspace(workspace.configuration, this._environmentService) : false,
                transient: workspace.transient
            },
            remote: {
                authority: this._environmentService.remoteAuthority,
                connectionData: null,
                isRemote: false
            },
            consoleForward: {
                includeStack: !this._isExtensionDevTestFromCli && (this._isExtensionDevHost || !this._environmentService.isBuilt || this._productService.quality !== 'stable' || this._environmentService.verbose),
                logNative: !this._isExtensionDevTestFromCli && this._isExtensionDevHost
            },
            extensions: this.extensions.toSnapshot(),
            telemetryInfo: {
                sessionId: this._telemetryService.sessionId,
                machineId: this._telemetryService.machineId,
                sqmId: this._telemetryService.sqmId,
                devDeviceId: this._telemetryService.devDeviceId,
                firstSessionDate: this._telemetryService.firstSessionDate,
                msftInternal: this._telemetryService.msftInternal
            },
            logLevel: this._logService.getLevel(),
            loggers: [...this._loggerService.getRegisteredLoggers()],
            logsLocation: this._environmentService.extHostLogsPath,
            autoStart: (this.startup === 1),
            uiKind: UIKind.Desktop
        };
    }
    _onExtHostProcessExit(code, signal) {
        if (this._terminating) {
            return;
        }
        this._onExit.fire([code, signal]);
    }
    _handleProcessOutputStream(stream, store) {
        let last = '';
        let isOmitting = false;
        const event = new Emitter();
        stream((chunk) => {
            last += chunk;
            const lines = last.split(/\r?\n/g);
            last = lines.pop();
            if (last.length > 10_000) {
                lines.push(last);
                last = '';
            }
            for (const line of lines) {
                if (isOmitting) {
                    if (line === "END_NATIVE_LOG") {
                        isOmitting = false;
                    }
                }
                else if (line === "START_NATIVE_LOG") {
                    isOmitting = true;
                }
                else if (line.length) {
                    event.fire(line + '\n');
                }
            }
        }, undefined, store);
        return event;
    }
    async enableInspectPort() {
        if (!!this._inspectListener) {
            return true;
        }
        if (!this._extensionHostProcess) {
            return false;
        }
        const result = await this._extensionHostProcess.enableInspectPort();
        if (!result) {
            return false;
        }
        await Promise.race([Event.toPromise(this._onDidSetInspectPort.event), timeout(1000)]);
        return !!this._inspectListener;
    }
    getInspectPort() {
        return this._inspectListener ?? undefined;
    }
    _onWillShutdown(event) {
        if (this._isExtensionDevHost && !this._isExtensionDevTestFromCli && !this._isExtensionDevDebug && this._environmentService.debugExtensionHost.debugId) {
            this._extensionHostDebugService.terminateSession(this._environmentService.debugExtensionHost.debugId);
            event.join(timeout(100), { id: 'join.extensionDevelopment', label: nls.localize('join.extensionDevelopment', "Terminating extension debug session") });
        }
    }
};
NativeLocalProcessExtensionHost = __decorate([
    __param(3, IWorkspaceContextService),
    __param(4, INotificationService),
    __param(5, INativeHostService),
    __param(6, ILifecycleService),
    __param(7, INativeWorkbenchEnvironmentService),
    __param(8, IUserDataProfilesService),
    __param(9, ITelemetryService),
    __param(10, ILogService),
    __param(11, ILoggerService),
    __param(12, ILabelService),
    __param(13, IExtensionHostDebugService),
    __param(14, IHostService),
    __param(15, IProductService),
    __param(16, IShellEnvironmentService),
    __param(17, IExtensionHostStarter),
    __metadata("design:paramtypes", [LocalProcessRunningLocation, Number, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], NativeLocalProcessExtensionHost);
export { NativeLocalProcessExtensionHost };
