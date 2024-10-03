import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IEncryptionService } from '../../../../platform/encryption/common/encryptionService.js';
import { INativeEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { BaseSecretStorageService } from '../../../../platform/secrets/common/secrets.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IJSONEditingService } from '../../configuration/common/jsonEditing.js';
export declare class NativeSecretStorageService extends BaseSecretStorageService {
    private readonly _notificationService;
    private readonly _dialogService;
    private readonly _openerService;
    private readonly _jsonEditingService;
    private readonly _environmentService;
    constructor(_notificationService: INotificationService, _dialogService: IDialogService, _openerService: IOpenerService, _jsonEditingService: IJSONEditingService, _environmentService: INativeEnvironmentService, storageService: IStorageService, encryptionService: IEncryptionService, logService: ILogService);
    set(key: string, value: string): Promise<void>;
    private notifyOfNoEncryptionOnce;
    private notifyOfNoEncryption;
}
