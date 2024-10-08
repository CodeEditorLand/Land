import { ColumnRange } from '../utils.js';
export declare class GhostText {
    readonly lineNumber: number;
    readonly parts: GhostTextPart[];
    constructor(lineNumber: number, parts: GhostTextPart[]);
    equals(other: GhostText): boolean;
    /**
     * Only used for testing/debugging.
    */
    render(documentText: string, debug?: boolean): string;
    renderForScreenReader(lineText: string): string;
    isEmpty(): boolean;
    get lineCount(): number;
}
export declare class GhostTextPart {
    readonly column: number;
    readonly text: string;
    /**
     * Indicates if this part is a preview of an inline suggestion when a suggestion is previewed.
    */
    readonly preview: boolean;
    constructor(column: number, text: string, 
    /**
     * Indicates if this part is a preview of an inline suggestion when a suggestion is previewed.
    */
    preview: boolean);
    readonly lines: string[];
    equals(other: GhostTextPart): boolean;
}
export declare class GhostTextReplacement {
    readonly lineNumber: number;
    readonly columnRange: ColumnRange;
    readonly text: string;
    readonly additionalReservedLineCount: number;
    readonly parts: ReadonlyArray<GhostTextPart>;
    constructor(lineNumber: number, columnRange: ColumnRange, text: string, additionalReservedLineCount?: number);
    readonly newLines: string[];
    renderForScreenReader(_lineText: string): string;
    render(documentText: string, debug?: boolean): string;
    get lineCount(): number;
    isEmpty(): boolean;
    equals(other: GhostTextReplacement): boolean;
}
export type GhostTextOrReplacement = GhostText | GhostTextReplacement;
export declare function ghostTextsOrReplacementsEqual(a: readonly GhostTextOrReplacement[] | undefined, b: readonly GhostTextOrReplacement[] | undefined): boolean;
export declare function ghostTextOrReplacementEquals(a: GhostTextOrReplacement | undefined, b: GhostTextOrReplacement | undefined): boolean;
