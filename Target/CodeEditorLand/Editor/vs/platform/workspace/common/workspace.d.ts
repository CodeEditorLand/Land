import { Event } from '../../../base/common/event.js';
import { URI, UriComponents } from '../../../base/common/uri.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
export declare const IWorkspaceContextService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IWorkspaceContextService>;
export interface IWorkspaceContextService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeWorkbenchState: Event<WorkbenchState>;
    readonly onDidChangeWorkspaceName: Event<void>;
    readonly onWillChangeWorkspaceFolders: Event<IWorkspaceFoldersWillChangeEvent>;
    readonly onDidChangeWorkspaceFolders: Event<IWorkspaceFoldersChangeEvent>;
    getCompleteWorkspace(): Promise<IWorkspace>;
    getWorkspace(): IWorkspace;
    getWorkbenchState(): WorkbenchState;
    getWorkspaceFolder(resource: URI): IWorkspaceFolder | null;
    isCurrentWorkspace(workspaceIdOrFolder: IWorkspaceIdentifier | ISingleFolderWorkspaceIdentifier | URI): boolean;
    isInsideWorkspace(resource: URI): boolean;
}
export interface IResolvedWorkspace extends IWorkspaceIdentifier, IBaseWorkspace {
    readonly folders: IWorkspaceFolder[];
}
export interface IBaseWorkspace {
    readonly remoteAuthority?: string;
    readonly transient?: boolean;
}
export interface IBaseWorkspaceIdentifier {
    readonly id: string;
}
export interface ISingleFolderWorkspaceIdentifier extends IBaseWorkspaceIdentifier {
    readonly uri: URI;
}
export interface IWorkspaceIdentifier extends IBaseWorkspaceIdentifier {
    configPath: URI;
}
export interface IEmptyWorkspaceIdentifier extends IBaseWorkspaceIdentifier {
}
export type IAnyWorkspaceIdentifier = IWorkspaceIdentifier | ISingleFolderWorkspaceIdentifier | IEmptyWorkspaceIdentifier;
export declare function isSingleFolderWorkspaceIdentifier(obj: unknown): obj is ISingleFolderWorkspaceIdentifier;
export declare function isEmptyWorkspaceIdentifier(obj: unknown): obj is IEmptyWorkspaceIdentifier;
export declare const EXTENSION_DEVELOPMENT_EMPTY_WINDOW_WORKSPACE: IEmptyWorkspaceIdentifier;
export declare const UNKNOWN_EMPTY_WINDOW_WORKSPACE: IEmptyWorkspaceIdentifier;
export declare function toWorkspaceIdentifier(workspace: IWorkspace): IAnyWorkspaceIdentifier;
export declare function toWorkspaceIdentifier(backupPath: string | undefined, isExtensionDevelopment: boolean): IEmptyWorkspaceIdentifier;
export declare function isWorkspaceIdentifier(obj: unknown): obj is IWorkspaceIdentifier;
export interface ISerializedSingleFolderWorkspaceIdentifier extends IBaseWorkspaceIdentifier {
    readonly uri: UriComponents;
}
export interface ISerializedWorkspaceIdentifier extends IBaseWorkspaceIdentifier {
    readonly configPath: UriComponents;
}
export declare function reviveIdentifier(identifier: undefined): undefined;
export declare function reviveIdentifier(identifier: ISerializedWorkspaceIdentifier): IWorkspaceIdentifier;
export declare function reviveIdentifier(identifier: ISerializedSingleFolderWorkspaceIdentifier): ISingleFolderWorkspaceIdentifier;
export declare function reviveIdentifier(identifier: IEmptyWorkspaceIdentifier): IEmptyWorkspaceIdentifier;
export declare function reviveIdentifier(identifier: ISerializedWorkspaceIdentifier | ISerializedSingleFolderWorkspaceIdentifier | IEmptyWorkspaceIdentifier | undefined): IAnyWorkspaceIdentifier | undefined;
export declare const enum WorkbenchState {
    EMPTY = 1,
    FOLDER = 2,
    WORKSPACE = 3
}
export interface IWorkspaceFoldersWillChangeEvent {
    readonly changes: IWorkspaceFoldersChangeEvent;
    readonly fromCache: boolean;
    join(promise: Promise<void>): void;
}
export interface IWorkspaceFoldersChangeEvent {
    added: IWorkspaceFolder[];
    removed: IWorkspaceFolder[];
    changed: IWorkspaceFolder[];
}
export interface IWorkspace {
    readonly id: string;
    readonly folders: IWorkspaceFolder[];
    readonly transient?: boolean;
    readonly configuration?: URI | null;
}
export declare function isWorkspace(thing: unknown): thing is IWorkspace;
export interface IWorkspaceFolderData {
    readonly uri: URI;
    readonly name: string;
    readonly index: number;
}
export interface IWorkspaceFolder extends IWorkspaceFolderData {
    toResource: (relativePath: string) => URI;
}
export declare function isWorkspaceFolder(thing: unknown): thing is IWorkspaceFolder;
export declare class Workspace implements IWorkspace {
    private _id;
    private _transient;
    private _configuration;
    private _ignorePathCasing;
    private _foldersMap;
    private _folders;
    constructor(_id: string, folders: WorkspaceFolder[], _transient: boolean, _configuration: URI | null, _ignorePathCasing: (key: URI) => boolean);
    update(workspace: Workspace): void;
    get folders(): WorkspaceFolder[];
    set folders(folders: WorkspaceFolder[]);
    get id(): string;
    get transient(): boolean;
    get configuration(): URI | null;
    set configuration(configuration: URI | null);
    getFolder(resource: URI): IWorkspaceFolder | null;
    private updateFoldersMap;
    toJSON(): IWorkspace;
}
export interface IRawFileWorkspaceFolder {
    readonly path: string;
    name?: string;
}
export interface IRawUriWorkspaceFolder {
    readonly uri: string;
    name?: string;
}
export declare class WorkspaceFolder implements IWorkspaceFolder {
    readonly raw?: (IRawFileWorkspaceFolder | IRawUriWorkspaceFolder) | undefined;
    readonly uri: URI;
    readonly name: string;
    readonly index: number;
    constructor(data: IWorkspaceFolderData, raw?: (IRawFileWorkspaceFolder | IRawUriWorkspaceFolder) | undefined);
    toResource(relativePath: string): URI;
    toJSON(): IWorkspaceFolderData;
}
export declare function toWorkspaceFolder(resource: URI): WorkspaceFolder;
export declare const WORKSPACE_EXTENSION = "code-workspace";
export declare const WORKSPACE_SUFFIX = ".code-workspace";
export declare const WORKSPACE_FILTER: {
    name: string;
    extensions: string[];
}[];
export declare const UNTITLED_WORKSPACE_NAME = "workspace.json";
export declare function isUntitledWorkspace(path: URI, environmentService: IEnvironmentService): boolean;
export declare function isTemporaryWorkspace(workspace: IWorkspace): boolean;
export declare function isTemporaryWorkspace(path: URI): boolean;
export declare const STANDALONE_EDITOR_WORKSPACE_ID = "4064f6ec-cb38-4ad0-af64-ee6467e63c82";
export declare function isStandaloneEditorWorkspace(workspace: IWorkspace): boolean;
export declare function isSavedWorkspace(path: URI, environmentService: IEnvironmentService): boolean;
export declare function hasWorkspaceFileExtension(path: string | URI): boolean;
