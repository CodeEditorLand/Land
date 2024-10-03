import { Disposable } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { IProductService } from '../../product/common/productService.js';
import { IRemoteAuthorityResolverService, IRemoteConnectionData, ResolvedAuthority, ResolvedOptions, ResolverResult } from '../common/remoteAuthorityResolver.js';
import { ElectronRemoteResourceLoader } from './electronRemoteResourceLoader.js';
export declare class RemoteAuthorityResolverService extends Disposable implements IRemoteAuthorityResolverService {
    private readonly remoteResourceLoader;
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeConnectionData;
    readonly onDidChangeConnectionData: import("../../../workbench/workbench.web.main.internal.js").Event<void>;
    private readonly _resolveAuthorityRequests;
    private readonly _connectionTokens;
    private readonly _canonicalURIRequests;
    private _canonicalURIProvider;
    constructor(productService: IProductService, remoteResourceLoader: ElectronRemoteResourceLoader);
    resolveAuthority(authority: string): Promise<ResolverResult>;
    getCanonicalURI(uri: URI): Promise<URI>;
    getConnectionData(authority: string): IRemoteConnectionData | null;
    _clearResolvedAuthority(authority: string): void;
    _setResolvedAuthority(resolvedAuthority: ResolvedAuthority, options?: ResolvedOptions): void;
    _setResolvedAuthorityError(authority: string, err: any): void;
    _setAuthorityConnectionToken(authority: string, connectionToken: string): void;
    _setCanonicalURIProvider(provider: (uri: URI) => Promise<URI>): void;
}
