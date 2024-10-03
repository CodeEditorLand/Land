import { Event } from '../../../../base/common/event.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { ICodeEditor } from '../../../browser/editorBrowser.js';
import { IPosition, Position } from '../../../common/core/position.js';
import { ITextModel } from '../../../common/model.js';
import { CompletionItemKind, CompletionTriggerKind } from '../../../common/languages.js';
import { IEditorWorkerService } from '../../../common/services/editorWorker.js';
import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { CompletionModel } from './completionModel.js';
import { CompletionOptions } from './suggest.js';
import { IWordAtPosition } from '../../../common/core/wordHelper.js';
import { ILanguageFeaturesService } from '../../../common/services/languageFeatures.js';
import { IEnvironmentService } from '../../../../platform/environment/common/environment.js';
export interface ICancelEvent {
    readonly retrigger: boolean;
}
export interface ITriggerEvent {
    readonly auto: boolean;
    readonly shy: boolean;
    readonly position: IPosition;
}
export interface ISuggestEvent {
    readonly completionModel: CompletionModel;
    readonly isFrozen: boolean;
    readonly triggerOptions: SuggestTriggerOptions;
}
export interface SuggestTriggerOptions {
    readonly auto: boolean;
    readonly shy?: boolean;
    readonly refilter?: boolean;
    readonly retrigger?: boolean;
    readonly triggerKind?: CompletionTriggerKind;
    readonly triggerCharacter?: string;
    readonly clipboardText?: string;
    completionOptions?: Partial<CompletionOptions>;
}
export declare class LineContext {
    static shouldAutoTrigger(editor: ICodeEditor): boolean;
    readonly lineNumber: number;
    readonly column: number;
    readonly leadingLineContent: string;
    readonly leadingWord: IWordAtPosition;
    readonly triggerOptions: SuggestTriggerOptions;
    constructor(model: ITextModel, position: Position, triggerOptions: SuggestTriggerOptions);
}
export declare const enum State {
    Idle = 0,
    Manual = 1,
    Auto = 2
}
export declare class SuggestModel implements IDisposable {
    private readonly _editor;
    private readonly _editorWorkerService;
    private readonly _clipboardService;
    private readonly _telemetryService;
    private readonly _logService;
    private readonly _contextKeyService;
    private readonly _configurationService;
    private readonly _languageFeaturesService;
    private readonly _envService;
    private readonly _toDispose;
    private readonly _triggerCharacterListener;
    private readonly _triggerQuickSuggest;
    private _triggerState;
    private _requestToken?;
    private _context?;
    private _currentSelection;
    private _completionModel;
    private readonly _completionDisposables;
    private readonly _onDidCancel;
    private readonly _onDidTrigger;
    private readonly _onDidSuggest;
    readonly onDidCancel: Event<ICancelEvent>;
    readonly onDidTrigger: Event<ITriggerEvent>;
    readonly onDidSuggest: Event<ISuggestEvent>;
    constructor(_editor: ICodeEditor, _editorWorkerService: IEditorWorkerService, _clipboardService: IClipboardService, _telemetryService: ITelemetryService, _logService: ILogService, _contextKeyService: IContextKeyService, _configurationService: IConfigurationService, _languageFeaturesService: ILanguageFeaturesService, _envService: IEnvironmentService);
    dispose(): void;
    private _updateTriggerCharacters;
    get state(): State;
    cancel(retrigger?: boolean): void;
    clear(): void;
    private _updateActiveSuggestSession;
    private _onCursorChange;
    private _onCompositionEnd;
    private _doTriggerQuickSuggest;
    private _refilterCompletionItems;
    trigger(options: SuggestTriggerOptions): void;
    private _telemetryGate;
    private _reportDurationsTelemetry;
    static createSuggestFilter(editor: ICodeEditor): {
        itemKind: Set<CompletionItemKind>;
        showDeprecated: boolean;
    };
    private _onNewContext;
}
