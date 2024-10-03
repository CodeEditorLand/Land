import { CancellationToken } from '../../../base/common/cancellation.js';
import { URI } from '../../../base/common/uri.js';
import { IDownloadService } from './download.js';
import { IFileService } from '../../files/common/files.js';
import { IRequestService } from '../../request/common/request.js';
export declare class DownloadService implements IDownloadService {
    private readonly requestService;
    private readonly fileService;
    readonly _serviceBrand: undefined;
    constructor(requestService: IRequestService, fileService: IFileService);
    download(resource: URI, target: URI, cancellationToken?: CancellationToken): Promise<void>;
}
