import { Event } from '../../base/common/event.js';
import { IMarkdownString } from '../../base/common/htmlContent.js';
import { IDisposable } from '../../base/common/lifecycle.js';
import { ThemeColor } from '../../base/common/themables.js';
import { URI, UriComponents } from '../../base/common/uri.js';
import { IEditorOptions } from './config/editorOptions.js';
import { IDimension } from './core/dimension.js';
import { IPosition, Position } from './core/position.js';
import { IRange, Range } from './core/range.js';
import { ISelection, Selection } from './core/selection.js';
import { IModelDecoration, IModelDecorationsChangeAccessor, IModelDeltaDecoration, ITextModel, IValidEditOperation, OverviewRulerLane, TrackedRangeStickiness } from './model.js';
import { IModelDecorationsChangedEvent } from './textModelEvents.js';
import { ICommandMetadata } from '../../platform/commands/common/commands.js';
export interface IEditOperationBuilder {
    addEditOperation(range: IRange, text: string | null, forceMoveMarkers?: boolean): void;
    addTrackedEditOperation(range: IRange, text: string | null, forceMoveMarkers?: boolean): void;
    trackSelection(selection: Selection, trackPreviousOnEmpty?: boolean): string;
}
export interface ICursorStateComputerData {
    getInverseEditOperations(): IValidEditOperation[];
    getTrackedSelection(id: string): Selection;
}
export interface ICommand {
    readonly insertsAutoWhitespace?: boolean;
    getEditOperations(model: ITextModel, builder: IEditOperationBuilder): void;
    computeCursorState(model: ITextModel, helper: ICursorStateComputerData): Selection;
}
export interface IDiffEditorModel {
    original: ITextModel;
    modified: ITextModel;
}
export interface IDiffEditorViewModel extends IDisposable {
    readonly model: IDiffEditorModel;
    waitForDiff(): Promise<void>;
}
export interface IModelChangedEvent {
    readonly oldModelUrl: URI | null;
    readonly newModelUrl: URI | null;
}
export interface IScrollEvent {
    readonly scrollTop: number;
    readonly scrollLeft: number;
    readonly scrollWidth: number;
    readonly scrollHeight: number;
    readonly scrollTopChanged: boolean;
    readonly scrollLeftChanged: boolean;
    readonly scrollWidthChanged: boolean;
    readonly scrollHeightChanged: boolean;
}
export interface IContentSizeChangedEvent {
    readonly contentWidth: number;
    readonly contentHeight: number;
    readonly contentWidthChanged: boolean;
    readonly contentHeightChanged: boolean;
}
export interface ITriggerEditorOperationEvent {
    source: string | null | undefined;
    handlerId: string;
    payload: any;
}
export interface INewScrollPosition {
    scrollLeft?: number;
    scrollTop?: number;
}
export interface IEditorAction {
    readonly id: string;
    readonly label: string;
    readonly alias: string;
    readonly metadata: ICommandMetadata | undefined;
    isSupported(): boolean;
    run(args?: unknown): Promise<void>;
}
export type IEditorModel = ITextModel | IDiffEditorModel | IDiffEditorViewModel;
export interface ICursorState {
    inSelectionMode: boolean;
    selectionStart: IPosition;
    position: IPosition;
}
export interface IViewState {
    scrollTop?: number;
    scrollTopWithoutViewZones?: number;
    scrollLeft: number;
    firstPosition: IPosition;
    firstPositionDeltaTop: number;
}
export interface ICodeEditorViewState {
    cursorState: ICursorState[];
    viewState: IViewState;
    contributionsState: {
        [id: string]: any;
    };
}
export interface IDiffEditorViewState {
    original: ICodeEditorViewState | null;
    modified: ICodeEditorViewState | null;
    modelState?: unknown;
}
export type IEditorViewState = ICodeEditorViewState | IDiffEditorViewState;
export declare const enum ScrollType {
    Smooth = 0,
    Immediate = 1
}
export interface IEditor {
    onDidDispose(listener: () => void): IDisposable;
    dispose(): void;
    getId(): string;
    getEditorType(): string;
    updateOptions(newOptions: IEditorOptions): void;
    onVisible(): void;
    onHide(): void;
    layout(dimension?: IDimension, postponeRendering?: boolean): void;
    focus(): void;
    hasTextFocus(): boolean;
    getSupportedActions(): IEditorAction[];
    saveViewState(): IEditorViewState | null;
    restoreViewState(state: IEditorViewState | null): void;
    getVisibleColumnFromPosition(position: IPosition): number;
    getStatusbarColumn(position: IPosition): number;
    getPosition(): Position | null;
    setPosition(position: IPosition, source?: string): void;
    revealLine(lineNumber: number, scrollType?: ScrollType): void;
    revealLineInCenter(lineNumber: number, scrollType?: ScrollType): void;
    revealLineInCenterIfOutsideViewport(lineNumber: number, scrollType?: ScrollType): void;
    revealLineNearTop(lineNumber: number, scrollType?: ScrollType): void;
    revealPosition(position: IPosition, scrollType?: ScrollType): void;
    revealPositionInCenter(position: IPosition, scrollType?: ScrollType): void;
    revealPositionInCenterIfOutsideViewport(position: IPosition, scrollType?: ScrollType): void;
    revealPositionNearTop(position: IPosition, scrollType?: ScrollType): void;
    getSelection(): Selection | null;
    getSelections(): Selection[] | null;
    setSelection(selection: IRange, source?: string): void;
    setSelection(selection: Range, source?: string): void;
    setSelection(selection: ISelection, source?: string): void;
    setSelection(selection: Selection, source?: string): void;
    setSelections(selections: readonly ISelection[], source?: string): void;
    revealLines(startLineNumber: number, endLineNumber: number, scrollType?: ScrollType): void;
    revealLinesInCenter(lineNumber: number, endLineNumber: number, scrollType?: ScrollType): void;
    revealLinesInCenterIfOutsideViewport(lineNumber: number, endLineNumber: number, scrollType?: ScrollType): void;
    revealLinesNearTop(lineNumber: number, endLineNumber: number, scrollType?: ScrollType): void;
    revealRange(range: IRange, scrollType?: ScrollType): void;
    revealRangeInCenter(range: IRange, scrollType?: ScrollType): void;
    revealRangeAtTop(range: IRange, scrollType?: ScrollType): void;
    revealRangeInCenterIfOutsideViewport(range: IRange, scrollType?: ScrollType): void;
    revealRangeNearTop(range: IRange, scrollType?: ScrollType): void;
    revealRangeNearTopIfOutsideViewport(range: IRange, scrollType?: ScrollType): void;
    trigger(source: string | null | undefined, handlerId: string, payload: any): void;
    getModel(): IEditorModel | null;
    setModel(model: IEditorModel | null): void;
    createDecorationsCollection(decorations?: IModelDeltaDecoration[]): IEditorDecorationsCollection;
    changeDecorations(callback: (changeAccessor: IModelDecorationsChangeAccessor) => any): any;
}
export interface IDiffEditor extends IEditor {
    getModel(): IDiffEditorModel | null;
    getOriginalEditor(): IEditor;
    getModifiedEditor(): IEditor;
}
export interface ICompositeCodeEditor {
    readonly onDidChangeActiveEditor: Event<ICompositeCodeEditor>;
    readonly activeCodeEditor: IEditor | undefined;
}
export interface IEditorDecorationsCollection {
    onDidChange: Event<IModelDecorationsChangedEvent>;
    length: number;
    getRange(index: number): Range | null;
    getRanges(): Range[];
    has(decoration: IModelDecoration): boolean;
    set(newDecorations: readonly IModelDeltaDecoration[]): string[];
    append(newDecorations: readonly IModelDeltaDecoration[]): string[];
    clear(): void;
}
export interface IEditorContribution {
    dispose(): void;
    saveViewState?(): any;
    restoreViewState?(state: any): void;
}
export interface IDiffEditorContribution {
    dispose(): void;
}
export declare function isThemeColor(o: any): o is ThemeColor;
export interface IThemeDecorationRenderOptions {
    backgroundColor?: string | ThemeColor;
    outline?: string;
    outlineColor?: string | ThemeColor;
    outlineStyle?: string;
    outlineWidth?: string;
    border?: string;
    borderColor?: string | ThemeColor;
    borderRadius?: string;
    borderSpacing?: string;
    borderStyle?: string;
    borderWidth?: string;
    fontStyle?: string;
    fontWeight?: string;
    fontSize?: string;
    textDecoration?: string;
    cursor?: string;
    color?: string | ThemeColor;
    opacity?: string;
    letterSpacing?: string;
    gutterIconPath?: UriComponents;
    gutterIconSize?: string;
    overviewRulerColor?: string | ThemeColor;
    before?: IContentDecorationRenderOptions;
    after?: IContentDecorationRenderOptions;
    beforeInjectedText?: IContentDecorationRenderOptions & {
        affectsLetterSpacing?: boolean;
    };
    afterInjectedText?: IContentDecorationRenderOptions & {
        affectsLetterSpacing?: boolean;
    };
}
export interface IContentDecorationRenderOptions {
    contentText?: string;
    contentIconPath?: UriComponents;
    border?: string;
    borderColor?: string | ThemeColor;
    borderRadius?: string;
    fontStyle?: string;
    fontWeight?: string;
    fontSize?: string;
    fontFamily?: string;
    textDecoration?: string;
    color?: string | ThemeColor;
    backgroundColor?: string | ThemeColor;
    opacity?: string;
    verticalAlign?: string;
    margin?: string;
    padding?: string;
    width?: string;
    height?: string;
}
export interface IDecorationRenderOptions extends IThemeDecorationRenderOptions {
    isWholeLine?: boolean;
    rangeBehavior?: TrackedRangeStickiness;
    overviewRulerLane?: OverviewRulerLane;
    light?: IThemeDecorationRenderOptions;
    dark?: IThemeDecorationRenderOptions;
}
export interface IThemeDecorationInstanceRenderOptions {
    before?: IContentDecorationRenderOptions;
    after?: IContentDecorationRenderOptions;
}
export interface IDecorationInstanceRenderOptions extends IThemeDecorationInstanceRenderOptions {
    light?: IThemeDecorationInstanceRenderOptions;
    dark?: IThemeDecorationInstanceRenderOptions;
}
export interface IDecorationOptions {
    range: IRange;
    hoverMessage?: IMarkdownString | IMarkdownString[];
    renderOptions?: IDecorationInstanceRenderOptions;
}
export declare const EditorType: {
    ICodeEditor: string;
    IDiffEditor: string;
};
export declare const enum Handler {
    CompositionStart = "compositionStart",
    CompositionEnd = "compositionEnd",
    Type = "type",
    ReplacePreviousChar = "replacePreviousChar",
    CompositionType = "compositionType",
    Paste = "paste",
    Cut = "cut"
}
export interface TypePayload {
    text: string;
}
export interface ReplacePreviousCharPayload {
    text: string;
    replaceCharCnt: number;
}
export interface CompositionTypePayload {
    text: string;
    replacePrevCharCnt: number;
    replaceNextCharCnt: number;
    positionDelta: number;
}
