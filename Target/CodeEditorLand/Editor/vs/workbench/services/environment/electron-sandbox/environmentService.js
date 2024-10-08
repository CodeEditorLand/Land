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
import { IEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { refineServiceDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { AbstractNativeEnvironmentService } from '../../../../platform/environment/common/environmentService.js';
import { memoize } from '../../../../base/common/decorators.js';
import { URI } from '../../../../base/common/uri.js';
import { Schemas } from '../../../../base/common/network.js';
import { joinPath } from '../../../../base/common/resources.js';
export const INativeWorkbenchEnvironmentService = refineServiceDecorator(IEnvironmentService);
export class NativeWorkbenchEnvironmentService extends AbstractNativeEnvironmentService {
    get mainPid() { return this.configuration.mainPid; }
    get machineId() { return this.configuration.machineId; }
    get sqmId() { return this.configuration.sqmId; }
    get devDeviceId() { return this.configuration.devDeviceId; }
    get remoteAuthority() { return this.configuration.remoteAuthority; }
    get expectsResolverExtension() { return !!this.configuration.remoteAuthority?.includes('+'); }
    get execPath() { return this.configuration.execPath; }
    get backupPath() { return this.configuration.backupPath; }
    get window() {
        return {
            id: this.configuration.windowId,
            colorScheme: this.configuration.colorScheme,
            maximized: this.configuration.maximized,
            accessibilitySupport: this.configuration.accessibilitySupport,
            perfMarks: this.configuration.perfMarks,
            isInitialStartup: this.configuration.isInitialStartup,
            isCodeCaching: typeof this.configuration.codeCachePath === 'string'
        };
    }
    get windowLogsPath() { return joinPath(this.logsHome, `window${this.configuration.windowId}`); }
    get logFile() { return joinPath(this.windowLogsPath, `renderer.log`); }
    get extHostLogsPath() { return joinPath(this.windowLogsPath, 'exthost'); }
    get extHostTelemetryLogFile() {
        return joinPath(this.extHostLogsPath, 'extensionTelemetry.log');
    }
    get webviewExternalEndpoint() { return `${Schemas.vscodeWebview}://{{uuid}}`; }
    get skipReleaseNotes() { return !!this.args['skip-release-notes']; }
    get skipWelcome() { return !!this.args['skip-welcome']; }
    get logExtensionHostCommunication() { return !!this.args.logExtensionHostCommunication; }
    get enableSmokeTestDriver() { return !!this.args['enable-smoke-test-driver']; }
    get extensionEnabledProposedApi() {
        if (Array.isArray(this.args['enable-proposed-api'])) {
            return this.args['enable-proposed-api'];
        }
        if ('enable-proposed-api' in this.args) {
            return [];
        }
        return undefined;
    }
    get os() { return this.configuration.os; }
    get filesToOpenOrCreate() { return this.configuration.filesToOpenOrCreate; }
    get filesToDiff() { return this.configuration.filesToDiff; }
    get filesToMerge() { return this.configuration.filesToMerge; }
    get filesToWait() { return this.configuration.filesToWait; }
    constructor(configuration, productService) {
        super(configuration, { homeDir: configuration.homeDir, tmpDir: configuration.tmpDir, userDataDir: configuration.userDataDir }, productService);
        this.configuration = configuration;
    }
}
__decorate([
    memoize,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], NativeWorkbenchEnvironmentService.prototype, "mainPid", null);
__decorate([
    memoize,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], NativeWorkbenchEnvironmentService.prototype, "machineId", null);
__decorate([
    memoize,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], NativeWorkbenchEnvironmentService.prototype, "sqmId", null);
__decorate([
    memoize,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], NativeWorkbenchEnvironmentService.prototype, "devDeviceId", null);
__decorate([
    memoize,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], NativeWorkbenchEnvironmentService.prototype, "remoteAuthority", null);
__decorate([
    memoize,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], NativeWorkbenchEnvironmentService.prototype, "expectsResolverExtension", null);
__decorate([
    memoize,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], NativeWorkbenchEnvironmentService.prototype, "execPath", null);
__decorate([
    memoize,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], NativeWorkbenchEnvironmentService.prototype, "backupPath", null);
__decorate([
    memoize,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], NativeWorkbenchEnvironmentService.prototype, "window", null);
__decorate([
    memoize,
    __metadata("design:type", URI),
    __metadata("design:paramtypes", [])
], NativeWorkbenchEnvironmentService.prototype, "windowLogsPath", null);
__decorate([
    memoize,
    __metadata("design:type", URI),
    __metadata("design:paramtypes", [])
], NativeWorkbenchEnvironmentService.prototype, "logFile", null);
__decorate([
    memoize,
    __metadata("design:type", URI),
    __metadata("design:paramtypes", [])
], NativeWorkbenchEnvironmentService.prototype, "extHostLogsPath", null);
__decorate([
    memoize,
    __metadata("design:type", URI),
    __metadata("design:paramtypes", [])
], NativeWorkbenchEnvironmentService.prototype, "extHostTelemetryLogFile", null);
__decorate([
    memoize,
    __metadata("design:type", String),
    __metadata("design:paramtypes", [])
], NativeWorkbenchEnvironmentService.prototype, "webviewExternalEndpoint", null);
__decorate([
    memoize,
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], NativeWorkbenchEnvironmentService.prototype, "skipReleaseNotes", null);
__decorate([
    memoize,
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], NativeWorkbenchEnvironmentService.prototype, "skipWelcome", null);
__decorate([
    memoize,
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], NativeWorkbenchEnvironmentService.prototype, "logExtensionHostCommunication", null);
__decorate([
    memoize,
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], NativeWorkbenchEnvironmentService.prototype, "enableSmokeTestDriver", null);
__decorate([
    memoize,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], NativeWorkbenchEnvironmentService.prototype, "extensionEnabledProposedApi", null);
__decorate([
    memoize,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], NativeWorkbenchEnvironmentService.prototype, "os", null);
__decorate([
    memoize,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], NativeWorkbenchEnvironmentService.prototype, "filesToOpenOrCreate", null);
__decorate([
    memoize,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], NativeWorkbenchEnvironmentService.prototype, "filesToDiff", null);
__decorate([
    memoize,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], NativeWorkbenchEnvironmentService.prototype, "filesToMerge", null);
__decorate([
    memoize,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], NativeWorkbenchEnvironmentService.prototype, "filesToWait", null);
