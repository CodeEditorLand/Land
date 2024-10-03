import { CancellationToken } from '../../../base/common/cancellation.js';
import { Event } from '../../../base/common/event.js';
import { URI, UriComponents } from '../../../base/common/uri.js';
import { ExtensionIdentifier, IExtensionDescription } from '../../../platform/extensions/common/extensions.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { EditSessionIdentityMatch } from '../../../platform/workspace/common/editSessions.js';
import { Workspace } from '../../../platform/workspace/common/workspace.js';
import { IExtHostFileSystemInfo } from './extHostFileSystemInfo.js';
import { IExtHostInitDataService } from './extHostInitDataService.js';
import { IExtHostRpcService } from './extHostRpcService.js';
import { IURITransformerService } from './extHostUriTransformerService.js';
import { ITextQueryBuilderOptions } from '../../services/search/common/queryBuilder.js';
import { IRawFileMatch2, ITextSearchResult } from '../../services/search/common/search.js';
import type * as vscode from 'vscode';
import { ExtHostWorkspaceShape, IWorkspaceData } from './extHost.protocol.js';
import { AuthInfo, Credentials } from '../../../platform/request/common/request.js';
export interface IExtHostWorkspaceProvider {
    getWorkspaceFolder2(uri: vscode.Uri, resolveParent?: boolean): Promise<vscode.WorkspaceFolder | undefined>;
    resolveWorkspaceFolder(uri: vscode.Uri): Promise<vscode.WorkspaceFolder | undefined>;
    getWorkspaceFolders2(): Promise<vscode.WorkspaceFolder[] | undefined>;
    resolveProxy(url: string): Promise<string | undefined>;
    lookupAuthorization(authInfo: AuthInfo): Promise<Credentials | undefined>;
    lookupKerberosAuthorization(url: string): Promise<string | undefined>;
    loadCertificates(): Promise<string[]>;
}
interface QueryOptions<T> {
    options: T;
    folder: URI | undefined;
}
export declare class ExtHostWorkspace implements ExtHostWorkspaceShape, IExtHostWorkspaceProvider {
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeWorkspace;
    readonly onDidChangeWorkspace: Event<vscode.WorkspaceFoldersChangeEvent>;
    private readonly _onDidGrantWorkspaceTrust;
    readonly onDidGrantWorkspaceTrust: Event<void>;
    private readonly _logService;
    private readonly _requestIdProvider;
    private readonly _barrier;
    private _confirmedWorkspace?;
    private _unconfirmedWorkspace?;
    private readonly _proxy;
    private readonly _messageService;
    private readonly _extHostFileSystemInfo;
    private readonly _uriTransformerService;
    private readonly _activeSearchCallbacks;
    private _trusted;
    private readonly _editSessionIdentityProviders;
    constructor(extHostRpc: IExtHostRpcService, initData: IExtHostInitDataService, extHostFileSystemInfo: IExtHostFileSystemInfo, logService: ILogService, uriTransformerService: IURITransformerService);
    $initializeWorkspace(data: IWorkspaceData | null, trusted: boolean): void;
    waitForInitializeCall(): Promise<boolean>;
    get workspace(): Workspace | undefined;
    get name(): string | undefined;
    get workspaceFile(): vscode.Uri | undefined;
    private get _actualWorkspace();
    getWorkspaceFolders(): vscode.WorkspaceFolder[] | undefined;
    getWorkspaceFolders2(): Promise<vscode.WorkspaceFolder[] | undefined>;
    updateWorkspaceFolders(extension: IExtensionDescription, index: number, deleteCount: number, ...workspaceFoldersToAdd: {
        uri: vscode.Uri;
        name?: string;
    }[]): boolean;
    getWorkspaceFolder(uri: vscode.Uri, resolveParent?: boolean): vscode.WorkspaceFolder | undefined;
    getWorkspaceFolder2(uri: vscode.Uri, resolveParent?: boolean): Promise<vscode.WorkspaceFolder | undefined>;
    resolveWorkspaceFolder(uri: vscode.Uri): Promise<vscode.WorkspaceFolder | undefined>;
    getPath(): string | undefined;
    getRelativePath(pathOrUri: string | vscode.Uri, includeWorkspace?: boolean): string;
    private trySetWorkspaceFolders;
    $acceptWorkspaceData(data: IWorkspaceData | null): void;
    findFiles(include: vscode.GlobPattern | undefined, exclude: vscode.GlobPattern | null | undefined, maxResults: number | undefined, extensionId: ExtensionIdentifier, token?: vscode.CancellationToken): Promise<vscode.Uri[]>;
    findFiles2(filePattern: vscode.GlobPattern | undefined, options: vscode.FindFiles2Options | undefined, extensionId: ExtensionIdentifier, token?: vscode.CancellationToken): Promise<vscode.Uri[]>;
    findFiles2New(filePatterns: vscode.GlobPattern[], options: vscode.FindFiles2OptionsNew | undefined, extensionId: ExtensionIdentifier, token?: vscode.CancellationToken): Promise<vscode.Uri[]>;
    private _findFilesImpl;
    private _findFilesBase;
    findTextInFilesNew(query: vscode.TextSearchQueryNew, options: vscode.FindTextInFilesOptionsNew | undefined, extensionId: ExtensionIdentifier, token?: vscode.CancellationToken): vscode.FindTextInFilesResponse;
    findTextInFilesBase(query: vscode.TextSearchQuery, queryOptions: QueryOptions<ITextQueryBuilderOptions>[] | undefined, callback: (result: ITextSearchResult<URI>, uri: URI) => void, token?: vscode.CancellationToken): Promise<vscode.TextSearchComplete>;
    findTextInFiles(query: vscode.TextSearchQuery, options: vscode.FindTextInFilesOptions & {
        useSearchExclude?: boolean;
    }, callback: (result: vscode.TextSearchResult) => void, extensionId: ExtensionIdentifier, token?: vscode.CancellationToken): Promise<vscode.TextSearchComplete>;
    $handleTextSearchResult(result: IRawFileMatch2, requestId: number): void;
    save(uri: URI): Promise<URI | undefined>;
    saveAs(uri: URI): Promise<URI | undefined>;
    saveAll(includeUntitled?: boolean): Promise<boolean>;
    resolveProxy(url: string): Promise<string | undefined>;
    lookupAuthorization(authInfo: AuthInfo): Promise<Credentials | undefined>;
    lookupKerberosAuthorization(url: string): Promise<string | undefined>;
    loadCertificates(): Promise<string[]>;
    get trusted(): boolean;
    requestWorkspaceTrust(options?: vscode.WorkspaceTrustRequestOptions): Promise<boolean | undefined>;
    $onDidGrantWorkspaceTrust(): void;
    private _providerHandlePool;
    registerEditSessionIdentityProvider(scheme: string, provider: vscode.EditSessionIdentityProvider): import("../../../base/common/lifecycle.js").IDisposable;
    $getEditSessionIdentifier(workspaceFolder: UriComponents, cancellationToken: CancellationToken): Promise<string | undefined>;
    $provideEditSessionIdentityMatch(workspaceFolder: UriComponents, identity1: string, identity2: string, cancellationToken: CancellationToken): Promise<EditSessionIdentityMatch | undefined>;
    private readonly _onWillCreateEditSessionIdentityEvent;
    getOnWillCreateEditSessionIdentityEvent(extension: IExtensionDescription): Event<vscode.EditSessionIdentityWillCreateEvent>;
    $onWillCreateEditSessionIdentity(workspaceFolder: UriComponents, token: CancellationToken, timeout: number): Promise<void>;
    private readonly _canonicalUriProviders;
    registerCanonicalUriProvider(scheme: string, provider: vscode.CanonicalUriProvider): import("../../../base/common/lifecycle.js").IDisposable;
    provideCanonicalUri(uri: URI, options: vscode.CanonicalUriRequestOptions, cancellationToken: CancellationToken): Promise<URI | undefined>;
    $provideCanonicalUri(uri: UriComponents, targetScheme: string, cancellationToken: CancellationToken): Promise<UriComponents | undefined>;
}
export declare const IExtHostWorkspace: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtHostWorkspace>;
export interface IExtHostWorkspace extends ExtHostWorkspace, ExtHostWorkspaceShape, IExtHostWorkspaceProvider {
}
export {};
