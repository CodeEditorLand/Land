import { URI } from '../../../../base/common/uri.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ExtensionIdentifier, IExtensionDescription } from '../../../../platform/extensions/common/extensions.js';
import { IExtensionResourceLoaderService } from '../../../../platform/extensionResourceLoader/common/extensionResourceLoader.js';
export declare class Snippet {
    readonly isFileTemplate: boolean;
    readonly scopes: string[];
    readonly name: string;
    readonly prefix: string;
    readonly description: string;
    readonly body: string;
    readonly source: string;
    readonly snippetSource: SnippetSource;
    readonly snippetIdentifier: string;
    readonly extensionId?: ExtensionIdentifier | undefined;
    private readonly _bodyInsights;
    readonly prefixLow: string;
    constructor(isFileTemplate: boolean, scopes: string[], name: string, prefix: string, description: string, body: string, source: string, snippetSource: SnippetSource, snippetIdentifier: string, extensionId?: ExtensionIdentifier | undefined);
    get codeSnippet(): string;
    get isBogous(): boolean;
    get isTrivial(): boolean;
    get needsClipboard(): boolean;
    get usesSelection(): boolean;
}
export declare const enum SnippetSource {
    User = 1,
    Workspace = 2,
    Extension = 3
}
export declare class SnippetFile {
    readonly source: SnippetSource;
    readonly location: URI;
    defaultScopes: string[] | undefined;
    private readonly _extension;
    private readonly _fileService;
    private readonly _extensionResourceLoaderService;
    readonly data: Snippet[];
    readonly isGlobalSnippets: boolean;
    readonly isUserSnippets: boolean;
    private _loadPromise?;
    constructor(source: SnippetSource, location: URI, defaultScopes: string[] | undefined, _extension: IExtensionDescription | undefined, _fileService: IFileService, _extensionResourceLoaderService: IExtensionResourceLoaderService);
    select(selector: string, bucket: Snippet[]): void;
    private _filepathSelect;
    private _scopeSelect;
    private _load;
    load(): Promise<this>;
    reset(): void;
    private _parseSnippet;
}
