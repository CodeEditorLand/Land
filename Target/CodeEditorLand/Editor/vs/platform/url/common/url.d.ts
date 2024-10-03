import { IDisposable } from '../../../base/common/lifecycle.js';
import { URI, UriComponents } from '../../../base/common/uri.js';
export declare const IURLService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IURLService>;
export interface IOpenURLOptions {
    trusted?: boolean;
    originalUrl?: string;
}
export interface IURLHandler {
    handleURL(uri: URI, options?: IOpenURLOptions): Promise<boolean>;
}
export interface IURLService {
    readonly _serviceBrand: undefined;
    create(options?: Partial<UriComponents>): URI;
    open(url: URI, options?: IOpenURLOptions): Promise<boolean>;
    registerHandler(handler: IURLHandler): IDisposable;
}
