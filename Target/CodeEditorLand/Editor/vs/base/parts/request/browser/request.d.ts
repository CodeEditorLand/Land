import { CancellationToken } from '../../../common/cancellation.js';
import { IRequestContext, IRequestOptions } from '../common/request.js';
export declare function request(options: IRequestOptions, token: CancellationToken): Promise<IRequestContext>;
