import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IEditorService } from '../../editor/common/editorService.js';
import { IExtensionService } from '../../extensions/common/extensions.js';
import { IFileMatch, IFileQuery, ISearchComplete, ISearchProgressItem, ISearchResultProvider, ITextQuery } from '../common/search.js';
import { SearchService } from '../common/searchService.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { IWorkerClient } from '../../../../base/common/worker/simpleWorker.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ILocalFileSearchSimpleWorker } from '../common/localFileSearchWorkerTypes.js';
import { UriComponents } from '../../../../base/common/uri.js';
import { Event } from '../../../../base/common/event.js';
export declare class RemoteSearchService extends SearchService {
    private readonly instantiationService;
    constructor(modelService: IModelService, editorService: IEditorService, telemetryService: ITelemetryService, logService: ILogService, extensionService: IExtensionService, fileService: IFileService, instantiationService: IInstantiationService, uriIdentityService: IUriIdentityService);
}
export declare class LocalFileSearchWorkerClient extends Disposable implements ISearchResultProvider {
    private fileService;
    private uriIdentityService;
    protected _worker: IWorkerClient<ILocalFileSearchSimpleWorker> | null;
    private readonly _onDidReceiveTextSearchMatch;
    readonly onDidReceiveTextSearchMatch: Event<{
        match: IFileMatch<UriComponents>;
        queryId: number;
    }>;
    private cache;
    private queryId;
    constructor(fileService: IFileService, uriIdentityService: IUriIdentityService);
    getAIName(): Promise<string | undefined>;
    sendTextSearchMatch(match: IFileMatch<UriComponents>, queryId: number): void;
    private get fileSystemProvider();
    private cancelQuery;
    textSearch(query: ITextQuery, onProgress?: (p: ISearchProgressItem) => void, token?: CancellationToken): Promise<ISearchComplete>;
    fileSearch(query: IFileQuery, token?: CancellationToken): Promise<ISearchComplete>;
    clearCache(cacheKey: string): Promise<void>;
    private _getOrCreateWorker;
}
