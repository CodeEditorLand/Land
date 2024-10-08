import { IPosition } from './core/position.js';
export interface IGuidesTextModelPart {
    /**
     * @internal
     */
    getActiveIndentGuide(lineNumber: number, minLineNumber: number, maxLineNumber: number): IActiveIndentGuideInfo;
    /**
     * @internal
     */
    getLinesIndentGuides(startLineNumber: number, endLineNumber: number): number[];
    /**
     * Requests the the indent guides for the given range of lines.
     * `result[i]` will contain the indent guides of the `startLineNumber + i`th line.
     * @internal
     */
    getLinesBracketGuides(startLineNumber: number, endLineNumber: number, activePosition: IPosition | null, options: BracketGuideOptions): IndentGuide[][];
}
export interface IActiveIndentGuideInfo {
    startLineNumber: number;
    endLineNumber: number;
    indent: number;
}
export declare enum HorizontalGuidesState {
    Disabled = 0,
    EnabledForActive = 1,
    Enabled = 2
}
export interface BracketGuideOptions {
    includeInactive: boolean;
    horizontalGuides: HorizontalGuidesState;
    highlightActive: boolean;
}
export declare class IndentGuide {
    readonly visibleColumn: number | -1;
    readonly column: number | -1;
    readonly className: string;
    /**
     * If set, this indent guide is a horizontal guide (no vertical part).
     * It starts at visibleColumn and continues until endColumn.
    */
    readonly horizontalLine: IndentGuideHorizontalLine | null;
    /**
     * If set (!= -1), only show this guide for wrapped lines that don't contain this model column, but are after it.
    */
    readonly forWrappedLinesAfterColumn: number | -1;
    readonly forWrappedLinesBeforeOrAtColumn: number | -1;
    constructor(visibleColumn: number | -1, column: number | -1, className: string, 
    /**
     * If set, this indent guide is a horizontal guide (no vertical part).
     * It starts at visibleColumn and continues until endColumn.
    */
    horizontalLine: IndentGuideHorizontalLine | null, 
    /**
     * If set (!= -1), only show this guide for wrapped lines that don't contain this model column, but are after it.
    */
    forWrappedLinesAfterColumn: number | -1, forWrappedLinesBeforeOrAtColumn: number | -1);
}
export declare class IndentGuideHorizontalLine {
    readonly top: boolean;
    readonly endColumn: number;
    constructor(top: boolean, endColumn: number);
}
