import { IRange } from '../../../../editor/common/core/range.js';
import { IIdentifiedSingleEditOperation, ITextModel, IValidEditOperation } from '../../../../editor/common/model.js';
import { IEditObserver } from './inlineChatStrategies.js';
import { IProgress } from '../../../../platform/progress/common/progress.js';
import { IntervalTimer } from '../../../../base/common/async.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
export interface AsyncTextEdit {
    readonly range: IRange;
    readonly newText: AsyncIterable<string>;
}
export declare function performAsyncTextEdit(model: ITextModel, edit: AsyncTextEdit, progress?: IProgress<IValidEditOperation[]>, obs?: IEditObserver): Promise<void>;
export declare function asProgressiveEdit(interval: IntervalTimer, edit: IIdentifiedSingleEditOperation, wordsPerSec: number, token: CancellationToken): AsyncTextEdit;
