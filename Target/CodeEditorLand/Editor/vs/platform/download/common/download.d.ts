import { CancellationToken } from '../../../base/common/cancellation.js';
import { URI } from '../../../base/common/uri.js';
export declare const IDownloadService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IDownloadService>;
export interface IDownloadService {
    readonly _serviceBrand: undefined;
    download(uri: URI, to: URI, cancellationToken?: CancellationToken): Promise<void>;
}
