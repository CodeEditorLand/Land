import { OffsetRange } from './offsetRange.js';
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
    inverse(originalStr: string): OffsetEdit;
    getNewTextRanges(): OffsetRange[];
    get isEmpty(): boolean;
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
