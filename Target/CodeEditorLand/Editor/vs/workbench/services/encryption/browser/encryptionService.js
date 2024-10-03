import { IEncryptionService } from '../../../../platform/encryption/common/encryptionService.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
export class EncryptionService {
    encrypt(value) {
        return Promise.resolve(value);
    }
    decrypt(value) {
        return Promise.resolve(value);
    }
    isEncryptionAvailable() {
        return Promise.resolve(false);
    }
    getKeyStorageProvider() {
        return Promise.resolve("basic_text");
    }
    setUsePlainTextEncryption() {
        return Promise.resolve(undefined);
    }
}
registerSingleton(IEncryptionService, EncryptionService, 1);
