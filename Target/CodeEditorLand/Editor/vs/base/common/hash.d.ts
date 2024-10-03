import { VSBuffer } from './buffer.js';
type NotSyncHashable = ArrayBufferLike | ArrayBufferView;
export declare function hash<T>(obj: T extends NotSyncHashable ? never : T): number;
export declare function doHash(obj: any, hashVal: number): number;
export declare function numberHash(val: number, initialHashVal: number): number;
export declare function stringHash(s: string, hashVal: number): number;
export declare const hashAsync: (input: string | ArrayBufferView | VSBuffer) => Promise<string>;
export declare class StringSHA1 {
    private static _bigBlock32;
    private _h0;
    private _h1;
    private _h2;
    private _h3;
    private _h4;
    private readonly _buff;
    private readonly _buffDV;
    private _buffLen;
    private _totalLen;
    private _leftoverHighSurrogate;
    private _finished;
    constructor();
    update(str: string): void;
    private _push;
    digest(): string;
    private _wrapUp;
    private _step;
}
export {};
