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
    /**
     * Get the total number of entries in this data transfer.
     */
    get size(): number;
    /**
     * Check if this data transfer contains data for `mimeType`.
     *
     * This uses exact matching and does not support wildcards.
     */
    has(mimeType: string): boolean;
    /**
     * Check if this data transfer contains data matching `pattern`.
     *
     * This allows matching for wildcards, such as `image/*`.
     *
     * Use the special `files` mime type to match any file in the data transfer.
     */
    matches(pattern: string): boolean;
    /**
     * Retrieve the first entry for `mimeType`.
     *
     * Note that if you want to find all entries for a given mime type, use {@link IReadonlyVSDataTransfer.entries} instead.
     */
    get(mimeType: string): IDataTransferItem | undefined;
}
export declare class VSDataTransfer implements IReadonlyVSDataTransfer {
    private readonly _entries;
    get size(): number;
    has(mimeType: string): boolean;
    matches(pattern: string): boolean;
    get(mimeType: string): IDataTransferItem | undefined;
    /**
     * Add a new entry to this data transfer.
     *
     * This does not replace existing entries for `mimeType`.
     */
    append(mimeType: string, value: IDataTransferItem): void;
    /**
     * Set the entry for a given mime type.
     *
     * This replaces all existing entries for `mimeType`.
     */
    replace(mimeType: string, value: IDataTransferItem): void;
    /**
     * Remove all entries for `mimeType`.
     */
    delete(mimeType: string): void;
    /**
     * Iterate over all `[mime, item]` pairs in this data transfer.
     *
     * There may be multiple entries for each mime type.
     */
    [Symbol.iterator](): IterableIterator<readonly [string, IDataTransferItem]>;
    private toKey;
}
export declare function matchesMimeType(pattern: string, mimeTypes: readonly string[]): boolean;
export declare const UriList: Readonly<{
    create: (entries: ReadonlyArray<string | URI>) => string;
    split: (str: string) => string[];
    parse: (str: string) => string[];
}>;
