import { URI } from '../../../../../base/common/uri.js';
import { INotebookDiffResult } from '../notebookCommon.js';
export declare const ID_NOTEBOOK_EDITOR_WORKER_SERVICE = "notebookEditorWorkerService";
export declare const INotebookEditorWorkerService: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<INotebookEditorWorkerService>;
export interface INotebookEditorWorkerService {
    readonly _serviceBrand: undefined;
    canComputeDiff(original: URI, modified: URI): boolean;
    computeDiff(original: URI, modified: URI): Promise<INotebookDiffResult>;
    canPromptRecommendation(model: URI): Promise<boolean>;
}
