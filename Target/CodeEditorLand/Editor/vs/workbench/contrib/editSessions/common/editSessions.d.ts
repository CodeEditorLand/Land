import { VSBuffer } from '../../../../base/common/buffer.js';
import { ILocalizedString } from '../../../../platform/action/common/action.js';
import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IResourceRefHandle } from '../../../../platform/userDataSync/common/userDataSync.js';
import { Event } from '../../../../base/common/event.js';
import { EditSessionsStoreClient } from './editSessionsStorageClient.js';
export declare const EDIT_SESSION_SYNC_CATEGORY: import("../../../../nls.js").ILocalizedString;
export type SyncResource = 'editSessions' | 'workspaceState';
export declare const IEditSessionsStorageService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IEditSessionsStorageService>;
export interface IEditSessionsStorageService {
    _serviceBrand: undefined;
    readonly SIZE_LIMIT: number;
    readonly isSignedIn: boolean;
    readonly onDidSignIn: Event<void>;
    readonly onDidSignOut: Event<void>;
    storeClient: EditSessionsStoreClient | undefined;
    lastReadResources: Map<SyncResource, {
        ref: string;
        content: string;
    }>;
    lastWrittenResources: Map<SyncResource, {
        ref: string;
        content: string;
    }>;
    initialize(reason: 'read' | 'write', silent?: boolean): Promise<boolean>;
    read(resource: SyncResource, ref: string | undefined): Promise<{
        ref: string;
        content: string;
    } | undefined>;
    write(resource: SyncResource, content: string | EditSession): Promise<string>;
    delete(resource: SyncResource, ref: string | null): Promise<void>;
    list(resource: SyncResource): Promise<IResourceRefHandle[]>;
    getMachineById(machineId: string): Promise<string | undefined>;
}
export declare const IEditSessionsLogService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IEditSessionsLogService>;
export interface IEditSessionsLogService extends ILogService {
}
export declare enum ChangeType {
    Addition = 1,
    Deletion = 2
}
export declare enum FileType {
    File = 1
}
interface Addition {
    relativeFilePath: string;
    fileType: FileType.File;
    contents: string;
    type: ChangeType.Addition;
}
interface Deletion {
    relativeFilePath: string;
    fileType: FileType.File;
    contents: undefined;
    type: ChangeType.Deletion;
}
export type Change = Addition | Deletion;
export interface Folder {
    name: string;
    canonicalIdentity: string | undefined;
    workingChanges: Change[];
    absoluteUri: string | undefined;
}
export declare const EditSessionSchemaVersion = 3;
export interface EditSession {
    version: number;
    workspaceStateId?: string;
    machine?: string;
    folders: Folder[];
}
export declare const EDIT_SESSIONS_SIGNED_IN_KEY = "editSessionsSignedIn";
export declare const EDIT_SESSIONS_SIGNED_IN: RawContextKey<boolean>;
export declare const EDIT_SESSIONS_PENDING_KEY = "editSessionsPending";
export declare const EDIT_SESSIONS_PENDING: RawContextKey<boolean>;
export declare const EDIT_SESSIONS_CONTAINER_ID = "workbench.view.editSessions";
export declare const EDIT_SESSIONS_DATA_VIEW_ID = "workbench.views.editSessions.data";
export declare const EDIT_SESSIONS_TITLE: ILocalizedString;
export declare const EDIT_SESSIONS_VIEW_ICON: import("../../../../base/common/themables.js").ThemeIcon;
export declare const EDIT_SESSIONS_SHOW_VIEW: RawContextKey<boolean>;
export declare const EDIT_SESSIONS_SCHEME = "vscode-edit-sessions";
export declare function decodeEditSessionFileContent(version: number, content: string): VSBuffer;
export declare function hashedEditSessionId(editSessionId: string): string;
export declare const editSessionsLogId = "editSessions";
export {};
