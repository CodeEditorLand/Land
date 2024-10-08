import { ITextSearchPreviewOptions, ITextSearchResult } from './search.js';
export declare const getFileResults: (bytes: Uint8Array, pattern: RegExp, options: {
    surroundingContext: number;
    previewOptions: ITextSearchPreviewOptions | undefined;
    remainingResultQuota: number;
}) => ITextSearchResult[];
