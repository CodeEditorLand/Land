import { KnownStorageProvider, IEncryptionMainService } from '../common/encryptionService.js';
import { ILogService } from '../../log/common/log.js';
export declare class EncryptionMainService implements IEncryptionMainService {
    private readonly logService;
    _serviceBrand: undefined;
    constructor(logService: ILogService);
    encrypt(value: string): Promise<string>;
    decrypt(value: string): Promise<string>;
    isEncryptionAvailable(): Promise<boolean>;
    getKeyStorageProvider(): Promise<KnownStorageProvider>;
    setUsePlainTextEncryption(): Promise<void>;
}
