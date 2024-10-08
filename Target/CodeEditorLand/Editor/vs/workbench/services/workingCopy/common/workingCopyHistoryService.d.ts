import { Event, Emitter } from '../../../../base/common/event.js';
import { ILifecycleService } from '../../lifecycle/common/lifecycle.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IWorkingCopyHistoryEntry, IWorkingCopyHistoryEntryDescriptor, IWorkingCopyHistoryEvent, IWorkingCopyHistoryService } from './workingCopyHistory.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IRemoteAgentService } from '../../remote/common/remoteAgentService.js';
import { URI } from '../../../../base/common/uri.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { ResourceMap } from '../../../../base/common/map.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { SaveSource } from '../../../common/editor.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
export interface IWorkingCopyHistoryModelOptions {
    /**
     * Whether to flush when the model changes. If not
     * configured, `model.store()` has to be called
     * explicitly.
     */
    flushOnChange: boolean;
}
export declare class WorkingCopyHistoryModel {
    private readonly historyHome;
    private readonly entryAddedEmitter;
    private readonly entryChangedEmitter;
    private readonly entryReplacedEmitter;
    private readonly entryRemovedEmitter;
    private readonly options;
    private readonly fileService;
    private readonly labelService;
    private readonly logService;
    private readonly configurationService;
    static readonly ENTRIES_FILE = "entries.json";
    private static readonly FILE_SAVED_SOURCE;
    private static readonly SETTINGS;
    private entries;
    private whenResolved;
    private workingCopyResource;
    private workingCopyName;
    private historyEntriesFolder;
    private historyEntriesListingFile;
    private historyEntriesNameMatcher;
    private versionId;
    private storedVersionId;
    private readonly storeLimiter;
    constructor(workingCopyResource: URI, historyHome: URI, entryAddedEmitter: Emitter<IWorkingCopyHistoryEvent>, entryChangedEmitter: Emitter<IWorkingCopyHistoryEvent>, entryReplacedEmitter: Emitter<IWorkingCopyHistoryEvent>, entryRemovedEmitter: Emitter<IWorkingCopyHistoryEvent>, options: IWorkingCopyHistoryModelOptions, fileService: IFileService, labelService: ILabelService, logService: ILogService, configurationService: IConfigurationService);
    private setWorkingCopy;
    private toHistoryEntriesFolder;
    addEntry(source: string | undefined, sourceDescription: string | undefined, timestamp: number | undefined, token: CancellationToken): Promise<IWorkingCopyHistoryEntry>;
    private doAddEntry;
    private doReplaceEntry;
    removeEntry(entry: IWorkingCopyHistoryEntry, token: CancellationToken): Promise<boolean>;
    updateEntry(entry: IWorkingCopyHistoryEntry, properties: {
        source: SaveSource;
    }, token: CancellationToken): Promise<void>;
    getEntries(): Promise<readonly IWorkingCopyHistoryEntry[]>;
    hasEntries(skipResolve: boolean): Promise<boolean>;
    private resolveEntriesOnce;
    private doResolveEntries;
    private resolveEntriesFromDisk;
    moveEntries(target: WorkingCopyHistoryModel, source: SaveSource, token: CancellationToken): Promise<void>;
    store(token: CancellationToken): Promise<void>;
    private shouldStore;
    private doStore;
    private cleanUpEntries;
    private deleteEntry;
    private writeEntriesFile;
    private readEntriesFile;
    private readEntriesFolder;
    private isFileNotFound;
    private traceError;
}
export declare abstract class WorkingCopyHistoryService extends Disposable implements IWorkingCopyHistoryService {
    protected readonly fileService: IFileService;
    protected readonly remoteAgentService: IRemoteAgentService;
    protected readonly environmentService: IWorkbenchEnvironmentService;
    protected readonly uriIdentityService: IUriIdentityService;
    protected readonly labelService: ILabelService;
    protected readonly logService: ILogService;
    protected readonly configurationService: IConfigurationService;
    private static readonly FILE_MOVED_SOURCE;
    private static readonly FILE_RENAMED_SOURCE;
    readonly _serviceBrand: undefined;
    protected readonly _onDidAddEntry: Emitter<IWorkingCopyHistoryEvent>;
    readonly onDidAddEntry: Event<IWorkingCopyHistoryEvent>;
    protected readonly _onDidChangeEntry: Emitter<IWorkingCopyHistoryEvent>;
    readonly onDidChangeEntry: Event<IWorkingCopyHistoryEvent>;
    protected readonly _onDidReplaceEntry: Emitter<IWorkingCopyHistoryEvent>;
    readonly onDidReplaceEntry: Event<IWorkingCopyHistoryEvent>;
    private readonly _onDidMoveEntries;
    readonly onDidMoveEntries: Event<void>;
    protected readonly _onDidRemoveEntry: Emitter<IWorkingCopyHistoryEvent>;
    readonly onDidRemoveEntry: Event<IWorkingCopyHistoryEvent>;
    private readonly _onDidRemoveEntries;
    readonly onDidRemoveEntries: Event<void>;
    private readonly localHistoryHome;
    protected readonly models: ResourceMap<WorkingCopyHistoryModel>;
    constructor(fileService: IFileService, remoteAgentService: IRemoteAgentService, environmentService: IWorkbenchEnvironmentService, uriIdentityService: IUriIdentityService, labelService: ILabelService, logService: ILogService, configurationService: IConfigurationService);
    private resolveLocalHistoryHome;
    moveEntries(source: URI, target: URI): Promise<URI[]>;
    private doMoveEntries;
    addEntry({ resource, source, timestamp }: IWorkingCopyHistoryEntryDescriptor, token: CancellationToken): Promise<IWorkingCopyHistoryEntry | undefined>;
    updateEntry(entry: IWorkingCopyHistoryEntry, properties: {
        source: SaveSource;
    }, token: CancellationToken): Promise<void>;
    removeEntry(entry: IWorkingCopyHistoryEntry, token: CancellationToken): Promise<boolean>;
    removeAll(token: CancellationToken): Promise<void>;
    getEntries(resource: URI, token: CancellationToken): Promise<readonly IWorkingCopyHistoryEntry[]>;
    getAll(token: CancellationToken): Promise<readonly URI[]>;
    private getModel;
    protected abstract getModelOptions(): IWorkingCopyHistoryModelOptions;
}
export declare class NativeWorkingCopyHistoryService extends WorkingCopyHistoryService {
    private readonly lifecycleService;
    private static readonly STORE_ALL_INTERVAL;
    private readonly isRemotelyStored;
    private readonly storeAllCts;
    private readonly storeAllScheduler;
    constructor(fileService: IFileService, remoteAgentService: IRemoteAgentService, environmentService: IWorkbenchEnvironmentService, uriIdentityService: IUriIdentityService, labelService: ILabelService, lifecycleService: ILifecycleService, logService: ILogService, configurationService: IConfigurationService);
    private registerListeners;
    protected getModelOptions(): IWorkingCopyHistoryModelOptions;
    private onWillShutdown;
    private onDidChangeModels;
    private storeAll;
}
