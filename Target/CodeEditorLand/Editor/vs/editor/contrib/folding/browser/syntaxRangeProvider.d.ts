import { CancellationToken } from '../../../../base/common/cancellation.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { ITextModel } from '../../../common/model.js';
import { FoldingRange, FoldingRangeProvider } from '../../../common/languages.js';
import { FoldingLimitReporter, RangeProvider } from './folding.js';
import { FoldingRegions } from './foldingRanges.js';
export interface IFoldingRangeData extends FoldingRange {
    rank: number;
}
export declare class SyntaxRangeProvider implements RangeProvider {
    private readonly editorModel;
    private readonly providers;
    readonly handleFoldingRangesChange: () => void;
    private readonly foldingRangesLimit;
    private readonly fallbackRangeProvider;
    readonly id = "syntax";
    readonly disposables: DisposableStore;
    constructor(editorModel: ITextModel, providers: FoldingRangeProvider[], handleFoldingRangesChange: () => void, foldingRangesLimit: FoldingLimitReporter, fallbackRangeProvider: RangeProvider | undefined);
    compute(cancellationToken: CancellationToken): Promise<FoldingRegions | null>;
    dispose(): void;
}
export declare function sanitizeRanges(rangeData: IFoldingRangeData[], foldingRangesLimit: FoldingLimitReporter): FoldingRegions;
