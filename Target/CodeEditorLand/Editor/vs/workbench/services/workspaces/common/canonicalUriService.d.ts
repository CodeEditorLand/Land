import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { ICanonicalUriService, ICanonicalUriProvider } from '../../../../platform/workspace/common/canonicalUri.js';
export declare class CanonicalUriService implements ICanonicalUriService {
    readonly _serviceBrand: undefined;
    private readonly _providers;
    registerCanonicalUriProvider(provider: ICanonicalUriProvider): IDisposable;
    provideCanonicalUri(uri: URI, targetScheme: string, token: CancellationToken): Promise<URI | undefined>;
}
