import { CancellationToken } from '../../../../base/common/cancellation.js';
import * as glob from '../../../../base/common/glob.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { URI, UriComponents } from '../../../../base/common/uri.js';
import { IFilesConfiguration } from '../../../../platform/files/common/files.js';
import { ITelemetryData } from '../../../../platform/telemetry/common/telemetry.js';
import { Event } from '../../../../base/common/event.js';
import { GlobPattern, TextSearchCompleteMessageType } from './searchExtTypes.js';
import { ResourceSet } from '../../../../base/common/map.js';
export { TextSearchCompleteMessageType };
export declare const VIEWLET_ID = "workbench.view.search";
export declare const PANEL_ID = "workbench.panel.search";
export declare const VIEW_ID = "workbench.view.search";
export declare const SEARCH_RESULT_LANGUAGE_ID = "search-result";
export declare const SEARCH_EXCLUDE_CONFIG = "search.exclude";
export declare const DEFAULT_MAX_SEARCH_RESULTS = 20000;
export declare const ISearchService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ISearchService>;
export interface ISearchService {
    readonly _serviceBrand: undefined;
    textSearch(query: ITextQuery, token?: CancellationToken, onProgress?: (result: ISearchProgressItem) => void): Promise<ISearchComplete>;
    aiTextSearch(query: IAITextQuery, token?: CancellationToken, onProgress?: (result: ISearchProgressItem) => void): Promise<ISearchComplete>;
    getAIName(): Promise<string | undefined>;
    textSearchSplitSyncAsync(query: ITextQuery, token?: CancellationToken | undefined, onProgress?: ((result: ISearchProgressItem) => void) | undefined, notebookFilesToIgnore?: ResourceSet, asyncNotebookFilesToIgnore?: Promise<ResourceSet>): {
        syncResults: ISearchComplete;
        asyncResults: Promise<ISearchComplete>;
    };
    fileSearch(query: IFileQuery, token?: CancellationToken): Promise<ISearchComplete>;
    clearCache(cacheKey: string): Promise<void>;
    registerSearchResultProvider(scheme: string, type: SearchProviderType, provider: ISearchResultProvider): IDisposable;
}
export declare const enum SearchProviderType {
    file = 0,
    text = 1,
    aiText = 2
}
export interface ISearchResultProvider {
    getAIName(): Promise<string | undefined>;
    textSearch(query: ITextQuery, onProgress?: (p: ISearchProgressItem) => void, token?: CancellationToken): Promise<ISearchComplete>;
    fileSearch(query: IFileQuery, token?: CancellationToken): Promise<ISearchComplete>;
    clearCache(cacheKey: string): Promise<void>;
}
export interface ExcludeGlobPattern<U extends UriComponents = URI> {
    folder?: U;
    pattern: glob.IExpression;
}
export interface IFolderQuery<U extends UriComponents = URI> {
    folder: U;
    folderName?: string;
    excludePattern?: ExcludeGlobPattern<U>[];
    includePattern?: glob.IExpression;
    fileEncoding?: string;
    disregardIgnoreFiles?: boolean;
    disregardGlobalIgnoreFiles?: boolean;
    disregardParentIgnoreFiles?: boolean;
    ignoreSymlinks?: boolean;
}
export interface ICommonQueryProps<U extends UriComponents> {
    _reason?: string;
    folderQueries: IFolderQuery<U>[];
    includePattern?: glob.IExpression;
    excludePattern?: glob.IExpression;
    extraFileResources?: U[];
    onlyOpenEditors?: boolean;
    maxResults?: number;
    usingSearchPaths?: boolean;
    onlyFileScheme?: boolean;
}
export interface IFileQueryProps<U extends UriComponents> extends ICommonQueryProps<U> {
    type: QueryType.File;
    filePattern?: string;
    shouldGlobMatchFilePattern?: boolean;
    exists?: boolean;
    sortByScore?: boolean;
    cacheKey?: string;
}
export interface ITextQueryProps<U extends UriComponents> extends ICommonQueryProps<U> {
    type: QueryType.Text;
    contentPattern: IPatternInfo;
    previewOptions?: ITextSearchPreviewOptions;
    maxFileSize?: number;
    usePCRE2?: boolean;
    surroundingContext?: number;
    userDisabledExcludesAndIgnoreFiles?: boolean;
}
export interface IAITextQueryProps<U extends UriComponents> extends ICommonQueryProps<U> {
    type: QueryType.aiText;
    contentPattern: string;
    previewOptions?: ITextSearchPreviewOptions;
    maxFileSize?: number;
    surroundingContext?: number;
    userDisabledExcludesAndIgnoreFiles?: boolean;
}
export type IFileQuery = IFileQueryProps<URI>;
export type IRawFileQuery = IFileQueryProps<UriComponents>;
export type ITextQuery = ITextQueryProps<URI>;
export type IRawTextQuery = ITextQueryProps<UriComponents>;
export type IAITextQuery = IAITextQueryProps<URI>;
export type IRawAITextQuery = IAITextQueryProps<UriComponents>;
export type IRawQuery = IRawTextQuery | IRawFileQuery | IRawAITextQuery;
export type ISearchQuery = ITextQuery | IFileQuery | IAITextQuery;
export declare const enum QueryType {
    File = 1,
    Text = 2,
    aiText = 3
}
export interface IPatternInfo {
    pattern: string;
    isRegExp?: boolean;
    isWordMatch?: boolean;
    wordSeparators?: string;
    isMultiline?: boolean;
    isUnicode?: boolean;
    isCaseSensitive?: boolean;
    notebookInfo?: INotebookPatternInfo;
}
export interface INotebookPatternInfo {
    isInNotebookMarkdownInput?: boolean;
    isInNotebookMarkdownPreview?: boolean;
    isInNotebookCellInput?: boolean;
    isInNotebookCellOutput?: boolean;
}
export interface IExtendedExtensionSearchOptions {
    usePCRE2?: boolean;
}
export interface IFileMatch<U extends UriComponents = URI> {
    resource: U;
    results?: ITextSearchResult<U>[];
}
export type IRawFileMatch2 = IFileMatch<UriComponents>;
export interface ITextSearchPreviewOptions {
    matchLines: number;
    charsPerLine: number;
}
export interface ISearchRange {
    readonly startLineNumber: number;
    readonly startColumn: number;
    readonly endLineNumber: number;
    readonly endColumn: number;
}
export interface ITextSearchMatch<U extends UriComponents = URI> {
    uri?: U;
    rangeLocations: SearchRangeSetPairing[];
    previewText: string;
    webviewIndex?: number;
    cellFragment?: string;
}
export interface ITextSearchContext<U extends UriComponents = URI> {
    uri?: U;
    text: string;
    lineNumber: number;
}
export type ITextSearchResult<U extends UriComponents = URI> = ITextSearchMatch<U> | ITextSearchContext<U>;
export declare function resultIsMatch(result: ITextSearchResult): result is ITextSearchMatch;
export interface IProgressMessage {
    message: string;
}
export type ISearchProgressItem = IFileMatch | IProgressMessage;
export declare function isFileMatch(p: ISearchProgressItem): p is IFileMatch;
export declare function isProgressMessage(p: ISearchProgressItem | ISerializedSearchProgressItem): p is IProgressMessage;
export interface ITextSearchCompleteMessage {
    text: string;
    type: TextSearchCompleteMessageType;
    trusted?: boolean;
}
export interface ISearchCompleteStats {
    limitHit?: boolean;
    messages: ITextSearchCompleteMessage[];
    stats?: IFileSearchStats | ITextSearchStats;
}
export interface ISearchComplete extends ISearchCompleteStats {
    results: IFileMatch[];
    exit?: SearchCompletionExitCode;
}
export declare const enum SearchCompletionExitCode {
    Normal = 0,
    NewSearchStarted = 1
}
export interface ITextSearchStats {
    type: 'textSearchProvider' | 'searchProcess' | 'aiTextSearchProvider';
}
export interface IFileSearchStats {
    fromCache: boolean;
    detailStats: ISearchEngineStats | ICachedSearchStats | IFileSearchProviderStats;
    resultCount: number;
    type: 'fileSearchProvider' | 'searchProcess';
    sortingTime?: number;
}
export interface ICachedSearchStats {
    cacheWasResolved: boolean;
    cacheLookupTime: number;
    cacheFilterTime: number;
    cacheEntryCount: number;
}
export interface ISearchEngineStats {
    fileWalkTime: number;
    directoriesWalked: number;
    filesWalked: number;
    cmdTime: number;
    cmdResultCount?: number;
}
export interface IFileSearchProviderStats {
    providerTime: number;
    postProcessTime: number;
}
export declare class FileMatch implements IFileMatch {
    resource: URI;
    results: ITextSearchResult[];
    constructor(resource: URI);
}
export interface SearchRangeSetPairing {
    source: ISearchRange;
    preview: ISearchRange;
}
export declare class TextSearchMatch implements ITextSearchMatch {
    rangeLocations: SearchRangeSetPairing[];
    previewText: string;
    webviewIndex?: number;
    constructor(text: string, ranges: ISearchRange | ISearchRange[], previewOptions?: ITextSearchPreviewOptions, webviewIndex?: number);
}
export declare class SearchRange implements ISearchRange {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
    constructor(startLineNumber: number, startColumn: number, endLineNumber: number, endColumn: number);
}
export declare class OneLineRange extends SearchRange {
    constructor(lineNumber: number, startColumn: number, endColumn: number);
}
export declare const enum ViewMode {
    List = "list",
    Tree = "tree"
}
export declare const enum SearchSortOrder {
    Default = "default",
    FileNames = "fileNames",
    Type = "type",
    Modified = "modified",
    CountDescending = "countDescending",
    CountAscending = "countAscending"
}
export interface ISearchConfigurationProperties {
    exclude: glob.IExpression;
    useRipgrep: boolean;
    useIgnoreFiles: boolean;
    useGlobalIgnoreFiles: boolean;
    useParentIgnoreFiles: boolean;
    followSymlinks: boolean;
    smartCase: boolean;
    globalFindClipboard: boolean;
    location: 'sidebar' | 'panel';
    useReplacePreview: boolean;
    showLineNumbers: boolean;
    usePCRE2: boolean;
    actionsPosition: 'auto' | 'right';
    maintainFileSearchCache: boolean;
    maxResults: number | null;
    collapseResults: 'auto' | 'alwaysCollapse' | 'alwaysExpand';
    searchOnType: boolean;
    seedOnFocus: boolean;
    seedWithNearestWord: boolean;
    searchOnTypeDebouncePeriod: number;
    mode: 'view' | 'reuseEditor' | 'newEditor';
    searchEditor: {
        doubleClickBehaviour: 'selectWord' | 'goToLocation' | 'openLocationToSide';
        singleClickBehaviour: 'default' | 'peekDefinition';
        reusePriorSearchConfiguration: boolean;
        defaultNumberOfContextLines: number | null;
        focusResultsOnSearch: boolean;
        experimental: {};
    };
    sortOrder: SearchSortOrder;
    decorations: {
        colors: boolean;
        badges: boolean;
    };
    quickAccess: {
        preserveInput: boolean;
    };
    defaultViewMode: ViewMode;
    experimental: {
        closedNotebookRichContentResults: boolean;
    };
}
export interface ISearchConfiguration extends IFilesConfiguration {
    search: ISearchConfigurationProperties;
    editor: {
        wordSeparators: string;
    };
}
export declare function getExcludes(configuration: ISearchConfiguration, includeSearchExcludes?: boolean): glob.IExpression | undefined;
export declare function pathIncludedInQuery(queryProps: ICommonQueryProps<URI>, fsPath: string): boolean;
export declare enum SearchErrorCode {
    unknownEncoding = 1,
    regexParseError = 2,
    globParseError = 3,
    invalidLiteral = 4,
    rgProcessError = 5,
    other = 6,
    canceled = 7
}
export declare class SearchError extends Error {
    readonly code?: SearchErrorCode | undefined;
    constructor(message: string, code?: SearchErrorCode | undefined);
}
export declare function deserializeSearchError(error: Error): SearchError;
export declare function serializeSearchError(searchError: SearchError): Error;
export interface ITelemetryEvent {
    eventName: string;
    data: ITelemetryData;
}
export interface IRawSearchService {
    fileSearch(search: IRawFileQuery): Event<ISerializedSearchProgressItem | ISerializedSearchComplete>;
    textSearch(search: IRawTextQuery): Event<ISerializedSearchProgressItem | ISerializedSearchComplete>;
    clearCache(cacheKey: string): Promise<void>;
}
export interface IRawFileMatch {
    base?: string;
    relativePath: string;
    searchPath: string | undefined;
}
export interface ISearchEngine<T> {
    search: (onResult: (matches: T) => void, onProgress: (progress: IProgressMessage) => void, done: (error: Error | null, complete: ISearchEngineSuccess) => void) => void;
    cancel: () => void;
}
export interface ISerializedSearchSuccess {
    type: 'success';
    limitHit: boolean;
    messages: ITextSearchCompleteMessage[];
    stats?: IFileSearchStats | ITextSearchStats;
}
export interface ISearchEngineSuccess {
    limitHit: boolean;
    messages: ITextSearchCompleteMessage[];
    stats: ISearchEngineStats;
}
export interface ISerializedSearchError {
    type: 'error';
    error: {
        message: string;
        stack: string;
    };
}
export type ISerializedSearchComplete = ISerializedSearchSuccess | ISerializedSearchError;
export declare function isSerializedSearchComplete(arg: ISerializedSearchProgressItem | ISerializedSearchComplete): arg is ISerializedSearchComplete;
export declare function isSerializedSearchSuccess(arg: ISerializedSearchComplete): arg is ISerializedSearchSuccess;
export declare function isSerializedFileMatch(arg: ISerializedSearchProgressItem): arg is ISerializedFileMatch;
export declare function isFilePatternMatch(candidate: IRawFileMatch, filePatternToUse: string, fuzzy?: boolean): boolean;
export interface ISerializedFileMatch {
    path: string;
    results?: ITextSearchResult[];
    numMatches?: number;
}
export type ISerializedSearchProgressItem = ISerializedFileMatch | ISerializedFileMatch[] | IProgressMessage;
export type IFileSearchProgressItem = IRawFileMatch | IRawFileMatch[] | IProgressMessage;
export declare class SerializableFileMatch implements ISerializedFileMatch {
    path: string;
    results: ITextSearchMatch[];
    constructor(path: string);
    addMatch(match: ITextSearchMatch): void;
    serialize(): ISerializedFileMatch;
}
export declare function resolvePatternsForProvider(globalPattern: glob.IExpression | undefined, folderPattern: glob.IExpression | undefined): string[];
export declare class QueryGlobTester {
    private _excludeExpression;
    private _parsedExcludeExpression;
    private _parsedIncludeExpression;
    constructor(config: ISearchQuery, folderQuery: IFolderQuery);
    private _evalParsedExcludeExpression;
    matchesExcludesSync(testPath: string, basename?: string, hasSibling?: (name: string) => boolean): boolean;
    includedInQuerySync(testPath: string, basename?: string, hasSibling?: (name: string) => boolean): boolean;
    includedInQuery(testPath: string, basename?: string, hasSibling?: (name: string) => boolean | Promise<boolean>): Promise<boolean> | boolean;
    hasSiblingExcludeClauses(): boolean;
}
export declare function hasSiblingPromiseFn(siblingsFn?: () => Promise<string[]>): ((name: string) => Promise<boolean>) | undefined;
export declare function hasSiblingFn(siblingsFn?: () => string[]): ((name: string) => boolean) | undefined;
export declare function excludeToGlobPattern(excludesForFolder: {
    baseUri?: URI | undefined;
    patterns: string[];
}[]): GlobPattern[];
export declare const DEFAULT_TEXT_SEARCH_PREVIEW_OPTIONS: {
    matchLines: number;
    charsPerLine: number;
};
