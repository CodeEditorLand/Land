import { Disposable, IDisposable } from '../../../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { ICellViewModel, INotebookEditor, INotebookEditorContribution, INotebookViewModel } from '../../notebookBrowser.js';
export declare function formatCellDuration(duration: number, showMilliseconds?: boolean): string;
export declare class NotebookStatusBarController extends Disposable {
    private readonly _notebookEditor;
    private readonly _itemFactory;
    private readonly _visibleCells;
    private readonly _observer;
    constructor(_notebookEditor: INotebookEditor, _itemFactory: (vm: INotebookViewModel, cell: ICellViewModel) => IDisposable);
    private _updateEverything;
    private _updateVisibleCells;
    dispose(): void;
}
export declare class ExecutionStateCellStatusBarContrib extends Disposable implements INotebookEditorContribution {
    static id: string;
    constructor(notebookEditor: INotebookEditor, instantiationService: IInstantiationService);
}
export declare class TimerCellStatusBarContrib extends Disposable implements INotebookEditorContribution {
    static id: string;
    constructor(notebookEditor: INotebookEditor, instantiationService: IInstantiationService);
}
