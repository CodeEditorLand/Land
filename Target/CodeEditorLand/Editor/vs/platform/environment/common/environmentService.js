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
import { toLocalISOString } from '../../../base/common/date.js';
import { memoize } from '../../../base/common/decorators.js';
import { FileAccess, Schemas } from '../../../base/common/network.js';
import { dirname, join, normalize, resolve } from '../../../base/common/path.js';
import { env } from '../../../base/common/process.js';
import { joinPath } from '../../../base/common/resources.js';
import { URI } from '../../../base/common/uri.js';
export const EXTENSION_IDENTIFIER_WITH_LOG_REGEX = /^([^.]+\..+)[:=](.+)$/;
export class AbstractNativeEnvironmentService {
    get appRoot() { return dirname(FileAccess.asFileUri('').fsPath); }
    get userHome() { return URI.file(this.paths.homeDir); }
    get userDataPath() { return this.paths.userDataDir; }
    get appSettingsHome() { return URI.file(join(this.userDataPath, 'User')); }
    get tmpDir() { return URI.file(this.paths.tmpDir); }
    get cacheHome() { return URI.file(this.userDataPath); }
    get stateResource() { return joinPath(this.appSettingsHome, 'globalStorage', 'storage.json'); }
    get userRoamingDataHome() { return this.appSettingsHome.with({ scheme: Schemas.vscodeUserData }); }
    get userDataSyncHome() { return joinPath(this.appSettingsHome, 'sync'); }
    get logsHome() {
        if (!this.args.logsPath) {
            const key = toLocalISOString(new Date()).replace(/-|:|\.\d+Z$/g, '');
            this.args.logsPath = join(this.userDataPath, 'logs', key);
        }
        return URI.file(this.args.logsPath);
    }
    get sync() { return this.args.sync; }
    get machineSettingsResource() { return joinPath(URI.file(join(this.userDataPath, 'Machine')), 'settings.json'); }
    get workspaceStorageHome() { return joinPath(this.appSettingsHome, 'workspaceStorage'); }
    get localHistoryHome() { return joinPath(this.appSettingsHome, 'History'); }
    get keyboardLayoutResource() { return joinPath(this.userRoamingDataHome, 'keyboardLayout.json'); }
    get argvResource() {
        const vscodePortable = env['VSCODE_PORTABLE'];
        if (vscodePortable) {
            return URI.file(join(vscodePortable, 'argv.json'));
        }
        return joinPath(this.userHome, this.productService.dataFolderName, 'argv.json');
    }
    get isExtensionDevelopment() { return !!this.args.extensionDevelopmentPath; }
    get untitledWorkspacesHome() { return URI.file(join(this.userDataPath, 'Workspaces')); }
    get builtinExtensionsPath() {
        const cliBuiltinExtensionsDir = this.args['builtin-extensions-dir'];
        if (cliBuiltinExtensionsDir) {
            return resolve(cliBuiltinExtensionsDir);
        }
        return normalize(join(FileAccess.asFileUri('').fsPath, '..', 'extensions'));
    }
    get extensionsDownloadLocation() {
        const cliExtensionsDownloadDir = this.args['extensions-download-dir'];
        if (cliExtensionsDownloadDir) {
            return URI.file(resolve(cliExtensionsDownloadDir));
        }
        return URI.file(join(this.userDataPath, 'CachedExtensionVSIXs'));
    }
    get extensionsPath() {
        const cliExtensionsDir = this.args['extensions-dir'];
        if (cliExtensionsDir) {
            return resolve(cliExtensionsDir);
        }
        const vscodeExtensions = env['VSCODE_EXTENSIONS'];
        if (vscodeExtensions) {
            return vscodeExtensions;
        }
        const vscodePortable = env['VSCODE_PORTABLE'];
        if (vscodePortable) {
            return join(vscodePortable, 'extensions');
        }
        return joinPath(this.userHome, this.productService.dataFolderName, 'extensions').fsPath;
    }
    get extensionDevelopmentLocationURI() {
        const extensionDevelopmentPaths = this.args.extensionDevelopmentPath;
        if (Array.isArray(extensionDevelopmentPaths)) {
            return extensionDevelopmentPaths.map(extensionDevelopmentPath => {
                if (/^[^:/?#]+?:\/\//.test(extensionDevelopmentPath)) {
                    return URI.parse(extensionDevelopmentPath);
                }
                return URI.file(normalize(extensionDevelopmentPath));
            });
        }
        return undefined;
    }
    get extensionDevelopmentKind() {
        return this.args.extensionDevelopmentKind?.map(kind => kind === 'ui' || kind === 'workspace' || kind === 'web' ? kind : 'workspace');
    }
    get extensionTestsLocationURI() {
        const extensionTestsPath = this.args.extensionTestsPath;
        if (extensionTestsPath) {
            if (/^[^:/?#]+?:\/\//.test(extensionTestsPath)) {
                return URI.parse(extensionTestsPath);
            }
            return URI.file(normalize(extensionTestsPath));
        }
        return undefined;
    }
    get disableExtensions() {
        if (this.args['disable-extensions']) {
            return true;
        }
        const disableExtensions = this.args['disable-extension'];
        if (disableExtensions) {
            if (typeof disableExtensions === 'string') {
                return [disableExtensions];
            }
            if (Array.isArray(disableExtensions) && disableExtensions.length > 0) {
                return disableExtensions;
            }
        }
        return false;
    }
    get debugExtensionHost() { return parseExtensionHostDebugPort(this.args, this.isBuilt); }
    get debugRenderer() { return !!this.args.debugRenderer; }
    get isBuilt() { return !env['VSCODE_DEV']; }
    get verbose() { return !!this.args.verbose; }
    get logLevel() { return this.args.log?.find(entry => !EXTENSION_IDENTIFIER_WITH_LOG_REGEX.test(entry)); }
    get extensionLogLevel() {
        const result = [];
        for (const entry of this.args.log || []) {
            const matches = EXTENSION_IDENTIFIER_WITH_LOG_REGEX.exec(entry);
            if (matches && matches[1] && matches[2]) {
                result.push([matches[1], matches[2]]);
            }
        }
        return result.length ? result : undefined;
    }
    get serviceMachineIdResource() { return joinPath(URI.file(this.userDataPath), 'machineid'); }
    get crashReporterId() { return this.args['crash-reporter-id']; }
    get crashReporterDirectory() { return this.args['crash-reporter-directory']; }
    get disableTelemetry() { return !!this.args['disable-telemetry']; }
    get disableWorkspaceTrust() { return !!this.args['disable-workspace-trust']; }
    get useInMemorySecretStorage() { return !!this.args['use-inmemory-secretstorage']; }
    get policyFile() {
        if (this.args['__enable-file-policy']) {
            const vscodePortable = env['VSCODE_PORTABLE'];
            if (vscodePortable) {
                return URI.file(join(vscodePortable, 'policy.json'));
            }
            return joinPath(this.userHome, this.productService.dataFolderName, 'policy.json');
        }
        return undefined;
    }
    get continueOn() {
        return this.args['continueOn'];
    }
    set continueOn(value) {
        this.args['continueOn'] = value;
    }
    get args() { return this._args; }
    constructor(_args, paths, productService) {
        this._args = _args;
        this.paths = paths;
        this.productService = productService;
        this.editSessionId = this.args['editSessionId'];
    }
}
__decorate([
    memoize,
    __metadata("design:type", String),
    __metadata("design:paramtypes", [])
], AbstractNativeEnvironmentService.prototype, "appRoot", null);
__decorate([
    memoize,
    __metadata("design:type", URI),
    __metadata("design:paramtypes", [])
], AbstractNativeEnvironmentService.prototype, "userHome", null);
__decorate([
    memoize,
    __metadata("design:type", String),
    __metadata("design:paramtypes", [])
], AbstractNativeEnvironmentService.prototype, "userDataPath", null);
__decorate([
    memoize,
    __metadata("design:type", URI),
    __metadata("design:paramtypes", [])
], AbstractNativeEnvironmentService.prototype, "appSettingsHome", null);
__decorate([
    memoize,
    __metadata("design:type", URI),
    __metadata("design:paramtypes", [])
], AbstractNativeEnvironmentService.prototype, "tmpDir", null);
__decorate([
    memoize,
    __metadata("design:type", URI),
    __metadata("design:paramtypes", [])
], AbstractNativeEnvironmentService.prototype, "cacheHome", null);
__decorate([
    memoize,
    __metadata("design:type", URI),
    __metadata("design:paramtypes", [])
], AbstractNativeEnvironmentService.prototype, "stateResource", null);
__decorate([
    memoize,
    __metadata("design:type", URI),
    __metadata("design:paramtypes", [])
], AbstractNativeEnvironmentService.prototype, "userRoamingDataHome", null);
__decorate([
    memoize,
    __metadata("design:type", URI),
    __metadata("design:paramtypes", [])
], AbstractNativeEnvironmentService.prototype, "userDataSyncHome", null);
__decorate([
    memoize,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], AbstractNativeEnvironmentService.prototype, "sync", null);
__decorate([
    memoize,
    __metadata("design:type", URI),
    __metadata("design:paramtypes", [])
], AbstractNativeEnvironmentService.prototype, "machineSettingsResource", null);
__decorate([
    memoize,
    __metadata("design:type", URI),
    __metadata("design:paramtypes", [])
], AbstractNativeEnvironmentService.prototype, "workspaceStorageHome", null);
__decorate([
    memoize,
    __metadata("design:type", URI),
    __metadata("design:paramtypes", [])
], AbstractNativeEnvironmentService.prototype, "localHistoryHome", null);
__decorate([
    memoize,
    __metadata("design:type", URI),
    __metadata("design:paramtypes", [])
], AbstractNativeEnvironmentService.prototype, "keyboardLayoutResource", null);
__decorate([
    memoize,
    __metadata("design:type", URI),
    __metadata("design:paramtypes", [])
], AbstractNativeEnvironmentService.prototype, "argvResource", null);
__decorate([
    memoize,
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], AbstractNativeEnvironmentService.prototype, "isExtensionDevelopment", null);
__decorate([
    memoize,
    __metadata("design:type", URI),
    __metadata("design:paramtypes", [])
], AbstractNativeEnvironmentService.prototype, "untitledWorkspacesHome", null);
__decorate([
    memoize,
    __metadata("design:type", String),
    __metadata("design:paramtypes", [])
], AbstractNativeEnvironmentService.prototype, "builtinExtensionsPath", null);
__decorate([
    memoize,
    __metadata("design:type", String),
    __metadata("design:paramtypes", [])
], AbstractNativeEnvironmentService.prototype, "extensionsPath", null);
__decorate([
    memoize,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], AbstractNativeEnvironmentService.prototype, "extensionDevelopmentLocationURI", null);
__decorate([
    memoize,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], AbstractNativeEnvironmentService.prototype, "extensionDevelopmentKind", null);
__decorate([
    memoize,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], AbstractNativeEnvironmentService.prototype, "extensionTestsLocationURI", null);
__decorate([
    memoize,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], AbstractNativeEnvironmentService.prototype, "debugExtensionHost", null);
__decorate([
    memoize,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], AbstractNativeEnvironmentService.prototype, "logLevel", null);
__decorate([
    memoize,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], AbstractNativeEnvironmentService.prototype, "extensionLogLevel", null);
__decorate([
    memoize,
    __metadata("design:type", URI),
    __metadata("design:paramtypes", [])
], AbstractNativeEnvironmentService.prototype, "serviceMachineIdResource", null);
__decorate([
    memoize,
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], AbstractNativeEnvironmentService.prototype, "disableTelemetry", null);
__decorate([
    memoize,
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], AbstractNativeEnvironmentService.prototype, "disableWorkspaceTrust", null);
__decorate([
    memoize,
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], AbstractNativeEnvironmentService.prototype, "useInMemorySecretStorage", null);
__decorate([
    memoize,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], AbstractNativeEnvironmentService.prototype, "policyFile", null);
export function parseExtensionHostDebugPort(args, isBuilt) {
    return parseDebugParams(args['inspect-extensions'], args['inspect-brk-extensions'], 5870, isBuilt, args.debugId, args.extensionEnvironment);
}
export function parseDebugParams(debugArg, debugBrkArg, defaultBuildPort, isBuilt, debugId, environmentString) {
    const portStr = debugBrkArg || debugArg;
    const port = Number(portStr) || (!isBuilt ? defaultBuildPort : null);
    const brk = port ? Boolean(!!debugBrkArg) : false;
    let env;
    if (environmentString) {
        try {
            env = JSON.parse(environmentString);
        }
        catch {
            // ignore
        }
    }
    return { port, break: brk, debugId, env };
}
