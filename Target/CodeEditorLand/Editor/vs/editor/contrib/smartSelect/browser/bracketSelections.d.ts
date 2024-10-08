import { Position } from '../../../common/core/position.js';
import { ITextModel } from '../../../common/model.js';
import { SelectionRange, SelectionRangeProvider } from '../../../common/languages.js';
export declare class BracketSelectionRangeProvider implements SelectionRangeProvider {
    provideSelectionRanges(model: ITextModel, positions: Position[]): Promise<SelectionRange[][]>;
    static _maxDuration: number;
    private static readonly _maxRounds;
    private static _bracketsRightYield;
    private static _bracketsLeftYield;
    private static _addBracketLeading;
}
