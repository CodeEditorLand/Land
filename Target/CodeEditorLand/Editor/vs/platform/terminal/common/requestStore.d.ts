import { Disposable } from '../../../base/common/lifecycle.js';
import { ILogService } from '../../log/common/log.js';
export declare class RequestStore<T, RequestArgs> extends Disposable {
    private readonly _logService;
    private _lastRequestId;
    private readonly _timeout;
    private _pendingRequests;
    private _pendingRequestDisposables;
    private readonly _onCreateRequest;
    readonly onCreateRequest: import("../../../workbench/workbench.web.main.internal.js").Event<RequestArgs & {
        requestId: number;
    }>;
    constructor(timeout: number | undefined, _logService: ILogService);
    createRequest(args: RequestArgs): Promise<T>;
    acceptReply(requestId: number, data: T): void;
}
