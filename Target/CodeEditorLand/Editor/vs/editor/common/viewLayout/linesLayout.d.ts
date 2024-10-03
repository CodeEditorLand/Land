import { IEditorWhitespace, IPartialViewLinesViewportData, IViewWhitespaceViewportData, IWhitespaceChangeAccessor } from '../viewModel.js';
interface IPendingChange {
    id: string;
    newAfterLineNumber: number;
    newHeight: number;
}
interface IPendingRemove {
    id: string;
}
export declare class EditorWhitespace implements IEditorWhitespace {
    id: string;
    afterLineNumber: number;
    ordinal: number;
    height: number;
    minWidth: number;
    prefixSum: number;
    constructor(id: string, afterLineNumber: number, ordinal: number, height: number, minWidth: number);
}
export declare class LinesLayout {
    private static INSTANCE_COUNT;
    private readonly _instanceId;
    private readonly _pendingChanges;
    private _lastWhitespaceId;
    private _arr;
    private _prefixSumValidIndex;
    private _minWidth;
    private _lineCount;
    private _lineHeight;
    private _paddingTop;
    private _paddingBottom;
    constructor(lineCount: number, lineHeight: number, paddingTop: number, paddingBottom: number);
    static findInsertionIndex(arr: EditorWhitespace[], afterLineNumber: number, ordinal: number): number;
    setLineHeight(lineHeight: number): void;
    setPadding(paddingTop: number, paddingBottom: number): void;
    onFlushed(lineCount: number): void;
    changeWhitespace(callback: (accessor: IWhitespaceChangeAccessor) => void): boolean;
    _commitPendingChanges(inserts: EditorWhitespace[], changes: IPendingChange[], removes: IPendingRemove[]): void;
    private _checkPendingChanges;
    private _insertWhitespace;
    private _findWhitespaceIndex;
    private _changeOneWhitespace;
    private _removeWhitespace;
    onLinesDeleted(fromLineNumber: number, toLineNumber: number): void;
    onLinesInserted(fromLineNumber: number, toLineNumber: number): void;
    getWhitespacesTotalHeight(): number;
    getWhitespacesAccumulatedHeight(index: number): number;
    getLinesTotalHeight(): number;
    getWhitespaceAccumulatedHeightBeforeLineNumber(lineNumber: number): number;
    private _findLastWhitespaceBeforeLineNumber;
    private _findFirstWhitespaceAfterLineNumber;
    getFirstWhitespaceIndexAfterLineNumber(lineNumber: number): number;
    getVerticalOffsetForLineNumber(lineNumber: number, includeViewZones?: boolean): number;
    getVerticalOffsetAfterLineNumber(lineNumber: number, includeViewZones?: boolean): number;
    hasWhitespace(): boolean;
    getWhitespaceMinWidth(): number;
    isAfterLines(verticalOffset: number): boolean;
    isInTopPadding(verticalOffset: number): boolean;
    isInBottomPadding(verticalOffset: number): boolean;
    getLineNumberAtOrAfterVerticalOffset(verticalOffset: number): number;
    getLinesViewportData(verticalOffset1: number, verticalOffset2: number): IPartialViewLinesViewportData;
    getVerticalOffsetForWhitespaceIndex(whitespaceIndex: number): number;
    getWhitespaceIndexAtOrAfterVerticallOffset(verticalOffset: number): number;
    getWhitespaceAtVerticalOffset(verticalOffset: number): IViewWhitespaceViewportData | null;
    getWhitespaceViewportData(verticalOffset1: number, verticalOffset2: number): IViewWhitespaceViewportData[];
    getWhitespaces(): IEditorWhitespace[];
    getWhitespacesCount(): number;
    getIdForWhitespaceIndex(index: number): string;
    getAfterLineNumberForWhitespaceIndex(index: number): number;
    getHeightForWhitespaceIndex(index: number): number;
}
export {};
