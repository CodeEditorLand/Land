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
import * as dom from '../../../../base/browser/dom.js';
import { parentOriginHash } from '../../../../base/browser/iframe.js';
import { mainWindow } from '../../../../base/browser/window.js';
import { Barrier } from '../../../../base/common/async.js';
import { VSBuffer } from '../../../../base/common/buffer.js';
import { canceled, onUnexpectedError } from '../../../../base/common/errors.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { Disposable, toDisposable } from '../../../../base/common/lifecycle.js';
import { COI, FileAccess } from '../../../../base/common/network.js';
import * as platform from '../../../../base/common/platform.js';
import { joinPath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { generateUuid } from '../../../../base/common/uuid.js';
import { getNLSLanguage, getNLSMessages } from '../../../../nls.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { ILayoutService } from '../../../../platform/layout/browser/layoutService.js';
import { ILogService, ILoggerService } from '../../../../platform/log/common/log.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { isLoggingOnly } from '../../../../platform/telemetry/common/telemetryUtils.js';
import { IUserDataProfilesService } from '../../../../platform/userDataProfile/common/userDataProfile.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IBrowserWorkbenchEnvironmentService } from '../../environment/browser/environmentService.js';
import { UIKind, createMessageOfType, isMessageOfType } from '../common/extensionHostProtocol.js';
import { LocalWebWorkerRunningLocation } from '../common/extensionRunningLocation.js';
let WebWorkerExtensionHost = class WebWorkerExtensionHost extends Disposable {
    constructor(runningLocation, startup, _initDataProvider, _telemetryService, _contextService, _labelService, _logService, _loggerService, _environmentService, _userDataProfilesService, _productService, _layoutService, _storageService) {
        super();
        this.runningLocation = runningLocation;
        this.startup = startup;
        this._initDataProvider = _initDataProvider;
        this._telemetryService = _telemetryService;
        this._contextService = _contextService;
        this._labelService = _labelService;
        this._logService = _logService;
        this._loggerService = _loggerService;
        this._environmentService = _environmentService;
        this._userDataProfilesService = _userDataProfilesService;
        this._productService = _productService;
        this._layoutService = _layoutService;
        this._storageService = _storageService;
        this.pid = null;
        this.remoteAuthority = null;
        this.extensions = null;
        this._onDidExit = this._register(new Emitter());
        this.onExit = this._onDidExit.event;
        this._isTerminating = false;
        this._protocolPromise = null;
        this._protocol = null;
        this._extensionHostLogsLocation = joinPath(this._environmentService.extHostLogsPath, 'webWorker');
    }
    async _getWebWorkerExtensionHostIframeSrc() {
        const suffixSearchParams = new URLSearchParams();
        if (this._environmentService.debugExtensionHost && this._environmentService.debugRenderer) {
            suffixSearchParams.set('debugged', '1');
        }
        COI.addSearchParam(suffixSearchParams, true, true);
        const suffix = `?${suffixSearchParams.toString()}`;
        const iframeModulePath = `vs/workbench/services/extensions/worker/webWorkerExtensionHostIframe.html`;
        if (platform.isWeb) {
            const webEndpointUrlTemplate = this._productService.webEndpointUrlTemplate;
            const commit = this._productService.commit;
            const quality = this._productService.quality;
            if (webEndpointUrlTemplate && commit && quality) {
                // Try to keep the web worker extension host iframe origin stable by storing it in workspace storage
                const key = 'webWorkerExtensionHostIframeStableOriginUUID';
                let stableOriginUUID = this._storageService.get(key, 1 /* StorageScope.WORKSPACE */);
                if (typeof stableOriginUUID === 'undefined') {
                    stableOriginUUID = generateUuid();
                    this._storageService.store(key, stableOriginUUID, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
                }
                const hash = await parentOriginHash(mainWindow.origin, stableOriginUUID);
                const baseUrl = (webEndpointUrlTemplate
                    .replace('{{uuid}}', `v--${hash}`) // using `v--` as a marker to require `parentOrigin`/`salt` verification
                    .replace('{{commit}}', commit)
                    .replace('{{quality}}', quality));
                const res = new URL(`${baseUrl}/out/${iframeModulePath}${suffix}`);
                res.searchParams.set('parentOrigin', mainWindow.origin);
                res.searchParams.set('salt', stableOriginUUID);
                return res.toString();
            }
            console.warn(`The web worker extension host is started in a same-origin iframe!`);
        }
        const relativeExtensionHostIframeSrc = FileAccess.asBrowserUri(iframeModulePath);
        return `${relativeExtensionHostIframeSrc.toString(true)}${suffix}`;
    }
    async start() {
        if (!this._protocolPromise) {
            this._protocolPromise = this._startInsideIframe();
            this._protocolPromise.then(protocol => this._protocol = protocol);
        }
        return this._protocolPromise;
    }
    async _startInsideIframe() {
        const webWorkerExtensionHostIframeSrc = await this._getWebWorkerExtensionHostIframeSrc();
        const emitter = this._register(new Emitter());
        const iframe = document.createElement('iframe');
        iframe.setAttribute('class', 'web-worker-ext-host-iframe');
        iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
        iframe.setAttribute('allow', 'usb; serial; hid; cross-origin-isolated;');
        iframe.setAttribute('aria-hidden', 'true');
        iframe.style.display = 'none';
        const vscodeWebWorkerExtHostId = generateUuid();
        iframe.setAttribute('src', `${webWorkerExtensionHostIframeSrc}&vscodeWebWorkerExtHostId=${vscodeWebWorkerExtHostId}`);
        const barrier = new Barrier();
        let port;
        let barrierError = null;
        let barrierHasError = false;
        let startTimeout = null;
        const rejectBarrier = (exitCode, error) => {
            barrierError = error;
            barrierHasError = true;
            onUnexpectedError(barrierError);
            clearTimeout(startTimeout);
            this._onDidExit.fire([81 /* ExtensionHostExitCode.UnexpectedError */, barrierError.message]);
            barrier.open();
        };
        const resolveBarrier = (messagePort) => {
            port = messagePort;
            clearTimeout(startTimeout);
            barrier.open();
        };
        startTimeout = setTimeout(() => {
            console.warn(`The Web Worker Extension Host did not start in 60s, that might be a problem.`);
        }, 60000);
        this._register(dom.addDisposableListener(mainWindow, 'message', (event) => {
            if (event.source !== iframe.contentWindow) {
                return;
            }
            if (event.data.vscodeWebWorkerExtHostId !== vscodeWebWorkerExtHostId) {
                return;
            }
            if (event.data.error) {
                const { name, message, stack } = event.data.error;
                const err = new Error();
                err.message = message;
                err.name = name;
                err.stack = stack;
                return rejectBarrier(81 /* ExtensionHostExitCode.UnexpectedError */, err);
            }
            if (event.data.type === 'vscode.bootstrap.nls') {
                iframe.contentWindow.postMessage({
                    type: event.data.type,
                    data: {
                        workerUrl: FileAccess.asBrowserUri('vs/workbench/api/worker/extensionHostWorkerMain.js').toString(true),
                        fileRoot: globalThis._VSCODE_FILE_ROOT,
                        nls: {
                            messages: getNLSMessages(),
                            language: getNLSLanguage()
                        }
                    }
                }, '*');
                return;
            }
            const { data } = event.data;
            if (barrier.isOpen() || !(data instanceof MessagePort)) {
                console.warn('UNEXPECTED message', event);
                const err = new Error('UNEXPECTED message');
                return rejectBarrier(81 /* ExtensionHostExitCode.UnexpectedError */, err);
            }
            resolveBarrier(data);
        }));
        this._layoutService.mainContainer.appendChild(iframe);
        this._register(toDisposable(() => iframe.remove()));
        // await MessagePort and use it to directly communicate
        // with the worker extension host
        await barrier.wait();
        if (barrierHasError) {
            throw barrierError;
        }
        // Send over message ports for extension API
        const messagePorts = this._environmentService.options?.messagePorts ?? new Map();
        iframe.contentWindow.postMessage({ type: 'vscode.init', data: messagePorts }, '*', [...messagePorts.values()]);
        port.onmessage = (event) => {
            const { data } = event;
            if (!(data instanceof ArrayBuffer)) {
                console.warn('UNKNOWN data received', data);
                this._onDidExit.fire([77, 'UNKNOWN data received']);
                return;
            }
            emitter.fire(VSBuffer.wrap(new Uint8Array(data, 0, data.byteLength)));
        };
        const protocol = {
            onMessage: emitter.event,
            send: vsbuf => {
                const data = vsbuf.buffer.buffer.slice(vsbuf.buffer.byteOffset, vsbuf.buffer.byteOffset + vsbuf.buffer.byteLength);
                port.postMessage(data, [data]);
            }
        };
        return this._performHandshake(protocol);
    }
    async _performHandshake(protocol) {
        // extension host handshake happens below
        // (1) <== wait for: Ready
        // (2) ==> send: init data
        // (3) <== wait for: Initialized
        await Event.toPromise(Event.filter(protocol.onMessage, msg => isMessageOfType(msg, 1 /* MessageType.Ready */)));
        if (this._isTerminating) {
            throw canceled();
        }
        protocol.send(VSBuffer.fromString(JSON.stringify(await this._createExtHostInitData())));
        if (this._isTerminating) {
            throw canceled();
        }
        await Event.toPromise(Event.filter(protocol.onMessage, msg => isMessageOfType(msg, 0 /* MessageType.Initialized */)));
        if (this._isTerminating) {
            throw canceled();
        }
        return protocol;
    }
    dispose() {
        if (this._isTerminating) {
            return;
        }
        this._isTerminating = true;
        this._protocol?.send(createMessageOfType(2 /* MessageType.Terminate */));
        super.dispose();
    }
    getInspectPort() {
        return undefined;
    }
    enableInspectPort() {
        return Promise.resolve(false);
    }
    async _createExtHostInitData() {
        const initData = await this._initDataProvider.getInitData();
        this.extensions = initData.extensions;
        const workspace = this._contextService.getWorkspace();
        const nlsBaseUrl = this._productService.extensionsGallery?.nlsBaseUrl;
        let nlsUrlWithDetails = undefined;
        // Only use the nlsBaseUrl if we are using a language other than the default, English.
        if (nlsBaseUrl && this._productService.commit && !platform.Language.isDefaultVariant()) {
            nlsUrlWithDetails = URI.joinPath(URI.parse(nlsBaseUrl), this._productService.commit, this._productService.version, platform.Language.value());
        }
        return {
            commit: this._productService.commit,
            version: this._productService.version,
            quality: this._productService.quality,
            parentPid: 0,
            environment: {
                isExtensionDevelopmentDebug: this._environmentService.debugRenderer,
                appName: this._productService.nameLong,
                appHost: this._productService.embedderIdentifier ?? (platform.isWeb ? 'web' : 'desktop'),
                appUriScheme: this._productService.urlProtocol,
                appLanguage: platform.language,
                extensionTelemetryLogResource: this._environmentService.extHostTelemetryLogFile,
                isExtensionTelemetryLoggingOnly: isLoggingOnly(this._productService, this._environmentService),
                extensionDevelopmentLocationURI: this._environmentService.extensionDevelopmentLocationURI,
                extensionTestsLocationURI: this._environmentService.extensionTestsLocationURI,
                globalStorageHome: this._userDataProfilesService.defaultProfile.globalStorageHome,
                workspaceStorageHome: this._environmentService.workspaceStorageHome,
                extensionLogLevel: this._environmentService.extensionLogLevel
            },
            workspace: this._contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */ ? undefined : {
                configuration: workspace.configuration || undefined,
                id: workspace.id,
                name: this._labelService.getWorkspaceLabel(workspace),
                transient: workspace.transient
            },
            consoleForward: {
                includeStack: false,
                logNative: this._environmentService.debugRenderer
            },
            extensions: this.extensions.toSnapshot(),
            nlsBaseUrl: nlsUrlWithDetails,
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
            logsLocation: this._extensionHostLogsLocation,
            autoStart: (this.startup === 1 /* ExtensionHostStartup.EagerAutoStart */),
            remote: {
                authority: this._environmentService.remoteAuthority,
                connectionData: null,
                isRemote: false
            },
            uiKind: platform.isWeb ? UIKind.Web : UIKind.Desktop
        };
    }
};
WebWorkerExtensionHost = __decorate([
    __param(3, ITelemetryService),
    __param(4, IWorkspaceContextService),
    __param(5, ILabelService),
    __param(6, ILogService),
    __param(7, ILoggerService),
    __param(8, IBrowserWorkbenchEnvironmentService),
    __param(9, IUserDataProfilesService),
    __param(10, IProductService),
    __param(11, ILayoutService),
    __param(12, IStorageService),
    __metadata("design:paramtypes", [LocalWebWorkerRunningLocation, Number, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], WebWorkerExtensionHost);
export { WebWorkerExtensionHost };
