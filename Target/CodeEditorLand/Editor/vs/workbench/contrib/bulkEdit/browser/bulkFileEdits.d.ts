import { IProgress } from '../../../../platform/progress/common/progress.js';
import { IUndoRedoService, UndoRedoGroup, UndoRedoSource } from '../../../../platform/undoRedo/common/undoRedo.js';
import { URI } from '../../../../base/common/uri.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ResourceFileEdit } from '../../../../editor/browser/services/bulkEditService.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
export declare class BulkFileEdits {
    private readonly _label;
    private readonly _code;
    private readonly _undoRedoGroup;
    private readonly _undoRedoSource;
    private readonly _confirmBeforeUndo;
    private readonly _progress;
    private readonly _token;
    private readonly _edits;
    private readonly _instaService;
    private readonly _undoRedoService;
    constructor(_label: string, _code: string, _undoRedoGroup: UndoRedoGroup, _undoRedoSource: UndoRedoSource | undefined, _confirmBeforeUndo: boolean, _progress: IProgress<void>, _token: CancellationToken, _edits: ResourceFileEdit[], _instaService: IInstantiationService, _undoRedoService: IUndoRedoService);
    apply(): Promise<readonly URI[]>;
}
