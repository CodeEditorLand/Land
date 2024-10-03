import { CancellationToken } from '../../../../base/common/cancellation.js';
import { URI } from '../../../../base/common/uri.js';
import { IProgress } from '../../../../platform/progress/common/progress.js';
export declare class Position {
    readonly line: number;
    readonly character: number;
    constructor(line: number, character: number);
    isBefore(other: Position): boolean;
    isBeforeOrEqual(other: Position): boolean;
    isAfter(other: Position): boolean;
    isAfterOrEqual(other: Position): boolean;
    isEqual(other: Position): boolean;
    compareTo(other: Position): number;
    translate(lineDelta?: number, characterDelta?: number): Position;
    translate(change: {
        lineDelta?: number;
        characterDelta?: number;
    }): Position;
    with(line?: number, character?: number): Position;
    with(change: {
        line?: number;
        character?: number;
    }): Position;
}
export declare class Range {
    readonly start: Position;
    readonly end: Position;
    constructor(startLine: number, startCol: number, endLine: number, endCol: number);
    isEmpty: boolean;
    isSingleLine: boolean;
    contains(positionOrRange: Position | Range): boolean;
    isEqual(other: Range): boolean;
    intersection(range: Range): Range | undefined;
    union(other: Range): Range;
    with(start?: Position, end?: Position): Range;
    with(change: {
        start?: Position;
        end?: Position;
    }): Range;
}
export type ProviderResult<T> = T | undefined | null | Thenable<T | undefined | null>;
export interface RelativePattern {
    baseUri: URI;
    pattern: string;
}
export type GlobPattern = string | RelativePattern;
export interface TextSearchQueryNew {
    pattern: string;
    isMultiline?: boolean;
    isRegExp?: boolean;
    isCaseSensitive?: boolean;
    isWordMatch?: boolean;
}
export interface TextSearchProviderFolderOptions {
    folder: URI;
    includes: string[];
    excludes: GlobPattern[];
    followSymlinks: boolean;
    useIgnoreFiles: {
        local: boolean;
        parent: boolean;
        global: boolean;
    };
    encoding: string;
}
export interface TextSearchProviderOptions {
    folderOptions: TextSearchProviderFolderOptions[];
    maxResults: number;
    previewOptions: {
        matchLines: number;
        charsPerLine: number;
    };
    maxFileSize: number | undefined;
    surroundingContext: number;
}
export interface TextSearchCompleteNew {
    limitHit?: boolean;
}
export interface FileSearchProviderFolderOptions {
    folder: URI;
    includes: string[];
    excludes: GlobPattern[];
    followSymlinks: boolean;
    useIgnoreFiles: {
        local: boolean;
        parent: boolean;
        global: boolean;
    };
}
export interface FileSearchProviderOptions {
    folderOptions: FileSearchProviderFolderOptions[];
    session: unknown;
    maxResults: number;
}
export declare class TextSearchMatchNew {
    uri: URI;
    ranges: {
        sourceRange: Range;
        previewRange: Range;
    }[];
    previewText: string;
    constructor(uri: URI, ranges: {
        sourceRange: Range;
        previewRange: Range;
    }[], previewText: string);
}
export declare class TextSearchContextNew {
    uri: URI;
    text: string;
    lineNumber: number;
    constructor(uri: URI, text: string, lineNumber: number);
}
export type TextSearchResultNew = TextSearchMatchNew | TextSearchContextNew;
export interface FileSearchProviderNew {
    provideFileSearchResults(pattern: string, options: FileSearchProviderOptions, token: CancellationToken): ProviderResult<URI[]>;
}
export interface TextSearchProviderNew {
    provideTextSearchResults(query: TextSearchQueryNew, options: TextSearchProviderOptions, progress: IProgress<TextSearchResultNew>, token: CancellationToken): ProviderResult<TextSearchCompleteNew>;
}
export interface TextSearchCompleteNew {
    limitHit?: boolean;
    message?: TextSearchCompleteMessageNew[];
}
export interface TextSearchCompleteMessageNew {
    text: string;
    trusted?: boolean;
    type: TextSearchCompleteMessageType;
}
export interface FileSearchProviderNew {
    provideFileSearchResults(pattern: string, options: FileSearchProviderOptions, token: CancellationToken): ProviderResult<URI[]>;
}
export interface TextSearchProviderNew {
    provideTextSearchResults(query: TextSearchQueryNew, options: TextSearchProviderOptions, progress: IProgress<TextSearchResultNew>, token: CancellationToken): ProviderResult<TextSearchCompleteNew>;
}
export interface TextSearchCompleteNew {
    limitHit?: boolean;
    message?: TextSearchCompleteMessageNew[];
}
export interface TextSearchCompleteMessageNew {
    text: string;
    trusted?: boolean;
    type: TextSearchCompleteMessageType;
}
export declare enum ExcludeSettingOptions {
    None = 1,
    FilesExclude = 2,
    SearchAndFilesExclude = 3
}
export declare enum TextSearchCompleteMessageType {
    Information = 1,
    Warning = 2
}
export interface TextSearchCompleteMessage {
    text: string;
    trusted?: boolean;
    type: TextSearchCompleteMessageType;
}
export interface AITextSearchProviderNew {
    readonly name?: string;
    provideAITextSearchResults(query: string, options: TextSearchProviderOptions, progress: IProgress<TextSearchResultNew>, token: CancellationToken): ProviderResult<TextSearchCompleteNew>;
}
