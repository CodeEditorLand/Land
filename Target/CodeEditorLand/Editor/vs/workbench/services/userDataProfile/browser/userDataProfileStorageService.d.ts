import { Event } from '../../../../base/common/event.js';
import { IStorageDatabase } from '../../../../base/parts/storage/common/storage.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { AbstractUserDataProfileStorageService, IProfileStorageChanges, IUserDataProfileStorageService } from '../../../../platform/userDataProfile/common/userDataProfileStorageService.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IUserDataProfile } from '../../../../platform/userDataProfile/common/userDataProfile.js';
import { IUserDataProfileService } from '../common/userDataProfile.js';
export declare class UserDataProfileStorageService extends AbstractUserDataProfileStorageService implements IUserDataProfileStorageService {
    private readonly userDataProfileService;
    private readonly logService;
    private readonly _onDidChange;
    readonly onDidChange: Event<IProfileStorageChanges>;
    constructor(storageService: IStorageService, userDataProfileService: IUserDataProfileService, logService: ILogService);
    private onDidChangeStorageTargetInCurrentProfile;
    private onDidChangeStorageValueInCurrentProfile;
    protected createStorageDatabase(profile: IUserDataProfile): Promise<IStorageDatabase>;
}
