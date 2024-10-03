export declare class ReplacePattern {
    static fromStaticValue(value: string): ReplacePattern;
    private readonly _state;
    get hasReplacementPatterns(): boolean;
    constructor(pieces: ReplacePiece[] | null);
    buildReplaceString(matches: string[] | null, preserveCase?: boolean): string;
    private static _substitute;
}
export declare class ReplacePiece {
    static staticValue(value: string): ReplacePiece;
    static matchIndex(index: number): ReplacePiece;
    static caseOps(index: number, caseOps: string[]): ReplacePiece;
    readonly staticValue: string | null;
    readonly matchIndex: number;
    readonly caseOps: string[] | null;
    private constructor();
}
export declare function parseReplaceString(replaceString: string): ReplacePattern;
