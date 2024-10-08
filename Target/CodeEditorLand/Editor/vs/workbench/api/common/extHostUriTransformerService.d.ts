import { IURITransformer } from '../../../base/common/uriIpc.js';
import { URI, UriComponents } from '../../../base/common/uri.js';
export interface IURITransformerService extends IURITransformer {
    readonly _serviceBrand: undefined;
}
export declare const IURITransformerService: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IURITransformerService>;
export declare class URITransformerService implements IURITransformerService {
    readonly _serviceBrand: undefined;
    transformIncoming: (uri: UriComponents) => UriComponents;
    transformOutgoing: (uri: UriComponents) => UriComponents;
    transformOutgoingURI: (uri: URI) => URI;
    transformOutgoingScheme: (scheme: string) => string;
    constructor(delegate: IURITransformer | null);
}
