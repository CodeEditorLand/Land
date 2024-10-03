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
import { VSBuffer } from '../../../../base/common/buffer.js';
import { Emitter } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { Schemas } from '../../../../base/common/network.js';
import * as platform from '../../../../base/common/platform.js';
import { IExtensionHostDebugService } from '../../../../platform/debug/common/extensionHostDebug.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { ILogService, ILoggerService } from '../../../../platform/log/common/log.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { connectRemoteAgentExtensionHost } from '../../../../platform/remote/common/remoteAgentConnection.js';
import { IRemoteAuthorityResolverService } from '../../../../platform/remote/common/remoteAuthorityResolver.js';
import { IRemoteSocketFactoryService } from '../../../../platform/remote/common/remoteSocketFactoryService.js';
import { ISignService } from '../../../../platform/sign/common/sign.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { isLoggingOnly } from '../../../../platform/telemetry/common/telemetryUtils.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { parseExtensionDevOptions } from './extensionDevOptions.js';
import { UIKind, createMessageOfType, isMessageOfType } from './extensionHostProtocol.js';
import { RemoteRunningLocation } from './extensionRunningLocation.js';
let RemoteExtensionHost = class RemoteExtensionHost extends Disposable {
    constructor(runningLocation, _initDataProvider, remoteSocketFactoryService, _contextService, _environmentService, _telemetryService, _logService, _loggerService, _labelService, remoteAuthorityResolverService, _extensionHostDebugService, _productService, _signService) {
        super();
        this.runningLocation = runningLocation;
        this._initDataProvider = _initDataProvider;
        this.remoteSocketFactoryService = remoteSocketFactoryService;
        this._contextService = _contextService;
        this._environmentService = _environmentService;
        this._telemetryService = _telemetryService;
        this._logService = _logService;
        this._loggerService = _loggerService;
        this._labelService = _labelService;
        this.remoteAuthorityResolverService = remoteAuthorityResolverService;
        this._extensionHostDebugService = _extensionHostDebugService;
        this._productService = _productService;
        this._signService = _signService;
        this.pid = null;
        this.startup = 1;
        this.extensions = null;
        this._onExit = this._register(new Emitter());
        this.onExit = this._onExit.event;
        this._hasDisconnected = false;
        this.remoteAuthority = this._initDataProvider.remoteAuthority;
        this._protocol = null;
        this._hasLostConnection = false;
        this._terminating = false;
        const devOpts = parseExtensionDevOptions(this._environmentService);
        this._isExtensionDevHost = devOpts.isExtensionDevHost;
    }
    start() {
        const options = {
            commit: this._productService.commit,
            quality: this._productService.quality,
            addressProvider: {
                getAddress: async () => {
                    const { authority } = await this.remoteAuthorityResolverService.resolveAuthority(this._initDataProvider.remoteAuthority);
                    return { connectTo: authority.connectTo, connectionToken: authority.connectionToken };
                }
            },
            remoteSocketFactoryService: this.remoteSocketFactoryService,
            signService: this._signService,
            logService: this._logService,
            ipcLogger: null
        };
        return this.remoteAuthorityResolverService.resolveAuthority(this._initDataProvider.remoteAuthority).then((resolverResult) => {
            const startParams = {
                language: platform.language,
                debugId: this._environmentService.debugExtensionHost.debugId,
                break: this._environmentService.debugExtensionHost.break,
                port: this._environmentService.debugExtensionHost.port,
                env: { ...this._environmentService.debugExtensionHost.env, ...resolverResult.options?.extensionHostEnv },
            };
            const extDevLocs = this._environmentService.extensionDevelopmentLocationURI;
            let debugOk = true;
            if (extDevLocs && extDevLocs.length > 0) {
                if (extDevLocs[0].scheme === Schemas.file) {
                    debugOk = false;
                }
            }
            if (!debugOk) {
                startParams.break = false;
            }
            return connectRemoteAgentExtensionHost(options, startParams).then(result => {
                this._register(result);
                const { protocol, debugPort, reconnectionToken } = result;
                const isExtensionDevelopmentDebug = typeof debugPort === 'number';
                if (debugOk && this._environmentService.isExtensionDevelopment && this._environmentService.debugExtensionHost.debugId && debugPort) {
                    this._extensionHostDebugService.attachSession(this._environmentService.debugExtensionHost.debugId, debugPort, this._initDataProvider.remoteAuthority);
                }
                protocol.onDidDispose(() => {
                    this._onExtHostConnectionLost(reconnectionToken);
                });
                protocol.onSocketClose(() => {
                    if (this._isExtensionDevHost) {
                        this._onExtHostConnectionLost(reconnectionToken);
                    }
                });
                return new Promise((resolve, reject) => {
                    const handle = setTimeout(() => {
                        reject('The remote extension host took longer than 60s to send its ready message.');
                    }, 60 * 1000);
                    const disposable = protocol.onMessage(msg => {
                        if (isMessageOfType(msg, 1)) {
                            this._createExtHostInitData(isExtensionDevelopmentDebug).then(data => {
                                protocol.send(VSBuffer.fromString(JSON.stringify(data)));
                            });
                            return;
                        }
                        if (isMessageOfType(msg, 0)) {
                            clearTimeout(handle);
                            disposable.dispose();
                            this._protocol = protocol;
                            resolve(protocol);
                            return;
                        }
                        console.error(`received unexpected message during handshake phase from the extension host: `, msg);
                    });
                });
            });
        });
    }
    _onExtHostConnectionLost(reconnectionToken) {
        if (this._hasLostConnection) {
            return;
        }
        this._hasLostConnection = true;
        if (this._isExtensionDevHost && this._environmentService.debugExtensionHost.debugId) {
            this._extensionHostDebugService.close(this._environmentService.debugExtensionHost.debugId);
        }
        if (this._terminating) {
            return;
        }
        this._onExit.fire([0, reconnectionToken]);
    }
    async _createExtHostInitData(isExtensionDevelopmentDebug) {
        const remoteInitData = await this._initDataProvider.getInitData();
        this.extensions = remoteInitData.extensions;
        const workspace = this._contextService.getWorkspace();
        return {
            commit: this._productService.commit,
            version: this._productService.version,
            quality: this._productService.quality,
            parentPid: remoteInitData.pid,
            environment: {
                isExtensionDevelopmentDebug,
                appRoot: remoteInitData.appRoot,
                appName: this._productService.nameLong,
                appHost: this._productService.embedderIdentifier || 'desktop',
                appUriScheme: this._productService.urlProtocol,
                extensionTelemetryLogResource: this._environmentService.extHostTelemetryLogFile,
                isExtensionTelemetryLoggingOnly: isLoggingOnly(this._productService, this._environmentService),
                appLanguage: platform.language,
                extensionDevelopmentLocationURI: this._environmentService.extensionDevelopmentLocationURI,
                extensionTestsLocationURI: this._environmentService.extensionTestsLocationURI,
                globalStorageHome: remoteInitData.globalStorageHome,
                workspaceStorageHome: remoteInitData.workspaceStorageHome,
                extensionLogLevel: this._environmentService.extensionLogLevel
            },
            workspace: this._contextService.getWorkbenchState() === 1 ? null : {
                configuration: workspace.configuration,
                id: workspace.id,
                name: this._labelService.getWorkspaceLabel(workspace),
                transient: workspace.transient
            },
            remote: {
                isRemote: true,
                authority: this._initDataProvider.remoteAuthority,
                connectionData: remoteInitData.connectionData
            },
            consoleForward: {
                includeStack: false,
                logNative: Boolean(this._environmentService.debugExtensionHost.debugId)
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
            logsLocation: remoteInitData.extensionHostLogsPath,
            autoStart: (this.startup === 1),
            uiKind: platform.isWeb ? UIKind.Web : UIKind.Desktop
        };
    }
    getInspectPort() {
        return undefined;
    }
    enableInspectPort() {
        return Promise.resolve(false);
    }
    async disconnect() {
        if (this._protocol && !this._hasDisconnected) {
            this._protocol.send(createMessageOfType(2));
            this._protocol.sendDisconnect();
            this._hasDisconnected = true;
            await this._protocol.drain();
        }
    }
    dispose() {
        super.dispose();
        this._terminating = true;
        this.disconnect();
        if (this._protocol) {
            this._protocol.getSocket().end();
            this._protocol = null;
        }
    }
};
RemoteExtensionHost = __decorate([
    __param(2, IRemoteSocketFactoryService),
    __param(3, IWorkspaceContextService),
    __param(4, IWorkbenchEnvironmentService),
    __param(5, ITelemetryService),
    __param(6, ILogService),
    __param(7, ILoggerService),
    __param(8, ILabelService),
    __param(9, IRemoteAuthorityResolverService),
    __param(10, IExtensionHostDebugService),
    __param(11, IProductService),
    __param(12, ISignService),
    __metadata("design:paramtypes", [RemoteRunningLocation, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], RemoteExtensionHost);
export { RemoteExtensionHost };
