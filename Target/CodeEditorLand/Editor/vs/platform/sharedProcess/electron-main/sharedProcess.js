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
import { validatedIpcMain } from '../../../base/parts/ipc/electron-main/ipcMain.js';
import { Barrier, DeferredPromise } from '../../../base/common/async.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { IEnvironmentMainService } from '../../environment/electron-main/environmentMainService.js';
import { ILifecycleMainService } from '../../lifecycle/electron-main/lifecycleMainService.js';
import { ILogService } from '../../log/common/log.js';
import { IUserDataProfilesService } from '../../userDataProfile/common/userDataProfile.js';
import { IPolicyService } from '../../policy/common/policy.js';
import { ILoggerMainService } from '../../log/electron-main/loggerService.js';
import { UtilityProcess } from '../../utilityProcess/electron-main/utilityProcess.js';
import { NullTelemetryService } from '../../telemetry/common/telemetryUtils.js';
import { parseSharedProcessDebugPort } from '../../environment/node/environmentService.js';
import { assertIsDefined } from '../../../base/common/types.js';
import { SharedProcessChannelConnection, SharedProcessRawConnection, SharedProcessLifecycle } from '../common/sharedProcess.js';
import { Emitter } from '../../../base/common/event.js';
let SharedProcess = class SharedProcess extends Disposable {
    constructor(machineId, sqmId, devDeviceId, environmentMainService, userDataProfilesService, lifecycleMainService, logService, loggerMainService, policyService) {
        super();
        this.machineId = machineId;
        this.sqmId = sqmId;
        this.devDeviceId = devDeviceId;
        this.environmentMainService = environmentMainService;
        this.userDataProfilesService = userDataProfilesService;
        this.lifecycleMainService = lifecycleMainService;
        this.logService = logService;
        this.loggerMainService = loggerMainService;
        this.policyService = policyService;
        this.firstWindowConnectionBarrier = new Barrier();
        this.utilityProcess = undefined;
        this.utilityProcessLogListener = undefined;
        this._onDidCrash = this._register(new Emitter());
        this.onDidCrash = this._onDidCrash.event;
        this._whenReady = undefined;
        this._whenIpcReady = undefined;
        this.registerListeners();
    }
    registerListeners() {
        // Shared process channel connections from workbench windows
        validatedIpcMain.on(SharedProcessChannelConnection.request, (e, nonce) => this.onWindowConnection(e, nonce, SharedProcessChannelConnection.response));
        // Shared process raw connections from workbench windows
        validatedIpcMain.on(SharedProcessRawConnection.request, (e, nonce) => this.onWindowConnection(e, nonce, SharedProcessRawConnection.response));
        // Lifecycle
        this._register(this.lifecycleMainService.onWillShutdown(() => this.onWillShutdown()));
    }
    async onWindowConnection(e, nonce, responseChannel) {
        this.logService.trace(`[SharedProcess] onWindowConnection for: ${responseChannel}`);
        // release barrier if this is the first window connection
        if (!this.firstWindowConnectionBarrier.isOpen()) {
            this.firstWindowConnectionBarrier.open();
        }
        // await the shared process to be overall ready
        // we do not just wait for IPC ready because the
        // workbench window will communicate directly
        await this.whenReady();
        // connect to the shared process passing the responseChannel
        // as payload to give a hint what the connection is about
        const port = await this.connect(responseChannel);
        // Check back if the requesting window meanwhile closed
        // Since shared process is delayed on startup there is
        // a chance that the window close before the shared process
        // was ready for a connection.
        if (e.sender.isDestroyed()) {
            return port.close();
        }
        // send the port back to the requesting window
        e.sender.postMessage(responseChannel, nonce, [port]);
    }
    onWillShutdown() {
        this.logService.trace('[SharedProcess] onWillShutdown');
        this.utilityProcess?.postMessage(SharedProcessLifecycle.exit);
        this.utilityProcess = undefined;
    }
    whenReady() {
        if (!this._whenReady) {
            this._whenReady = (async () => {
                // Wait for shared process being ready to accept connection
                await this.whenIpcReady;
                // Overall signal that the shared process was loaded and
                // all services within have been created.
                const whenReady = new DeferredPromise();
                this.utilityProcess?.once(SharedProcessLifecycle.initDone, () => whenReady.complete());
                await whenReady.p;
                this.utilityProcessLogListener?.dispose();
                this.logService.trace('[SharedProcess] Overall ready');
            })();
        }
        return this._whenReady;
    }
    get whenIpcReady() {
        if (!this._whenIpcReady) {
            this._whenIpcReady = (async () => {
                // Always wait for first window asking for connection
                await this.firstWindowConnectionBarrier.wait();
                // Spawn shared process
                this.createUtilityProcess();
                // Wait for shared process indicating that IPC connections are accepted
                const sharedProcessIpcReady = new DeferredPromise();
                this.utilityProcess?.once(SharedProcessLifecycle.ipcReady, () => sharedProcessIpcReady.complete());
                await sharedProcessIpcReady.p;
                this.logService.trace('[SharedProcess] IPC ready');
            })();
        }
        return this._whenIpcReady;
    }
    createUtilityProcess() {
        this.utilityProcess = this._register(new UtilityProcess(this.logService, NullTelemetryService, this.lifecycleMainService));
        // Install a log listener for very early shared process warnings and errors
        this.utilityProcessLogListener = this.utilityProcess.onMessage((e) => {
            if (typeof e.warning === 'string') {
                this.logService.warn(e.warning);
            }
            else if (typeof e.error === 'string') {
                this.logService.error(e.error);
            }
        });
        const inspectParams = parseSharedProcessDebugPort(this.environmentMainService.args, this.environmentMainService.isBuilt);
        let execArgv = undefined;
        if (inspectParams.port) {
            execArgv = ['--nolazy'];
            if (inspectParams.break) {
                execArgv.push(`--inspect-brk=${inspectParams.port}`);
            }
            else {
                execArgv.push(`--inspect=${inspectParams.port}`);
            }
        }
        this.utilityProcess.start({
            type: 'shared-process',
            entryPoint: 'vs/code/electron-utility/sharedProcess/sharedProcessMain',
            payload: this.createSharedProcessConfiguration(),
            respondToAuthRequestsFromMainProcess: true,
            execArgv
        });
        this._register(this.utilityProcess.onCrash(() => this._onDidCrash.fire()));
    }
    createSharedProcessConfiguration() {
        return {
            machineId: this.machineId,
            sqmId: this.sqmId,
            devDeviceId: this.devDeviceId,
            codeCachePath: this.environmentMainService.codeCachePath,
            profiles: {
                home: this.userDataProfilesService.profilesHome,
                all: this.userDataProfilesService.profiles,
            },
            args: this.environmentMainService.args,
            logLevel: this.loggerMainService.getLogLevel(),
            loggers: this.loggerMainService.getRegisteredLoggers(),
            policiesData: this.policyService.serialize()
        };
    }
    async connect(payload) {
        // Wait for shared process being ready to accept connection
        await this.whenIpcReady;
        // Connect and return message port
        const utilityProcess = assertIsDefined(this.utilityProcess);
        return utilityProcess.connect(payload);
    }
};
SharedProcess = __decorate([
    __param(3, IEnvironmentMainService),
    __param(4, IUserDataProfilesService),
    __param(5, ILifecycleMainService),
    __param(6, ILogService),
    __param(7, ILoggerMainService),
    __param(8, IPolicyService),
    __metadata("design:paramtypes", [String, String, String, Object, Object, Object, Object, Object, Object])
], SharedProcess);
export { SharedProcess };
