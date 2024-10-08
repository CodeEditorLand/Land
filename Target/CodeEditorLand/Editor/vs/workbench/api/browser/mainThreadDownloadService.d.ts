import { Disposable } from '../../../base/common/lifecycle.js';
import { MainThreadDownloadServiceShape } from '../common/extHost.protocol.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { IDownloadService } from '../../../platform/download/common/download.js';
import { UriComponents } from '../../../base/common/uri.js';
export declare class MainThreadDownloadService extends Disposable implements MainThreadDownloadServiceShape {
    private readonly downloadService;
    constructor(extHostContext: IExtHostContext, downloadService: IDownloadService);
    $download(uri: UriComponents, to: UriComponents): Promise<void>;
}
