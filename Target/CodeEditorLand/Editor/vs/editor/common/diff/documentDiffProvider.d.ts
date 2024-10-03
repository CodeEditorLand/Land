import { CancellationToken } from '../../../base/common/cancellation.js';
import { Event } from '../../../base/common/event.js';
import { MovedText } from './linesDiffComputer.js';
import { DetailedLineRangeMapping } from './rangeMapping.js';
import { ITextModel } from '../model.js';
export interface IDocumentDiffProvider {
    computeDiff(original: ITextModel, modified: ITextModel, options: IDocumentDiffProviderOptions, cancellationToken: CancellationToken): Promise<IDocumentDiff>;
    onDidChange: Event<void>;
}
export interface IDocumentDiffProviderOptions {
    ignoreTrimWhitespace: boolean;
    maxComputationTimeMs: number;
    computeMoves: boolean;
}
export interface IDocumentDiff {
    readonly identical: boolean;
    readonly quitEarly: boolean;
    readonly changes: readonly DetailedLineRangeMapping[];
    readonly moves: readonly MovedText[];
}
