import { Event } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { UriDto } from '../../../base/common/uri.js';
import { IChannel } from '../../../base/parts/ipc/common/ipc.js';
import { IStorageDatabase, IStorageItemsChangeEvent, IUpdateRequest } from '../../../base/parts/storage/common/storage.js';
import { IUserDataProfile } from '../../userDataProfile/common/userDataProfile.js';
import { ISerializedSingleFolderWorkspaceIdentifier, ISerializedWorkspaceIdentifier, IEmptyWorkspaceIdentifier, IAnyWorkspaceIdentifier } from '../../workspace/common/workspace.js';
export type Key = string;
export type Value = string;
export type Item = [Key, Value];
export interface IBaseSerializableStorageRequest {
    /**
     * Profile to correlate storage. Only used when no
     * workspace is provided. Can be undefined to denote
     * application scope.
     */
    readonly profile: UriDto<IUserDataProfile> | undefined;
    /**
     * Workspace to correlate storage. Can be undefined to
     * denote application or profile scope depending on profile.
     */
    readonly workspace: ISerializedWorkspaceIdentifier | ISerializedSingleFolderWorkspaceIdentifier | IEmptyWorkspaceIdentifier | undefined;
    /**
     * Additional payload for the request to perform.
     */
    readonly payload?: unknown;
}
export interface ISerializableUpdateRequest extends IBaseSerializableStorageRequest {
    insert?: Item[];
    delete?: Key[];
}
export interface ISerializableItemsChangeEvent {
    readonly changed?: Item[];
    readonly deleted?: Key[];
}
declare abstract class BaseStorageDatabaseClient extends Disposable implements IStorageDatabase {
    protected channel: IChannel;
    protected profile: UriDto<IUserDataProfile> | undefined;
    protected workspace: IAnyWorkspaceIdentifier | undefined;
    abstract readonly onDidChangeItemsExternal: Event<IStorageItemsChangeEvent>;
    constructor(channel: IChannel, profile: UriDto<IUserDataProfile> | undefined, workspace: IAnyWorkspaceIdentifier | undefined);
    getItems(): Promise<Map<string, string>>;
    updateItems(request: IUpdateRequest): Promise<void>;
    optimize(): Promise<void>;
    abstract close(): Promise<void>;
}
declare abstract class BaseProfileAwareStorageDatabaseClient extends BaseStorageDatabaseClient {
    private readonly _onDidChangeItemsExternal;
    readonly onDidChangeItemsExternal: Event<IStorageItemsChangeEvent>;
    constructor(channel: IChannel, profile: UriDto<IUserDataProfile> | undefined);
    private registerListeners;
    private onDidChangeStorage;
}
export declare class ApplicationStorageDatabaseClient extends BaseProfileAwareStorageDatabaseClient {
    constructor(channel: IChannel);
    close(): Promise<void>;
}
export declare class ProfileStorageDatabaseClient extends BaseProfileAwareStorageDatabaseClient {
    constructor(channel: IChannel, profile: UriDto<IUserDataProfile>);
    close(): Promise<void>;
}
export declare class WorkspaceStorageDatabaseClient extends BaseStorageDatabaseClient implements IStorageDatabase {
    readonly onDidChangeItemsExternal: Event<any>;
    constructor(channel: IChannel, workspace: IAnyWorkspaceIdentifier);
    close(): Promise<void>;
}
export declare class StorageClient {
    private readonly channel;
    constructor(channel: IChannel);
    isUsed(path: string): Promise<boolean>;
}
export {};
