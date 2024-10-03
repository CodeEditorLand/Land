import { URI } from '../../../base/common/uri.js';
import { IExtUri } from '../../../base/common/resources.js';
export declare const IUriIdentityService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IUriIdentityService>;
export interface IUriIdentityService {
    readonly _serviceBrand: undefined;
    readonly extUri: IExtUri;
    asCanonicalUri(uri: URI): URI;
}
