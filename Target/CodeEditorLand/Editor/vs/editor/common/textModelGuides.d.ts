import { IPosition } from './core/position.js';
export interface IGuidesTextModelPart {
    getActiveIndentGuide(lineNumber: number, minLineNumber: number, maxLineNumber: number): IActiveIndentGuideInfo;
    getLinesIndentGuides(startLineNumber: number, endLineNumber: number): number[];
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
    readonly horizontalLine: IndentGuideHorizontalLine | null;
    readonly forWrappedLinesAfterColumn: number | -1;
    readonly forWrappedLinesBeforeOrAtColumn: number | -1;
    constructor(visibleColumn: number | -1, column: number | -1, className: string, horizontalLine: IndentGuideHorizontalLine | null, forWrappedLinesAfterColumn: number | -1, forWrappedLinesBeforeOrAtColumn: number | -1);
}
export declare class IndentGuideHorizontalLine {
    readonly top: boolean;
    readonly endColumn: number;
    constructor(top: boolean, endColumn: number);
}
