import { IEncryptionService, KnownStorageProvider } from '../../../../platform/encryption/common/encryptionService.js';
export declare class EncryptionService implements IEncryptionService {
    readonly _serviceBrand: undefined;
    encrypt(value: string): Promise<string>;
    decrypt(value: string): Promise<string>;
    isEncryptionAvailable(): Promise<boolean>;
    getKeyStorageProvider(): Promise<KnownStorageProvider>;
    setUsePlainTextEncryption(): Promise<void>;
}
