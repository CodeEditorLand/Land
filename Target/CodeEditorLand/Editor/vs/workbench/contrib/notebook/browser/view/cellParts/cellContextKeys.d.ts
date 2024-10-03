import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { IContextKeyService } from '../../../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { ICellViewModel, INotebookEditorDelegate } from '../../notebookBrowser.js';
import { CellContentPart } from '../cellPart.js';
import { INotebookExecutionStateService } from '../../../common/notebookExecutionStateService.js';
export declare class CellContextKeyPart extends CellContentPart {
    private readonly instantiationService;
    private cellContextKeyManager;
    constructor(notebookEditor: INotebookEditorDelegate, instantiationService: IInstantiationService);
    didRenderCell(element: ICellViewModel): void;
}
export declare class CellContextKeyManager extends Disposable {
    private readonly notebookEditor;
    private element;
    private readonly _contextKeyService;
    private readonly _notebookExecutionStateService;
    private cellType;
    private cellEditable;
    private cellFocused;
    private cellEditorFocused;
    private cellRunState;
    private cellExecuting;
    private cellHasOutputs;
    private cellContentCollapsed;
    private cellOutputCollapsed;
    private cellLineNumbers;
    private cellResource;
    private cellGeneratedByChat;
    private cellHasErrorDiagnostics;
    private markdownEditMode;
    private readonly elementDisposables;
    constructor(notebookEditor: INotebookEditorDelegate, element: ICellViewModel | undefined, _contextKeyService: IContextKeyService, _notebookExecutionStateService: INotebookExecutionStateService);
    updateForElement(element: ICellViewModel | undefined): void;
    private onDidChangeState;
    private updateForFocusState;
    private updateForExecutionState;
    private updateForEditState;
    private updateForCollapseState;
    private updateForOutputs;
    private updateForChat;
}
