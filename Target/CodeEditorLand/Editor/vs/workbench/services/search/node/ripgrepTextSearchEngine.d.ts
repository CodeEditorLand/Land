import { EventEmitter } from 'events';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { URI } from '../../../../base/common/uri.js';
import { Progress } from '../../../../platform/progress/common/progress.js';
import { ITextSearchPreviewOptions } from '../common/search.js';
import { TextSearchCompleteNew, TextSearchProviderOptions, TextSearchQueryNew, TextSearchResultNew } from '../common/searchExtTypes.js';
import { IOutputChannel } from './ripgrepSearchUtils.js';
import type { RipgrepTextSearchOptions } from '../common/searchExtTypesInternal.js';
export declare class RipgrepTextSearchEngine {
    private outputChannel;
    private readonly _numThreads?;
    constructor(outputChannel: IOutputChannel, _numThreads?: number | undefined);
    provideTextSearchResults(query: TextSearchQueryNew, options: TextSearchProviderOptions, progress: Progress<TextSearchResultNew>, token: CancellationToken): Promise<TextSearchCompleteNew>;
    provideTextSearchResultsWithRgOptions(query: TextSearchQueryNew, options: RipgrepTextSearchOptions, progress: Progress<TextSearchResultNew>, token: CancellationToken): Promise<TextSearchCompleteNew>;
}
export declare class RipgrepParser extends EventEmitter {
    private maxResults;
    private root;
    private previewOptions;
    private remainder;
    private isDone;
    private hitLimit;
    private stringDecoder;
    private numResults;
    constructor(maxResults: number, root: URI, previewOptions: ITextSearchPreviewOptions);
    cancel(): void;
    flush(): void;
    on(event: 'result', listener: (result: TextSearchResultNew) => void): this;
    on(event: 'hitLimit', listener: () => void): this;
    handleData(data: Buffer | string): void;
    private handleDecodedData;
    private handleLine;
    private createTextSearchMatch;
    private createTextSearchContexts;
    private onResult;
}
export declare function getRgArgs(query: TextSearchQueryNew, options: RipgrepTextSearchOptions): string[];
export declare function unicodeEscapesToPCRE2(pattern: string): string;
export interface IRgMessage {
    type: 'match' | 'context' | string;
    data: IRgMatch;
}
export interface IRgMatch {
    path: IRgBytesOrText;
    lines: IRgBytesOrText;
    line_number: number;
    absolute_offset: number;
    submatches: IRgSubmatch[];
}
export interface IRgSubmatch {
    match: IRgBytesOrText;
    start: number;
    end: number;
}
export type IRgBytesOrText = {
    bytes: string;
} | {
    text: string;
};
export declare function fixRegexNewline(pattern: string): string;
export declare function fixNewline(pattern: string): string;
export declare function performBraceExpansionForRipgrep(pattern: string): string[];
