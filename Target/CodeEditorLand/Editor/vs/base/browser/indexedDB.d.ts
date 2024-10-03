export declare class DBClosedError extends Error {
    readonly code = "DBClosed";
    constructor(dbName: string);
}
export declare class IndexedDB {
    private readonly name;
    static create(name: string, version: number | undefined, stores: string[]): Promise<IndexedDB>;
    private static openDatabase;
    private static doOpenDatabase;
    private static deleteDatabase;
    private database;
    private readonly pendingTransactions;
    constructor(database: IDBDatabase, name: string);
    hasPendingTransactions(): boolean;
    close(): void;
    runInTransaction<T>(store: string, transactionMode: IDBTransactionMode, dbRequestFn: (store: IDBObjectStore) => IDBRequest<T>[]): Promise<T[]>;
    runInTransaction<T>(store: string, transactionMode: IDBTransactionMode, dbRequestFn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T>;
    getKeyValues<V>(store: string, isValid: (value: unknown) => value is V): Promise<Map<string, V>>;
}
