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
import { isLinux } from '../../../../base/common/platform.js';
import { parse } from '../../../../base/common/jsonc.js';
import { IEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { Extensions as WorkbenchExtensions } from '../../../common/contributions.js';
import { IJSONEditingService } from '../../../services/configuration/common/jsonEditing.js';
let EncryptionContribution = class EncryptionContribution {
    constructor(jsonEditingService, environmentService, fileService, storageService) {
        this.jsonEditingService = jsonEditingService;
        this.environmentService = environmentService;
        this.fileService = fileService;
        this.storageService = storageService;
        this.migrateToGnomeLibsecret();
    }
    /**
     * Migrate the user from using the gnome or gnome-keyring password-store to gnome-libsecret.
     * TODO@TylerLeonhardt: This migration can be removed in 3 months or so and then storage
     * can be cleaned up.
     */
    async migrateToGnomeLibsecret() {
        if (!isLinux || this.storageService.getBoolean('encryption.migratedToGnomeLibsecret', -1 /* StorageScope.APPLICATION */, false)) {
            return;
        }
        try {
            const content = await this.fileService.readFile(this.environmentService.argvResource);
            const argv = parse(content.value.toString());
            if (argv['password-store'] === 'gnome' || argv['password-store'] === 'gnome-keyring') {
                this.jsonEditingService.write(this.environmentService.argvResource, [{ path: ['password-store'], value: 'gnome-libsecret' }], true);
            }
            this.storageService.store('encryption.migratedToGnomeLibsecret', true, -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
        }
        catch (error) {
            console.error(error);
        }
    }
};
EncryptionContribution = __decorate([
    __param(0, IJSONEditingService),
    __param(1, IEnvironmentService),
    __param(2, IFileService),
    __param(3, IStorageService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], EncryptionContribution);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(EncryptionContribution, 4 /* LifecyclePhase.Eventually */);
