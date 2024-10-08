export declare const enum LinePartMetadata {
    IS_WHITESPACE = 1,
    PSEUDO_BEFORE = 2,
    PSEUDO_AFTER = 4,
    IS_WHITESPACE_MASK = 1,
    PSEUDO_BEFORE_MASK = 2,
    PSEUDO_AFTER_MASK = 4
}
export declare class LinePart {
    /**
     * last char index of this token (not inclusive).
     */
    readonly endIndex: number;
    readonly type: string;
    readonly metadata: number;
    readonly containsRTL: boolean;
    _linePartBrand: void;
    constructor(
    /**
     * last char index of this token (not inclusive).
     */
    endIndex: number, type: string, metadata: number, containsRTL: boolean);
    isWhitespace(): boolean;
    isPseudoAfter(): boolean;
}
