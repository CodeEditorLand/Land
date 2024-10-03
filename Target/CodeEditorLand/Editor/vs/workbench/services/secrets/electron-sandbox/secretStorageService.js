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
import { createSingleCallFunction } from '../../../../base/common/functional.js';
import { isLinux } from '../../../../base/common/platform.js';
import Severity from '../../../../base/common/severity.js';
import { localize } from '../../../../nls.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IEncryptionService, isGnome, isKwallet } from '../../../../platform/encryption/common/encryptionService.js';
import { INativeEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { BaseSecretStorageService, ISecretStorageService } from '../../../../platform/secrets/common/secrets.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IJSONEditingService } from '../../configuration/common/jsonEditing.js';
let NativeSecretStorageService = class NativeSecretStorageService extends BaseSecretStorageService {
    constructor(_notificationService, _dialogService, _openerService, _jsonEditingService, _environmentService, storageService, encryptionService, logService) {
        super(!!_environmentService.useInMemorySecretStorage, storageService, encryptionService, logService);
        this._notificationService = _notificationService;
        this._dialogService = _dialogService;
        this._openerService = _openerService;
        this._jsonEditingService = _jsonEditingService;
        this._environmentService = _environmentService;
        this.notifyOfNoEncryptionOnce = createSingleCallFunction(() => this.notifyOfNoEncryption());
    }
    set(key, value) {
        this._sequencer.queue(key, async () => {
            await this.resolvedStorageService;
            if (this.type !== 'persisted' && !this._environmentService.useInMemorySecretStorage) {
                this._logService.trace('[NativeSecretStorageService] Notifying user that secrets are not being stored on disk.');
                await this.notifyOfNoEncryptionOnce();
            }
        });
        return super.set(key, value);
    }
    async notifyOfNoEncryption() {
        const buttons = [];
        const troubleshootingButton = {
            label: localize('troubleshootingButton', "Open troubleshooting guide"),
            run: () => this._openerService.open('https://go.microsoft.com/fwlink/?linkid=2239490'),
            keepOpen: true
        };
        buttons.push(troubleshootingButton);
        let errorMessage = localize('encryptionNotAvailableJustTroubleshootingGuide', "An OS keyring couldn't be identified for storing the encryption related data in your current desktop environment.");
        if (!isLinux) {
            this._notificationService.prompt(Severity.Error, errorMessage, buttons);
            return;
        }
        const provider = await this._encryptionService.getKeyStorageProvider();
        if (provider === "basic_text") {
            const detail = localize('usePlainTextExtraSentence', "Open the troubleshooting guide to address this or you can use weaker encryption that doesn't use the OS keyring.");
            const usePlainTextButton = {
                label: localize('usePlainText', "Use weaker encryption"),
                run: async () => {
                    await this._encryptionService.setUsePlainTextEncryption();
                    await this._jsonEditingService.write(this._environmentService.argvResource, [{ path: ['password-store'], value: "basic" }], true);
                    this.reinitialize();
                }
            };
            buttons.unshift(usePlainTextButton);
            await this._dialogService.prompt({
                type: 'error',
                buttons,
                message: errorMessage,
                detail
            });
            return;
        }
        if (isGnome(provider)) {
            errorMessage = localize('isGnome', "You're running in a GNOME environment but the OS keyring is not available for encryption. Ensure you have gnome-keyring or another libsecret compatible implementation installed and running.");
        }
        else if (isKwallet(provider)) {
            errorMessage = localize('isKwallet', "You're running in a KDE environment but the OS keyring is not available for encryption. Ensure you have kwallet running.");
        }
        this._notificationService.prompt(Severity.Error, errorMessage, buttons);
    }
};
NativeSecretStorageService = __decorate([
    __param(0, INotificationService),
    __param(1, IDialogService),
    __param(2, IOpenerService),
    __param(3, IJSONEditingService),
    __param(4, INativeEnvironmentService),
    __param(5, IStorageService),
    __param(6, IEncryptionService),
    __param(7, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object])
], NativeSecretStorageService);
export { NativeSecretStorageService };
registerSingleton(ISecretStorageService, NativeSecretStorageService, 1);
