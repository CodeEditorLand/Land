import { VSBufferReadableStream } from '../../../common/buffer.js';
export declare function isOfflineError(error: any): boolean;
export declare class OfflineError extends Error {
    constructor();
}
export interface IHeaders {
    'Proxy-Authorization'?: string;
    'x-operation-id'?: string;
    'retry-after'?: string;
    etag?: string;
    'Content-Length'?: string;
    'activityid'?: string;
    'X-Market-User-Id'?: string;
    [header: string]: string | string[] | undefined;
}
export interface IRequestOptions {
    type?: string;
    url?: string;
    user?: string;
    password?: string;
    headers?: IHeaders;
    timeout?: number;
    data?: string;
    followRedirects?: number;
    proxyAuthorization?: string;
}
export interface IRequestContext {
    res: {
        headers: IHeaders;
        statusCode?: number;
    };
    stream: VSBufferReadableStream;
}
