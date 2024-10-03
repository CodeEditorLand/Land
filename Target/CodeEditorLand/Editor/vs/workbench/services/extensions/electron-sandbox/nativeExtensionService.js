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
var NativeExtensionHostKindPicker_1;
import { runWhenWindowIdle } from '../../../../base/browser/dom.js';
import { mainWindow } from '../../../../base/browser/window.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Schemas } from '../../../../base/common/network.js';
import * as performance from '../../../../base/common/performance.js';
import { isCI } from '../../../../base/common/platform.js';
import * as nls from '../../../../nls.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IExtensionGalleryService } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';
import { INotificationService, NotificationPriority, Severity } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IRemoteAuthorityResolverService, RemoteAuthorityResolverError, getRemoteAuthorityPrefix } from '../../../../platform/remote/common/remoteAuthorityResolver.js';
import { IRemoteExtensionsScannerService } from '../../../../platform/remote/common/remoteExtensionsScanner.js';
import { getRemoteName, parseAuthorityWithPort } from '../../../../platform/remote/common/remoteHosts.js';
import { updateProxyConfigurationsScope } from '../../../../platform/request/common/request.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IWorkspaceTrustManagementService } from '../../../../platform/workspace/common/workspaceTrust.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { IWorkbenchExtensionEnablementService, IWorkbenchExtensionManagementService } from '../../extensionManagement/common/extensionManagement.js';
import { WebWorkerExtensionHost } from '../browser/webWorkerExtensionHost.js';
import { AbstractExtensionService, ExtensionHostCrashTracker, ResolvedExtensions, checkEnabledAndProposedAPI, extensionIsEnabled } from '../common/abstractExtensionService.js';
import { parseExtensionDevOptions } from '../common/extensionDevOptions.js';
import { extensionHostKindToString, extensionRunningPreferenceToString } from '../common/extensionHostKind.js';
import { IExtensionManifestPropertiesService } from '../common/extensionManifestPropertiesService.js';
import { filterExtensionDescriptions } from '../common/extensionRunningLocationTracker.js';
import { ExtensionHostExtensions, IExtensionService, toExtension, webWorkerExtHostConfig } from '../common/extensions.js';
import { ExtensionsProposedApi } from '../common/extensionsProposedApi.js';
import { RemoteExtensionHost } from '../common/remoteExtensionHost.js';
import { CachedExtensionScanner } from './cachedExtensionScanner.js';
import { NativeLocalProcessExtensionHost } from './localProcessExtensionHost.js';
import { IHostService } from '../../host/browser/host.js';
import { ILifecycleService } from '../../lifecycle/common/lifecycle.js';
import { IRemoteAgentService } from '../../remote/common/remoteAgentService.js';
import { IRemoteExplorerService } from '../../remote/common/remoteExplorerService.js';
let NativeExtensionService = class NativeExtensionService extends AbstractExtensionService {
    constructor(instantiationService, notificationService, environmentService, telemetryService, extensionEnablementService, fileService, productService, extensionManagementService, contextService, configurationService, extensionManifestPropertiesService, logService, remoteAgentService, remoteExtensionsScannerService, lifecycleService, remoteAuthorityResolverService, _nativeHostService, _hostService, _remoteExplorerService, _extensionGalleryService, _workspaceTrustManagementService, dialogService) {
        const extensionsProposedApi = instantiationService.createInstance(ExtensionsProposedApi);
        const extensionScanner = instantiationService.createInstance(CachedExtensionScanner);
        const extensionHostFactory = new NativeExtensionHostFactory(extensionsProposedApi, extensionScanner, () => this._getExtensionRegistrySnapshotWhenReady(), instantiationService, environmentService, extensionEnablementService, configurationService, remoteAgentService, remoteAuthorityResolverService, logService);
        super(extensionsProposedApi, extensionHostFactory, new NativeExtensionHostKindPicker(environmentService, configurationService, logService), instantiationService, notificationService, environmentService, telemetryService, extensionEnablementService, fileService, productService, extensionManagementService, contextService, configurationService, extensionManifestPropertiesService, logService, remoteAgentService, remoteExtensionsScannerService, lifecycleService, remoteAuthorityResolverService, dialogService);
        this._nativeHostService = _nativeHostService;
        this._hostService = _hostService;
        this._remoteExplorerService = _remoteExplorerService;
        this._extensionGalleryService = _extensionGalleryService;
        this._workspaceTrustManagementService = _workspaceTrustManagementService;
        this._localCrashTracker = new ExtensionHostCrashTracker();
        this._extensionScanner = extensionScanner;
        lifecycleService.when(2).then(() => {
            runWhenWindowIdle(mainWindow, () => {
                this._initialize();
            }, 50);
        });
    }
    async _scanAllLocalExtensions() {
        return this._extensionScanner.scannedExtensions;
    }
    _onExtensionHostCrashed(extensionHost, code, signal) {
        const activatedExtensions = [];
        const extensionsStatus = this.getExtensionsStatus();
        for (const key of Object.keys(extensionsStatus)) {
            const extensionStatus = extensionsStatus[key];
            if (extensionStatus.activationStarted && extensionHost.containsExtension(extensionStatus.id)) {
                activatedExtensions.push(extensionStatus.id);
            }
        }
        super._onExtensionHostCrashed(extensionHost, code, signal);
        if (extensionHost.kind === 1) {
            if (code === 55) {
                this._notificationService.prompt(Severity.Error, nls.localize('extensionService.versionMismatchCrash', "Extension host cannot start: version mismatch."), [{
                        label: nls.localize('relaunch', "Relaunch VS Code"),
                        run: () => {
                            this._instantiationService.invokeFunction((accessor) => {
                                const hostService = accessor.get(IHostService);
                                hostService.restart();
                            });
                        }
                    }]);
                return;
            }
            this._logExtensionHostCrash(extensionHost);
            this._sendExtensionHostCrashTelemetry(code, signal, activatedExtensions);
            this._localCrashTracker.registerCrash();
            if (this._localCrashTracker.shouldAutomaticallyRestart()) {
                this._logService.info(`Automatically restarting the extension host.`);
                this._notificationService.status(nls.localize('extensionService.autoRestart', "The extension host terminated unexpectedly. Restarting..."), { hideAfter: 5000 });
                this.startExtensionHosts();
            }
            else {
                const choices = [];
                if (this._environmentService.isBuilt) {
                    choices.push({
                        label: nls.localize('startBisect', "Start Extension Bisect"),
                        run: () => {
                            this._instantiationService.invokeFunction(accessor => {
                                const commandService = accessor.get(ICommandService);
                                commandService.executeCommand('extension.bisect.start');
                            });
                        }
                    });
                }
                else {
                    choices.push({
                        label: nls.localize('devTools', "Open Developer Tools"),
                        run: () => this._nativeHostService.openDevTools()
                    });
                }
                choices.push({
                    label: nls.localize('restart', "Restart Extension Host"),
                    run: () => this.startExtensionHosts()
                });
                if (this._environmentService.isBuilt) {
                    choices.push({
                        label: nls.localize('learnMore', "Learn More"),
                        run: () => {
                            this._instantiationService.invokeFunction(accessor => {
                                const openerService = accessor.get(IOpenerService);
                                openerService.open('https://aka.ms/vscode-extension-bisect');
                            });
                        }
                    });
                }
                this._notificationService.prompt(Severity.Error, nls.localize('extensionService.crash', "Extension host terminated unexpectedly 3 times within the last 5 minutes."), choices);
            }
        }
    }
    _sendExtensionHostCrashTelemetry(code, signal, activatedExtensions) {
        this._telemetryService.publicLog2('extensionHostCrash', {
            code,
            signal,
            extensionIds: activatedExtensions.map(e => e.value)
        });
        for (const extensionId of activatedExtensions) {
            this._telemetryService.publicLog2('extensionHostCrashExtension', {
                code,
                signal,
                extensionId: extensionId.value
            });
        }
    }
    async _resolveAuthority(remoteAuthority) {
        const authorityPlusIndex = remoteAuthority.indexOf('+');
        if (authorityPlusIndex === -1) {
            const { host, port } = parseAuthorityWithPort(remoteAuthority);
            return {
                authority: {
                    authority: remoteAuthority,
                    connectTo: {
                        type: 0,
                        host,
                        port
                    },
                    connectionToken: undefined
                }
            };
        }
        return this._resolveAuthorityOnExtensionHosts(1, remoteAuthority);
    }
    async _getCanonicalURI(remoteAuthority, uri) {
        const authorityPlusIndex = remoteAuthority.indexOf('+');
        if (authorityPlusIndex === -1) {
            return uri;
        }
        const localProcessExtensionHosts = this._getExtensionHostManagers(1);
        if (localProcessExtensionHosts.length === 0) {
            throw new Error(`Cannot resolve canonical URI`);
        }
        const results = await Promise.all(localProcessExtensionHosts.map(extHost => extHost.getCanonicalURI(remoteAuthority, uri)));
        for (const result of results) {
            if (result) {
                return result;
            }
        }
        throw new Error(`Cannot get canonical URI because no extension is installed to resolve ${getRemoteAuthorityPrefix(remoteAuthority)}`);
    }
    async _resolveExtensions() {
        this._extensionScanner.startScanningExtensions();
        const remoteAuthority = this._environmentService.remoteAuthority;
        let remoteEnv = null;
        let remoteExtensions = [];
        if (remoteAuthority) {
            this._remoteAuthorityResolverService._setCanonicalURIProvider(async (uri) => {
                if (uri.scheme !== Schemas.vscodeRemote || uri.authority !== remoteAuthority) {
                    return uri;
                }
                performance.mark(`code/willGetCanonicalURI/${getRemoteAuthorityPrefix(remoteAuthority)}`);
                if (isCI) {
                    this._logService.info(`Invoking getCanonicalURI for authority ${getRemoteAuthorityPrefix(remoteAuthority)}...`);
                }
                try {
                    return this._getCanonicalURI(remoteAuthority, uri);
                }
                finally {
                    performance.mark(`code/didGetCanonicalURI/${getRemoteAuthorityPrefix(remoteAuthority)}`);
                    if (isCI) {
                        this._logService.info(`getCanonicalURI returned for authority ${getRemoteAuthorityPrefix(remoteAuthority)}.`);
                    }
                }
            });
            if (isCI) {
                this._logService.info(`Starting to wait on IWorkspaceTrustManagementService.workspaceResolved...`);
            }
            await this._workspaceTrustManagementService.workspaceResolved;
            if (isCI) {
                this._logService.info(`Finished waiting on IWorkspaceTrustManagementService.workspaceResolved.`);
            }
            let resolverResult;
            try {
                resolverResult = await this._resolveAuthorityInitial(remoteAuthority);
            }
            catch (err) {
                if (RemoteAuthorityResolverError.isNoResolverFound(err)) {
                    err.isHandled = await this._handleNoResolverFound(remoteAuthority);
                }
                else {
                    if (RemoteAuthorityResolverError.isHandled(err)) {
                        console.log(`Error handled: Not showing a notification for the error`);
                    }
                }
                this._remoteAuthorityResolverService._setResolvedAuthorityError(remoteAuthority, err);
                return this._startLocalExtensionHost();
            }
            this._remoteAuthorityResolverService._setResolvedAuthority(resolverResult.authority, resolverResult.options);
            this._remoteExplorerService.setTunnelInformation(resolverResult.tunnelInformation);
            const connection = this._remoteAgentService.getConnection();
            if (connection) {
                connection.onDidStateChange(async (e) => {
                    if (e.type === 0) {
                        this._remoteAuthorityResolverService._clearResolvedAuthority(remoteAuthority);
                    }
                });
                connection.onReconnecting(() => this._resolveAuthorityAgain());
            }
            [remoteEnv, remoteExtensions] = await Promise.all([
                this._remoteAgentService.getEnvironment(),
                this._remoteExtensionsScannerService.scanExtensions()
            ]);
            if (!remoteEnv) {
                this._notificationService.notify({ severity: Severity.Error, message: nls.localize('getEnvironmentFailure', "Could not fetch remote environment") });
                return this._startLocalExtensionHost();
            }
            updateProxyConfigurationsScope(remoteEnv.useHostProxy ? 1 : 2);
        }
        else {
            this._remoteAuthorityResolverService._setCanonicalURIProvider(async (uri) => uri);
        }
        return this._startLocalExtensionHost(remoteExtensions);
    }
    async _startLocalExtensionHost(remoteExtensions = []) {
        await this._workspaceTrustManagementService.workspaceTrustInitialized;
        return new ResolvedExtensions(await this._scanAllLocalExtensions(), remoteExtensions, true, false);
    }
    async _onExtensionHostExit(code) {
        await this._doStopExtensionHosts();
        const connection = this._remoteAgentService.getConnection();
        connection?.dispose();
        if (parseExtensionDevOptions(this._environmentService).isExtensionDevTestFromCli) {
            if (isCI) {
                this._logService.info(`Asking native host service to exit with code ${code}.`);
            }
            this._nativeHostService.exit(code);
        }
        else {
            this._nativeHostService.closeWindow();
        }
    }
    async _handleNoResolverFound(remoteAuthority) {
        const remoteName = getRemoteName(remoteAuthority);
        const recommendation = this._productService.remoteExtensionTips?.[remoteName];
        if (!recommendation) {
            return false;
        }
        const sendTelemetry = (userReaction) => {
            this._telemetryService.publicLog('remoteExtensionRecommendations:popup', { userReaction, extensionId: resolverExtensionId });
        };
        const resolverExtensionId = recommendation.extensionId;
        const allExtensions = await this._scanAllLocalExtensions();
        const extension = allExtensions.filter(e => e.identifier.value === resolverExtensionId)[0];
        if (extension) {
            if (!extensionIsEnabled(this._logService, this._extensionEnablementService, extension, false)) {
                const message = nls.localize('enableResolver', "Extension '{0}' is required to open the remote window.\nOK to enable?", recommendation.friendlyName);
                this._notificationService.prompt(Severity.Info, message, [{
                        label: nls.localize('enable', 'Enable and Reload'),
                        run: async () => {
                            sendTelemetry('enable');
                            await this._extensionEnablementService.setEnablement([toExtension(extension)], 9);
                            await this._hostService.reload();
                        }
                    }], {
                    sticky: true,
                    priority: NotificationPriority.URGENT
                });
            }
        }
        else {
            const message = nls.localize('installResolver', "Extension '{0}' is required to open the remote window.\nDo you want to install the extension?", recommendation.friendlyName);
            this._notificationService.prompt(Severity.Info, message, [{
                    label: nls.localize('install', 'Install and Reload'),
                    run: async () => {
                        sendTelemetry('install');
                        const [galleryExtension] = await this._extensionGalleryService.getExtensions([{ id: resolverExtensionId }], CancellationToken.None);
                        if (galleryExtension) {
                            await this._extensionManagementService.installFromGallery(galleryExtension);
                            await this._hostService.reload();
                        }
                        else {
                            this._notificationService.error(nls.localize('resolverExtensionNotFound', "`{0}` not found on marketplace"));
                        }
                    }
                }], {
                sticky: true,
                priority: NotificationPriority.URGENT,
                onCancel: () => sendTelemetry('cancel')
            });
        }
        return true;
    }
};
NativeExtensionService = __decorate([
    __param(0, IInstantiationService),
    __param(1, INotificationService),
    __param(2, IWorkbenchEnvironmentService),
    __param(3, ITelemetryService),
    __param(4, IWorkbenchExtensionEnablementService),
    __param(5, IFileService),
    __param(6, IProductService),
    __param(7, IWorkbenchExtensionManagementService),
    __param(8, IWorkspaceContextService),
    __param(9, IConfigurationService),
    __param(10, IExtensionManifestPropertiesService),
    __param(11, ILogService),
    __param(12, IRemoteAgentService),
    __param(13, IRemoteExtensionsScannerService),
    __param(14, ILifecycleService),
    __param(15, IRemoteAuthorityResolverService),
    __param(16, INativeHostService),
    __param(17, IHostService),
    __param(18, IRemoteExplorerService),
    __param(19, IExtensionGalleryService),
    __param(20, IWorkspaceTrustManagementService),
    __param(21, IDialogService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], NativeExtensionService);
export { NativeExtensionService };
let NativeExtensionHostFactory = class NativeExtensionHostFactory {
    constructor(_extensionsProposedApi, _extensionScanner, _getExtensionRegistrySnapshotWhenReady, _instantiationService, environmentService, _extensionEnablementService, configurationService, _remoteAgentService, _remoteAuthorityResolverService, _logService) {
        this._extensionsProposedApi = _extensionsProposedApi;
        this._extensionScanner = _extensionScanner;
        this._getExtensionRegistrySnapshotWhenReady = _getExtensionRegistrySnapshotWhenReady;
        this._instantiationService = _instantiationService;
        this._extensionEnablementService = _extensionEnablementService;
        this._remoteAgentService = _remoteAgentService;
        this._remoteAuthorityResolverService = _remoteAuthorityResolverService;
        this._logService = _logService;
        this._webWorkerExtHostEnablement = determineLocalWebWorkerExtHostEnablement(environmentService, configurationService);
    }
    createExtensionHost(runningLocations, runningLocation, isInitialStart) {
        switch (runningLocation.kind) {
            case 1: {
                const startup = (isInitialStart
                    ? 2
                    : 1);
                return this._instantiationService.createInstance(NativeLocalProcessExtensionHost, runningLocation, startup, this._createLocalProcessExtensionHostDataProvider(runningLocations, isInitialStart, runningLocation));
            }
            case 2: {
                if (this._webWorkerExtHostEnablement !== 0) {
                    const startup = (isInitialStart
                        ? (this._webWorkerExtHostEnablement === 2 ? 3 : 2)
                        : 1);
                    return this._instantiationService.createInstance(WebWorkerExtensionHost, runningLocation, startup, this._createWebWorkerExtensionHostDataProvider(runningLocations, runningLocation));
                }
                return null;
            }
            case 3: {
                const remoteAgentConnection = this._remoteAgentService.getConnection();
                if (remoteAgentConnection) {
                    return this._instantiationService.createInstance(RemoteExtensionHost, runningLocation, this._createRemoteExtensionHostDataProvider(runningLocations, remoteAgentConnection.remoteAuthority));
                }
                return null;
            }
        }
    }
    _createLocalProcessExtensionHostDataProvider(runningLocations, isInitialStart, desiredRunningLocation) {
        return {
            getInitData: async () => {
                if (isInitialStart) {
                    const scannedExtensions = await this._extensionScanner.scannedExtensions;
                    if (isCI) {
                        this._logService.info(`NativeExtensionHostFactory._createLocalProcessExtensionHostDataProvider.scannedExtensions: ${scannedExtensions.map(ext => ext.identifier.value).join(',')}`);
                    }
                    const localExtensions = checkEnabledAndProposedAPI(this._logService, this._extensionEnablementService, this._extensionsProposedApi, scannedExtensions, true);
                    if (isCI) {
                        this._logService.info(`NativeExtensionHostFactory._createLocalProcessExtensionHostDataProvider.localExtensions: ${localExtensions.map(ext => ext.identifier.value).join(',')}`);
                    }
                    const runningLocation = runningLocations.computeRunningLocation(localExtensions, [], false);
                    const myExtensions = filterExtensionDescriptions(localExtensions, runningLocation, extRunningLocation => desiredRunningLocation.equals(extRunningLocation));
                    const extensions = new ExtensionHostExtensions(0, localExtensions, myExtensions.map(extension => extension.identifier));
                    if (isCI) {
                        this._logService.info(`NativeExtensionHostFactory._createLocalProcessExtensionHostDataProvider.myExtensions: ${myExtensions.map(ext => ext.identifier.value).join(',')}`);
                    }
                    return { extensions };
                }
                else {
                    const snapshot = await this._getExtensionRegistrySnapshotWhenReady();
                    const myExtensions = runningLocations.filterByRunningLocation(snapshot.extensions, desiredRunningLocation);
                    const extensions = new ExtensionHostExtensions(snapshot.versionId, snapshot.extensions, myExtensions.map(extension => extension.identifier));
                    return { extensions };
                }
            }
        };
    }
    _createWebWorkerExtensionHostDataProvider(runningLocations, desiredRunningLocation) {
        return {
            getInitData: async () => {
                const snapshot = await this._getExtensionRegistrySnapshotWhenReady();
                const myExtensions = runningLocations.filterByRunningLocation(snapshot.extensions, desiredRunningLocation);
                const extensions = new ExtensionHostExtensions(snapshot.versionId, snapshot.extensions, myExtensions.map(extension => extension.identifier));
                return { extensions };
            }
        };
    }
    _createRemoteExtensionHostDataProvider(runningLocations, remoteAuthority) {
        return {
            remoteAuthority: remoteAuthority,
            getInitData: async () => {
                const snapshot = await this._getExtensionRegistrySnapshotWhenReady();
                const remoteEnv = await this._remoteAgentService.getEnvironment();
                if (!remoteEnv) {
                    throw new Error('Cannot provide init data for remote extension host!');
                }
                const myExtensions = runningLocations.filterByExtensionHostKind(snapshot.extensions, 3);
                const extensions = new ExtensionHostExtensions(snapshot.versionId, snapshot.extensions, myExtensions.map(extension => extension.identifier));
                return {
                    connectionData: this._remoteAuthorityResolverService.getConnectionData(remoteAuthority),
                    pid: remoteEnv.pid,
                    appRoot: remoteEnv.appRoot,
                    extensionHostLogsPath: remoteEnv.extensionHostLogsPath,
                    globalStorageHome: remoteEnv.globalStorageHome,
                    workspaceStorageHome: remoteEnv.workspaceStorageHome,
                    extensions,
                };
            }
        };
    }
};
NativeExtensionHostFactory = __decorate([
    __param(3, IInstantiationService),
    __param(4, IWorkbenchEnvironmentService),
    __param(5, IWorkbenchExtensionEnablementService),
    __param(6, IConfigurationService),
    __param(7, IRemoteAgentService),
    __param(8, IRemoteAuthorityResolverService),
    __param(9, ILogService),
    __metadata("design:paramtypes", [ExtensionsProposedApi,
        CachedExtensionScanner, Function, Object, Object, Object, Object, Object, Object, Object])
], NativeExtensionHostFactory);
function determineLocalWebWorkerExtHostEnablement(environmentService, configurationService) {
    if (environmentService.isExtensionDevelopment && environmentService.extensionDevelopmentKind?.some(k => k === 'web')) {
        return 1;
    }
    else {
        const config = configurationService.getValue(webWorkerExtHostConfig);
        if (config === true) {
            return 1;
        }
        else if (config === 'auto') {
            return 2;
        }
        else {
            return 0;
        }
    }
}
let NativeExtensionHostKindPicker = NativeExtensionHostKindPicker_1 = class NativeExtensionHostKindPicker {
    constructor(environmentService, configurationService, _logService) {
        this._logService = _logService;
        this._hasRemoteExtHost = Boolean(environmentService.remoteAuthority);
        const webWorkerExtHostEnablement = determineLocalWebWorkerExtHostEnablement(environmentService, configurationService);
        this._hasWebWorkerExtHost = (webWorkerExtHostEnablement !== 0);
    }
    pickExtensionHostKind(extensionId, extensionKinds, isInstalledLocally, isInstalledRemotely, preference) {
        const result = NativeExtensionHostKindPicker_1.pickExtensionHostKind(extensionKinds, isInstalledLocally, isInstalledRemotely, preference, this._hasRemoteExtHost, this._hasWebWorkerExtHost);
        this._logService.trace(`pickRunningLocation for ${extensionId.value}, extension kinds: [${extensionKinds.join(', ')}], isInstalledLocally: ${isInstalledLocally}, isInstalledRemotely: ${isInstalledRemotely}, preference: ${extensionRunningPreferenceToString(preference)} => ${extensionHostKindToString(result)}`);
        return result;
    }
    static pickExtensionHostKind(extensionKinds, isInstalledLocally, isInstalledRemotely, preference, hasRemoteExtHost, hasWebWorkerExtHost) {
        const result = [];
        for (const extensionKind of extensionKinds) {
            if (extensionKind === 'ui' && isInstalledLocally) {
                if (preference === 0 || preference === 1) {
                    return 1;
                }
                else {
                    result.push(1);
                }
            }
            if (extensionKind === 'workspace' && isInstalledRemotely) {
                if (preference === 0 || preference === 2) {
                    return 3;
                }
                else {
                    result.push(3);
                }
            }
            if (extensionKind === 'workspace' && !hasRemoteExtHost) {
                if (preference === 0 || preference === 1) {
                    return 1;
                }
                else {
                    result.push(1);
                }
            }
            if (extensionKind === 'web' && isInstalledLocally && hasWebWorkerExtHost) {
                if (preference === 0 || preference === 1) {
                    return 2;
                }
                else {
                    result.push(2);
                }
            }
        }
        return (result.length > 0 ? result[0] : null);
    }
};
NativeExtensionHostKindPicker = NativeExtensionHostKindPicker_1 = __decorate([
    __param(0, IWorkbenchEnvironmentService),
    __param(1, IConfigurationService),
    __param(2, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object])
], NativeExtensionHostKindPicker);
export { NativeExtensionHostKindPicker };
class RestartExtensionHostAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.restartExtensionHost',
            title: nls.localize2('restartExtensionHost', "Restart Extension Host"),
            category: Categories.Developer,
            f1: true
        });
    }
    async run(accessor) {
        const extensionService = accessor.get(IExtensionService);
        const stopped = await extensionService.stopExtensionHosts(nls.localize('restartExtensionHost.reason', "Restarting extension host on explicit request."));
        if (stopped) {
            extensionService.startExtensionHosts();
        }
    }
}
registerAction2(RestartExtensionHostAction);
registerSingleton(IExtensionService, NativeExtensionService, 0);
