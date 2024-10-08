import { Position } from '../../../common/core/position.js';
import { ITextModel } from '../../../common/model.js';
import { SelectionRange, SelectionRangeProvider } from '../../../common/languages.js';
export declare class WordSelectionRangeProvider implements SelectionRangeProvider {
    private readonly selectSubwords;
    constructor(selectSubwords?: boolean);
    provideSelectionRanges(model: ITextModel, positions: Position[]): SelectionRange[][];
    private _addInWordRanges;
    private _addWordRanges;
    private _addWhitespaceLine;
}
