import { registerMainProcessRemoteService } from '../../../../platform/ipc/electron-sandbox/services.js';
import { IEncryptionService } from '../../../../platform/encryption/common/encryptionService.js';
registerMainProcessRemoteService(IEncryptionService, 'encryption');
