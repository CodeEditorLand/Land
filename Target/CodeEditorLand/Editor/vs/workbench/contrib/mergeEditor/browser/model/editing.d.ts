import { Range } from '../../../../../editor/common/core/range.js';
import { IIdentifiedSingleEditOperation } from '../../../../../editor/common/model.js';
import { LineRange } from './lineRange.js';
/**
 * Represents an edit, expressed in whole lines:
 * At (before) {@link LineRange.startLineNumber}, delete {@link LineRange.lineCount} many lines and insert {@link newLines}.
*/
export declare class LineRangeEdit {
    readonly range: LineRange;
    readonly newLines: string[];
    constructor(range: LineRange, newLines: string[]);
    equals(other: LineRangeEdit): boolean;
    toEdits(modelLineCount: number): IIdentifiedSingleEditOperation[];
}
export declare class RangeEdit {
    readonly range: Range;
    readonly newText: string;
    constructor(range: Range, newText: string);
    equals(other: RangeEdit): boolean;
}
export declare class LineEdits {
    readonly edits: readonly LineRangeEdit[];
    constructor(edits: readonly LineRangeEdit[]);
    toEdits(modelLineCount: number): IIdentifiedSingleEditOperation[];
}
