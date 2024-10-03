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
    async migrateToGnomeLibsecret() {
        if (!isLinux || this.storageService.getBoolean('encryption.migratedToGnomeLibsecret', -1, false)) {
            return;
        }
        try {
            const content = await this.fileService.readFile(this.environmentService.argvResource);
            const argv = parse(content.value.toString());
            if (argv['password-store'] === 'gnome' || argv['password-store'] === 'gnome-keyring') {
                this.jsonEditingService.write(this.environmentService.argvResource, [{ path: ['password-store'], value: 'gnome-libsecret' }], true);
            }
            this.storageService.store('encryption.migratedToGnomeLibsecret', true, -1, 0);
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
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(EncryptionContribution, 4);
