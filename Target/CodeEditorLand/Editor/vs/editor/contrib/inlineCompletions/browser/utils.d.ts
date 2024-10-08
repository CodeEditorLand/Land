import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../base/common/observable.js';
import { Position } from '../../../common/core/position.js';
import { Range } from '../../../common/core/range.js';
import { SingleTextEdit } from '../../../common/core/textEdit.js';
export declare function getReadonlyEmptyArray<T>(): readonly T[];
export declare class ColumnRange {
    readonly startColumn: number;
    readonly endColumnExclusive: number;
    constructor(startColumn: number, endColumnExclusive: number);
    toRange(lineNumber: number): Range;
    equals(other: ColumnRange): boolean;
}
export declare function addPositions(pos1: Position, pos2: Position): Position;
export declare function subtractPositions(pos1: Position, pos2: Position): Position;
export declare function substringPos(text: string, pos: Position): string;
export declare function getEndPositionsAfterApplying(edits: readonly SingleTextEdit[]): Position[];
export declare function convertItemsToStableObservables<T>(items: IObservable<readonly T[]>, store: DisposableStore): IObservable<IObservable<T>[]>;
