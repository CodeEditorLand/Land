import { Emitter } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../base/common/uri.js';
import { FontInfo } from '../../../../../editor/common/config/fontInfo.js';
import * as editorCommon from '../../../../../editor/common/editorCommon.js';
import { DiffNestedCellViewModel } from './diffNestedCellViewModel.js';
import { NotebookDiffEditorEventDispatcher } from './eventDispatcher.js';
import { CellDiffViewModelLayoutChangeEvent, DiffSide, IDiffElementLayoutInfo } from './notebookDiffEditorBrowser.js';
import { IGenericCellViewModel } from '../notebookBrowser.js';
import { NotebookLayoutInfo } from '../notebookViewEvents.js';
import { NotebookCellTextModel } from '../../common/model/notebookCellTextModel.js';
import { NotebookTextModel } from '../../common/model/notebookTextModel.js';
import { ICellOutput, INotebookTextModel, IOutputDto, IOutputItemDto } from '../../common/notebookCommon.js';
import { INotebookService } from '../../common/notebookService.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IDiffEditorHeightCalculatorService } from './editorHeightCalculator.js';
import { NotebookDocumentMetadataTextModel } from '../../common/model/notebookMetadataTextModel.js';
export declare const HeightOfHiddenLinesRegionInDiffEditor = 24;
export declare const DefaultLineHeight = 17;
export declare enum PropertyFoldingState {
    Expanded = 0,
    Collapsed = 1
}
export declare const OUTPUT_EDITOR_HEIGHT_MAGIC = 1440;
type ILayoutInfoDelta0 = {
    [K in keyof IDiffElementLayoutInfo]?: number;
};
interface ILayoutInfoDelta extends ILayoutInfoDelta0 {
    rawOutputHeight?: number;
    recomputeOutput?: boolean;
}
export type IDiffElementViewModelBase = DiffElementCellViewModelBase | DiffElementPlaceholderViewModel | NotebookDocumentMetadataViewModel;
export declare abstract class DiffElementViewModelBase extends Disposable {
    readonly mainDocumentTextModel: INotebookTextModel;
    readonly editorEventDispatcher: NotebookDiffEditorEventDispatcher;
    readonly initData: {
        metadataStatusHeight: number;
        outputStatusHeight: number;
        fontInfo: FontInfo | undefined;
    };
    protected _layoutInfoEmitter: Emitter<CellDiffViewModelLayoutChangeEvent>;
    onDidLayoutChange: import("../../../../workbench.web.main.internal.js").Event<CellDiffViewModelLayoutChangeEvent>;
    abstract renderOutput: boolean;
    constructor(mainDocumentTextModel: INotebookTextModel, editorEventDispatcher: NotebookDiffEditorEventDispatcher, initData: {
        metadataStatusHeight: number;
        outputStatusHeight: number;
        fontInfo: FontInfo | undefined;
    });
    abstract layoutChange(): void;
    abstract getHeight(lineHeight: number): number;
    abstract get totalHeight(): number;
}
export declare class DiffElementPlaceholderViewModel extends DiffElementViewModelBase {
    readonly type: 'placeholder';
    hiddenCells: DiffElementCellViewModelBase[];
    protected _unfoldHiddenCells: Emitter<void>;
    onUnfoldHiddenCells: import("../../../../workbench.web.main.internal.js").Event<void>;
    renderOutput: boolean;
    constructor(mainDocumentTextModel: INotebookTextModel, editorEventDispatcher: NotebookDiffEditorEventDispatcher, initData: {
        metadataStatusHeight: number;
        outputStatusHeight: number;
        fontInfo: FontInfo | undefined;
    });
    get totalHeight(): number;
    getHeight(_: number): number;
    layoutChange(): void;
    showHiddenCells(): void;
}
export declare class NotebookDocumentMetadataViewModel extends DiffElementViewModelBase {
    readonly originalDocumentTextModel: INotebookTextModel;
    readonly modifiedDocumentTextModel: INotebookTextModel;
    readonly type: 'unchangedMetadata' | 'modifiedMetadata';
    private readonly editorHeightCalculator;
    readonly originalMetadata: NotebookDocumentMetadataTextModel;
    readonly modifiedMetadata: NotebookDocumentMetadataTextModel;
    cellFoldingState: PropertyFoldingState;
    protected _layoutInfo: IDiffElementLayoutInfo;
    renderOutput: boolean;
    set editorHeight(height: number);
    get editorHeight(): number;
    set editorMargin(margin: number);
    get editorMargin(): number;
    get layoutInfo(): IDiffElementLayoutInfo;
    get totalHeight(): number;
    private _sourceEditorViewState;
    constructor(originalDocumentTextModel: INotebookTextModel, modifiedDocumentTextModel: INotebookTextModel, type: 'unchangedMetadata' | 'modifiedMetadata', editorEventDispatcher: NotebookDiffEditorEventDispatcher, initData: {
        metadataStatusHeight: number;
        outputStatusHeight: number;
        fontInfo: FontInfo | undefined;
    }, notebookService: INotebookService, editorHeightCalculator: IDiffEditorHeightCalculatorService);
    computeHeights(): Promise<void>;
    layoutChange(): void;
    protected _layout(delta: ILayoutInfoDelta): void;
    getHeight(lineHeight: number): number;
    private _computeTotalHeight;
    computeInputEditorHeight(_lineHeight: number): number;
    private _fireLayoutChangeEvent;
    getComputedCellContainerWidth(layoutInfo: NotebookLayoutInfo, diffEditor: boolean, fullWidth: boolean): number;
    getSourceEditorViewState(): editorCommon.ICodeEditorViewState | editorCommon.IDiffEditorViewState | null;
    saveSpirceEditorViewState(viewState: editorCommon.ICodeEditorViewState | editorCommon.IDiffEditorViewState | null): void;
}
export declare abstract class DiffElementCellViewModelBase extends DiffElementViewModelBase {
    readonly type: 'unchanged' | 'insert' | 'delete' | 'modified';
    readonly index: number;
    private readonly configurationService;
    readonly diffEditorHeightCalculator: IDiffEditorHeightCalculatorService;
    cellFoldingState: PropertyFoldingState;
    metadataFoldingState: PropertyFoldingState;
    outputFoldingState: PropertyFoldingState;
    protected _stateChangeEmitter: Emitter<{
        renderOutput: boolean;
    }>;
    onDidStateChange: import("../../../../workbench.web.main.internal.js").Event<{
        renderOutput: boolean;
    }>;
    protected _layoutInfo: IDiffElementLayoutInfo;
    displayIconToHideUnmodifiedCells?: boolean;
    private _hideUnchangedCells;
    onHideUnchangedCells: import("../../../../workbench.web.main.internal.js").Event<void>;
    hideUnchangedCells(): void;
    set rawOutputHeight(height: number);
    get rawOutputHeight(): number;
    set outputStatusHeight(height: number);
    get outputStatusHeight(): number;
    set outputMetadataHeight(height: number);
    get outputMetadataHeight(): number;
    set editorHeight(height: number);
    get editorHeight(): number;
    set editorMargin(margin: number);
    get editorMargin(): number;
    set metadataStatusHeight(height: number);
    get metadataStatusHeight(): number;
    set metadataHeight(height: number);
    get metadataHeight(): number;
    private _renderOutput;
    set renderOutput(value: boolean);
    get renderOutput(): boolean;
    get layoutInfo(): IDiffElementLayoutInfo;
    get totalHeight(): number;
    protected get ignoreOutputs(): boolean;
    protected get ignoreMetadata(): boolean;
    private _sourceEditorViewState;
    private _outputEditorViewState;
    private _metadataEditorViewState;
    readonly original: DiffNestedCellViewModel | undefined;
    readonly modified: DiffNestedCellViewModel | undefined;
    constructor(mainDocumentTextModel: INotebookTextModel, original: NotebookCellTextModel | undefined, modified: NotebookCellTextModel | undefined, type: 'unchanged' | 'insert' | 'delete' | 'modified', editorEventDispatcher: NotebookDiffEditorEventDispatcher, initData: {
        metadataStatusHeight: number;
        outputStatusHeight: number;
        fontInfo: FontInfo | undefined;
    }, notebookService: INotebookService, index: number, configurationService: IConfigurationService, diffEditorHeightCalculator: IDiffEditorHeightCalculatorService);
    layoutChange(): void;
    private _estimateEditorHeight;
    protected _layout(delta: ILayoutInfoDelta): void;
    getHeight(lineHeight: number): number;
    private _computeTotalHeight;
    computeInputEditorHeight(lineHeight: number): number;
    private _getOutputTotalHeight;
    private _fireLayoutChangeEvent;
    abstract checkIfInputModified(): false | {
        reason: string | undefined;
    };
    abstract checkIfOutputsModified(): false | {
        reason: string | undefined;
    };
    abstract checkMetadataIfModified(): false | {
        reason: string | undefined;
    };
    abstract isOutputEmpty(): boolean;
    abstract getRichOutputTotalHeight(): number;
    abstract getCellByUri(cellUri: URI): IGenericCellViewModel;
    abstract getOutputOffsetInCell(diffSide: DiffSide, index: number): number;
    abstract getOutputOffsetInContainer(diffSide: DiffSide, index: number): number;
    abstract updateOutputHeight(diffSide: DiffSide, index: number, height: number): void;
    abstract getNestedCellViewModel(diffSide: DiffSide): DiffNestedCellViewModel;
    getComputedCellContainerWidth(layoutInfo: NotebookLayoutInfo, diffEditor: boolean, fullWidth: boolean): number;
    getOutputEditorViewState(): editorCommon.ICodeEditorViewState | editorCommon.IDiffEditorViewState | null;
    saveOutputEditorViewState(viewState: editorCommon.ICodeEditorViewState | editorCommon.IDiffEditorViewState | null): void;
    getMetadataEditorViewState(): editorCommon.ICodeEditorViewState | editorCommon.IDiffEditorViewState | null;
    saveMetadataEditorViewState(viewState: editorCommon.ICodeEditorViewState | editorCommon.IDiffEditorViewState | null): void;
    getSourceEditorViewState(): editorCommon.ICodeEditorViewState | editorCommon.IDiffEditorViewState | null;
    saveSpirceEditorViewState(viewState: editorCommon.ICodeEditorViewState | editorCommon.IDiffEditorViewState | null): void;
}
export declare class SideBySideDiffElementViewModel extends DiffElementCellViewModelBase {
    readonly otherDocumentTextModel: NotebookTextModel;
    get originalDocument(): NotebookTextModel;
    get modifiedDocument(): INotebookTextModel;
    readonly original: DiffNestedCellViewModel;
    readonly modified: DiffNestedCellViewModel;
    readonly type: 'unchanged' | 'modified';
    /**
     * The height of the editor when the unchanged lines are collapsed.
     */
    private editorHeightWithUnchangedLinesCollapsed?;
    constructor(mainDocumentTextModel: NotebookTextModel, otherDocumentTextModel: NotebookTextModel, original: NotebookCellTextModel, modified: NotebookCellTextModel, type: 'unchanged' | 'modified', editorEventDispatcher: NotebookDiffEditorEventDispatcher, initData: {
        metadataStatusHeight: number;
        outputStatusHeight: number;
        fontInfo: FontInfo | undefined;
    }, notebookService: INotebookService, configurationService: IConfigurationService, index: number, diffEditorHeightCalculator: IDiffEditorHeightCalculatorService);
    checkIfInputModified(): false | {
        reason: string | undefined;
    };
    checkIfOutputsModified(): false | {
        reason: string | undefined;
        kind: OutputComparison;
    };
    checkMetadataIfModified(): false | {
        reason: undefined;
    };
    updateOutputHeight(diffSide: DiffSide, index: number, height: number): void;
    getOutputOffsetInContainer(diffSide: DiffSide, index: number): number;
    getOutputOffsetInCell(diffSide: DiffSide, index: number): number;
    isOutputEmpty(): boolean;
    getRichOutputTotalHeight(): number;
    getNestedCellViewModel(diffSide: DiffSide): DiffNestedCellViewModel;
    getCellByUri(cellUri: URI): IGenericCellViewModel;
    computeInputEditorHeight(lineHeight: number): number;
    private computeModifiedInputEditorHeight;
    private computeModifiedMetadataEditorHeight;
    computeEditorHeights(): Promise<void>;
}
export declare class SingleSideDiffElementViewModel extends DiffElementCellViewModelBase {
    readonly otherDocumentTextModel: NotebookTextModel;
    get cellViewModel(): DiffNestedCellViewModel;
    get originalDocument(): NotebookTextModel | INotebookTextModel;
    get modifiedDocument(): NotebookTextModel | INotebookTextModel;
    readonly type: 'insert' | 'delete';
    constructor(mainDocumentTextModel: NotebookTextModel, otherDocumentTextModel: NotebookTextModel, original: NotebookCellTextModel | undefined, modified: NotebookCellTextModel | undefined, type: 'insert' | 'delete', editorEventDispatcher: NotebookDiffEditorEventDispatcher, initData: {
        metadataStatusHeight: number;
        outputStatusHeight: number;
        fontInfo: FontInfo | undefined;
    }, notebookService: INotebookService, configurationService: IConfigurationService, diffEditorHeightCalculator: IDiffEditorHeightCalculatorService, index: number);
    checkIfInputModified(): false | {
        reason: string | undefined;
    };
    getNestedCellViewModel(diffSide: DiffSide): DiffNestedCellViewModel;
    checkIfOutputsModified(): false | {
        reason: string | undefined;
    };
    checkMetadataIfModified(): false | {
        reason: string | undefined;
    };
    updateOutputHeight(diffSide: DiffSide, index: number, height: number): void;
    getOutputOffsetInContainer(diffSide: DiffSide, index: number): number;
    getOutputOffsetInCell(diffSide: DiffSide, index: number): number;
    isOutputEmpty(): boolean;
    getRichOutputTotalHeight(): number;
    getCellByUri(cellUri: URI): IGenericCellViewModel;
}
export declare const enum OutputComparison {
    Unchanged = 0,
    Metadata = 1,
    Other = 2
}
export declare function outputEqual(a: ICellOutput, b: ICellOutput): OutputComparison;
export declare function getStreamOutputData(outputs: IOutputItemDto[]): string | null;
export declare function getFormattedOutputJSON(outputs: IOutputDto[]): string;
export {};
