import { toErrorMessage } from '../common/errorMessage.js';
import { ErrorNoTelemetry, getErrorMessage } from '../common/errors.js';
import { mark } from '../common/performance.js';
class MissingStoresError extends Error {
    constructor(db) {
        super('Missing stores');
        this.db = db;
    }
}
export class DBClosedError extends Error {
    constructor(dbName) {
        super(`IndexedDB database '${dbName}' is closed.`);
        this.code = 'DBClosed';
    }
}
export class IndexedDB {
    static async create(name, version, stores) {
        const database = await IndexedDB.openDatabase(name, version, stores);
        return new IndexedDB(database, name);
    }
    static async openDatabase(name, version, stores) {
        mark(`code/willOpenDatabase/${name}`);
        try {
            return await IndexedDB.doOpenDatabase(name, version, stores);
        }
        catch (err) {
            if (err instanceof MissingStoresError) {
                console.info(`Attempting to recreate the IndexedDB once.`, name);
                try {
                    await IndexedDB.deleteDatabase(err.db);
                }
                catch (error) {
                    console.error(`Error while deleting the IndexedDB`, getErrorMessage(error));
                    throw error;
                }
                return await IndexedDB.doOpenDatabase(name, version, stores);
            }
            throw err;
        }
        finally {
            mark(`code/didOpenDatabase/${name}`);
        }
    }
    static doOpenDatabase(name, version, stores) {
        return new Promise((c, e) => {
            const request = indexedDB.open(name, version);
            request.onerror = () => e(request.error);
            request.onsuccess = () => {
                const db = request.result;
                for (const store of stores) {
                    if (!db.objectStoreNames.contains(store)) {
                        console.error(`Error while opening IndexedDB. Could not find '${store}'' object store`);
                        e(new MissingStoresError(db));
                        return;
                    }
                }
                c(db);
            };
            request.onupgradeneeded = () => {
                const db = request.result;
                for (const store of stores) {
                    if (!db.objectStoreNames.contains(store)) {
                        db.createObjectStore(store);
                    }
                }
            };
        });
    }
    static deleteDatabase(database) {
        return new Promise((c, e) => {
            database.close();
            const deleteRequest = indexedDB.deleteDatabase(database.name);
            deleteRequest.onerror = (err) => e(deleteRequest.error);
            deleteRequest.onsuccess = () => c();
        });
    }
    constructor(database, name) {
        this.name = name;
        this.database = null;
        this.pendingTransactions = [];
        this.database = database;
    }
    hasPendingTransactions() {
        return this.pendingTransactions.length > 0;
    }
    close() {
        if (this.pendingTransactions.length) {
            this.pendingTransactions.splice(0, this.pendingTransactions.length).forEach(transaction => transaction.abort());
        }
        this.database?.close();
        this.database = null;
    }
    async runInTransaction(store, transactionMode, dbRequestFn) {
        if (!this.database) {
            throw new DBClosedError(this.name);
        }
        const transaction = this.database.transaction(store, transactionMode);
        this.pendingTransactions.push(transaction);
        return new Promise((c, e) => {
            transaction.oncomplete = () => {
                if (Array.isArray(request)) {
                    c(request.map(r => r.result));
                }
                else {
                    c(request.result);
                }
            };
            transaction.onerror = () => e(transaction.error ? ErrorNoTelemetry.fromError(transaction.error) : new ErrorNoTelemetry('unknown error'));
            transaction.onabort = () => e(transaction.error ? ErrorNoTelemetry.fromError(transaction.error) : new ErrorNoTelemetry('unknown error'));
            const request = dbRequestFn(transaction.objectStore(store));
        }).finally(() => this.pendingTransactions.splice(this.pendingTransactions.indexOf(transaction), 1));
    }
    async getKeyValues(store, isValid) {
        if (!this.database) {
            throw new DBClosedError(this.name);
        }
        const transaction = this.database.transaction(store, 'readonly');
        this.pendingTransactions.push(transaction);
        return new Promise(resolve => {
            const items = new Map();
            const objectStore = transaction.objectStore(store);
            const cursor = objectStore.openCursor();
            if (!cursor) {
                return resolve(items);
            }
            cursor.onsuccess = () => {
                if (cursor.result) {
                    if (isValid(cursor.result.value)) {
                        items.set(cursor.result.key.toString(), cursor.result.value);
                    }
                    cursor.result.continue();
                }
                else {
                    resolve(items);
                }
            };
            const onError = (error) => {
                console.error(`IndexedDB getKeyValues(): ${toErrorMessage(error, true)}`);
                resolve(items);
            };
            cursor.onerror = () => onError(cursor.error);
            transaction.onerror = () => onError(transaction.error);
        }).finally(() => this.pendingTransactions.splice(this.pendingTransactions.indexOf(transaction), 1));
    }
}
