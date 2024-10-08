import { CancellationToken } from '../../../../base/common/cancellation.js';
import { ResourceSet } from '../../../../base/common/map.js';
import { ITextQuery, ISearchProgressItem, ISearchComplete } from '../../../services/search/common/search.js';
export declare const INotebookSearchService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<INotebookSearchService>;
export interface INotebookSearchService {
    readonly _serviceBrand: undefined;
    notebookSearch(query: ITextQuery, token: CancellationToken | undefined, searchInstanceID: string, onProgress?: (result: ISearchProgressItem) => void): {
        openFilesToScan: ResourceSet;
        completeData: Promise<ISearchComplete>;
        allScannedFiles: Promise<ResourceSet>;
    };
}
