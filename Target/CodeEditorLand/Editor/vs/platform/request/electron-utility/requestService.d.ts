import { CancellationToken } from '../../../base/common/cancellation.js';
import { IRequestContext, IRequestOptions } from '../../../base/parts/request/common/request.js';
import { RequestService as NodeRequestService } from '../node/requestService.js';
export declare class RequestService extends NodeRequestService {
    request(options: IRequestOptions, token: CancellationToken): Promise<IRequestContext>;
}
