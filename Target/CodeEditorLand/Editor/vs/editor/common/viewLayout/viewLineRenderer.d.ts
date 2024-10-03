import { IViewLineTokens } from '../tokens/lineTokens.js';
import { StringBuilder } from '../core/stringBuilder.js';
import { LineDecoration } from './lineDecorations.js';
export declare const enum RenderWhitespace {
    None = 0,
    Boundary = 1,
    Selection = 2,
    Trailing = 3,
    All = 4
}
export declare class LineRange {
    readonly startOffset: number;
    readonly endOffset: number;
    constructor(startIndex: number, endIndex: number);
    equals(otherLineRange: LineRange): boolean;
}
export declare class RenderLineInput {
    readonly useMonospaceOptimizations: boolean;
    readonly canUseHalfwidthRightwardsArrow: boolean;
    readonly lineContent: string;
    readonly continuesWithWrappedLine: boolean;
    readonly isBasicASCII: boolean;
    readonly containsRTL: boolean;
    readonly fauxIndentLength: number;
    readonly lineTokens: IViewLineTokens;
    readonly lineDecorations: LineDecoration[];
    readonly tabSize: number;
    readonly startVisibleColumn: number;
    readonly spaceWidth: number;
    readonly renderSpaceWidth: number;
    readonly renderSpaceCharCode: number;
    readonly stopRenderingLineAfter: number;
    readonly renderWhitespace: RenderWhitespace;
    readonly renderControlCharacters: boolean;
    readonly fontLigatures: boolean;
    readonly selectionsOnLine: LineRange[] | null;
    constructor(useMonospaceOptimizations: boolean, canUseHalfwidthRightwardsArrow: boolean, lineContent: string, continuesWithWrappedLine: boolean, isBasicASCII: boolean, containsRTL: boolean, fauxIndentLength: number, lineTokens: IViewLineTokens, lineDecorations: LineDecoration[], tabSize: number, startVisibleColumn: number, spaceWidth: number, middotWidth: number, wsmiddotWidth: number, stopRenderingLineAfter: number, renderWhitespace: 'none' | 'boundary' | 'selection' | 'trailing' | 'all', renderControlCharacters: boolean, fontLigatures: boolean, selectionsOnLine: LineRange[] | null);
    private sameSelection;
    equals(other: RenderLineInput): boolean;
}
export declare class DomPosition {
    readonly partIndex: number;
    readonly charIndex: number;
    constructor(partIndex: number, charIndex: number);
}
export declare class CharacterMapping {
    private static getPartIndex;
    private static getCharIndex;
    readonly length: number;
    private readonly _data;
    private readonly _horizontalOffset;
    constructor(length: number, partCount: number);
    setColumnInfo(column: number, partIndex: number, charIndex: number, horizontalOffset: number): void;
    getHorizontalOffset(column: number): number;
    private charOffsetToPartData;
    getDomPosition(column: number): DomPosition;
    getColumn(domPosition: DomPosition, partLength: number): number;
    private partDataToCharOffset;
    inflate(): [number, number, number][];
}
export declare const enum ForeignElementType {
    None = 0,
    Before = 1,
    After = 2
}
export declare class RenderLineOutput {
    _renderLineOutputBrand: void;
    readonly characterMapping: CharacterMapping;
    readonly containsRTL: boolean;
    readonly containsForeignElements: ForeignElementType;
    constructor(characterMapping: CharacterMapping, containsRTL: boolean, containsForeignElements: ForeignElementType);
}
export declare function renderViewLine(input: RenderLineInput, sb: StringBuilder): RenderLineOutput;
export declare class RenderLineOutput2 {
    readonly characterMapping: CharacterMapping;
    readonly html: string;
    readonly containsRTL: boolean;
    readonly containsForeignElements: ForeignElementType;
    constructor(characterMapping: CharacterMapping, html: string, containsRTL: boolean, containsForeignElements: ForeignElementType);
}
export declare function renderViewLine2(input: RenderLineInput): RenderLineOutput2;
