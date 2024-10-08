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
import { Schemas } from '../../../../base/common/network.js';
import { joinPath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { IEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { memoize } from '../../../../base/common/decorators.js';
import { onUnexpectedError } from '../../../../base/common/errors.js';
import { parseLineAndColumnAware } from '../../../../base/common/extpath.js';
import { LogLevelToString } from '../../../../platform/log/common/log.js';
import { isUndefined } from '../../../../base/common/types.js';
import { refineServiceDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { EXTENSION_IDENTIFIER_WITH_LOG_REGEX } from '../../../../platform/environment/common/environmentService.js';
export const IBrowserWorkbenchEnvironmentService = refineServiceDecorator(IEnvironmentService);
export class BrowserWorkbenchEnvironmentService {
    get remoteAuthority() { return this.options.remoteAuthority; }
    get expectsResolverExtension() {
        return !!this.options.remoteAuthority?.includes('+') && !this.options.webSocketFactory;
    }
    get isBuilt() { return !!this.productService.commit; }
    get logLevel() {
        const logLevelFromPayload = this.payload?.get('logLevel');
        if (logLevelFromPayload) {
            return logLevelFromPayload.split(',').find(entry => !EXTENSION_IDENTIFIER_WITH_LOG_REGEX.test(entry));
        }
        return this.options.developmentOptions?.logLevel !== undefined ? LogLevelToString(this.options.developmentOptions?.logLevel) : undefined;
    }
    get extensionLogLevel() {
        const logLevelFromPayload = this.payload?.get('logLevel');
        if (logLevelFromPayload) {
            const result = [];
            for (const entry of logLevelFromPayload.split(',')) {
                const matches = EXTENSION_IDENTIFIER_WITH_LOG_REGEX.exec(entry);
                if (matches && matches[1] && matches[2]) {
                    result.push([matches[1], matches[2]]);
                }
            }
            return result.length ? result : undefined;
        }
        return this.options.developmentOptions?.extensionLogLevel !== undefined ? this.options.developmentOptions?.extensionLogLevel.map(([extension, logLevel]) => ([extension, LogLevelToString(logLevel)])) : undefined;
    }
    get profDurationMarkers() {
        const profDurationMarkersFromPayload = this.payload?.get('profDurationMarkers');
        if (profDurationMarkersFromPayload) {
            const result = [];
            for (const entry of profDurationMarkersFromPayload.split(',')) {
                result.push(entry);
            }
            return result.length === 2 ? result : undefined;
        }
        return undefined;
    }
    get windowLogsPath() { return this.logsHome; }
    get logFile() { return joinPath(this.windowLogsPath, 'window.log'); }
    get userRoamingDataHome() { return URI.file('/User').with({ scheme: Schemas.vscodeUserData }); }
    get argvResource() { return joinPath(this.userRoamingDataHome, 'argv.json'); }
    get cacheHome() { return joinPath(this.userRoamingDataHome, 'caches'); }
    get workspaceStorageHome() { return joinPath(this.userRoamingDataHome, 'workspaceStorage'); }
    get localHistoryHome() { return joinPath(this.userRoamingDataHome, 'History'); }
    get stateResource() { return joinPath(this.userRoamingDataHome, 'State', 'storage.json'); }
    /**
     * In Web every workspace can potentially have scoped user-data
     * and/or extensions and if Sync state is shared then it can make
     * Sync error prone - say removing extensions from another workspace.
     * Hence scope Sync state per workspace. Sync scoped to a workspace
     * is capable of handling opening same workspace in multiple windows.
     */
    get userDataSyncHome() { return joinPath(this.userRoamingDataHome, 'sync', this.workspaceId); }
    get sync() { return undefined; }
    get keyboardLayoutResource() { return joinPath(this.userRoamingDataHome, 'keyboardLayout.json'); }
    get untitledWorkspacesHome() { return joinPath(this.userRoamingDataHome, 'Workspaces'); }
    get serviceMachineIdResource() { return joinPath(this.userRoamingDataHome, 'machineid'); }
    get extHostLogsPath() { return joinPath(this.logsHome, 'exthost'); }
    get extHostTelemetryLogFile() {
        return joinPath(this.extHostLogsPath, 'extensionTelemetry.log');
    }
    get debugExtensionHost() {
        if (!this.extensionHostDebugEnvironment) {
            this.extensionHostDebugEnvironment = this.resolveExtensionHostDebugEnvironment();
        }
        return this.extensionHostDebugEnvironment.params;
    }
    get isExtensionDevelopment() {
        if (!this.extensionHostDebugEnvironment) {
            this.extensionHostDebugEnvironment = this.resolveExtensionHostDebugEnvironment();
        }
        return this.extensionHostDebugEnvironment.isExtensionDevelopment;
    }
    get extensionDevelopmentLocationURI() {
        if (!this.extensionHostDebugEnvironment) {
            this.extensionHostDebugEnvironment = this.resolveExtensionHostDebugEnvironment();
        }
        return this.extensionHostDebugEnvironment.extensionDevelopmentLocationURI;
    }
    get extensionDevelopmentLocationKind() {
        if (!this.extensionHostDebugEnvironment) {
            this.extensionHostDebugEnvironment = this.resolveExtensionHostDebugEnvironment();
        }
        return this.extensionHostDebugEnvironment.extensionDevelopmentKind;
    }
    get extensionTestsLocationURI() {
        if (!this.extensionHostDebugEnvironment) {
            this.extensionHostDebugEnvironment = this.resolveExtensionHostDebugEnvironment();
        }
        return this.extensionHostDebugEnvironment.extensionTestsLocationURI;
    }
    get extensionEnabledProposedApi() {
        if (!this.extensionHostDebugEnvironment) {
            this.extensionHostDebugEnvironment = this.resolveExtensionHostDebugEnvironment();
        }
        return this.extensionHostDebugEnvironment.extensionEnabledProposedApi;
    }
    get debugRenderer() {
        if (!this.extensionHostDebugEnvironment) {
            this.extensionHostDebugEnvironment = this.resolveExtensionHostDebugEnvironment();
        }
        return this.extensionHostDebugEnvironment.debugRenderer;
    }
    get enableSmokeTestDriver() { return this.options.developmentOptions?.enableSmokeTestDriver; }
    get disableExtensions() { return this.payload?.get('disableExtensions') === 'true'; }
    get enableExtensions() { return this.options.enabledExtensions; }
    get webviewExternalEndpoint() {
        const endpoint = this.options.webviewEndpoint
            || this.productService.webviewContentExternalBaseUrlTemplate
            || 'https://{{uuid}}.vscode-cdn.net/{{quality}}/{{commit}}/out/vs/workbench/contrib/webview/browser/pre/';
        const webviewExternalEndpointCommit = this.payload?.get('webviewExternalEndpointCommit');
        return endpoint
            .replace('{{commit}}', webviewExternalEndpointCommit ?? this.productService.commit ?? 'ef65ac1ba57f57f2a3961bfe94aa20481caca4c6')
            .replace('{{quality}}', (webviewExternalEndpointCommit ? 'insider' : this.productService.quality) ?? 'insider');
    }
    get extensionTelemetryLogResource() { return joinPath(this.logsHome, 'extensionTelemetry.log'); }
    get disableTelemetry() { return false; }
    get verbose() { return this.payload?.get('verbose') === 'true'; }
    get logExtensionHostCommunication() { return this.payload?.get('logExtensionHostCommunication') === 'true'; }
    get skipReleaseNotes() { return this.payload?.get('skipReleaseNotes') === 'true'; }
    get skipWelcome() { return this.payload?.get('skipWelcome') === 'true'; }
    get disableWorkspaceTrust() { return !this.options.enableWorkspaceTrust; }
    get profile() { return this.payload?.get('profile'); }
    constructor(workspaceId, logsHome, options, productService) {
        this.workspaceId = workspaceId;
        this.logsHome = logsHome;
        this.options = options;
        this.productService = productService;
        this.extensionHostDebugEnvironment = undefined;
        this.editSessionId = this.options.editSessionId;
        if (options.workspaceProvider && Array.isArray(options.workspaceProvider.payload)) {
            try {
                this.payload = new Map(options.workspaceProvider.payload);
            }
            catch (error) {
                onUnexpectedError(error); // possible invalid payload for map
            }
        }
    }
    resolveExtensionHostDebugEnvironment() {
        const extensionHostDebugEnvironment = {
            params: {
                port: null,
                break: false
            },
            debugRenderer: false,
            isExtensionDevelopment: false,
            extensionDevelopmentLocationURI: undefined,
            extensionDevelopmentKind: undefined
        };
        // Fill in selected extra environmental properties
        if (this.payload) {
            for (const [key, value] of this.payload) {
                switch (key) {
                    case 'extensionDevelopmentPath':
                        if (!extensionHostDebugEnvironment.extensionDevelopmentLocationURI) {
                            extensionHostDebugEnvironment.extensionDevelopmentLocationURI = [];
                        }
                        extensionHostDebugEnvironment.extensionDevelopmentLocationURI.push(URI.parse(value));
                        extensionHostDebugEnvironment.isExtensionDevelopment = true;
                        break;
                    case 'extensionDevelopmentKind':
                        extensionHostDebugEnvironment.extensionDevelopmentKind = [value];
                        break;
                    case 'extensionTestsPath':
                        extensionHostDebugEnvironment.extensionTestsLocationURI = URI.parse(value);
                        break;
                    case 'debugRenderer':
                        extensionHostDebugEnvironment.debugRenderer = value === 'true';
                        break;
                    case 'debugId':
                        extensionHostDebugEnvironment.params.debugId = value;
                        break;
                    case 'inspect-brk-extensions':
                        extensionHostDebugEnvironment.params.port = parseInt(value);
                        extensionHostDebugEnvironment.params.break = true;
                        break;
                    case 'inspect-extensions':
                        extensionHostDebugEnvironment.params.port = parseInt(value);
                        break;
                    case 'enableProposedApi':
                        extensionHostDebugEnvironment.extensionEnabledProposedApi = [];
                        break;
                }
            }
        }
        const developmentOptions = this.options.developmentOptions;
        if (developmentOptions && !extensionHostDebugEnvironment.isExtensionDevelopment) {
            if (developmentOptions.extensions?.length) {
                extensionHostDebugEnvironment.extensionDevelopmentLocationURI = developmentOptions.extensions.map(e => URI.revive(e));
                extensionHostDebugEnvironment.isExtensionDevelopment = true;
            }
            if (developmentOptions.extensionTestsPath) {
                extensionHostDebugEnvironment.extensionTestsLocationURI = URI.revive(developmentOptions.extensionTestsPath);
            }
        }
        return extensionHostDebugEnvironment;
    }
    get filesToOpenOrCreate() {
        if (this.payload) {
            const fileToOpen = this.payload.get('openFile');
            if (fileToOpen) {
                const fileUri = URI.parse(fileToOpen);
                // Support: --goto parameter to open on line/col
                if (this.payload.has('gotoLineMode')) {
                    const pathColumnAware = parseLineAndColumnAware(fileUri.path);
                    return [{
                            fileUri: fileUri.with({ path: pathColumnAware.path }),
                            options: {
                                selection: !isUndefined(pathColumnAware.line) ? { startLineNumber: pathColumnAware.line, startColumn: pathColumnAware.column || 1 } : undefined
                            }
                        }];
                }
                return [{ fileUri }];
            }
        }
        return undefined;
    }
    get filesToDiff() {
        if (this.payload) {
            const fileToDiffPrimary = this.payload.get('diffFilePrimary');
            const fileToDiffSecondary = this.payload.get('diffFileSecondary');
            if (fileToDiffPrimary && fileToDiffSecondary) {
                return [
                    { fileUri: URI.parse(fileToDiffSecondary) },
                    { fileUri: URI.parse(fileToDiffPrimary) }
                ];
            }
        }
        return undefined;
    }
    get filesToMerge() {
        if (this.payload) {
            const fileToMerge1 = this.payload.get('mergeFile1');
            const fileToMerge2 = this.payload.get('mergeFile2');
            const fileToMergeBase = this.payload.get('mergeFileBase');
            const fileToMergeResult = this.payload.get('mergeFileResult');
            if (fileToMerge1 && fileToMerge2 && fileToMergeBase && fileToMergeResult) {
                return [
                    { fileUri: URI.parse(fileToMerge1) },
                    { fileUri: URI.parse(fileToMerge2) },
                    { fileUri: URI.parse(fileToMergeBase) },
                    { fileUri: URI.parse(fileToMergeResult) }
                ];
            }
        }
        return undefined;
    }
}
__decorate([
    memoize,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], BrowserWorkbenchEnvironmentService.prototype, "remoteAuthority", null);
__decorate([
    memoize,
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], BrowserWorkbenchEnvironmentService.prototype, "expectsResolverExtension", null);
__decorate([
    memoize,
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], BrowserWorkbenchEnvironmentService.prototype, "isBuilt", null);
__decorate([
    memoize,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], BrowserWorkbenchEnvironmentService.prototype, "logLevel", null);
__decorate([
    memoize,
    __metadata("design:type", URI),
    __metadata("design:paramtypes", [])
], BrowserWorkbenchEnvironmentService.prototype, "windowLogsPath", null);
__decorate([
    memoize,
    __metadata("design:type", URI),
    __metadata("design:paramtypes", [])
], BrowserWorkbenchEnvironmentService.prototype, "logFile", null);
__decorate([
    memoize,
    __metadata("design:type", URI),
    __metadata("design:paramtypes", [])
], BrowserWorkbenchEnvironmentService.prototype, "userRoamingDataHome", null);
__decorate([
    memoize,
    __metadata("design:type", URI),
    __metadata("design:paramtypes", [])
], BrowserWorkbenchEnvironmentService.prototype, "argvResource", null);
__decorate([
    memoize,
    __metadata("design:type", URI),
    __metadata("design:paramtypes", [])
], BrowserWorkbenchEnvironmentService.prototype, "cacheHome", null);
__decorate([
    memoize,
    __metadata("design:type", URI),
    __metadata("design:paramtypes", [])
], BrowserWorkbenchEnvironmentService.prototype, "workspaceStorageHome", null);
__decorate([
    memoize,
    __metadata("design:type", URI),
    __metadata("design:paramtypes", [])
], BrowserWorkbenchEnvironmentService.prototype, "localHistoryHome", null);
__decorate([
    memoize,
    __metadata("design:type", URI),
    __metadata("design:paramtypes", [])
], BrowserWorkbenchEnvironmentService.prototype, "stateResource", null);
__decorate([
    memoize,
    __metadata("design:type", URI),
    __metadata("design:paramtypes", [])
], BrowserWorkbenchEnvironmentService.prototype, "userDataSyncHome", null);
__decorate([
    memoize,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], BrowserWorkbenchEnvironmentService.prototype, "sync", null);
__decorate([
    memoize,
    __metadata("design:type", URI),
    __metadata("design:paramtypes", [])
], BrowserWorkbenchEnvironmentService.prototype, "keyboardLayoutResource", null);
__decorate([
    memoize,
    __metadata("design:type", URI),
    __metadata("design:paramtypes", [])
], BrowserWorkbenchEnvironmentService.prototype, "untitledWorkspacesHome", null);
__decorate([
    memoize,
    __metadata("design:type", URI),
    __metadata("design:paramtypes", [])
], BrowserWorkbenchEnvironmentService.prototype, "serviceMachineIdResource", null);
__decorate([
    memoize,
    __metadata("design:type", URI),
    __metadata("design:paramtypes", [])
], BrowserWorkbenchEnvironmentService.prototype, "extHostLogsPath", null);
__decorate([
    memoize,
    __metadata("design:type", URI),
    __metadata("design:paramtypes", [])
], BrowserWorkbenchEnvironmentService.prototype, "extHostTelemetryLogFile", null);
__decorate([
    memoize,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], BrowserWorkbenchEnvironmentService.prototype, "debugExtensionHost", null);
__decorate([
    memoize,
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], BrowserWorkbenchEnvironmentService.prototype, "isExtensionDevelopment", null);
__decorate([
    memoize,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], BrowserWorkbenchEnvironmentService.prototype, "extensionDevelopmentLocationURI", null);
__decorate([
    memoize,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], BrowserWorkbenchEnvironmentService.prototype, "extensionDevelopmentLocationKind", null);
__decorate([
    memoize,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], BrowserWorkbenchEnvironmentService.prototype, "extensionTestsLocationURI", null);
__decorate([
    memoize,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], BrowserWorkbenchEnvironmentService.prototype, "extensionEnabledProposedApi", null);
__decorate([
    memoize,
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], BrowserWorkbenchEnvironmentService.prototype, "debugRenderer", null);
__decorate([
    memoize,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], BrowserWorkbenchEnvironmentService.prototype, "enableSmokeTestDriver", null);
__decorate([
    memoize,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], BrowserWorkbenchEnvironmentService.prototype, "disableExtensions", null);
__decorate([
    memoize,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], BrowserWorkbenchEnvironmentService.prototype, "enableExtensions", null);
__decorate([
    memoize,
    __metadata("design:type", String),
    __metadata("design:paramtypes", [])
], BrowserWorkbenchEnvironmentService.prototype, "webviewExternalEndpoint", null);
__decorate([
    memoize,
    __metadata("design:type", URI),
    __metadata("design:paramtypes", [])
], BrowserWorkbenchEnvironmentService.prototype, "extensionTelemetryLogResource", null);
__decorate([
    memoize,
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], BrowserWorkbenchEnvironmentService.prototype, "disableTelemetry", null);
__decorate([
    memoize,
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], BrowserWorkbenchEnvironmentService.prototype, "verbose", null);
__decorate([
    memoize,
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], BrowserWorkbenchEnvironmentService.prototype, "logExtensionHostCommunication", null);
__decorate([
    memoize,
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], BrowserWorkbenchEnvironmentService.prototype, "skipReleaseNotes", null);
__decorate([
    memoize,
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], BrowserWorkbenchEnvironmentService.prototype, "skipWelcome", null);
__decorate([
    memoize,
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], BrowserWorkbenchEnvironmentService.prototype, "disableWorkspaceTrust", null);
__decorate([
    memoize,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], BrowserWorkbenchEnvironmentService.prototype, "profile", null);
__decorate([
    memoize,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], BrowserWorkbenchEnvironmentService.prototype, "filesToOpenOrCreate", null);
__decorate([
    memoize,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], BrowserWorkbenchEnvironmentService.prototype, "filesToDiff", null);
__decorate([
    memoize,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], BrowserWorkbenchEnvironmentService.prototype, "filesToMerge", null);
