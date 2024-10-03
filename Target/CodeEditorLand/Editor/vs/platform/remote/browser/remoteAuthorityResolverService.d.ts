import { Disposable } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { ILogService } from '../../log/common/log.js';
import { IProductService } from '../../product/common/productService.js';
import { IRemoteAuthorityResolverService, IRemoteConnectionData, ResolvedAuthority, ResolvedOptions, ResolverResult } from '../common/remoteAuthorityResolver.js';
export declare class RemoteAuthorityResolverService extends Disposable implements IRemoteAuthorityResolverService {
    private readonly _logService;
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeConnectionData;
    readonly onDidChangeConnectionData: import("../../../workbench/workbench.web.main.internal.js").Event<void>;
    private readonly _resolveAuthorityRequests;
    private readonly _cache;
    private readonly _connectionToken;
    private readonly _connectionTokens;
    private readonly _isWorkbenchOptionsBasedResolution;
    constructor(isWorkbenchOptionsBasedResolution: boolean, connectionToken: Promise<string> | string | undefined, resourceUriProvider: ((uri: URI) => URI) | undefined, serverBasePath: string | undefined, productService: IProductService, _logService: ILogService);
    resolveAuthority(authority: string): Promise<ResolverResult>;
    getCanonicalURI(uri: URI): Promise<URI>;
    getConnectionData(authority: string): IRemoteConnectionData | null;
    private _doResolveAuthority;
    _clearResolvedAuthority(authority: string): void;
    _setResolvedAuthority(resolvedAuthority: ResolvedAuthority, options?: ResolvedOptions): void;
    _setResolvedAuthorityError(authority: string, err: any): void;
    _setAuthorityConnectionToken(authority: string, connectionToken: string): void;
    _setCanonicalURIProvider(provider: (uri: URI) => Promise<URI>): void;
}
