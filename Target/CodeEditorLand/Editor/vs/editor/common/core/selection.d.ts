import { IPosition, Position } from './position.js';
import { Range } from './range.js';
export interface ISelection {
    readonly selectionStartLineNumber: number;
    readonly selectionStartColumn: number;
    readonly positionLineNumber: number;
    readonly positionColumn: number;
}
export declare const enum SelectionDirection {
    LTR = 0,
    RTL = 1
}
export declare class Selection extends Range {
    readonly selectionStartLineNumber: number;
    readonly selectionStartColumn: number;
    readonly positionLineNumber: number;
    readonly positionColumn: number;
    constructor(selectionStartLineNumber: number, selectionStartColumn: number, positionLineNumber: number, positionColumn: number);
    toString(): string;
    equalsSelection(other: ISelection): boolean;
    static selectionsEqual(a: ISelection, b: ISelection): boolean;
    getDirection(): SelectionDirection;
    setEndPosition(endLineNumber: number, endColumn: number): Selection;
    getPosition(): Position;
    getSelectionStart(): Position;
    setStartPosition(startLineNumber: number, startColumn: number): Selection;
    static fromPositions(start: IPosition, end?: IPosition): Selection;
    static fromRange(range: Range, direction: SelectionDirection): Selection;
    static liftSelection(sel: ISelection): Selection;
    static selectionsArrEqual(a: ISelection[], b: ISelection[]): boolean;
    static isISelection(obj: any): obj is ISelection;
    static createWithDirection(startLineNumber: number, startColumn: number, endLineNumber: number, endColumn: number, direction: SelectionDirection): Selection;
}
