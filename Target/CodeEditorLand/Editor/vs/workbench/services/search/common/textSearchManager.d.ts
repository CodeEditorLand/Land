import { CancellationToken } from '../../../../base/common/cancellation.js';
import { URI } from '../../../../base/common/uri.js';
import { IAITextQuery, IFileMatch, ISearchCompleteStats, ITextQuery, ITextSearchStats } from './search.js';
import { AITextSearchProviderNew, TextSearchProviderNew, TextSearchResultNew } from './searchExtTypes.js';
export interface IFileUtils {
    readdir: (resource: URI) => Promise<string[]>;
    toCanonicalName: (encoding: string) => string;
}
interface IAITextQueryProviderPair {
    query: IAITextQuery;
    provider: AITextSearchProviderNew;
}
interface ITextQueryProviderPair {
    query: ITextQuery;
    provider: TextSearchProviderNew;
}
export declare class TextSearchManager {
    private queryProviderPair;
    private fileUtils;
    private processType;
    private collector;
    private isLimitHit;
    private resultCount;
    constructor(queryProviderPair: IAITextQueryProviderPair | ITextQueryProviderPair, fileUtils: IFileUtils, processType: ITextSearchStats['type']);
    private get query();
    search(onProgress: (matches: IFileMatch[]) => void, token: CancellationToken): Promise<ISearchCompleteStats>;
    private getMessagesFromResults;
    private resultSize;
    private trimResultToSize;
    private doSearch;
    private getSearchOptionsForFolder;
}
export declare class TextSearchResultsCollector {
    private _onResult;
    private _batchedCollector;
    private _currentFolderIdx;
    private _currentUri;
    private _currentFileMatch;
    constructor(_onResult: (result: IFileMatch[]) => void);
    add(data: TextSearchResultNew, folderIdx: number): void;
    private pushToCollector;
    flush(): void;
    private sendItems;
}
/**
 * Collects items that have a size - before the cumulative size of collected items reaches START_BATCH_AFTER_COUNT, the callback is called for every
 * set of items collected.
 * But after that point, the callback is called with batches of maxBatchSize.
 * If the batch isn't filled within some time, the callback is also called.
 */
export declare class BatchedCollector<T> {
    private maxBatchSize;
    private cb;
    private static readonly TIMEOUT;
    private static readonly START_BATCH_AFTER_COUNT;
    private totalNumberCompleted;
    private batch;
    private batchSize;
    private timeoutHandle;
    constructor(maxBatchSize: number, cb: (items: T[]) => void);
    addItem(item: T, size: number): void;
    addItems(items: T[], size: number): void;
    private addItemToBatch;
    private addItemsToBatch;
    private onUpdate;
    flush(): void;
}
export {};
