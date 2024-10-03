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
    constructor(edits: readonly TextEditInfo[]);
    getOffsetBeforeChange(offset: Length): Length;
    getDistanceToNextChange(offset: Length): Length | null;
    private translateOldToCur;
    private translateCurToOld;
    private adjustNextEdit;
}
