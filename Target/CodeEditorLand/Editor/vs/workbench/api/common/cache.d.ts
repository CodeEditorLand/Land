export declare class Cache<T> {
    private readonly id;
    private static readonly enableDebugLogging;
    private readonly _data;
    private _idPool;
    constructor(id: string);
    add(item: readonly T[]): number;
    get(pid: number, id: number): T | undefined;
    delete(id: number): void;
    private logDebugInfo;
}
