import { Disposable } from '../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../base/common/uri.js';
import { INotebookDiffResult } from '../../common/notebookCommon.js';
import { INotebookService } from '../../common/notebookService.js';
import { INotebookEditorWorkerService } from '../../common/services/notebookWorkerService.js';
import { IModelService } from '../../../../../editor/common/services/model.js';
export declare class NotebookEditorWorkerServiceImpl extends Disposable implements INotebookEditorWorkerService {
    readonly _serviceBrand: undefined;
    private readonly _workerManager;
    constructor(notebookService: INotebookService, modelService: IModelService);
    canComputeDiff(original: URI, modified: URI): boolean;
    computeDiff(original: URI, modified: URI): Promise<INotebookDiffResult>;
    canPromptRecommendation(model: URI): Promise<boolean>;
}
