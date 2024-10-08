import { IMouseWheelEvent } from '../../../../../base/browser/mouseEvent.js';
import { IListRenderer, IListVirtualDelegate } from '../../../../../base/browser/ui/list/list.js';
import { IListStyles, IStyleController } from '../../../../../base/browser/ui/list/listWidget.js';
import { Event } from '../../../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../../../base/common/lifecycle.js';
import { ScrollEvent } from '../../../../../base/common/scrollable.js';
import { Range } from '../../../../../editor/common/core/range.js';
import { Selection } from '../../../../../editor/common/core/selection.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IListService, IWorkbenchListOptions, WorkbenchList } from '../../../../../platform/list/browser/listService.js';
import { ICellViewModel, ICellOutputViewModel, CellRevealType, CellRevealRangeType, INotebookViewZoneChangeAccessor } from '../notebookBrowser.js';
import { CellViewModel, NotebookViewModel } from '../viewModel/notebookViewModelImpl.js';
import { ICellRange } from '../../common/notebookRange.js';
import { BaseCellRenderTemplate, INotebookCellList } from './notebookRenderingCommon.js';
import { FastDomNode } from '../../../../../base/browser/fastDomNode.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IListViewOptions, IListView } from '../../../../../base/browser/ui/list/listView.js';
import { NotebookCellListView } from './notebookCellListView.js';
import { NotebookOptions } from '../notebookOptions.js';
import { INotebookExecutionStateService } from '../../common/notebookExecutionStateService.js';
export declare const NOTEBOOK_WEBVIEW_BOUNDARY = 5000;
export declare class NotebookCellList extends WorkbenchList<CellViewModel> implements IDisposable, IStyleController, INotebookCellList {
    private listUser;
    private readonly notebookOptions;
    protected readonly view: NotebookCellListView<CellViewModel>;
    private viewZones;
    get onWillScroll(): Event<ScrollEvent>;
    get rowsContainer(): HTMLElement;
    get scrollableElement(): HTMLElement;
    private _previousFocusedElements;
    private readonly _localDisposableStore;
    private readonly _viewModelStore;
    private styleElement?;
    private _notebookCellAnchor;
    private readonly _onDidRemoveOutputs;
    readonly onDidRemoveOutputs: Event<readonly ICellOutputViewModel[]>;
    private readonly _onDidHideOutputs;
    readonly onDidHideOutputs: Event<readonly ICellOutputViewModel[]>;
    private readonly _onDidRemoveCellsFromView;
    readonly onDidRemoveCellsFromView: Event<readonly ICellViewModel[]>;
    private _viewModel;
    get viewModel(): NotebookViewModel | null;
    private _hiddenRangeIds;
    private hiddenRangesPrefixSum;
    private readonly _onDidChangeVisibleRanges;
    onDidChangeVisibleRanges: Event<void>;
    private _visibleRanges;
    get visibleRanges(): ICellRange[];
    set visibleRanges(ranges: ICellRange[]);
    private _isDisposed;
    get isDisposed(): boolean;
    private _isInLayout;
    private _webviewElement;
    get webviewElement(): FastDomNode<HTMLElement> | null;
    get inRenderingTransaction(): boolean;
    constructor(listUser: string, container: HTMLElement, notebookOptions: NotebookOptions, delegate: IListVirtualDelegate<CellViewModel>, renderers: IListRenderer<CellViewModel, BaseCellRenderTemplate>[], contextKeyService: IContextKeyService, options: IWorkbenchListOptions<CellViewModel>, listService: IListService, configurationService: IConfigurationService, instantiationService: IInstantiationService, notebookExecutionStateService: INotebookExecutionStateService);
    protected createListView(container: HTMLElement, virtualDelegate: IListVirtualDelegate<CellViewModel>, renderers: IListRenderer<any, any>[], viewOptions: IListViewOptions<CellViewModel>): IListView<CellViewModel>;
    /**
     * Test Only
     */
    _getView(): NotebookCellListView<CellViewModel>;
    attachWebview(element: HTMLElement): void;
    elementAt(position: number): ICellViewModel | undefined;
    elementHeight(element: ICellViewModel): number;
    detachViewModel(): void;
    attachViewModel(model: NotebookViewModel): void;
    private _updateElementsInWebview;
    clear(): void;
    setHiddenAreas(_ranges: ICellRange[], triggerViewUpdate: boolean): boolean;
    private _updateHiddenRangePrefixSum;
    /**
     * oldRanges and newRanges are all reduced and sorted.
     */
    updateHiddenAreasInView(oldRanges: ICellRange[], newRanges: ICellRange[]): void;
    splice2(start: number, deleteCount: number, elements?: readonly CellViewModel[]): void;
    getModelIndex(cell: CellViewModel): number | undefined;
    getModelIndex2(viewIndex: number): number | undefined;
    getViewIndex(cell: ICellViewModel): number | undefined;
    getViewIndex2(modelIndex: number): number | undefined;
    convertModelIndexToViewIndex(modelIndex: number): number;
    modelIndexIsVisible(modelIndex: number): boolean;
    private _getVisibleRangesFromIndex;
    getVisibleRangesPlusViewportAboveAndBelow(): ICellRange[];
    private _getViewIndexUpperBound;
    private _getViewIndexUpperBound2;
    focusElement(cell: ICellViewModel): void;
    selectElements(elements: ICellViewModel[]): void;
    getCellViewScrollTop(cell: ICellViewModel): number;
    getCellViewScrollBottom(cell: ICellViewModel): number;
    setFocus(indexes: number[], browserEvent?: UIEvent, ignoreTextModelUpdate?: boolean): void;
    setSelection(indexes: number[], browserEvent?: UIEvent | undefined, ignoreTextModelUpdate?: boolean): void;
    /**
     * The range will be revealed with as little scrolling as possible.
     */
    revealCells(range: ICellRange): void;
    private _revealInViewWithMinimalScrolling;
    scrollToBottom(): void;
    /**
     * Reveals the given cell in the notebook cell list. The cell will come into view syncronously
     * but the cell's editor will be attached asyncronously if it was previously out of view.
     * @returns The promise to await for the cell editor to be attached
     */
    revealCell(cell: ICellViewModel, revealType: CellRevealType): Promise<void>;
    private _revealInternal;
    revealRangeInCell(cell: ICellViewModel, range: Selection | Range, revealType: CellRevealRangeType): Promise<void>;
    private _revealRangeInternalAsync;
    private _revealRangeInCenterInternalAsync;
    private _revealRangeInCenterIfOutsideViewportInternalAsync;
    private _revealRangeCommon;
    /**
     * Reveals the specified offset of the given cell in the center of the viewport.
     * This enables revealing locations in the output as well as the input.
     */
    revealCellOffsetInCenter(cell: ICellViewModel, offset: number): void;
    revealOffsetInCenterIfOutsideViewport(offset: number): void;
    private _revealInCenterIfOutsideViewport;
    domElementOfElement(element: ICellViewModel): HTMLElement | null;
    focusView(): void;
    triggerScrollFromMouseWheelEvent(browserEvent: IMouseWheelEvent): void;
    delegateVerticalScrollbarPointerDown(browserEvent: PointerEvent): void;
    private isElementAboveViewport;
    updateElementHeight2(element: ICellViewModel, size: number, anchorElementIndex?: number | null): void;
    changeViewZones(callback: (accessor: INotebookViewZoneChangeAccessor) => void): void;
    domFocus(): void;
    focusContainer(clearSelection: boolean): void;
    getViewScrollTop(): number;
    getViewScrollBottom(): number;
    setCellEditorSelection(cell: ICellViewModel, range: Range): void;
    style(styles: IListStyles): void;
    getRenderHeight(): number;
    getScrollHeight(): number;
    layout(height?: number, width?: number): void;
    dispose(): void;
}
export declare class ListViewInfoAccessor extends Disposable {
    readonly list: INotebookCellList;
    constructor(list: INotebookCellList);
    getViewIndex(cell: ICellViewModel): number;
    getViewHeight(cell: ICellViewModel): number;
    getCellRangeFromViewRange(startIndex: number, endIndex: number): ICellRange | undefined;
    getCellsFromViewRange(startIndex: number, endIndex: number): ReadonlyArray<ICellViewModel>;
    getCellsInRange(range?: ICellRange): ReadonlyArray<ICellViewModel>;
    getVisibleRangesPlusViewportAboveAndBelow(): ICellRange[];
}
