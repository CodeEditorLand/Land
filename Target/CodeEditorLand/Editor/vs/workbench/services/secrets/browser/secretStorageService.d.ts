import { IEncryptionService } from '../../../../platform/encryption/common/encryptionService.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { BaseSecretStorageService } from '../../../../platform/secrets/common/secrets.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IBrowserWorkbenchEnvironmentService } from '../../environment/browser/environmentService.js';
export declare class BrowserSecretStorageService extends BaseSecretStorageService {
    private readonly _secretStorageProvider;
    private readonly _embedderSequencer;
    constructor(storageService: IStorageService, encryptionService: IEncryptionService, environmentService: IBrowserWorkbenchEnvironmentService, logService: ILogService);
    get(key: string): Promise<string | undefined>;
    set(key: string, value: string): Promise<void>;
    delete(key: string): Promise<void>;
    get type(): "unknown" | "in-memory" | "persisted";
}
