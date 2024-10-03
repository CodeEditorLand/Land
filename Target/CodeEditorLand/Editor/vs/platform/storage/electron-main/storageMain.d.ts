import { Emitter, Event } from '../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../base/common/lifecycle.js';
import { IStorage, Storage } from '../../../base/parts/storage/common/storage.js';
import { ISQLiteStorageDatabaseLoggingOptions } from '../../../base/parts/storage/node/storage.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
import { IFileService } from '../../files/common/files.js';
import { ILogService } from '../../log/common/log.js';
import { IUserDataProfile, IUserDataProfilesService } from '../../userDataProfile/common/userDataProfile.js';
import { IAnyWorkspaceIdentifier } from '../../workspace/common/workspace.js';
export interface IStorageMainOptions {
    readonly useInMemoryStorage?: boolean;
}
export interface IStorageMain extends IDisposable {
    readonly onDidChangeStorage: Event<IStorageChangeEvent>;
    readonly onDidCloseStorage: Event<void>;
    readonly items: Map<string, string>;
    readonly whenInit: Promise<void>;
    readonly storage: IStorage;
    readonly path: string | undefined;
    init(): Promise<void>;
    get(key: string, fallbackValue: string): string;
    get(key: string, fallbackValue?: string): string | undefined;
    set(key: string, value: string | boolean | number | undefined | null): void;
    delete(key: string): void;
    isInMemory(): boolean;
    optimize(): Promise<void>;
    close(): Promise<void>;
}
export interface IStorageChangeEvent {
    readonly key: string;
}
declare abstract class BaseStorageMain extends Disposable implements IStorageMain {
    protected readonly logService: ILogService;
    private readonly fileService;
    private static readonly LOG_SLOW_CLOSE_THRESHOLD;
    protected readonly _onDidChangeStorage: Emitter<IStorageChangeEvent>;
    readonly onDidChangeStorage: Event<IStorageChangeEvent>;
    private readonly _onDidCloseStorage;
    readonly onDidCloseStorage: Event<void>;
    private _storage;
    get storage(): IStorage;
    abstract get path(): string | undefined;
    private initializePromise;
    private readonly whenInitPromise;
    readonly whenInit: Promise<void>;
    private state;
    constructor(logService: ILogService, fileService: IFileService);
    isInMemory(): boolean;
    init(): Promise<void>;
    protected createLoggingOptions(): ISQLiteStorageDatabaseLoggingOptions;
    protected doInit(storage: IStorage): Promise<void>;
    protected abstract doCreate(): Promise<Storage>;
    get items(): Map<string, string>;
    get(key: string, fallbackValue: string): string;
    get(key: string, fallbackValue?: string): string | undefined;
    set(key: string, value: string | boolean | number | undefined | null): Promise<void>;
    delete(key: string): Promise<void>;
    optimize(): Promise<void>;
    close(): Promise<void>;
    private logSlowClose;
    private doClose;
}
declare class BaseProfileAwareStorageMain extends BaseStorageMain {
    private readonly profile;
    private readonly options;
    private static readonly STORAGE_NAME;
    get path(): string | undefined;
    constructor(profile: IUserDataProfile, options: IStorageMainOptions, logService: ILogService, fileService: IFileService);
    protected doCreate(): Promise<Storage>;
}
export declare class ProfileStorageMain extends BaseProfileAwareStorageMain {
    constructor(profile: IUserDataProfile, options: IStorageMainOptions, logService: ILogService, fileService: IFileService);
}
export declare class ApplicationStorageMain extends BaseProfileAwareStorageMain {
    constructor(options: IStorageMainOptions, userDataProfileService: IUserDataProfilesService, logService: ILogService, fileService: IFileService);
    protected doInit(storage: IStorage): Promise<void>;
    private updateTelemetryState;
}
export declare class WorkspaceStorageMain extends BaseStorageMain {
    private workspace;
    private readonly options;
    private readonly environmentService;
    private static readonly WORKSPACE_STORAGE_NAME;
    private static readonly WORKSPACE_META_NAME;
    get path(): string | undefined;
    constructor(workspace: IAnyWorkspaceIdentifier, options: IStorageMainOptions, logService: ILogService, environmentService: IEnvironmentService, fileService: IFileService);
    protected doCreate(): Promise<Storage>;
    private prepareWorkspaceStorageFolder;
    private ensureWorkspaceStorageFolderMeta;
}
export declare class InMemoryStorageMain extends BaseStorageMain {
    get path(): string | undefined;
    protected doCreate(): Promise<Storage>;
}
export {};
