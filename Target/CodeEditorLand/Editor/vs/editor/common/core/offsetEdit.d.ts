import { OffsetRange } from './offsetRange.js';
/**
 * Describes an edit to a (0-based) string.
 * Use `TextEdit` to describe edits for a 1-based line/column text.
*/
export declare class OffsetEdit {
    readonly edits: readonly SingleOffsetEdit[];
    static readonly empty: OffsetEdit;
    static fromJson(data: IOffsetEdit): OffsetEdit;
    static replace(range: OffsetRange, newText: string): OffsetEdit;
    static insert(offset: number, insertText: string): OffsetEdit;
    constructor(edits: readonly SingleOffsetEdit[]);
    normalize(): OffsetEdit;
    toString(): string;
    apply(str: string): string;
    compose(other: OffsetEdit): OffsetEdit;
    /**
     * Creates an edit that reverts this edit.
     */
    inverse(originalStr: string): OffsetEdit;
    getNewTextRanges(): OffsetRange[];
    get isEmpty(): boolean;
    /**
     * Consider `t1 := text o base` and `t2 := text o this`.
     * We are interested in `tm := tryMerge(t1, t2, base: text)`.
     * For that, we compute `tm' := t1 o base o this.rebase(base)`
     * such that `tm' === tm`.
     */
    tryRebase(base: OffsetEdit): OffsetEdit;
    applyToOffset(originalOffset: number): number;
    applyToOffsetRange(originalRange: OffsetRange): OffsetRange;
    applyInverseToOffset(postEditsOffset: number): number;
}
export type IOffsetEdit = ISingleOffsetEdit[];
export interface ISingleOffsetEdit {
    txt: string;
    pos: number;
    len: number;
}
export declare class SingleOffsetEdit {
    readonly replaceRange: OffsetRange;
    readonly newText: string;
    static fromJson(data: ISingleOffsetEdit): SingleOffsetEdit;
    static insert(offset: number, text: string): SingleOffsetEdit;
    constructor(replaceRange: OffsetRange, newText: string);
    toString(): string;
    get isEmpty(): boolean;
}
