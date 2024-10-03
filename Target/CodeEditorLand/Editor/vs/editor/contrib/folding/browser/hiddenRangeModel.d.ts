import { Event } from '../../../../base/common/event.js';
import { IRange } from '../../../common/core/range.js';
import { Selection } from '../../../common/core/selection.js';
import { IModelContentChangedEvent } from '../../../common/textModelEvents.js';
import { FoldingModel } from './foldingModel.js';
export declare class HiddenRangeModel {
    private readonly _foldingModel;
    private _hiddenRanges;
    private _foldingModelListener;
    private readonly _updateEventEmitter;
    private _hasLineChanges;
    get onDidChange(): Event<IRange[]>;
    get hiddenRanges(): IRange[];
    constructor(model: FoldingModel);
    notifyChangeModelContent(e: IModelContentChangedEvent): void;
    private updateHiddenRanges;
    private applyHiddenRanges;
    hasRanges(): boolean;
    isHidden(line: number): boolean;
    adjustSelections(selections: Selection[]): boolean;
    dispose(): void;
}
