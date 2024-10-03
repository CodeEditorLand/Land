import { IChecksumService } from '../../../../platform/checksum/common/checksumService.js';
import { registerSharedProcessRemoteService } from '../../../../platform/ipc/electron-sandbox/services.js';
registerSharedProcessRemoteService(IChecksumService, 'checksum');
