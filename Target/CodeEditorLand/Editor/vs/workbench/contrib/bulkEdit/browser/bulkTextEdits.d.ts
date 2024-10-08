import { URI } from '../../../../base/common/uri.js';
import { ICodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { ITextModelService } from '../../../../editor/common/services/resolverService.js';
import { IProgress } from '../../../../platform/progress/common/progress.js';
import { IEditorWorkerService } from '../../../../editor/common/services/editorWorker.js';
import { IUndoRedoService, UndoRedoGroup, UndoRedoSource } from '../../../../platform/undoRedo/common/undoRedo.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { ResourceTextEdit } from '../../../../editor/browser/services/bulkEditService.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
export declare class BulkTextEdits {
    private readonly _label;
    private readonly _code;
    private readonly _editor;
    private readonly _undoRedoGroup;
    private readonly _undoRedoSource;
    private readonly _progress;
    private readonly _token;
    private readonly _editorWorker;
    private readonly _modelService;
    private readonly _textModelResolverService;
    private readonly _undoRedoService;
    private readonly _edits;
    constructor(_label: string, _code: string, _editor: ICodeEditor | undefined, _undoRedoGroup: UndoRedoGroup, _undoRedoSource: UndoRedoSource | undefined, _progress: IProgress<void>, _token: CancellationToken, edits: ResourceTextEdit[], _editorWorker: IEditorWorkerService, _modelService: IModelService, _textModelResolverService: ITextModelService, _undoRedoService: IUndoRedoService);
    private _validateBeforePrepare;
    private _createEditsTasks;
    private _validateTasks;
    apply(): Promise<readonly URI[]>;
}
