import { IDisposable } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
export declare const IProtocolMainService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IProtocolMainService>;
export interface IIPCObjectUrl<T> extends IDisposable {
    resource: URI;
    update(obj: T): void;
}
export interface IProtocolMainService {
    readonly _serviceBrand: undefined;
    createIPCObjectUrl<T>(): IIPCObjectUrl<T>;
    addValidFileRoot(root: string): IDisposable;
}
