import { AsyncIterableObject } from '../../../../base/common/async.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ICodeEditor } from '../../../browser/editorBrowser.js';
export interface IHoverComputer<TArgs, TResult> {
    /**
     * This is called after half the hover time
     */
    computeAsync?: (args: TArgs, token: CancellationToken) => AsyncIterableObject<TResult>;
    /**
     * This is called after all the hover time
     */
    computeSync?: (args: TArgs) => TResult[];
}
export declare const enum HoverStartMode {
    Delayed = 0,
    Immediate = 1
}
export declare const enum HoverStartSource {
    Mouse = 0,
    Keyboard = 1
}
export declare class HoverResult<TArgs, TResult> {
    readonly value: TResult[];
    readonly isComplete: boolean;
    readonly hasLoadingMessage: boolean;
    readonly options: TArgs;
    constructor(value: TResult[], isComplete: boolean, hasLoadingMessage: boolean, options: TArgs);
}
/**
 * Computing the hover is very fine tuned.
 *
 * Suppose the hover delay is 300ms (the default). Then, when resting the mouse at an anchor:
 * - at 150ms, the async computation is triggered (i.e. semantic hover)
 *   - if async results already come in, they are not rendered yet.
 * - at 300ms, the sync computation is triggered (i.e. decorations, markers)
 *   - if there are sync or async results, they are rendered.
 * - at 900ms, if the async computation hasn't finished, a "Loading..." result is added.
 */
export declare class HoverOperation<TArgs, TResult> extends Disposable {
    private readonly _editor;
    private readonly _computer;
    private readonly _onResult;
    readonly onResult: import("../../../../workbench/workbench.web.main.internal.js").Event<HoverResult<TArgs, TResult>>;
    private readonly _asyncComputationScheduler;
    private readonly _syncComputationScheduler;
    private readonly _loadingMessageScheduler;
    private _state;
    private _asyncIterable;
    private _asyncIterableDone;
    private _result;
    private _options;
    constructor(_editor: ICodeEditor, _computer: IHoverComputer<TArgs, TResult>);
    dispose(): void;
    private get _hoverTime();
    private get _firstWaitTime();
    private get _secondWaitTime();
    private get _loadingMessageTime();
    private _setState;
    private _triggerAsyncComputation;
    private _triggerSyncComputation;
    private _triggerLoadingMessage;
    private _fireResult;
    start(mode: HoverStartMode, options: TArgs): void;
    cancel(): void;
    get options(): TArgs | undefined;
}
