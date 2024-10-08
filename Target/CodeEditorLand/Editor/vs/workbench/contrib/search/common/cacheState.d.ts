import { IFileQuery } from '../../../services/search/common/search.js';
export declare class FileQueryCacheState {
    private cacheQuery;
    private loadFn;
    private disposeFn;
    private previousCacheState;
    private readonly _cacheKey;
    get cacheKey(): string;
    get isLoaded(): boolean;
    get isUpdating(): boolean;
    private readonly query;
    private loadingPhase;
    private loadPromise;
    constructor(cacheQuery: (cacheKey: string) => IFileQuery, loadFn: (query: IFileQuery) => Promise<any>, disposeFn: (cacheKey: string) => Promise<void>, previousCacheState: FileQueryCacheState | undefined);
    load(): FileQueryCacheState;
    dispose(): void;
}
