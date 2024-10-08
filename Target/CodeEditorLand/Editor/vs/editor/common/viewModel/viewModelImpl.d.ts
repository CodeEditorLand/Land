import { Event } from '../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../base/common/lifecycle.js';
import { CursorConfiguration, CursorState, EditOperationType, IColumnSelectData, PartialCursorState } from '../cursorCommon.js';
import { CursorChangeReason } from '../cursorEvents.js';
import { IPosition, Position } from '../core/position.js';
import { Range } from '../core/range.js';
import { ISelection, Selection } from '../core/selection.js';
import { ICommand, ICursorState, IViewState, ScrollType } from '../editorCommon.js';
import { IEditorConfiguration } from '../config/editorConfiguration.js';
import { EndOfLinePreference, IAttachedView, ICursorStateComputer, IGlyphMarginLanesModel, IIdentifiedSingleEditOperation, ITextModel, PositionAffinity } from '../model.js';
import { IActiveIndentGuideInfo, BracketGuideOptions, IndentGuide } from '../textModelGuides.js';
import { ILanguageConfigurationService } from '../languages/languageConfigurationRegistry.js';
import { EditorTheme } from '../editorTheme.js';
import * as viewEvents from '../viewEvents.js';
import { ViewLayout } from '../viewLayout/viewLayout.js';
import { ILineBreaksComputer, ILineBreaksComputerFactory, InjectedText } from '../modelLineProjectionData.js';
import { ViewEventHandler } from '../viewEventHandler.js';
import { ICoordinatesConverter, IViewModel, IWhitespaceChangeAccessor, MinimapLinesRenderingData, OverviewRulerDecorationsGroup, ViewLineData, ViewLineRenderingData, ViewModelDecoration } from '../viewModel.js';
import { OutgoingViewModelEvent } from '../viewModelEventDispatcher.js';
import { IThemeService } from '../../../platform/theme/common/themeService.js';
export declare class ViewModel extends Disposable implements IViewModel {
    private readonly languageConfigurationService;
    private readonly _themeService;
    private readonly _attachedView;
    private readonly _transactionalTarget;
    private readonly _editorId;
    private readonly _configuration;
    readonly model: ITextModel;
    private readonly _eventDispatcher;
    readonly onEvent: Event<OutgoingViewModelEvent>;
    cursorConfig: CursorConfiguration;
    private readonly _updateConfigurationViewLineCount;
    private _hasFocus;
    private readonly _viewportStart;
    private readonly _lines;
    readonly coordinatesConverter: ICoordinatesConverter;
    readonly viewLayout: ViewLayout;
    private readonly _cursor;
    private readonly _decorations;
    readonly glyphLanes: IGlyphMarginLanesModel;
    constructor(editorId: number, configuration: IEditorConfiguration, model: ITextModel, domLineBreaksComputerFactory: ILineBreaksComputerFactory, monospaceLineBreaksComputerFactory: ILineBreaksComputerFactory, scheduleAtNextAnimationFrame: (callback: () => void) => IDisposable, languageConfigurationService: ILanguageConfigurationService, _themeService: IThemeService, _attachedView: IAttachedView, _transactionalTarget: IBatchableTarget);
    dispose(): void;
    createLineBreaksComputer(): ILineBreaksComputer;
    addViewEventHandler(eventHandler: ViewEventHandler): void;
    removeViewEventHandler(eventHandler: ViewEventHandler): void;
    private _updateConfigurationViewLineCountNow;
    private getModelVisibleRanges;
    visibleLinesStabilized(): void;
    private _handleVisibleLinesChanged;
    setHasFocus(hasFocus: boolean): void;
    onCompositionStart(): void;
    onCompositionEnd(): void;
    private _captureStableViewport;
    private _onConfigurationChanged;
    private _registerModelEvents;
    private readonly hiddenAreasModel;
    private previousHiddenAreas;
    /**
     * @param forceUpdate If true, the hidden areas will be updated even if the new ranges are the same as the previous ranges.
     * This is because the model might have changed, which resets the hidden areas, but not the last cached value.
     * This needs a better fix in the future.
    */
    setHiddenAreas(ranges: Range[], source?: unknown, forceUpdate?: boolean): void;
    getVisibleRangesPlusViewportAboveBelow(): Range[];
    getVisibleRanges(): Range[];
    getHiddenAreas(): Range[];
    private _toModelVisibleRanges;
    getCompletelyVisibleViewRange(): Range;
    getCompletelyVisibleViewRangeAtScrollTop(scrollTop: number): Range;
    saveState(): IViewState;
    reduceRestoreState(state: IViewState): {
        scrollLeft: number;
        scrollTop: number;
    };
    private _reduceRestoreStateCompatibility;
    private getTabSize;
    getLineCount(): number;
    /**
     * Gives a hint that a lot of requests are about to come in for these line numbers.
     */
    setViewport(startLineNumber: number, endLineNumber: number, centeredLineNumber: number): void;
    getActiveIndentGuide(lineNumber: number, minLineNumber: number, maxLineNumber: number): IActiveIndentGuideInfo;
    getLinesIndentGuides(startLineNumber: number, endLineNumber: number): number[];
    getBracketGuidesInRangeByLine(startLineNumber: number, endLineNumber: number, activePosition: IPosition | null, options: BracketGuideOptions): IndentGuide[][];
    getLineContent(lineNumber: number): string;
    getLineLength(lineNumber: number): number;
    getLineMinColumn(lineNumber: number): number;
    getLineMaxColumn(lineNumber: number): number;
    getLineFirstNonWhitespaceColumn(lineNumber: number): number;
    getLineLastNonWhitespaceColumn(lineNumber: number): number;
    getMinimapDecorationsInRange(range: Range): ViewModelDecoration[];
    getDecorationsInViewport(visibleRange: Range): ViewModelDecoration[];
    getInjectedTextAt(viewPosition: Position): InjectedText | null;
    getViewportViewLineRenderingData(visibleRange: Range, lineNumber: number): ViewLineRenderingData;
    getViewLineRenderingData(lineNumber: number): ViewLineRenderingData;
    private _getViewLineRenderingData;
    getViewLineData(lineNumber: number): ViewLineData;
    getMinimapLinesRenderingData(startLineNumber: number, endLineNumber: number, needed: boolean[]): MinimapLinesRenderingData;
    getAllOverviewRulerDecorations(theme: EditorTheme): OverviewRulerDecorationsGroup[];
    private _invalidateDecorationsColorCache;
    getValueInRange(range: Range, eol: EndOfLinePreference): string;
    getValueLengthInRange(range: Range, eol: EndOfLinePreference): number;
    modifyPosition(position: Position, offset: number): Position;
    deduceModelPositionRelativeToViewPosition(viewAnchorPosition: Position, deltaOffset: number, lineFeedCnt: number): Position;
    getPlainTextToCopy(modelRanges: Range[], emptySelectionClipboard: boolean, forceCRLF: boolean): string | string[];
    getRichTextToCopy(modelRanges: Range[], emptySelectionClipboard: boolean): {
        html: string;
        mode: string;
    } | null;
    private _getHTMLToCopy;
    private _getColorMap;
    getPrimaryCursorState(): CursorState;
    getLastAddedCursorIndex(): number;
    getCursorStates(): CursorState[];
    setCursorStates(source: string | null | undefined, reason: CursorChangeReason, states: PartialCursorState[] | null): boolean;
    getCursorColumnSelectData(): IColumnSelectData;
    getCursorAutoClosedCharacters(): Range[];
    setCursorColumnSelectData(columnSelectData: IColumnSelectData): void;
    getPrevEditOperationType(): EditOperationType;
    setPrevEditOperationType(type: EditOperationType): void;
    getSelection(): Selection;
    getSelections(): Selection[];
    getPosition(): Position;
    setSelections(source: string | null | undefined, selections: readonly ISelection[], reason?: CursorChangeReason): void;
    saveCursorState(): ICursorState[];
    restoreCursorState(states: ICursorState[]): void;
    private _executeCursorEdit;
    executeEdits(source: string | null | undefined, edits: IIdentifiedSingleEditOperation[], cursorStateComputer: ICursorStateComputer): void;
    startComposition(): void;
    endComposition(source?: string | null | undefined): void;
    type(text: string, source?: string | null | undefined): void;
    compositionType(text: string, replacePrevCharCnt: number, replaceNextCharCnt: number, positionDelta: number, source?: string | null | undefined): void;
    paste(text: string, pasteOnNewLine: boolean, multicursorText?: string[] | null | undefined, source?: string | null | undefined): void;
    cut(source?: string | null | undefined): void;
    executeCommand(command: ICommand, source?: string | null | undefined): void;
    executeCommands(commands: ICommand[], source?: string | null | undefined): void;
    revealAllCursors(source: string | null | undefined, revealHorizontal: boolean, minimalReveal?: boolean): void;
    revealPrimaryCursor(source: string | null | undefined, revealHorizontal: boolean, minimalReveal?: boolean): void;
    revealTopMostCursor(source: string | null | undefined): void;
    revealBottomMostCursor(source: string | null | undefined): void;
    revealRange(source: string | null | undefined, revealHorizontal: boolean, viewRange: Range, verticalType: viewEvents.VerticalRevealType, scrollType: ScrollType): void;
    changeWhitespace(callback: (accessor: IWhitespaceChangeAccessor) => void): void;
    private _withViewEventsCollector;
    batchEvents(callback: () => void): void;
    normalizePosition(position: Position, affinity: PositionAffinity): Position;
    /**
     * Gets the column at which indentation stops at a given line.
     * @internal
    */
    getLineIndentColumn(lineNumber: number): number;
}
export interface IBatchableTarget {
    /**
     * Allows the target to apply the changes introduced by the callback in a batch.
    */
    batchChanges<T>(cb: () => T): T;
}
