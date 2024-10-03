import { Position } from '../../../../../editor/common/core/position.js';
import { Range } from '../../../../../editor/common/core/range.js';
import { TextLength } from '../../../../../editor/common/core/textLength.js';
export declare function rangeContainsPosition(range: Range, position: Position): boolean;
export declare function lengthOfRange(range: Range): TextLength;
export declare function lengthBetweenPositions(position1: Position, position2: Position): TextLength;
export declare function addLength(position: Position, length: TextLength): Position;
export declare function rangeIsBeforeOrTouching(range: Range, other: Range): boolean;
