import { DeleteWordContext, WordNavigationType } from '../../../common/cursor/cursorWordOperations.js';
import { WordCharacterClassifier } from '../../../common/core/wordCharacterClassifier.js';
import { Position } from '../../../common/core/position.js';
import { Range } from '../../../common/core/range.js';
import { ITextModel } from '../../../common/model.js';
import { DeleteWordCommand, MoveWordCommand } from '../../wordOperations/browser/wordOperations.js';
export declare class DeleteWordPartLeft extends DeleteWordCommand {
    constructor();
    protected _delete(ctx: DeleteWordContext, wordNavigationType: WordNavigationType): Range;
}
export declare class DeleteWordPartRight extends DeleteWordCommand {
    constructor();
    protected _delete(ctx: DeleteWordContext, wordNavigationType: WordNavigationType): Range;
}
export declare class WordPartLeftCommand extends MoveWordCommand {
    protected _move(wordSeparators: WordCharacterClassifier, model: ITextModel, position: Position, wordNavigationType: WordNavigationType, hasMulticursor: boolean): Position;
}
export declare class CursorWordPartLeft extends WordPartLeftCommand {
    constructor();
}
export declare class CursorWordPartLeftSelect extends WordPartLeftCommand {
    constructor();
}
export declare class WordPartRightCommand extends MoveWordCommand {
    protected _move(wordSeparators: WordCharacterClassifier, model: ITextModel, position: Position, wordNavigationType: WordNavigationType, hasMulticursor: boolean): Position;
}
export declare class CursorWordPartRight extends WordPartRightCommand {
    constructor();
}
export declare class CursorWordPartRightSelect extends WordPartRightCommand {
    constructor();
}
