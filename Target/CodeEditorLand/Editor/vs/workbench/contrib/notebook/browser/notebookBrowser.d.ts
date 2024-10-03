import { CodeWindow } from '../../../../base/browser/window.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Event } from '../../../../base/common/event.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { IEditorContributionDescription } from '../../../../editor/browser/editorExtensions.js';
import * as editorCommon from '../../../../editor/common/editorCommon.js';
import { FontInfo } from '../../../../editor/common/config/fontInfo.js';
import { IPosition } from '../../../../editor/common/core/position.js';
import { IRange, Range } from '../../../../editor/common/core/range.js';
import { Selection } from '../../../../editor/common/core/selection.js';
import { FindMatch, IModelDeltaDecoration, IReadonlyTextBuffer, ITextModel, TrackedRangeStickiness } from '../../../../editor/common/model.js';
import { MenuId } from '../../../../platform/actions/common/actions.js';
import { ITextEditorOptions, ITextResourceEditorInput } from '../../../../platform/editor/common/editor.js';
import { IConstructorSignature } from '../../../../platform/instantiation/common/instantiation.js';
import { IEditorPane, IEditorPaneWithSelection } from '../../../common/editor.js';
import { CellViewModelStateChangeEvent, NotebookCellStateChangedEvent, NotebookLayoutInfo } from './notebookViewEvents.js';
import { NotebookCellTextModel } from '../common/model/notebookCellTextModel.js';
import { NotebookTextModel } from '../common/model/notebookTextModel.js';
import { CellKind, ICellOutput, INotebookCellStatusBarItem, INotebookRendererInfo, INotebookFindOptions, IOrderedMimeType, NotebookCellInternalMetadata, NotebookCellMetadata } from '../common/notebookCommon.js';
import { INotebookKernel } from '../common/notebookKernelService.js';
import { NotebookOptions } from './notebookOptions.js';
import { ICellRange } from '../common/notebookRange.js';
import { IWebviewElement } from '../../webview/browser/webview.js';
import { IEditorCommentsOptions, IEditorOptions } from '../../../../editor/common/config/editorOptions.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { ICodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { IObservable } from '../../../../base/common/observable.js';
export declare const EXPAND_CELL_INPUT_COMMAND_ID = "notebook.cell.expandCellInput";
export declare const EXECUTE_CELL_COMMAND_ID = "notebook.cell.execute";
export declare const DETECT_CELL_LANGUAGE = "notebook.cell.detectLanguage";
export declare const CHANGE_CELL_LANGUAGE = "notebook.cell.changeLanguage";
export declare const QUIT_EDIT_CELL_COMMAND_ID = "notebook.cell.quitEdit";
export declare const EXPAND_CELL_OUTPUT_COMMAND_ID = "notebook.cell.expandCellOutput";
export declare const IPYNB_VIEW_TYPE = "jupyter-notebook";
export declare const JUPYTER_EXTENSION_ID = "ms-toolsai.jupyter";
export declare const KERNEL_EXTENSIONS: Map<string, string>;
export declare const KERNEL_RECOMMENDATIONS: Map<string, Map<string, INotebookExtensionRecommendation>>;
export interface INotebookExtensionRecommendation {
    readonly extensionIds: string[];
    readonly displayName?: string;
}
export declare const enum RenderOutputType {
    Html = 0,
    Extension = 1
}
export interface IRenderPlainHtmlOutput {
    readonly type: RenderOutputType.Html;
    readonly source: IDisplayOutputViewModel;
    readonly htmlContent: string;
}
export interface IRenderOutputViaExtension {
    readonly type: RenderOutputType.Extension;
    readonly source: IDisplayOutputViewModel;
    readonly mimeType: string;
    readonly renderer: INotebookRendererInfo;
}
export type IInsetRenderOutput = IRenderPlainHtmlOutput | IRenderOutputViaExtension;
export interface ICellOutputViewModel extends IDisposable {
    cellViewModel: IGenericCellViewModel;
    model: ICellOutput;
    resolveMimeTypes(textModel: NotebookTextModel, kernelProvides: readonly string[] | undefined): [readonly IOrderedMimeType[], number];
    pickedMimeType: IOrderedMimeType | undefined;
    hasMultiMimeType(): boolean;
    readonly onDidResetRenderer: Event<void>;
    readonly visible: IObservable<boolean>;
    setVisible(visible: boolean, force?: boolean): void;
    resetRenderer(): void;
    toRawJSON(): any;
}
export interface IDisplayOutputViewModel extends ICellOutputViewModel {
    resolveMimeTypes(textModel: NotebookTextModel, kernelProvides: readonly string[] | undefined): [readonly IOrderedMimeType[], number];
}
export interface IGenericCellViewModel {
    id: string;
    handle: number;
    uri: URI;
    metadata: NotebookCellMetadata;
    outputIsHovered: boolean;
    outputIsFocused: boolean;
    inputInOutputIsFocused: boolean;
    outputsViewModels: ICellOutputViewModel[];
    getOutputOffset(index: number): number;
    updateOutputHeight(index: number, height: number, source?: string): void;
}
export interface IDisplayOutputLayoutUpdateRequest {
    readonly cell: IGenericCellViewModel;
    output: IDisplayOutputViewModel;
    cellTop: number;
    outputOffset: number;
    forceDisplay: boolean;
}
export interface ICommonCellInfo {
    readonly cellId: string;
    readonly cellHandle: number;
    readonly cellUri: URI;
    readonly executionId?: string;
}
export declare enum ScrollToRevealBehavior {
    fullCell = 0,
    firstLine = 1
}
export interface IFocusNotebookCellOptions {
    readonly skipReveal?: boolean;
    readonly focusEditorLine?: number;
    readonly revealBehavior?: ScrollToRevealBehavior | undefined;
    readonly outputId?: string;
    readonly altOutputId?: string;
    readonly outputWebviewFocused?: boolean;
}
export declare enum CellLayoutState {
    Uninitialized = 0,
    Estimated = 1,
    FromCache = 2,
    Measured = 3
}
export interface CellLayoutInfo {
    readonly layoutState: CellLayoutState;
    readonly fontInfo: FontInfo | null;
    readonly chatHeight: number;
    readonly editorWidth: number;
    readonly editorHeight: number;
    readonly statusBarHeight: number;
    readonly commentOffset: number;
    readonly commentHeight: number;
    readonly bottomToolbarOffset: number;
    readonly totalHeight: number;
}
export interface CellLayoutChangeEvent {
    readonly font?: FontInfo;
    readonly outerWidth?: number;
    readonly commentHeight?: boolean;
}
export interface CodeCellLayoutInfo extends CellLayoutInfo {
    readonly estimatedHasHorizontalScrolling: boolean;
    readonly outputContainerOffset: number;
    readonly outputTotalHeight: number;
    readonly outputShowMoreContainerHeight: number;
    readonly outputShowMoreContainerOffset: number;
    readonly codeIndicatorHeight: number;
    readonly outputIndicatorHeight: number;
}
export interface CodeCellLayoutChangeEvent extends CellLayoutChangeEvent {
    readonly source?: string;
    readonly chatHeight?: boolean;
    readonly editorHeight?: boolean;
    readonly outputHeight?: boolean;
    readonly outputShowMoreContainerHeight?: number;
    readonly totalHeight?: boolean;
}
export interface MarkupCellLayoutInfo extends CellLayoutInfo {
    readonly previewHeight: number;
    readonly foldHintHeight: number;
}
export declare enum CellLayoutContext {
    Fold = 0
}
export interface MarkupCellLayoutChangeEvent extends CellLayoutChangeEvent {
    readonly editorHeight?: number;
    readonly previewHeight?: number;
    totalHeight?: number;
    readonly context?: CellLayoutContext;
}
export interface ICommonCellViewModelLayoutChangeInfo {
    readonly totalHeight?: boolean | number;
    readonly outerWidth?: number;
    readonly context?: CellLayoutContext;
}
export interface ICellViewModel extends IGenericCellViewModel {
    readonly model: NotebookCellTextModel;
    readonly id: string;
    readonly textBuffer: IReadonlyTextBuffer;
    readonly layoutInfo: CellLayoutInfo;
    readonly onDidChangeLayout: Event<ICommonCellViewModelLayoutChangeInfo>;
    readonly onDidChangeCellStatusBarItems: Event<void>;
    readonly onCellDecorationsChanged: Event<{
        added: INotebookCellDecorationOptions[];
        removed: INotebookCellDecorationOptions[];
    }>;
    readonly onDidChangeState: Event<CellViewModelStateChangeEvent>;
    readonly onDidChangeEditorAttachState: Event<void>;
    readonly editStateSource: string;
    readonly editorAttached: boolean;
    isInputCollapsed: boolean;
    isOutputCollapsed: boolean;
    dragging: boolean;
    handle: number;
    uri: URI;
    language: string;
    readonly mime: string;
    cellKind: CellKind;
    lineNumbers: 'on' | 'off' | 'inherit';
    commentOptions: IEditorCommentsOptions;
    chatHeight: number;
    commentHeight: number;
    focusMode: CellFocusMode;
    focusedOutputId?: string | undefined;
    outputIsHovered: boolean;
    getText(): string;
    getAlternativeId(): number;
    getTextLength(): number;
    getHeight(lineHeight: number): number;
    metadata: NotebookCellMetadata;
    internalMetadata: NotebookCellInternalMetadata;
    textModel: ITextModel | undefined;
    hasModel(): this is IEditableCellViewModel;
    resolveTextModel(): Promise<ITextModel>;
    getSelections(): Selection[];
    setSelections(selections: Selection[]): void;
    getSelectionsStartPosition(): IPosition[] | undefined;
    getCellDecorations(): INotebookCellDecorationOptions[];
    getCellStatusBarItems(): INotebookCellStatusBarItem[];
    getEditState(): CellEditState;
    updateEditState(state: CellEditState, source: string): void;
    deltaModelDecorations(oldDecorations: readonly string[], newDecorations: readonly IModelDeltaDecoration[]): string[];
    getCellDecorationRange(id: string): Range | null;
    enableAutoLanguageDetection(): void;
}
export interface IEditableCellViewModel extends ICellViewModel {
    textModel: ITextModel;
}
export interface INotebookEditorMouseEvent {
    readonly event: MouseEvent;
    readonly target: ICellViewModel;
}
export interface INotebookEditorContribution {
    dispose(): void;
    saveViewState?(): unknown;
    restoreViewState?(state: unknown): void;
}
export declare enum NotebookOverviewRulerLane {
    Left = 1,
    Center = 2,
    Right = 4,
    Full = 7
}
export interface INotebookCellDecorationOptions {
    className?: string;
    gutterClassName?: string;
    outputClassName?: string;
    topClassName?: string;
    overviewRuler?: {
        color: string;
        modelRanges: IRange[];
        includeOutput: boolean;
        position: NotebookOverviewRulerLane;
    };
}
export interface INotebookDeltaDecoration {
    readonly handle: number;
    readonly options: INotebookCellDecorationOptions;
}
export interface INotebookDeltaCellStatusBarItems {
    readonly handle: number;
    readonly items: readonly INotebookCellStatusBarItem[];
}
export declare const enum CellRevealType {
    Default = 1,
    Top = 2,
    Center = 3,
    CenterIfOutsideViewport = 4,
    NearTopIfOutsideViewport = 5,
    FirstLineIfOutsideViewport = 6
}
export declare enum CellRevealRangeType {
    Default = 1,
    Center = 2,
    CenterIfOutsideViewport = 3
}
export interface INotebookEditorOptions extends ITextEditorOptions {
    readonly cellOptions?: ITextResourceEditorInput;
    readonly cellRevealType?: CellRevealType;
    readonly cellSelections?: ICellRange[];
    readonly isReadOnly?: boolean;
    readonly viewState?: INotebookEditorViewState;
    readonly indexedCellOptions?: {
        index: number;
        selection?: IRange;
    };
    readonly label?: string;
}
export type INotebookEditorContributionCtor = IConstructorSignature<INotebookEditorContribution, [INotebookEditor]>;
export interface INotebookEditorContributionDescription {
    id: string;
    ctor: INotebookEditorContributionCtor;
}
export interface INotebookEditorCreationOptions {
    readonly isReplHistory?: boolean;
    readonly isReadOnly?: boolean;
    readonly contributions?: INotebookEditorContributionDescription[];
    readonly cellEditorContributions?: IEditorContributionDescription[];
    readonly menuIds: {
        notebookToolbar: MenuId;
        cellTitleToolbar: MenuId;
        cellDeleteToolbar: MenuId;
        cellInsertToolbar: MenuId;
        cellTopInsertToolbar: MenuId;
        cellExecuteToolbar: MenuId;
        cellExecutePrimary?: MenuId;
    };
    readonly options?: NotebookOptions;
    readonly codeWindow?: CodeWindow;
}
export interface INotebookWebviewMessage {
    readonly message: unknown;
}
export interface INotebookEditorViewState {
    editingCells: {
        [key: number]: boolean;
    };
    collapsedInputCells: {
        [key: number]: boolean;
    };
    collapsedOutputCells: {
        [key: number]: boolean;
    };
    cellLineNumberStates: {
        [key: number]: 'on' | 'off';
    };
    editorViewStates: {
        [key: number]: editorCommon.ICodeEditorViewState | null;
    };
    hiddenFoldingRanges?: ICellRange[];
    cellTotalHeights?: {
        [key: number]: number;
    };
    scrollPosition?: {
        left: number;
        top: number;
    };
    focus?: number;
    editorFocused?: boolean;
    contributionsState?: {
        [id: string]: unknown;
    };
    selectedKernelId?: string;
}
export interface ICellModelDecorations {
    readonly ownerId: number;
    readonly decorations: readonly string[];
}
export interface ICellModelDeltaDecorations {
    readonly ownerId: number;
    readonly decorations: readonly IModelDeltaDecoration[];
}
export interface IModelDecorationsChangeAccessor {
    deltaDecorations(oldDecorations: ICellModelDecorations[], newDecorations: ICellModelDeltaDecorations[]): ICellModelDecorations[];
}
export interface INotebookViewZone {
    afterModelPosition: number;
    domNode: HTMLElement;
    heightInPx: number;
}
export interface INotebookViewZoneChangeAccessor {
    addZone(zone: INotebookViewZone): string;
    removeZone(id: string): void;
    layoutZone(id: string): void;
}
export type NotebookViewCellsSplice = [
    number,
    number,
    ICellViewModel[]
];
export interface INotebookViewCellsUpdateEvent {
    readonly synchronous: boolean;
    readonly splices: readonly NotebookViewCellsSplice[];
}
export interface INotebookViewModel {
    notebookDocument: NotebookTextModel;
    readonly viewCells: ICellViewModel[];
    layoutInfo: NotebookLayoutInfo | null;
    viewType: string;
    onDidChangeViewCells: Event<INotebookViewCellsUpdateEvent>;
    onDidChangeSelection: Event<string>;
    onDidFoldingStateChanged: Event<void>;
    getNearestVisibleCellIndexUpwards(index: number): number;
    getTrackedRange(id: string): ICellRange | null;
    setTrackedRange(id: string | null, newRange: ICellRange | null, newStickiness: TrackedRangeStickiness): string | null;
    getSelections(): ICellRange[];
    getCellIndex(cell: ICellViewModel): number;
    deltaCellStatusBarItems(oldItems: string[], newItems: INotebookDeltaCellStatusBarItems[]): string[];
    getFoldedLength(index: number): number;
    replaceOne(cell: ICellViewModel, range: Range, text: string): Promise<void>;
    replaceAll(matches: CellFindMatchWithIndex[], texts: string[]): Promise<void>;
}
export interface INotebookEditor {
    readonly onDidChangeCellState: Event<NotebookCellStateChangedEvent>;
    readonly onDidChangeViewCells: Event<INotebookViewCellsUpdateEvent>;
    readonly onDidChangeVisibleRanges: Event<void>;
    readonly onDidChangeSelection: Event<void>;
    readonly onDidChangeFocus: Event<void>;
    readonly onDidChangeModel: Event<NotebookTextModel | undefined>;
    readonly onDidAttachViewModel: Event<void>;
    readonly onDidFocusWidget: Event<void>;
    readonly onDidBlurWidget: Event<void>;
    readonly onDidScroll: Event<void>;
    readonly onDidChangeLayout: Event<void>;
    readonly onDidChangeActiveCell: Event<void>;
    readonly onDidChangeActiveEditor: Event<INotebookEditor>;
    readonly onDidChangeActiveKernel: Event<void>;
    readonly onMouseUp: Event<INotebookEditorMouseEvent>;
    readonly onMouseDown: Event<INotebookEditorMouseEvent>;
    readonly visibleRanges: ICellRange[];
    readonly textModel?: NotebookTextModel;
    readonly isVisible: boolean;
    readonly isReadOnly: boolean;
    readonly notebookOptions: NotebookOptions;
    readonly isDisposed: boolean;
    readonly activeKernel: INotebookKernel | undefined;
    readonly scrollTop: number;
    readonly scrollBottom: number;
    readonly scopedContextKeyService: IContextKeyService;
    readonly activeCodeEditor: ICodeEditor | undefined;
    readonly codeEditors: [ICellViewModel, ICodeEditor][];
    readonly activeCellAndCodeEditor: [ICellViewModel, ICodeEditor] | undefined;
    getLength(): number;
    getSelections(): ICellRange[];
    setSelections(selections: ICellRange[]): void;
    getFocus(): ICellRange;
    setFocus(focus: ICellRange): void;
    getId(): string;
    getViewModel(): INotebookViewModel | undefined;
    hasModel(): this is IActiveNotebookEditor;
    dispose(): void;
    getDomNode(): HTMLElement;
    getInnerWebview(): IWebviewElement | undefined;
    getSelectionViewModels(): ICellViewModel[];
    getEditorViewState(): INotebookEditorViewState;
    restoreListViewState(viewState: INotebookEditorViewState | undefined): void;
    getBaseCellEditorOptions(language: string): IBaseCellEditorOptions;
    focus(): void;
    focusContainer(clearSelection?: boolean): void;
    hasEditorFocus(): boolean;
    hasWebviewFocus(): boolean;
    hasOutputTextSelection(): boolean;
    setOptions(options: INotebookEditorOptions | undefined): Promise<void>;
    focusElement(cell: ICellViewModel): void;
    getLayoutInfo(): NotebookLayoutInfo;
    getVisibleRangesPlusViewportAboveAndBelow(): ICellRange[];
    focusNotebookCell(cell: ICellViewModel, focus: 'editor' | 'container' | 'output', options?: IFocusNotebookCellOptions): Promise<void>;
    executeNotebookCells(cells?: Iterable<ICellViewModel>): Promise<void>;
    cancelNotebookCells(cells?: Iterable<ICellViewModel>): Promise<void>;
    getActiveCell(): ICellViewModel | undefined;
    layoutNotebookCell(cell: ICellViewModel, height: number): Promise<void>;
    createOutput(cell: ICellViewModel, output: IInsetRenderOutput, offset: number, createWhenIdle: boolean): Promise<void>;
    updateOutput(cell: ICellViewModel, output: IInsetRenderOutput, offset: number): Promise<void>;
    copyOutputImage(cellOutput: ICellOutputViewModel): Promise<void>;
    selectOutputContent(cell: ICellViewModel): void;
    selectInputContents(cell: ICellViewModel): void;
    readonly onDidReceiveMessage: Event<INotebookWebviewMessage>;
    postMessage(message: any): void;
    addClassName(className: string): void;
    removeClassName(className: string): void;
    setScrollTop(scrollTop: number): void;
    revealCellRangeInView(range: ICellRange): void;
    revealInView(cell: ICellViewModel): Promise<void>;
    revealInViewAtTop(cell: ICellViewModel): void;
    revealInCenter(cell: ICellViewModel): void;
    revealInCenterIfOutsideViewport(cell: ICellViewModel): Promise<void>;
    revealFirstLineIfOutsideViewport(cell: ICellViewModel): Promise<void>;
    revealLineInViewAsync(cell: ICellViewModel, line: number): Promise<void>;
    revealLineInCenterAsync(cell: ICellViewModel, line: number): Promise<void>;
    revealLineInCenterIfOutsideViewportAsync(cell: ICellViewModel, line: number): Promise<void>;
    revealRangeInViewAsync(cell: ICellViewModel, range: Selection | Range): Promise<void>;
    revealRangeInCenterAsync(cell: ICellViewModel, range: Selection | Range): Promise<void>;
    revealRangeInCenterIfOutsideViewportAsync(cell: ICellViewModel, range: Selection | Range): Promise<void>;
    revealCellOffsetInCenter(cell: ICellViewModel, offset: number): void;
    revealOffsetInCenterIfOutsideViewport(offset: number): void;
    getCellRangeFromViewRange(startIndex: number, endIndex: number): ICellRange | undefined;
    setHiddenAreas(_ranges: ICellRange[]): boolean;
    setCellEditorSelection(cell: ICellViewModel, selection: Range): void;
    deltaCellDecorations(oldDecorations: string[], newDecorations: INotebookDeltaDecoration[]): string[];
    changeModelDecorations<T>(callback: (changeAccessor: IModelDecorationsChangeAccessor) => T): T | null;
    changeViewZones(callback: (accessor: INotebookViewZoneChangeAccessor) => void): void;
    getContribution<T extends INotebookEditorContribution>(id: string): T;
    getViewIndexByModelIndex(index: number): number;
    getCellsInRange(range?: ICellRange): ReadonlyArray<ICellViewModel>;
    cellAt(index: number): ICellViewModel | undefined;
    getCellByHandle(handle: number): ICellViewModel | undefined;
    getCellIndex(cell: ICellViewModel): number | undefined;
    getNextVisibleCellIndex(index: number): number | undefined;
    getPreviousVisibleCellIndex(index: number): number | undefined;
    find(query: string, options: INotebookFindOptions, token: CancellationToken, skipWarmup?: boolean, shouldGetSearchPreviewInfo?: boolean, ownerID?: string): Promise<CellFindMatchWithIndex[]>;
    findHighlightCurrent(matchIndex: number, ownerID?: string): Promise<number>;
    findUnHighlightCurrent(matchIndex: number, ownerID?: string): Promise<void>;
    findStop(ownerID?: string): void;
    showProgress(): void;
    hideProgress(): void;
    getAbsoluteTopOfElement(cell: ICellViewModel): number;
    getHeightOfElement(cell: ICellViewModel): number;
}
export interface IActiveNotebookEditor extends INotebookEditor {
    getViewModel(): INotebookViewModel;
    textModel: NotebookTextModel;
    getFocus(): ICellRange;
    cellAt(index: number): ICellViewModel;
    getCellIndex(cell: ICellViewModel): number;
    getNextVisibleCellIndex(index: number): number;
}
export interface INotebookEditorPane extends IEditorPaneWithSelection {
    getControl(): INotebookEditor | undefined;
    readonly onDidChangeModel: Event<void>;
    textModel: NotebookTextModel | undefined;
}
export interface IBaseCellEditorOptions extends IDisposable {
    readonly value: IEditorOptions;
    readonly onDidChange: Event<void>;
}
export interface INotebookEditorDelegate extends INotebookEditor {
    hasModel(): this is IActiveNotebookEditorDelegate;
    readonly creationOptions: INotebookEditorCreationOptions;
    readonly onDidChangeOptions: Event<void>;
    readonly onDidChangeDecorations: Event<void>;
    createMarkupPreview(cell: ICellViewModel): Promise<void>;
    unhideMarkupPreviews(cells: readonly ICellViewModel[]): Promise<void>;
    hideMarkupPreviews(cells: readonly ICellViewModel[]): Promise<void>;
    removeInset(output: IDisplayOutputViewModel): void;
    hideInset(output: IDisplayOutputViewModel): void;
    deltaCellContainerClassNames(cellId: string, added: string[], removed: string[]): void;
}
export interface IActiveNotebookEditorDelegate extends INotebookEditorDelegate {
    getViewModel(): INotebookViewModel;
    textModel: NotebookTextModel;
    getFocus(): ICellRange;
    cellAt(index: number): ICellViewModel;
    getCellIndex(cell: ICellViewModel): number;
    getNextVisibleCellIndex(index: number): number;
}
export interface ISearchPreviewInfo {
    line: string;
    range: {
        start: number;
        end: number;
    };
}
export interface CellWebviewFindMatch {
    readonly index: number;
    readonly searchPreviewInfo?: ISearchPreviewInfo;
}
export type CellContentFindMatch = FindMatch;
export interface CellFindMatch {
    cell: ICellViewModel;
    contentMatches: CellContentFindMatch[];
}
export interface CellFindMatchWithIndex {
    cell: ICellViewModel;
    index: number;
    length: number;
    getMatch(index: number): FindMatch | CellWebviewFindMatch;
    contentMatches: FindMatch[];
    webviewMatches: CellWebviewFindMatch[];
}
export declare enum CellEditState {
    Preview = 0,
    Editing = 1
}
export declare enum CellFocusMode {
    Container = 0,
    Editor = 1,
    Output = 2,
    ChatInput = 3
}
export declare enum CursorAtBoundary {
    None = 0,
    Top = 1,
    Bottom = 2,
    Both = 3
}
export declare enum CursorAtLineBoundary {
    None = 0,
    Start = 1,
    End = 2,
    Both = 3
}
export declare function getNotebookEditorFromEditorPane(editorPane?: IEditorPane): INotebookEditor | undefined;
export declare function expandCellRangesWithHiddenCells(editor: INotebookEditor, ranges: ICellRange[]): ICellRange[];
export declare function cellRangeToViewCells(editor: IActiveNotebookEditor, ranges: ICellRange[]): ICellViewModel[];
export declare const enum CellFoldingState {
    None = 0,
    Expanded = 1,
    Collapsed = 2
}
export interface EditorFoldingStateDelegate {
    getCellIndex(cell: ICellViewModel): number;
    getFoldingState(index: number): CellFoldingState;
}
