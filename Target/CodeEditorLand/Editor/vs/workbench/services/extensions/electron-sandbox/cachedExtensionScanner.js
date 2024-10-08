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
import * as platform from '../../../../base/common/platform.js';
import { dedupExtensions } from '../common/extensionsUtil.js';
import { IExtensionsScannerService, toExtensionDescription as toExtensionDescriptionFromScannedExtension } from '../../../../platform/extensionManagement/common/extensionsScannerService.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import Severity from '../../../../base/common/severity.js';
import { localize } from '../../../../nls.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IHostService } from '../../host/browser/host.js';
import { timeout } from '../../../../base/common/async.js';
import { IUserDataProfileService } from '../../userDataProfile/common/userDataProfile.js';
import { getErrorMessage } from '../../../../base/common/errors.js';
import { IWorkbenchExtensionManagementService } from '../../extensionManagement/common/extensionManagement.js';
import { toExtensionDescription } from '../common/extensions.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
let CachedExtensionScanner = class CachedExtensionScanner {
    constructor(_notificationService, _hostService, _extensionsScannerService, _userDataProfileService, _extensionManagementService, _environmentService, _logService) {
        this._notificationService = _notificationService;
        this._hostService = _hostService;
        this._extensionsScannerService = _extensionsScannerService;
        this._userDataProfileService = _userDataProfileService;
        this._extensionManagementService = _extensionManagementService;
        this._environmentService = _environmentService;
        this._logService = _logService;
        this.scannedExtensions = new Promise((resolve, reject) => {
            this._scannedExtensionsResolve = resolve;
            this._scannedExtensionsReject = reject;
        });
    }
    async startScanningExtensions() {
        try {
            const extensions = await this._scanInstalledExtensions();
            this._scannedExtensionsResolve(extensions);
        }
        catch (err) {
            this._scannedExtensionsReject(err);
        }
    }
    async _scanInstalledExtensions() {
        try {
            const language = platform.language;
            const result = await Promise.allSettled([
                this._extensionsScannerService.scanSystemExtensions({ language, useCache: true, checkControlFile: true }),
                this._extensionsScannerService.scanUserExtensions({ language, profileLocation: this._userDataProfileService.currentProfile.extensionsResource, useCache: true }),
                this._environmentService.remoteAuthority ? [] : this._extensionManagementService.getInstalledWorkspaceExtensions(false)
            ]);
            let scannedSystemExtensions = [], scannedUserExtensions = [], workspaceExtensions = [], scannedDevelopedExtensions = [], hasErrors = false;
            if (result[0].status === 'fulfilled') {
                scannedSystemExtensions = result[0].value;
            }
            else {
                hasErrors = true;
                this._logService.error(`Error scanning system extensions:`, getErrorMessage(result[0].reason));
            }
            if (result[1].status === 'fulfilled') {
                scannedUserExtensions = result[1].value;
            }
            else {
                hasErrors = true;
                this._logService.error(`Error scanning user extensions:`, getErrorMessage(result[1].reason));
            }
            if (result[2].status === 'fulfilled') {
                workspaceExtensions = result[2].value;
            }
            else {
                hasErrors = true;
                this._logService.error(`Error scanning workspace extensions:`, getErrorMessage(result[2].reason));
            }
            try {
                scannedDevelopedExtensions = await this._extensionsScannerService.scanExtensionsUnderDevelopment({ language }, [...scannedSystemExtensions, ...scannedUserExtensions]);
            }
            catch (error) {
                this._logService.error(error);
            }
            const system = scannedSystemExtensions.map(e => toExtensionDescriptionFromScannedExtension(e, false));
            const user = scannedUserExtensions.map(e => toExtensionDescriptionFromScannedExtension(e, false));
            const workspace = workspaceExtensions.map(e => toExtensionDescription(e, false));
            const development = scannedDevelopedExtensions.map(e => toExtensionDescriptionFromScannedExtension(e, true));
            const r = dedupExtensions(system, user, workspace, development, this._logService);
            if (!hasErrors) {
                const disposable = this._extensionsScannerService.onDidChangeCache(() => {
                    disposable.dispose();
                    this._notificationService.prompt(Severity.Error, localize('extensionCache.invalid', "Extensions have been modified on disk. Please reload the window."), [{
                            label: localize('reloadWindow', "Reload Window"),
                            run: () => this._hostService.reload()
                        }]);
                });
                timeout(5000).then(() => disposable.dispose());
            }
            return r;
        }
        catch (err) {
            this._logService.error(`Error scanning installed extensions:`);
            this._logService.error(err);
            return [];
        }
    }
};
CachedExtensionScanner = __decorate([
    __param(0, INotificationService),
    __param(1, IHostService),
    __param(2, IExtensionsScannerService),
    __param(3, IUserDataProfileService),
    __param(4, IWorkbenchExtensionManagementService),
    __param(5, IWorkbenchEnvironmentService),
    __param(6, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object])
], CachedExtensionScanner);
export { CachedExtensionScanner };
