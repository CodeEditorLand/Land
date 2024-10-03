import { Disposable } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
import { IFileService } from '../../files/common/files.js';
import { IUserDataProfilesService } from '../../userDataProfile/common/userDataProfile.js';
import { IResourceRefHandle, IUserDataSyncLocalStoreService, IUserDataSyncLogService, SyncResource } from './userDataSync.js';
export declare class UserDataSyncLocalStoreService extends Disposable implements IUserDataSyncLocalStoreService {
    private readonly environmentService;
    private readonly fileService;
    private readonly configurationService;
    private readonly logService;
    private readonly userDataProfilesService;
    _serviceBrand: any;
    constructor(environmentService: IEnvironmentService, fileService: IFileService, configurationService: IConfigurationService, logService: IUserDataSyncLogService, userDataProfilesService: IUserDataProfilesService);
    private cleanUp;
    getAllResourceRefs(resource: SyncResource, collection?: string, root?: URI): Promise<IResourceRefHandle[]>;
    resolveResourceContent(resourceKey: SyncResource, ref: string, collection?: string, root?: URI): Promise<string | null>;
    writeResource(resourceKey: SyncResource, content: string, cTime: Date, collection?: string, root?: URI): Promise<void>;
    private getResourceBackupHome;
    private cleanUpBackup;
    private getCreationTime;
}
