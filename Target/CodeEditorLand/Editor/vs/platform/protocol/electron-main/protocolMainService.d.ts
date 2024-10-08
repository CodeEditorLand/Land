import { Disposable, IDisposable } from '../../../base/common/lifecycle.js';
import { INativeEnvironmentService } from '../../environment/common/environment.js';
import { ILogService } from '../../log/common/log.js';
import { IIPCObjectUrl, IProtocolMainService } from './protocol.js';
import { IUserDataProfilesService } from '../../userDataProfile/common/userDataProfile.js';
export declare class ProtocolMainService extends Disposable implements IProtocolMainService {
    private readonly environmentService;
    private readonly logService;
    readonly _serviceBrand: undefined;
    private readonly validRoots;
    private readonly validExtensions;
    constructor(environmentService: INativeEnvironmentService, userDataProfilesService: IUserDataProfilesService, logService: ILogService);
    private handleProtocols;
    addValidFileRoot(root: string): IDisposable;
    private handleFileRequest;
    private handleResourceRequest;
    private requestToNormalizedFilePath;
    createIPCObjectUrl<T>(): IIPCObjectUrl<T>;
}
