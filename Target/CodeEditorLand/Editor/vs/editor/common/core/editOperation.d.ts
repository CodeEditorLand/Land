import { Position } from './position.js';
import { IRange, Range } from './range.js';
export interface ISingleEditOperation {
    range: IRange;
    text: string | null;
    forceMoveMarkers?: boolean;
}
export declare class EditOperation {
    static insert(position: Position, text: string): ISingleEditOperation;
    static delete(range: Range): ISingleEditOperation;
    static replace(range: Range, text: string | null): ISingleEditOperation;
    static replaceMove(range: Range, text: string | null): ISingleEditOperation;
}
