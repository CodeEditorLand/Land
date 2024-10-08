/**
 * An array that avoids being sparse by always
 * filling up unused indices with a default value.
 */
export declare class FixedArray<T> {
    private readonly _default;
    private _store;
    constructor(_default: T);
    get(index: number): T;
    set(index: number, value: T): void;
    replace(index: number, oldLength: number, newLength: number): void;
    delete(deleteIndex: number, deleteCount: number): void;
    insert(insertIndex: number, insertCount: number): void;
}
