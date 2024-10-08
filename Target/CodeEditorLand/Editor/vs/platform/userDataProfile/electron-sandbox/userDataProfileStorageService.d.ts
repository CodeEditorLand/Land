import { RemoteUserDataProfileStorageService } from '../common/userDataProfileStorageService.js';
import { IStorageService } from '../../storage/common/storage.js';
import { ILogService } from '../../log/common/log.js';
import { IUserDataProfilesService } from '../common/userDataProfile.js';
import { IMainProcessService } from '../../ipc/common/mainProcessService.js';
export declare class NativeUserDataProfileStorageService extends RemoteUserDataProfileStorageService {
    constructor(mainProcessService: IMainProcessService, userDataProfilesService: IUserDataProfilesService, storageService: IStorageService, logService: ILogService);
}
