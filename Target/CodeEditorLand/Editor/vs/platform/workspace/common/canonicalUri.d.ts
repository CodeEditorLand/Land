import { CancellationToken } from '../../../base/common/cancellation.js';
import { IDisposable } from '../../../base/common/lifecycle.js';
import { URI, UriComponents } from '../../../base/common/uri.js';
export interface ICanonicalUriProvider {
    readonly scheme: string;
    provideCanonicalUri(uri: UriComponents, targetScheme: string, token: CancellationToken): Promise<URI | undefined>;
}
export declare const ICanonicalUriService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<ICanonicalUriService>;
export interface ICanonicalUriService {
    readonly _serviceBrand: undefined;
    registerCanonicalUriProvider(provider: ICanonicalUriProvider): IDisposable;
}
