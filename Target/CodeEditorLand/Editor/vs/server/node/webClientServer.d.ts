import * as http from 'http';
import * as url from 'url';
import { ILogService } from '../../platform/log/common/log.js';
import { IServerEnvironmentService } from './serverEnvironmentService.js';
import { IProductService } from '../../platform/product/common/productService.js';
import { ServerConnectionToken } from './serverConnectionToken.js';
import { IRequestService } from '../../platform/request/common/request.js';
import { ICSSDevelopmentService } from '../../platform/cssDev/node/cssDevService.js';
/**
 * Return an error to the client.
 */
export declare function serveError(req: http.IncomingMessage, res: http.ServerResponse, errorCode: number, errorMessage: string): Promise<void>;
export declare const enum CacheControl {
    NO_CACHING = 0,
    ETAG = 1,
    NO_EXPIRY = 2
}
/**
 * Serve a file at a given path or 404 if the file is missing.
 */
export declare function serveFile(filePath: string, cacheControl: CacheControl, logService: ILogService, req: http.IncomingMessage, res: http.ServerResponse, responseHeaders: Record<string, string>): Promise<void>;
export declare class WebClientServer {
    private readonly _connectionToken;
    private readonly _basePath;
    readonly serverRootPath: string;
    private readonly _environmentService;
    private readonly _logService;
    private readonly _requestService;
    private readonly _productService;
    private readonly _cssDevService;
    private readonly _webExtensionResourceUrlTemplate;
    private readonly _staticRoute;
    private readonly _callbackRoute;
    private readonly _webExtensionRoute;
    constructor(_connectionToken: ServerConnectionToken, _basePath: string, serverRootPath: string, _environmentService: IServerEnvironmentService, _logService: ILogService, _requestService: IRequestService, _productService: IProductService, _cssDevService: ICSSDevelopmentService);
    /**
     * Handle web resources (i.e. only needed by the web client).
     * **NOTE**: This method is only invoked when the server has web bits.
     * **NOTE**: This method is only invoked after the connection token has been validated.
     */
    handle(req: http.IncomingMessage, res: http.ServerResponse, parsedUrl: url.UrlWithParsedQuery): Promise<void>;
    /**
     * Handle HTTP requests for /static/*
     */
    private _handleStatic;
    private _getResourceURLTemplateAuthority;
    /**
     * Handle extension resources
     */
    private _handleWebExtensionResource;
    /**
     * Handle HTTP requests for /
     */
    private _handleRoot;
    private _getScriptCspHashes;
    /**
     * Handle HTTP requests for /callback
     */
    private _handleCallback;
}
