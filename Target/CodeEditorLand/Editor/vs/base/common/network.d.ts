import { URI } from './uri.js';
export declare namespace Schemas {
    const inMemory = "inmemory";
    const vscode = "vscode";
    const internal = "private";
    const walkThrough = "walkThrough";
    const walkThroughSnippet = "walkThroughSnippet";
    const http = "http";
    const https = "https";
    const file = "file";
    const mailto = "mailto";
    const untitled = "untitled";
    const data = "data";
    const command = "command";
    const vscodeRemote = "vscode-remote";
    const vscodeRemoteResource = "vscode-remote-resource";
    const vscodeManagedRemoteResource = "vscode-managed-remote-resource";
    const vscodeUserData = "vscode-userdata";
    const vscodeCustomEditor = "vscode-custom-editor";
    const vscodeNotebookCell = "vscode-notebook-cell";
    const vscodeNotebookCellMetadata = "vscode-notebook-cell-metadata";
    const vscodeNotebookCellMetadataDiff = "vscode-notebook-cell-metadata-diff";
    const vscodeNotebookCellOutput = "vscode-notebook-cell-output";
    const vscodeNotebookCellOutputDiff = "vscode-notebook-cell-output-diff";
    const vscodeNotebookMetadata = "vscode-notebook-metadata";
    const vscodeInteractiveInput = "vscode-interactive-input";
    const vscodeSettings = "vscode-settings";
    const vscodeWorkspaceTrust = "vscode-workspace-trust";
    const vscodeTerminal = "vscode-terminal";
    const vscodeChatCodeBlock = "vscode-chat-code-block";
    const vscodeChatCodeCompareBlock = "vscode-chat-code-compare-block";
    const vscodeChatSesssion = "vscode-chat-editor";
    const webviewPanel = "webview-panel";
    const vscodeWebview = "vscode-webview";
    const extension = "extension";
    const vscodeFileResource = "vscode-file";
    const tmp = "tmp";
    const vsls = "vsls";
    const vscodeSourceControl = "vscode-scm";
    const commentsInput = "comment";
    const codeSetting = "code-setting";
    const outputChannel = "output";
    const accessibleView = "accessible-view";
}
export declare function matchesScheme(target: URI | string, scheme: string): boolean;
export declare function matchesSomeScheme(target: URI | string, ...schemes: string[]): boolean;
export declare const connectionTokenCookieName = "vscode-tkn";
export declare const connectionTokenQueryName = "tkn";
declare class RemoteAuthoritiesImpl {
    private readonly _hosts;
    private readonly _ports;
    private readonly _connectionTokens;
    private _preferredWebSchema;
    private _delegate;
    private _serverRootPath;
    setPreferredWebSchema(schema: 'http' | 'https'): void;
    setDelegate(delegate: (uri: URI) => URI): void;
    setServerRootPath(product: {
        quality?: string;
        commit?: string;
    }, serverBasePath: string | undefined): void;
    getServerRootPath(): string;
    private get _remoteResourcesPath();
    set(authority: string, host: string, port: number): void;
    setConnectionToken(authority: string, connectionToken: string): void;
    getPreferredWebSchema(): 'http' | 'https';
    rewrite(uri: URI): URI;
}
export declare const RemoteAuthorities: RemoteAuthoritiesImpl;
export declare function getServerRootPath(product: {
    quality?: string;
    commit?: string;
}, basePath: string | undefined): string;
export type AppResourcePath = (`a${string}` | `b${string}` | `c${string}` | `d${string}` | `e${string}` | `f${string}` | `g${string}` | `h${string}` | `i${string}` | `j${string}` | `k${string}` | `l${string}` | `m${string}` | `n${string}` | `o${string}` | `p${string}` | `q${string}` | `r${string}` | `s${string}` | `t${string}` | `u${string}` | `v${string}` | `w${string}` | `x${string}` | `y${string}` | `z${string}`);
export declare const builtinExtensionsPath: AppResourcePath;
export declare const nodeModulesPath: AppResourcePath;
export declare const nodeModulesAsarPath: AppResourcePath;
export declare const nodeModulesAsarUnpackedPath: AppResourcePath;
export declare const VSCODE_AUTHORITY = "vscode-app";
declare class FileAccessImpl {
    private static readonly FALLBACK_AUTHORITY;
    asBrowserUri(resourcePath: AppResourcePath | ''): URI;
    uriToBrowserUri(uri: URI): URI;
    asFileUri(resourcePath: AppResourcePath | ''): URI;
    uriToFileUri(uri: URI): URI;
    private toUri;
}
export declare const FileAccess: FileAccessImpl;
export declare namespace COI {
    const CoopAndCoep: Readonly<Record<string, string> | undefined>;
    function getHeadersFromQuery(url: string | URI | URL): Record<string, string> | undefined;
    function addSearchParam(urlOrSearch: URLSearchParams | Record<string, string>, coop: boolean, coep: boolean): void;
}
export {};
