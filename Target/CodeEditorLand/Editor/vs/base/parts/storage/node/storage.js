/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as fs from 'fs';
import { timeout } from '../../../common/async.js';
import { Event } from '../../../common/event.js';
import { mapToString, setToString } from '../../../common/map.js';
import { basename } from '../../../common/path.js';
import { Promises } from '../../../node/pfs.js';
export class SQLiteStorageDatabase {
    static { this.IN_MEMORY_PATH = ':memory:'; }
    get onDidChangeItemsExternal() { return Event.None; } // since we are the only client, there can be no external changes
    static { this.BUSY_OPEN_TIMEOUT = 2000; } // timeout in ms to retry when opening DB fails with SQLITE_BUSY
    static { this.MAX_HOST_PARAMETERS = 256; } // maximum number of parameters within a statement
    constructor(path, options = Object.create(null)) {
        this.path = path;
        this.options = options;
        this.name = basename(this.path);
        this.logger = new SQLiteStorageDatabaseLogger(this.options.logging);
        this.whenConnected = this.connect(this.path);
    }
    async getItems() {
        const connection = await this.whenConnected;
        const items = new Map();
        const rows = await this.all(connection, 'SELECT * FROM ItemTable');
        rows.forEach(row => items.set(row.key, row.value));
        if (this.logger.isTracing) {
            this.logger.trace(`[storage ${this.name}] getItems(): ${items.size} rows`);
        }
        return items;
    }
    async updateItems(request) {
        const connection = await this.whenConnected;
        return this.doUpdateItems(connection, request);
    }
    doUpdateItems(connection, request) {
        if (this.logger.isTracing) {
            this.logger.trace(`[storage ${this.name}] updateItems(): insert(${request.insert ? mapToString(request.insert) : '0'}), delete(${request.delete ? setToString(request.delete) : '0'})`);
        }
        return this.transaction(connection, () => {
            const toInsert = request.insert;
            const toDelete = request.delete;
            // INSERT
            if (toInsert && toInsert.size > 0) {
                const keysValuesChunks = [];
                keysValuesChunks.push([]); // seed with initial empty chunk
                // Split key/values into chunks of SQLiteStorageDatabase.MAX_HOST_PARAMETERS
                // so that we can efficiently run the INSERT with as many HOST parameters as possible
                let currentChunkIndex = 0;
                toInsert.forEach((value, key) => {
                    let keyValueChunk = keysValuesChunks[currentChunkIndex];
                    if (keyValueChunk.length > SQLiteStorageDatabase.MAX_HOST_PARAMETERS) {
                        currentChunkIndex++;
                        keyValueChunk = [];
                        keysValuesChunks.push(keyValueChunk);
                    }
                    keyValueChunk.push(key, value);
                });
                keysValuesChunks.forEach(keysValuesChunk => {
                    this.prepare(connection, `INSERT INTO ItemTable VALUES ${new Array(keysValuesChunk.length / 2).fill('(?,?)').join(',')}`, stmt => stmt.run(keysValuesChunk), () => {
                        const keys = [];
                        let length = 0;
                        toInsert.forEach((value, key) => {
                            keys.push(key);
                            length += value.length;
                        });
                        return `Keys: ${keys.join(', ')} Length: ${length}`;
                    });
                });
            }
            // DELETE
            if (toDelete && toDelete.size) {
                const keysChunks = [];
                keysChunks.push([]); // seed with initial empty chunk
                // Split keys into chunks of SQLiteStorageDatabase.MAX_HOST_PARAMETERS
                // so that we can efficiently run the DELETE with as many HOST parameters
                // as possible
                let currentChunkIndex = 0;
                toDelete.forEach(key => {
                    let keyChunk = keysChunks[currentChunkIndex];
                    if (keyChunk.length > SQLiteStorageDatabase.MAX_HOST_PARAMETERS) {
                        currentChunkIndex++;
                        keyChunk = [];
                        keysChunks.push(keyChunk);
                    }
                    keyChunk.push(key);
                });
                keysChunks.forEach(keysChunk => {
                    this.prepare(connection, `DELETE FROM ItemTable WHERE key IN (${new Array(keysChunk.length).fill('?').join(',')})`, stmt => stmt.run(keysChunk), () => {
                        const keys = [];
                        toDelete.forEach(key => {
                            keys.push(key);
                        });
                        return `Keys: ${keys.join(', ')}`;
                    });
                });
            }
        });
    }
    async optimize() {
        this.logger.trace(`[storage ${this.name}] vacuum()`);
        const connection = await this.whenConnected;
        return this.exec(connection, 'VACUUM');
    }
    async close(recovery) {
        this.logger.trace(`[storage ${this.name}] close()`);
        const connection = await this.whenConnected;
        return this.doClose(connection, recovery);
    }
    doClose(connection, recovery) {
        return new Promise((resolve, reject) => {
            connection.db.close(closeError => {
                if (closeError) {
                    this.handleSQLiteError(connection, `[storage ${this.name}] close(): ${closeError}`);
                }
                // Return early if this storage was created only in-memory
                // e.g. when running tests we do not need to backup.
                if (this.path === SQLiteStorageDatabase.IN_MEMORY_PATH) {
                    return resolve();
                }
                // If the DB closed successfully and we are not running in-memory
                // and the DB did not get errors during runtime, make a backup
                // of the DB so that we can use it as fallback in case the actual
                // DB becomes corrupt in the future.
                if (!connection.isErroneous && !connection.isInMemory) {
                    return this.backup().then(resolve, error => {
                        this.logger.error(`[storage ${this.name}] backup(): ${error}`);
                        return resolve(); // ignore failing backup
                    });
                }
                // Recovery: if we detected errors while using the DB or we are using
                // an inmemory DB (as a fallback to not being able to open the DB initially)
                // and we have a recovery function provided, we recreate the DB with this
                // data to recover all known data without loss if possible.
                if (typeof recovery === 'function') {
                    // Delete the existing DB. If the path does not exist or fails to
                    // be deleted, we do not try to recover anymore because we assume
                    // that the path is no longer writeable for us.
                    return fs.promises.unlink(this.path).then(() => {
                        // Re-open the DB fresh
                        return this.doConnect(this.path).then(recoveryConnection => {
                            const closeRecoveryConnection = () => {
                                return this.doClose(recoveryConnection, undefined /* do not attempt to recover again */);
                            };
                            // Store items
                            return this.doUpdateItems(recoveryConnection, { insert: recovery() }).then(() => closeRecoveryConnection(), error => {
                                // In case of an error updating items, still ensure to close the connection
                                // to prevent SQLITE_BUSY errors when the connection is reestablished
                                closeRecoveryConnection();
                                return Promise.reject(error);
                            });
                        });
                    }).then(resolve, reject);
                }
                // Finally without recovery we just reject
                return reject(closeError || new Error('Database has errors or is in-memory without recovery option'));
            });
        });
    }
    backup() {
        const backupPath = this.toBackupPath(this.path);
        return Promises.copy(this.path, backupPath, { preserveSymlinks: false });
    }
    toBackupPath(path) {
        return `${path}.backup`;
    }
    async checkIntegrity(full) {
        this.logger.trace(`[storage ${this.name}] checkIntegrity(full: ${full})`);
        const connection = await this.whenConnected;
        const row = await this.get(connection, full ? 'PRAGMA integrity_check' : 'PRAGMA quick_check');
        const integrity = full ? row['integrity_check'] : row['quick_check'];
        if (connection.isErroneous) {
            return `${integrity} (last error: ${connection.lastError})`;
        }
        if (connection.isInMemory) {
            return `${integrity} (in-memory!)`;
        }
        return integrity;
    }
    async connect(path, retryOnBusy = true) {
        this.logger.trace(`[storage ${this.name}] open(${path}, retryOnBusy: ${retryOnBusy})`);
        try {
            return await this.doConnect(path);
        }
        catch (error) {
            this.logger.error(`[storage ${this.name}] open(): Unable to open DB due to ${error}`);
            // SQLITE_BUSY should only arise if another process is locking the same DB we want
            // to open at that time. This typically never happens because a DB connection is
            // limited per window. However, in the event of a window reload, it may be possible
            // that the previous connection was not properly closed while the new connection is
            // already established.
            //
            // In this case we simply wait for some time and retry once to establish the connection.
            //
            if (error.code === 'SQLITE_BUSY' && retryOnBusy) {
                await timeout(SQLiteStorageDatabase.BUSY_OPEN_TIMEOUT);
                return this.connect(path, false /* not another retry */);
            }
            // Otherwise, best we can do is to recover from a backup if that exists, as such we
            // move the DB to a different filename and try to load from backup. If that fails,
            // a new empty DB is being created automatically.
            //
            // The final fallback is to use an in-memory DB which should only happen if the target
            // folder is really not writeable for us.
            //
            try {
                await fs.promises.unlink(path);
                try {
                    await Promises.rename(this.toBackupPath(path), path, false /* no retry */);
                }
                catch (error) {
                    // ignore
                }
                return await this.doConnect(path);
            }
            catch (error) {
                this.logger.error(`[storage ${this.name}] open(): Unable to use backup due to ${error}`);
                // In case of any error to open the DB, use an in-memory
                // DB so that we always have a valid DB to talk to.
                return this.doConnect(SQLiteStorageDatabase.IN_MEMORY_PATH);
            }
        }
    }
    handleSQLiteError(connection, msg) {
        connection.isErroneous = true;
        connection.lastError = msg;
        this.logger.error(msg);
    }
    doConnect(path) {
        return new Promise((resolve, reject) => {
            import('@vscode/sqlite3').then(sqlite3 => {
                const ctor = (this.logger.isTracing ? sqlite3.default.verbose().Database : sqlite3.default.Database);
                const connection = {
                    db: new ctor(path, (error) => {
                        if (error) {
                            return (connection.db && error.code !== 'SQLITE_CANTOPEN' /* https://github.com/TryGhost/node-sqlite3/issues/1617 */) ? connection.db.close(() => reject(error)) : reject(error);
                        }
                        // The following exec() statement serves two purposes:
                        // - create the DB if it does not exist yet
                        // - validate that the DB is not corrupt (the open() call does not throw otherwise)
                        return this.exec(connection, [
                            'PRAGMA user_version = 1;',
                            'CREATE TABLE IF NOT EXISTS ItemTable (key TEXT UNIQUE ON CONFLICT REPLACE, value BLOB)'
                        ].join('')).then(() => {
                            return resolve(connection);
                        }, error => {
                            return connection.db.close(() => reject(error));
                        });
                    }),
                    isInMemory: path === SQLiteStorageDatabase.IN_MEMORY_PATH
                };
                // Errors
                connection.db.on('error', error => this.handleSQLiteError(connection, `[storage ${this.name}] Error (event): ${error}`));
                // Tracing
                if (this.logger.isTracing) {
                    connection.db.on('trace', sql => this.logger.trace(`[storage ${this.name}] Trace (event): ${sql}`));
                }
            }, reject);
        });
    }
    exec(connection, sql) {
        return new Promise((resolve, reject) => {
            connection.db.exec(sql, error => {
                if (error) {
                    this.handleSQLiteError(connection, `[storage ${this.name}] exec(): ${error}`);
                    return reject(error);
                }
                return resolve();
            });
        });
    }
    get(connection, sql) {
        return new Promise((resolve, reject) => {
            connection.db.get(sql, (error, row) => {
                if (error) {
                    this.handleSQLiteError(connection, `[storage ${this.name}] get(): ${error}`);
                    return reject(error);
                }
                return resolve(row);
            });
        });
    }
    all(connection, sql) {
        return new Promise((resolve, reject) => {
            connection.db.all(sql, (error, rows) => {
                if (error) {
                    this.handleSQLiteError(connection, `[storage ${this.name}] all(): ${error}`);
                    return reject(error);
                }
                return resolve(rows);
            });
        });
    }
    transaction(connection, transactions) {
        return new Promise((resolve, reject) => {
            connection.db.serialize(() => {
                connection.db.run('BEGIN TRANSACTION');
                transactions();
                connection.db.run('END TRANSACTION', error => {
                    if (error) {
                        this.handleSQLiteError(connection, `[storage ${this.name}] transaction(): ${error}`);
                        return reject(error);
                    }
                    return resolve();
                });
            });
        });
    }
    prepare(connection, sql, runCallback, errorDetails) {
        const stmt = connection.db.prepare(sql);
        const statementErrorListener = (error) => {
            this.handleSQLiteError(connection, `[storage ${this.name}] prepare(): ${error} (${sql}). Details: ${errorDetails()}`);
        };
        stmt.on('error', statementErrorListener);
        runCallback(stmt);
        stmt.finalize(error => {
            if (error) {
                statementErrorListener(error);
            }
            stmt.removeListener('error', statementErrorListener);
        });
    }
}
class SQLiteStorageDatabaseLogger {
    // to reduce lots of output, require an environment variable to enable tracing
    // this helps when running with --verbose normally where the storage tracing
    // might hide useful output to look at
    static { this.VSCODE_TRACE_STORAGE = 'VSCODE_TRACE_STORAGE'; }
    constructor(options) {
        if (options && typeof options.logTrace === 'function' && process.env[SQLiteStorageDatabaseLogger.VSCODE_TRACE_STORAGE]) {
            this.logTrace = options.logTrace;
        }
        if (options && typeof options.logError === 'function') {
            this.logError = options.logError;
        }
    }
    get isTracing() {
        return !!this.logTrace;
    }
    trace(msg) {
        this.logTrace?.(msg);
    }
    error(error) {
        this.logError?.(error);
    }
}
