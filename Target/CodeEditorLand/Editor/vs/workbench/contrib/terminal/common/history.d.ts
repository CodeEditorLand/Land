import { Disposable } from "../../../../base/common/lifecycle.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { TerminalShellType } from "../../../../platform/terminal/common/terminal.js";
/**
 * Tracks a list of generic entries.
 */
export interface ITerminalPersistedHistory<T> {
    /**
     * The persisted entries.
     */
    readonly entries: IterableIterator<[string, T]>;
    /**
     * Adds an entry.
     */
    add(key: string, value: T): void;
    /**
     * Removes an entry.
     */
    remove(key: string): void;
    /**
     * Clears all entries.
     */
    clear(): void;
}
export declare function getCommandHistory(accessor: ServicesAccessor): ITerminalPersistedHistory<{
    shellType: TerminalShellType | undefined;
}>;
export declare function getDirectoryHistory(accessor: ServicesAccessor): ITerminalPersistedHistory<{
    remoteAuthority?: string;
}>;
export declare function getShellFileHistory(accessor: ServicesAccessor, shellType: TerminalShellType | undefined): Promise<string[]>;
export declare function clearShellFileHistory(): void;
export declare class TerminalPersistedHistory<T> extends Disposable implements ITerminalPersistedHistory<T> {
    private readonly _storageDataKey;
    private readonly _configurationService;
    private readonly _storageService;
    private readonly _entries;
    private _timestamp;
    private _isReady;
    private _isStale;
    get entries(): IterableIterator<[string, T]>;
    constructor(_storageDataKey: string, _configurationService: IConfigurationService, _storageService: IStorageService);
    add(key: string, value: T): void;
    remove(key: string): void;
    clear(): void;
    private _ensureUpToDate;
    private _loadState;
    private _loadPersistedState;
    private _saveState;
    private _getHistoryLimit;
    private _getTimestampStorageKey;
    private _getEntriesStorageKey;
}
export declare function fetchBashHistory(accessor: ServicesAccessor): Promise<IterableIterator<string> | undefined>;
export declare function fetchZshHistory(accessor: ServicesAccessor): Promise<SetIterator<string> | undefined>;
export declare function fetchPythonHistory(accessor: ServicesAccessor): Promise<IterableIterator<string> | undefined>;
export declare function fetchPwshHistory(accessor: ServicesAccessor): Promise<SetIterator<string> | undefined>;
export declare function fetchFishHistory(accessor: ServicesAccessor): Promise<SetIterator<string> | undefined>;
export declare function sanitizeFishHistoryCmd(cmd: string): string;
