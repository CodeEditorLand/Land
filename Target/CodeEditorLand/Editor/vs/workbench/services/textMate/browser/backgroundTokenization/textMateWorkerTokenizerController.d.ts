import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../../base/common/observable.js';
import { Proxied } from '../../../../../base/common/worker/simpleWorker.js';
import { IBackgroundTokenizationStore, ILanguageIdCodec } from '../../../../../editor/common/languages.js';
import { ITextModel } from '../../../../../editor/common/model.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import type { StateDeltas, TextMateTokenizationWorker } from './worker/textMateTokenizationWorker.worker.js';
export declare class TextMateWorkerTokenizerController extends Disposable {
    private readonly _model;
    private readonly _worker;
    private readonly _languageIdCodec;
    private readonly _backgroundTokenizationStore;
    private readonly _configurationService;
    private readonly _maxTokenizationLineLength;
    private static _id;
    readonly controllerId: number;
    private readonly _pendingChanges;
    /**
     * These states will eventually equal the worker states.
     * _states[i] stores the state at the end of line number i+1.
     */
    private readonly _states;
    private readonly _loggingEnabled;
    private _applyStateStackDiffFn?;
    private _initialState?;
    constructor(_model: ITextModel, _worker: Proxied<TextMateTokenizationWorker>, _languageIdCodec: ILanguageIdCodec, _backgroundTokenizationStore: IBackgroundTokenizationStore, _configurationService: IConfigurationService, _maxTokenizationLineLength: IObservable<number>);
    dispose(): void;
    requestTokens(startLineNumber: number, endLineNumberExclusive: number): void;
    /**
     * This method is called from the worker through the worker host.
     */
    setTokensAndStates(controllerId: number, versionId: number, rawTokens: ArrayBuffer, stateDeltas: StateDeltas[]): Promise<void>;
    private get _shouldLog();
}
