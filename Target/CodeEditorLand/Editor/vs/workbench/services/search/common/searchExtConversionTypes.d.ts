import { CancellationToken } from '../../../../base/common/cancellation.js';
import { URI } from '../../../../base/common/uri.js';
import { IProgress } from '../../../../platform/progress/common/progress.js';
import { Range, FileSearchProviderNew, FileSearchProviderOptions, ProviderResult, TextSearchCompleteNew, TextSearchProviderNew, TextSearchProviderOptions, TextSearchQueryNew, TextSearchResultNew, AITextSearchProviderNew, TextSearchCompleteMessage } from './searchExtTypes.js';
export interface RelativePattern {
    base: string;
    pattern: string;
}
export type GlobPattern = string | RelativePattern;
export interface TextSearchQuery {
    pattern: string;
    isMultiline?: boolean;
    isRegExp?: boolean;
    isCaseSensitive?: boolean;
    isWordMatch?: boolean;
}
export type GlobString = string;
export interface SearchOptions {
    folder: URI;
    includes: GlobString[];
    excludes: GlobString[];
    useIgnoreFiles: boolean;
    followSymlinks: boolean;
    useGlobalIgnoreFiles: boolean;
    useParentIgnoreFiles: boolean;
}
export interface TextSearchPreviewOptions {
    matchLines: number;
    charsPerLine: number;
}
export interface TextSearchOptions extends SearchOptions {
    maxResults: number;
    previewOptions?: TextSearchPreviewOptions;
    maxFileSize?: number;
    encoding?: string;
    beforeContext?: number;
    afterContext?: number;
}
export interface AITextSearchOptions extends SearchOptions {
    maxResults: number;
    previewOptions?: TextSearchPreviewOptions;
    maxFileSize?: number;
    beforeContext?: number;
    afterContext?: number;
}
export interface TextSearchComplete {
    limitHit?: boolean;
    message?: TextSearchCompleteMessage | TextSearchCompleteMessage[];
}
export interface FileSearchQuery {
    pattern: string;
}
export interface FileSearchOptions extends SearchOptions {
    maxResults?: number;
    session?: CancellationToken;
}
export interface TextSearchMatchPreview {
    text: string;
    matches: Range | Range[];
}
export interface TextSearchMatch {
    uri: URI;
    ranges: Range | Range[];
    preview: TextSearchMatchPreview;
}
export interface TextSearchContext {
    uri: URI;
    text: string;
    lineNumber: number;
}
export type TextSearchResult = TextSearchMatch | TextSearchContext;
export interface FileSearchProvider {
    provideFileSearchResults(query: FileSearchQuery, options: FileSearchOptions, token: CancellationToken): ProviderResult<URI[]>;
}
export interface TextSearchProvider {
    provideTextSearchResults(query: TextSearchQuery, options: TextSearchOptions, progress: IProgress<TextSearchResult>, token: CancellationToken): ProviderResult<TextSearchComplete>;
}
export interface AITextSearchProvider {
    readonly name?: string;
    provideAITextSearchResults(query: string, options: AITextSearchOptions, progress: IProgress<TextSearchResult>, token: CancellationToken): ProviderResult<TextSearchComplete>;
}
export interface FindTextInFilesOptions {
    include?: GlobPattern;
    exclude?: GlobPattern | null;
    maxResults?: number;
    useIgnoreFiles?: boolean;
    useGlobalIgnoreFiles?: boolean;
    useParentIgnoreFiles: boolean;
    followSymlinks?: boolean;
    encoding?: string;
    previewOptions?: TextSearchPreviewOptions;
    beforeContext?: number;
    afterContext?: number;
}
export declare class OldFileSearchProviderConverter implements FileSearchProviderNew {
    private provider;
    constructor(provider: FileSearchProvider);
    provideFileSearchResults(pattern: string, options: FileSearchProviderOptions, token: CancellationToken): ProviderResult<URI[]>;
}
export declare function newToOldPreviewOptions(options: {
    matchLines?: number;
    charsPerLine?: number;
} | undefined): {
    matchLines: number;
    charsPerLine: number;
};
export declare function oldToNewTextSearchResult(result: TextSearchResult): TextSearchResultNew;
export declare class OldTextSearchProviderConverter implements TextSearchProviderNew {
    private provider;
    constructor(provider: TextSearchProvider);
    provideTextSearchResults(query: TextSearchQueryNew, options: TextSearchProviderOptions, progress: IProgress<TextSearchResultNew>, token: CancellationToken): ProviderResult<TextSearchCompleteNew>;
}
export declare class OldAITextSearchProviderConverter implements AITextSearchProviderNew {
    private provider;
    readonly name?: string;
    constructor(provider: AITextSearchProvider);
    provideAITextSearchResults(query: string, options: TextSearchProviderOptions, progress: IProgress<TextSearchResultNew>, token: CancellationToken): ProviderResult<TextSearchCompleteNew>;
}
export declare function extensionResultIsMatch(data: TextSearchResult): data is TextSearchMatch;
