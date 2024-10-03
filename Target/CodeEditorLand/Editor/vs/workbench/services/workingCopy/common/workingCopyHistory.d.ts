import { Event } from '../../../../base/common/event.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { URI } from '../../../../base/common/uri.js';
import { SaveSource } from '../../../common/editor.js';
export declare const IWorkingCopyHistoryService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IWorkingCopyHistoryService>;
export interface IWorkingCopyHistoryEvent {
    readonly entry: IWorkingCopyHistoryEntry;
}
export interface IWorkingCopyHistoryEntry {
    readonly id: string;
    readonly workingCopy: {
        readonly resource: URI;
        readonly name: string;
    };
    readonly location: URI;
    timestamp: number;
    source: SaveSource;
    sourceDescription: string | undefined;
}
export interface IWorkingCopyHistoryEntryDescriptor {
    readonly resource: URI;
    readonly timestamp?: number;
    readonly source?: SaveSource;
}
export interface IWorkingCopyHistoryService {
    readonly _serviceBrand: undefined;
    onDidAddEntry: Event<IWorkingCopyHistoryEvent>;
    onDidChangeEntry: Event<IWorkingCopyHistoryEvent>;
    onDidReplaceEntry: Event<IWorkingCopyHistoryEvent>;
    onDidRemoveEntry: Event<IWorkingCopyHistoryEvent>;
    onDidMoveEntries: Event<void>;
    onDidRemoveEntries: Event<void>;
    addEntry(descriptor: IWorkingCopyHistoryEntryDescriptor, token: CancellationToken): Promise<IWorkingCopyHistoryEntry | undefined>;
    updateEntry(entry: IWorkingCopyHistoryEntry, properties: {
        source: SaveSource;
    }, token: CancellationToken): Promise<void>;
    removeEntry(entry: IWorkingCopyHistoryEntry, token: CancellationToken): Promise<boolean>;
    moveEntries(source: URI, target: URI): Promise<URI[]>;
    getEntries(resource: URI, token: CancellationToken): Promise<readonly IWorkingCopyHistoryEntry[]>;
    getAll(token: CancellationToken): Promise<readonly URI[]>;
    removeAll(token: CancellationToken): Promise<void>;
}
export declare const MAX_PARALLEL_HISTORY_IO_OPS = 20;
