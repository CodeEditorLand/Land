import { Length } from './length.js';
import { IModelContentChange } from '../../../textModelEvents.js';
export declare class TextEditInfo {
    readonly startOffset: Length;
    readonly endOffset: Length;
    readonly newLength: Length;
    static fromModelContentChanges(changes: IModelContentChange[]): TextEditInfo[];
    constructor(startOffset: Length, endOffset: Length, newLength: Length);
    toString(): string;
}
export declare class BeforeEditPositionMapper {
    private nextEditIdx;
    private deltaOldToNewLineCount;
    private deltaOldToNewColumnCount;
    private deltaLineIdxInOld;
    private readonly edits;
    /**
     * @param edits Must be sorted by offset in ascending order.
    */
    constructor(edits: readonly TextEditInfo[]);
    /**
     * @param offset Must be equal to or greater than the last offset this method has been called with.
    */
    getOffsetBeforeChange(offset: Length): Length;
    /**
     * @param offset Must be equal to or greater than the last offset this method has been called with.
     * Returns null if there is no edit anymore.
    */
    getDistanceToNextChange(offset: Length): Length | null;
    private translateOldToCur;
    private translateCurToOld;
    private adjustNextEdit;
}
