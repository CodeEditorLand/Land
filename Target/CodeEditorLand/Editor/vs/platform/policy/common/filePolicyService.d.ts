import { URI } from '../../../base/common/uri.js';
import { IFileService } from '../../files/common/files.js';
import { ILogService } from '../../log/common/log.js';
import { AbstractPolicyService, IPolicyService } from './policy.js';
export declare class FilePolicyService extends AbstractPolicyService implements IPolicyService {
    private readonly file;
    private readonly fileService;
    private readonly logService;
    private readonly throttledDelayer;
    constructor(file: URI, fileService: IFileService, logService: ILogService);
    protected _updatePolicyDefinitions(): Promise<void>;
    private read;
    private refresh;
}
