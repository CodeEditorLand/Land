import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { INotebookKernel, INotebookKernelHistoryService, INotebookKernelService, INotebookTextModelLike } from '../../common/notebookKernelService.js';
import { INotebookLoggingService } from '../../common/notebookLoggingService.js';
export declare class NotebookKernelHistoryService extends Disposable implements INotebookKernelHistoryService {
    private readonly _storageService;
    private readonly _notebookKernelService;
    private readonly _notebookLoggingService;
    _serviceBrand: undefined;
    private static STORAGE_KEY;
    private _mostRecentKernelsMap;
    constructor(_storageService: IStorageService, _notebookKernelService: INotebookKernelService, _notebookLoggingService: INotebookLoggingService);
    getKernels(notebook: INotebookTextModelLike): {
        selected: INotebookKernel | undefined;
        all: INotebookKernel[];
    };
    addMostRecentKernel(kernel: INotebookKernel): void;
    private _saveState;
    private _loadState;
    private _serialize;
    private _deserialize;
    _clear(): void;
}
