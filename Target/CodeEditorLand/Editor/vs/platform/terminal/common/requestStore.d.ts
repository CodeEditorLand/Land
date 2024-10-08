import { Disposable } from '../../../base/common/lifecycle.js';
import { ILogService } from '../../log/common/log.js';
/**
 * A helper class to track requests that have replies. Using this it's easy to implement an event
 * that accepts a reply.
 */
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
    /**
     * @param timeout How long in ms to allow requests to go unanswered for, undefined will use the
     * default (15 seconds).
     */
    constructor(timeout: number | undefined, _logService: ILogService);
    /**
     * Creates a request.
     * @param args The arguments to pass to the onCreateRequest event.
     */
    createRequest(args: RequestArgs): Promise<T>;
    /**
     * Accept a reply to a request.
     * @param requestId The request ID originating from the onCreateRequest event.
     * @param data The reply data.
     */
    acceptReply(requestId: number, data: T): void;
}
