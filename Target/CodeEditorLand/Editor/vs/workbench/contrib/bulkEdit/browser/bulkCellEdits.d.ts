import { CancellationToken } from '../../../../base/common/cancellation.js';
import { URI } from '../../../../base/common/uri.js';
import { ResourceEdit } from '../../../../editor/browser/services/bulkEditService.js';
import { WorkspaceEditMetadata } from '../../../../editor/common/languages.js';
import { IProgress } from '../../../../platform/progress/common/progress.js';
import { UndoRedoGroup, UndoRedoSource } from '../../../../platform/undoRedo/common/undoRedo.js';
import { ICellPartialMetadataEdit, ICellReplaceEdit, IDocumentMetadataEdit, IWorkspaceNotebookCellEdit } from '../../notebook/common/notebookCommon.js';
import { INotebookEditorModelResolverService } from '../../notebook/common/notebookEditorModelResolverService.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
export declare class ResourceNotebookCellEdit extends ResourceEdit implements IWorkspaceNotebookCellEdit {
    readonly resource: URI;
    readonly cellEdit: ICellPartialMetadataEdit | IDocumentMetadataEdit | ICellReplaceEdit;
    readonly notebookVersionId: number | undefined;
    static is(candidate: any): candidate is IWorkspaceNotebookCellEdit;
    static lift(edit: IWorkspaceNotebookCellEdit): ResourceNotebookCellEdit;
    constructor(resource: URI, cellEdit: ICellPartialMetadataEdit | IDocumentMetadataEdit | ICellReplaceEdit, notebookVersionId?: number | undefined, metadata?: WorkspaceEditMetadata);
}
export declare class BulkCellEdits {
    private readonly _undoRedoGroup;
    private readonly _progress;
    private readonly _token;
    private readonly _edits;
    private readonly _editorService;
    private readonly _notebookModelService;
    constructor(_undoRedoGroup: UndoRedoGroup, undoRedoSource: UndoRedoSource | undefined, _progress: IProgress<void>, _token: CancellationToken, _edits: ResourceNotebookCellEdit[], _editorService: IEditorService, _notebookModelService: INotebookEditorModelResolverService);
    apply(): Promise<readonly URI[]>;
}
