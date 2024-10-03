import { URI, UriComponents } from './uri.js';
export interface IURITransformer {
    transformIncoming(uri: UriComponents): UriComponents;
    transformOutgoing(uri: UriComponents): UriComponents;
    transformOutgoingURI(uri: URI): URI;
    transformOutgoingScheme(scheme: string): string;
}
export interface UriParts {
    scheme: string;
    authority?: string;
    path?: string;
    query?: string;
    fragment?: string;
}
export interface IRawURITransformer {
    transformIncoming(uri: UriParts): UriParts;
    transformOutgoing(uri: UriParts): UriParts;
    transformOutgoingScheme(scheme: string): string;
}
export declare class URITransformer implements IURITransformer {
    private readonly _uriTransformer;
    constructor(uriTransformer: IRawURITransformer);
    transformIncoming(uri: UriComponents): UriComponents;
    transformOutgoing(uri: UriComponents): UriComponents;
    transformOutgoingURI(uri: URI): URI;
    transformOutgoingScheme(scheme: string): string;
}
export declare const DefaultURITransformer: IURITransformer;
export declare function transformOutgoingURIs<T>(obj: T, transformer: IURITransformer): T;
export declare function transformIncomingURIs<T>(obj: T, transformer: IURITransformer): T;
export declare function transformAndReviveIncomingURIs<T>(obj: T, transformer: IURITransformer): T;
