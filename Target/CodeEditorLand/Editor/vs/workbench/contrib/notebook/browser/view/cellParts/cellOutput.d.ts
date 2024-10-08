import { FastDomNode } from '../../../../../../base/browser/fastDomNode.js';
import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { IMenuService } from '../../../../../../platform/actions/common/actions.js';
import { IContextKeyService } from '../../../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { IOpenerService } from '../../../../../../platform/opener/common/opener.js';
import { IQuickInputService } from '../../../../../../platform/quickinput/common/quickInput.js';
import { IExtensionsWorkbenchService } from '../../../../extensions/common/extensions.js';
import { ICellOutputViewModel, IInsetRenderOutput, INotebookEditorDelegate } from '../../notebookBrowser.js';
import { CellContentPart } from '../cellPart.js';
import { CodeCellRenderTemplate } from '../notebookRenderingCommon.js';
import { CodeCellViewModel } from '../../viewModel/codeCellViewModel.js';
import { INotebookExecutionStateService } from '../../../common/notebookExecutionStateService.js';
import { INotebookService } from '../../../common/notebookService.js';
interface IRenderResult {
    initRenderIsSynchronous: false;
}
declare class CellOutputElement extends Disposable {
    private notebookEditor;
    private viewCell;
    private cellOutputContainer;
    private outputContainer;
    readonly output: ICellOutputViewModel;
    private readonly notebookService;
    private readonly quickInputService;
    private readonly menuService;
    private readonly extensionsWorkbenchService;
    private readonly instantiationService;
    private readonly toolbarDisposables;
    innerContainer?: HTMLElement;
    renderedOutputContainer: HTMLElement;
    renderResult?: IInsetRenderOutput;
    private readonly contextKeyService;
    private toolbarAttached;
    constructor(notebookEditor: INotebookEditorDelegate, viewCell: CodeCellViewModel, cellOutputContainer: CellOutputContainer, outputContainer: FastDomNode<HTMLElement>, output: ICellOutputViewModel, notebookService: INotebookService, quickInputService: IQuickInputService, parentContextKeyService: IContextKeyService, menuService: IMenuService, extensionsWorkbenchService: IExtensionsWorkbenchService, instantiationService: IInstantiationService);
    detach(): void;
    updateDOMTop(top: number): void;
    rerender(): void;
    private _generateInnerOutputContainer;
    render(previousSibling: HTMLElement | undefined): IRenderResult | undefined;
    private _renderMissingRenderer;
    private _renderSearchForMimetype;
    private _renderMessage;
    private shouldEnableCopy;
    private _attachToolbar;
    private _pickActiveMimeTypeRenderer;
    private _showJupyterExtension;
    private _generateRendererInfo;
    private _outputHeightTimer;
    private _validateFinalOutputHeight;
    private _relayoutCell;
    dispose(): void;
}
declare class OutputEntryViewHandler {
    readonly model: ICellOutputViewModel;
    readonly element: CellOutputElement;
    constructor(model: ICellOutputViewModel, element: CellOutputElement);
}
export declare class CellOutputContainer extends CellContentPart {
    private notebookEditor;
    private viewCell;
    private readonly templateData;
    private options;
    private readonly openerService;
    private readonly _notebookExecutionStateService;
    private readonly instantiationService;
    private _outputEntries;
    private _hasStaleOutputs;
    hasHiddenOutputs: import("../../../../../../base/common/observable.js").ISettableObservable<boolean, void>;
    checkForHiddenOutputs(): void;
    get renderedOutputEntries(): OutputEntryViewHandler[];
    constructor(notebookEditor: INotebookEditorDelegate, viewCell: CodeCellViewModel, templateData: CodeCellRenderTemplate, options: {
        limit: number;
    }, openerService: IOpenerService, _notebookExecutionStateService: INotebookExecutionStateService, instantiationService: IInstantiationService);
    updateInternalLayoutNow(viewCell: CodeCellViewModel): void;
    render(): void;
    /**
     * Notify that an output may have been swapped out without the model getting rendered.
     */
    flagAsStale(): void;
    private _doRender;
    viewUpdateShowOutputs(initRendering: boolean): void;
    viewUpdateHideOuputs(): void;
    private _outputHeightTimer;
    private _validateFinalOutputHeight;
    private _updateOutputs;
    private _renderNow;
    private _generateShowMoreElement;
    private _relayoutCell;
    dispose(): void;
}
export {};
