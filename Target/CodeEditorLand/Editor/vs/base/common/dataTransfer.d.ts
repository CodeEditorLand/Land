import { URI } from './uri.js';
export interface IDataTransferFile {
    readonly id: string;
    readonly name: string;
    readonly uri?: URI;
    data(): Promise<Uint8Array>;
}
export interface IDataTransferItem {
    asString(): Thenable<string>;
    asFile(): IDataTransferFile | undefined;
    value: any;
}
export declare function createStringDataTransferItem(stringOrPromise: string | Promise<string>): IDataTransferItem;
export declare function createFileDataTransferItem(fileName: string, uri: URI | undefined, data: () => Promise<Uint8Array>): IDataTransferItem;
export interface IReadonlyVSDataTransfer extends Iterable<readonly [string, IDataTransferItem]> {
    get size(): number;
    has(mimeType: string): boolean;
    matches(pattern: string): boolean;
    get(mimeType: string): IDataTransferItem | undefined;
}
export declare class VSDataTransfer implements IReadonlyVSDataTransfer {
    private readonly _entries;
    get size(): number;
    has(mimeType: string): boolean;
    matches(pattern: string): boolean;
    get(mimeType: string): IDataTransferItem | undefined;
    append(mimeType: string, value: IDataTransferItem): void;
    replace(mimeType: string, value: IDataTransferItem): void;
    delete(mimeType: string): void;
    [Symbol.iterator](): IterableIterator<readonly [string, IDataTransferItem]>;
    private toKey;
}
export declare function matchesMimeType(pattern: string, mimeTypes: readonly string[]): boolean;
export declare const UriList: Readonly<{
    create: (entries: ReadonlyArray<string | URI>) => string;
    split: (str: string) => string[];
    parse: (str: string) => string[];
}>;
