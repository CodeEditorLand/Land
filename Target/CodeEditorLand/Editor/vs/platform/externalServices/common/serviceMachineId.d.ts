import { IEnvironmentService } from '../../environment/common/environment.js';
import { IFileService } from '../../files/common/files.js';
import { IStorageService } from '../../storage/common/storage.js';
export declare function getServiceMachineId(environmentService: IEnvironmentService, fileService: IFileService, storageService: IStorageService | undefined): Promise<string>;
