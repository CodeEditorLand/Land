import { IKeyboardEvent } from '../../base/browser/keyboardEvent.js';
import { IMouseEvent, IMouseWheelEvent } from '../../base/browser/mouseEvent.js';
import { IBoundarySashes } from '../../base/browser/ui/sash/sash.js';
import { Event } from '../../base/common/event.js';
import { IEditorConstructionOptions } from './config/editorConfiguration.js';
import { ConfigurationChangedEvent, EditorLayoutInfo, EditorOption, FindComputedEditorOptionValueById, IComputedEditorOptions, IDiffEditorOptions, IEditorOptions, OverviewRulerPosition } from '../common/config/editorOptions.js';
import { IDimension } from '../common/core/dimension.js';
import { IPosition, Position } from '../common/core/position.js';
import { IRange, Range } from '../common/core/range.js';
import { Selection } from '../common/core/selection.js';
import { IWordAtPosition } from '../common/core/wordHelper.js';
import { ICursorPositionChangedEvent, ICursorSelectionChangedEvent } from '../common/cursorEvents.js';
import { IDiffComputationResult, ILineChange } from '../common/diff/legacyLinesDiffComputer.js';
import * as editorCommon from '../common/editorCommon.js';
import { GlyphMarginLane, ICursorStateComputer, IIdentifiedSingleEditOperation, IModelDecoration, IModelDeltaDecoration, ITextModel, PositionAffinity } from '../common/model.js';
import { InjectedText } from '../common/modelLineProjectionData.js';
import { IModelContentChangedEvent, IModelDecorationsChangedEvent, IModelLanguageChangedEvent, IModelLanguageConfigurationChangedEvent, IModelOptionsChangedEvent, IModelTokensChangedEvent } from '../common/textModelEvents.js';
import { IEditorWhitespace, IViewModel } from '../common/viewModel.js';
import { OverviewRulerZone } from '../common/viewModel/overviewZoneManager.js';
import { MenuId } from '../../platform/actions/common/actions.js';
import { IContextKeyService } from '../../platform/contextkey/common/contextkey.js';
import { ServicesAccessor } from '../../platform/instantiation/common/instantiation.js';
export interface IViewZone {
    afterLineNumber: number;
    afterColumn?: number;
    afterColumnAffinity?: PositionAffinity;
    showInHiddenAreas?: boolean;
    ordinal?: number;
    suppressMouseDown?: boolean;
    heightInLines?: number;
    heightInPx?: number;
    minWidthInPx?: number;
    domNode: HTMLElement;
    marginDomNode?: HTMLElement | null;
    onDomNodeTop?: (top: number) => void;
    onComputedHeight?: (height: number) => void;
}
export interface IViewZoneChangeAccessor {
    addZone(zone: IViewZone): string;
    removeZone(id: string): void;
    layoutZone(id: string): void;
}
export declare const enum ContentWidgetPositionPreference {
    EXACT = 0,
    ABOVE = 1,
    BELOW = 2
}
export interface IContentWidgetPosition {
    position: IPosition | null;
    secondaryPosition?: IPosition | null;
    preference: ContentWidgetPositionPreference[];
    positionAffinity?: PositionAffinity;
}
export interface IContentWidget {
    allowEditorOverflow?: boolean;
    suppressMouseDown?: boolean;
    getId(): string;
    getDomNode(): HTMLElement;
    getPosition(): IContentWidgetPosition | null;
    beforeRender?(): IDimension | null;
    afterRender?(position: ContentWidgetPositionPreference | null): void;
}
export declare const enum OverlayWidgetPositionPreference {
    TOP_RIGHT_CORNER = 0,
    BOTTOM_RIGHT_CORNER = 1,
    TOP_CENTER = 2
}
export interface IOverlayWidgetPositionCoordinates {
    top: number;
    left: number;
}
export interface IOverlayWidgetPosition {
    preference: OverlayWidgetPositionPreference | IOverlayWidgetPositionCoordinates | null;
    stackOridinal?: number;
}
export interface IOverlayWidget {
    onDidLayout?: Event<void>;
    allowEditorOverflow?: boolean;
    getId(): string;
    getDomNode(): HTMLElement;
    getPosition(): IOverlayWidgetPosition | null;
    getMinContentWidthInPx?(): number;
}
export interface IGlyphMarginWidget {
    getId(): string;
    getDomNode(): HTMLElement;
    getPosition(): IGlyphMarginWidgetPosition;
}
export interface IGlyphMarginWidgetPosition {
    lane: GlyphMarginLane;
    zIndex: number;
    range: IRange;
}
export declare const enum MouseTargetType {
    UNKNOWN = 0,
    TEXTAREA = 1,
    GUTTER_GLYPH_MARGIN = 2,
    GUTTER_LINE_NUMBERS = 3,
    GUTTER_LINE_DECORATIONS = 4,
    GUTTER_VIEW_ZONE = 5,
    CONTENT_TEXT = 6,
    CONTENT_EMPTY = 7,
    CONTENT_VIEW_ZONE = 8,
    CONTENT_WIDGET = 9,
    OVERVIEW_RULER = 10,
    SCROLLBAR = 11,
    OVERLAY_WIDGET = 12,
    OUTSIDE_EDITOR = 13
}
export interface IBaseMouseTarget {
    readonly element: HTMLElement | null;
    readonly position: Position | null;
    readonly mouseColumn: number;
    readonly range: Range | null;
}
export interface IMouseTargetUnknown extends IBaseMouseTarget {
    readonly type: MouseTargetType.UNKNOWN;
}
export interface IMouseTargetTextarea extends IBaseMouseTarget {
    readonly type: MouseTargetType.TEXTAREA;
    readonly position: null;
    readonly range: null;
}
export interface IMouseTargetMarginData {
    readonly isAfterLines: boolean;
    readonly glyphMarginLeft: number;
    readonly glyphMarginWidth: number;
    readonly glyphMarginLane?: GlyphMarginLane;
    readonly lineNumbersWidth: number;
    readonly offsetX: number;
}
export interface IMouseTargetMargin extends IBaseMouseTarget {
    readonly type: MouseTargetType.GUTTER_GLYPH_MARGIN | MouseTargetType.GUTTER_LINE_NUMBERS | MouseTargetType.GUTTER_LINE_DECORATIONS;
    readonly position: Position;
    readonly range: Range;
    readonly detail: IMouseTargetMarginData;
}
export interface IMouseTargetViewZoneData {
    readonly viewZoneId: string;
    readonly positionBefore: Position | null;
    readonly positionAfter: Position | null;
    readonly position: Position;
    readonly afterLineNumber: number;
}
export interface IMouseTargetViewZone extends IBaseMouseTarget {
    readonly type: MouseTargetType.GUTTER_VIEW_ZONE | MouseTargetType.CONTENT_VIEW_ZONE;
    readonly position: Position;
    readonly range: Range;
    readonly detail: IMouseTargetViewZoneData;
}
export interface IMouseTargetContentTextData {
    readonly mightBeForeignElement: boolean;
    readonly injectedText: InjectedText | null;
}
export interface IMouseTargetContentText extends IBaseMouseTarget {
    readonly type: MouseTargetType.CONTENT_TEXT;
    readonly position: Position;
    readonly range: Range;
    readonly detail: IMouseTargetContentTextData;
}
export interface IMouseTargetContentEmptyData {
    readonly isAfterLines: boolean;
    readonly horizontalDistanceToText?: number;
}
export interface IMouseTargetContentEmpty extends IBaseMouseTarget {
    readonly type: MouseTargetType.CONTENT_EMPTY;
    readonly position: Position;
    readonly range: Range;
    readonly detail: IMouseTargetContentEmptyData;
}
export interface IMouseTargetContentWidget extends IBaseMouseTarget {
    readonly type: MouseTargetType.CONTENT_WIDGET;
    readonly position: null;
    readonly range: null;
    readonly detail: string;
}
export interface IMouseTargetOverlayWidget extends IBaseMouseTarget {
    readonly type: MouseTargetType.OVERLAY_WIDGET;
    readonly position: null;
    readonly range: null;
    readonly detail: string;
}
export interface IMouseTargetScrollbar extends IBaseMouseTarget {
    readonly type: MouseTargetType.SCROLLBAR;
    readonly position: Position;
    readonly range: Range;
}
export interface IMouseTargetOverviewRuler extends IBaseMouseTarget {
    readonly type: MouseTargetType.OVERVIEW_RULER;
}
export interface IMouseTargetOutsideEditor extends IBaseMouseTarget {
    readonly type: MouseTargetType.OUTSIDE_EDITOR;
    readonly outsidePosition: 'above' | 'below' | 'left' | 'right';
    readonly outsideDistance: number;
}
export type IMouseTarget = (IMouseTargetUnknown | IMouseTargetTextarea | IMouseTargetMargin | IMouseTargetViewZone | IMouseTargetContentText | IMouseTargetContentEmpty | IMouseTargetContentWidget | IMouseTargetOverlayWidget | IMouseTargetScrollbar | IMouseTargetOverviewRuler | IMouseTargetOutsideEditor);
export interface IEditorMouseEvent {
    readonly event: IMouseEvent;
    readonly target: IMouseTarget;
}
export interface IPartialEditorMouseEvent {
    readonly event: IMouseEvent;
    readonly target: IMouseTarget | null;
}
export interface IPasteEvent {
    readonly range: Range;
    readonly languageId: string | null;
    readonly clipboardEvent?: ClipboardEvent;
}
export interface PastePayload {
    text: string;
    pasteOnNewLine: boolean;
    multicursorText: string[] | null;
    mode: string | null;
    clipboardEvent?: ClipboardEvent;
}
export interface IOverviewRuler {
    getDomNode(): HTMLElement;
    dispose(): void;
    setZones(zones: OverviewRulerZone[]): void;
    setLayout(position: OverviewRulerPosition): void;
}
export interface IEditorAriaOptions {
    activeDescendant: string | undefined;
    role?: string;
}
export interface IDiffEditorConstructionOptions extends IDiffEditorOptions, IEditorConstructionOptions {
    overflowWidgetsDomNode?: HTMLElement;
    originalAriaLabel?: string;
    modifiedAriaLabel?: string;
}
export interface ICodeEditor extends editorCommon.IEditor {
    readonly isSimpleWidget: boolean;
    readonly contextMenuId: MenuId;
    readonly contextKeyService: IContextKeyService;
    readonly onDidChangeModelContent: Event<IModelContentChangedEvent>;
    readonly onDidChangeModelLanguage: Event<IModelLanguageChangedEvent>;
    readonly onDidChangeModelLanguageConfiguration: Event<IModelLanguageConfigurationChangedEvent>;
    readonly onDidChangeModelOptions: Event<IModelOptionsChangedEvent>;
    readonly onDidChangeConfiguration: Event<ConfigurationChangedEvent>;
    readonly onDidChangeCursorPosition: Event<ICursorPositionChangedEvent>;
    readonly onDidChangeCursorSelection: Event<ICursorSelectionChangedEvent>;
    readonly onWillChangeModel: Event<editorCommon.IModelChangedEvent>;
    readonly onDidChangeModel: Event<editorCommon.IModelChangedEvent>;
    readonly onDidChangeModelDecorations: Event<IModelDecorationsChangedEvent>;
    readonly onDidChangeModelTokens: Event<IModelTokensChangedEvent>;
    readonly onDidFocusEditorText: Event<void>;
    readonly onDidBlurEditorText: Event<void>;
    readonly onDidFocusEditorWidget: Event<void>;
    readonly onDidBlurEditorWidget: Event<void>;
    readonly onWillType: Event<string>;
    readonly onDidType: Event<string>;
    readonly onDidCompositionStart: Event<void>;
    readonly onDidCompositionEnd: Event<void>;
    readonly onDidAttemptReadOnlyEdit: Event<void>;
    readonly onDidPaste: Event<IPasteEvent>;
    readonly onMouseUp: Event<IEditorMouseEvent>;
    readonly onMouseDown: Event<IEditorMouseEvent>;
    readonly onMouseDrag: Event<IEditorMouseEvent>;
    readonly onMouseDrop: Event<IPartialEditorMouseEvent>;
    readonly onMouseDropCanceled: Event<void>;
    readonly onDropIntoEditor: Event<{
        readonly position: IPosition;
        readonly event: DragEvent;
    }>;
    readonly onContextMenu: Event<IEditorMouseEvent>;
    readonly onMouseMove: Event<IEditorMouseEvent>;
    readonly onMouseLeave: Event<IPartialEditorMouseEvent>;
    readonly onMouseWheel: Event<IMouseWheelEvent>;
    readonly onKeyUp: Event<IKeyboardEvent>;
    readonly onKeyDown: Event<IKeyboardEvent>;
    readonly onDidLayoutChange: Event<EditorLayoutInfo>;
    readonly onDidContentSizeChange: Event<editorCommon.IContentSizeChangedEvent>;
    readonly onDidScrollChange: Event<editorCommon.IScrollEvent>;
    readonly onDidChangeHiddenAreas: Event<void>;
    readonly onWillTriggerEditorOperationEvent: Event<editorCommon.ITriggerEditorOperationEvent>;
    readonly onBeginUpdate: Event<void>;
    readonly onEndUpdate: Event<void>;
    saveViewState(): editorCommon.ICodeEditorViewState | null;
    restoreViewState(state: editorCommon.ICodeEditorViewState | null): void;
    hasWidgetFocus(): boolean;
    getContribution<T extends editorCommon.IEditorContribution>(id: string): T | null;
    invokeWithinContext<T>(fn: (accessor: ServicesAccessor) => T): T;
    getModel(): ITextModel | null;
    setModel(model: ITextModel | null): void;
    getOptions(): IComputedEditorOptions;
    getOption<T extends EditorOption>(id: T): FindComputedEditorOptionValueById<T>;
    getRawOptions(): IEditorOptions;
    getOverflowWidgetsDomNode(): HTMLElement | undefined;
    getConfiguredWordAtPosition(position: Position): IWordAtPosition | null;
    getValue(options?: {
        preserveBOM: boolean;
        lineEnding: string;
    }): string;
    setValue(newValue: string): void;
    getContentWidth(): number;
    getScrollWidth(): number;
    getScrollLeft(): number;
    getContentHeight(): number;
    getScrollHeight(): number;
    getScrollTop(): number;
    setScrollLeft(newScrollLeft: number, scrollType?: editorCommon.ScrollType): void;
    setScrollTop(newScrollTop: number, scrollType?: editorCommon.ScrollType): void;
    setScrollPosition(position: editorCommon.INewScrollPosition, scrollType?: editorCommon.ScrollType): void;
    hasPendingScrollAnimation(): boolean;
    getAction(id: string): editorCommon.IEditorAction | null;
    executeCommand(source: string | null | undefined, command: editorCommon.ICommand): void;
    pushUndoStop(): boolean;
    popUndoStop(): boolean;
    executeEdits(source: string | null | undefined, edits: IIdentifiedSingleEditOperation[], endCursorState?: ICursorStateComputer | Selection[]): boolean;
    executeCommands(source: string | null | undefined, commands: (editorCommon.ICommand | null)[]): void;
    _getViewModel(): IViewModel | null;
    getLineDecorations(lineNumber: number): IModelDecoration[] | null;
    getDecorationsInRange(range: Range): IModelDecoration[] | null;
    deltaDecorations(oldDecorations: string[], newDecorations: IModelDeltaDecoration[]): string[];
    removeDecorations(decorationIds: string[]): void;
    setDecorationsByType(description: string, decorationTypeKey: string, ranges: editorCommon.IDecorationOptions[]): void;
    setDecorationsByTypeFast(decorationTypeKey: string, ranges: IRange[]): void;
    removeDecorationsByType(decorationTypeKey: string): void;
    getLayoutInfo(): EditorLayoutInfo;
    getVisibleRanges(): Range[];
    getVisibleRangesPlusViewportAboveBelow(): Range[];
    getWhitespaces(): IEditorWhitespace[];
    getTopForLineNumber(lineNumber: number, includeViewZones?: boolean): number;
    getBottomForLineNumber(lineNumber: number): number;
    getTopForPosition(lineNumber: number, column: number): number;
    setHiddenAreas(ranges: IRange[], source?: unknown): void;
    setAriaOptions(options: IEditorAriaOptions): void;
    writeScreenReaderContent(reason: string): void;
    getTelemetryData(): {
        [key: string]: any;
    } | undefined;
    getContainerDomNode(): HTMLElement;
    getDomNode(): HTMLElement | null;
    addContentWidget(widget: IContentWidget): void;
    layoutContentWidget(widget: IContentWidget): void;
    removeContentWidget(widget: IContentWidget): void;
    addOverlayWidget(widget: IOverlayWidget): void;
    layoutOverlayWidget(widget: IOverlayWidget): void;
    removeOverlayWidget(widget: IOverlayWidget): void;
    addGlyphMarginWidget(widget: IGlyphMarginWidget): void;
    layoutGlyphMarginWidget(widget: IGlyphMarginWidget): void;
    removeGlyphMarginWidget(widget: IGlyphMarginWidget): void;
    changeViewZones(callback: (accessor: IViewZoneChangeAccessor) => void): void;
    getOffsetForColumn(lineNumber: number, column: number): number;
    render(forceRedraw?: boolean): void;
    getTargetAtClientPoint(clientX: number, clientY: number): IMouseTarget | null;
    getScrolledVisiblePosition(position: IPosition): {
        top: number;
        left: number;
        height: number;
    } | null;
    applyFontInfo(target: HTMLElement): void;
    hasModel(): this is IActiveCodeEditor;
    setBanner(bannerDomNode: HTMLElement | null, height: number): void;
    handleInitialized?(): void;
}
export interface IActiveCodeEditor extends ICodeEditor {
    getPosition(): Position;
    getSelection(): Selection;
    getSelections(): Selection[];
    saveViewState(): editorCommon.ICodeEditorViewState;
    getModel(): ITextModel;
    _getViewModel(): IViewModel;
    getLineDecorations(lineNumber: number): IModelDecoration[];
    getDomNode(): HTMLElement;
    getScrolledVisiblePosition(position: IPosition): {
        top: number;
        left: number;
        height: number;
    };
}
export declare const enum DiffEditorState {
    Idle = 0,
    ComputingDiff = 1,
    DiffComputed = 2
}
export interface IDiffEditor extends editorCommon.IEditor {
    readonly ignoreTrimWhitespace: boolean;
    readonly renderSideBySide: boolean;
    readonly maxComputationTime: number;
    getContainerDomNode(): HTMLElement;
    readonly onDidUpdateDiff: Event<void>;
    readonly onDidChangeModel: Event<void>;
    saveViewState(): editorCommon.IDiffEditorViewState | null;
    restoreViewState(state: editorCommon.IDiffEditorViewState | null): void;
    getModel(): editorCommon.IDiffEditorModel | null;
    createViewModel(model: editorCommon.IDiffEditorModel): editorCommon.IDiffEditorViewModel;
    setModel(model: editorCommon.IDiffEditorModel | editorCommon.IDiffEditorViewModel | null): void;
    getOriginalEditor(): ICodeEditor;
    getModifiedEditor(): ICodeEditor;
    getLineChanges(): ILineChange[] | null;
    getDiffComputationResult(): IDiffComputationResult | null;
    updateOptions(newOptions: IDiffEditorOptions): void;
    setBoundarySashes(sashes: IBoundarySashes): void;
    goToDiff(target: 'next' | 'previous'): void;
    revealFirstDiff(): unknown;
    accessibleDiffViewerNext(): void;
    accessibleDiffViewerPrev(): void;
    handleInitialized(): void;
}
export declare function isCodeEditor(thing: unknown): thing is ICodeEditor;
export declare function isDiffEditor(thing: unknown): thing is IDiffEditor;
export declare function isCompositeEditor(thing: unknown): thing is editorCommon.ICompositeCodeEditor;
export declare function getCodeEditor(thing: unknown): ICodeEditor | null;
export declare function getIEditor(thing: any): editorCommon.IEditor | null;
