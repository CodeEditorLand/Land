import { VSBuffer } from './buffer.js';
import { URI, UriComponents } from './uri.js';
import { MarshalledId } from './marshallingIds.js';
export declare function stringify(obj: any): string;
export declare function parse(text: string): any;
export interface MarshalledObject {
    $mid: MarshalledId;
}
type Deserialize<T> = T extends UriComponents ? URI : T extends VSBuffer ? VSBuffer : T extends object ? Revived<T> : T;
export type Revived<T> = {
    [K in keyof T]: Deserialize<T[K]>;
};
export declare function revive<T = any>(obj: any, depth?: number): Revived<T>;
export {};
