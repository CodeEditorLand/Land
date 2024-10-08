/**
 * @param {FetchEvent} event
 * @param {{
 * 		scheme: string;
 * 		authority: string;
 * 		path: string;
 * 		query: string;
 * }} requestUrlComponents
 */
declare function processResourceRequest(event: FetchEvent, requestUrlComponents: {
    scheme: string;
    authority: string;
    path: string;
    query: string;
}): Promise<Response>;
/**
 * @param {FetchEvent} event
 * @param {URL} requestUrl
 * @return {Promise<Response>}
 */
declare function processLocalhostRequest(event: FetchEvent, requestUrl: URL): Promise<Response>;
/**
 * @param {Client} client
 * @returns {string | null}
 */
declare function getWebviewIdForClient(client: Client): string | null;
/**
 * @param {string} webviewId
 * @returns {Promise<Client[]>}
 */
declare function getOuterIframeClient(webviewId: string): Promise<Client[]>;
declare const sw: ServiceWorkerGlobalScope;
declare const VERSION: 4;
declare const resourceCacheName: "vscode-resource-cache-4";
declare const rootPath: string;
declare const searchParams: URLSearchParams;
declare const remoteAuthority: string | null;
/**
 * Origin used for resources
 */
declare const resourceBaseAuthority: string | null;
declare const resolveTimeout: 30000;
/**
 * @template T
 * @typedef {{ status: 'ok'; value: T } | { status: 'timeout' }} RequestStoreResult
 */
/**
 * @template T
 * @typedef {{
 *     resolve: (x: RequestStoreResult<T>) => void,
 *     promise: Promise<RequestStoreResult<T>>
 * }} RequestStoreEntry
 */
/**
 * Caches
 * @template T
 */
declare class RequestStore<T> {
    /** @type {Map<number, RequestStoreEntry<T>>} */
    map: Map<number, RequestStoreEntry<T>>;
    requestPool: number;
    /**
     * @returns {{ requestId: number, promise: Promise<RequestStoreResult<T>> }}
     */
    create(): {
        requestId: number;
        promise: Promise<RequestStoreResult<T>>;
    };
    /**
     * @param {number} requestId
     * @param {T} result
     * @return {boolean}
     */
    resolve(requestId: number, result: T): boolean;
}
/**
 * @typedef {{ readonly status: 200; id: number; path: string; mime: string; data: Uint8Array; etag: string | undefined; mtime: number | undefined; }
 * 		| { readonly status: 304; id: number; path: string; mime: string; mtime: number | undefined }
 *		| { readonly status: 401; id: number; path: string }
 *		| { readonly status: 404; id: number; path: string }} ResourceResponse
 */
/**
 * Map of requested paths to responses.
 *
 * @type {RequestStore<ResourceResponse>}
 */
declare const resourceRequestStore: RequestStore<ResourceResponse>;
/**
 * Map of requested localhost origins to optional redirects.
 *
 * @type {RequestStore<string | undefined>}
 */
declare const localhostRequestStore: RequestStore<string | undefined>;
declare function unauthorized(): Response;
declare function notFound(): Response;
declare function methodNotAllowed(): Response;
declare function requestTimeout(): Response;
type RequestStoreResult<T> = {
    status: "ok";
    value: T;
} | {
    status: "timeout";
};
type RequestStoreEntry<T> = {
    resolve: (x: RequestStoreResult<T>) => void;
    promise: Promise<RequestStoreResult<T>>;
};
type ResourceResponse = {
    readonly status: 200;
    id: number;
    path: string;
    mime: string;
    data: Uint8Array;
    etag: string | undefined;
    mtime: number | undefined;
} | {
    readonly status: 304;
    id: number;
    path: string;
    mime: string;
    mtime: number | undefined;
} | {
    readonly status: 401;
    id: number;
    path: string;
} | {
    readonly status: 404;
    id: number;
    path: string;
};
