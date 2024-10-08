import { IBoundarySashes } from '../../../../base/browser/ui/sash/sash.js';
import { Event } from '../../../../base/common/event.js';
import { ITransaction } from '../../../../base/common/observable.js';
import { IAccessibilitySignalService } from '../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IEditorProgressService } from '../../../../platform/progress/common/progress.js';
import { IDiffEditorOptions } from '../../../common/config/editorOptions.js';
import { IDimension } from '../../../common/core/dimension.js';
import { Range } from '../../../common/core/range.js';
import { IDiffComputationResult, ILineChange } from '../../../common/diff/legacyLinesDiffComputer.js';
import { LineRangeMapping, RangeMapping } from '../../../common/diff/rangeMapping.js';
import { IDiffEditorModel, IDiffEditorViewModel, IDiffEditorViewState } from '../../../common/editorCommon.js';
import { IEditorConstructionOptions } from '../../config/editorConfiguration.js';
import { ICodeEditor, IDiffEditor, IDiffEditorConstructionOptions } from '../../editorBrowser.js';
import { ICodeEditorService } from '../../services/codeEditorService.js';
import { CodeEditorWidget, ICodeEditorWidgetOptions } from '../codeEditor/codeEditorWidget.js';
import { DelegatingEditor } from './delegatingEditorImpl.js';
import './style.css';
import { RefCounted } from './utils.js';
export interface IDiffCodeEditorWidgetOptions {
    originalEditor?: ICodeEditorWidgetOptions;
    modifiedEditor?: ICodeEditorWidgetOptions;
}
export declare class DiffEditorWidget extends DelegatingEditor implements IDiffEditor {
    private readonly _domElement;
    private readonly _parentContextKeyService;
    private readonly _parentInstantiationService;
    private readonly _accessibilitySignalService;
    private readonly _editorProgressService;
    static ENTIRE_DIFF_OVERVIEW_WIDTH: number;
    private readonly elements;
    private readonly _diffModelSrc;
    private readonly _diffModel;
    readonly onDidChangeModel: Event<void>;
    get onDidContentSizeChange(): Event<import("../../../common/editorCommon.js").IContentSizeChangedEvent>;
    private readonly _contextKeyService;
    private readonly _instantiationService;
    private readonly _rootSizeObserver;
    private readonly _sashLayout;
    private readonly _sash;
    private readonly _boundarySashes;
    private _accessibleDiffViewerShouldBeVisible;
    private _accessibleDiffViewerVisible;
    private readonly _accessibleDiffViewer;
    private readonly _options;
    private readonly _editors;
    private readonly _overviewRulerPart;
    private readonly _movedBlocksLinesPart;
    private readonly _gutter;
    get collapseUnchangedRegions(): boolean;
    constructor(_domElement: HTMLElement, options: Readonly<IDiffEditorConstructionOptions>, codeEditorWidgetOptions: IDiffCodeEditorWidgetOptions, _parentContextKeyService: IContextKeyService, _parentInstantiationService: IInstantiationService, codeEditorService: ICodeEditorService, _accessibilitySignalService: IAccessibilitySignalService, _editorProgressService: IEditorProgressService);
    getViewWidth(): number;
    getContentHeight(): number;
    protected _createInnerEditor(instantiationService: IInstantiationService, container: HTMLElement, options: Readonly<IEditorConstructionOptions>, editorWidgetOptions: ICodeEditorWidgetOptions): CodeEditorWidget;
    private readonly _layoutInfo;
    private _createDiffEditorContributions;
    protected get _targetEditor(): CodeEditorWidget;
    getEditorType(): string;
    onVisible(): void;
    onHide(): void;
    layout(dimension?: IDimension | undefined): void;
    hasTextFocus(): boolean;
    saveViewState(): IDiffEditorViewState;
    restoreViewState(s: IDiffEditorViewState): void;
    handleInitialized(): void;
    createViewModel(model: IDiffEditorModel): IDiffEditorViewModel;
    getModel(): IDiffEditorModel | null;
    setModel(model: IDiffEditorModel | null | IDiffEditorViewModel): void;
    setDiffModel(viewModel: RefCounted<IDiffEditorViewModel> | null, tx?: ITransaction): void;
    /**
     * @param changedOptions Only has values for top-level options that have actually changed.
     */
    updateOptions(changedOptions: IDiffEditorOptions): void;
    getDomNode(): HTMLElement;
    getContainerDomNode(): HTMLElement;
    getOriginalEditor(): ICodeEditor;
    getModifiedEditor(): ICodeEditor;
    setBoundarySashes(sashes: IBoundarySashes): void;
    private readonly _diffValue;
    readonly onDidUpdateDiff: Event<void>;
    get ignoreTrimWhitespace(): boolean;
    get maxComputationTime(): number;
    get renderSideBySide(): boolean;
    /**
     * @deprecated Use `this.getDiffComputationResult().changes2` instead.
     */
    getLineChanges(): ILineChange[] | null;
    getDiffComputationResult(): IDiffComputationResult | null;
    revert(diff: LineRangeMapping): void;
    revertRangeMappings(diffs: RangeMapping[]): void;
    private _goTo;
    goToDiff(target: 'previous' | 'next'): void;
    revealFirstDiff(): void;
    accessibleDiffViewerNext(): void;
    accessibleDiffViewerPrev(): void;
    waitForDiff(): Promise<void>;
    mapToOtherSide(): {
        destination: CodeEditorWidget;
        destinationSelection: Range | undefined;
    };
    switchSide(): void;
    exitCompareMove(): void;
    collapseAllUnchangedRegions(): void;
    showAllUnchangedRegions(): void;
    private _handleCursorPositionChange;
}
