import { Event } from '../../../../base/common/event.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { ICodeEditor } from '../../../browser/editorBrowser.js';
import { EditorAction, ServicesAccessor } from '../../../browser/editorExtensions.js';
import { IEditorContribution } from '../../../common/editorCommon.js';
import { CompletionItemProvider } from '../../../common/languages.js';
import { ISuggestMemoryService } from './suggestMemory.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { CompletionItem, ISuggestItemPreselector } from './suggest.js';
import { SuggestModel } from './suggestModel.js';
import { ISelectedSuggestion, SuggestWidget } from './suggestWidget.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { WindowIdleValue } from '../../../../base/browser/dom.js';
declare const enum InsertFlags {
    None = 0,
    NoBeforeUndoStop = 1,
    NoAfterUndoStop = 2,
    KeepAlternativeSuggestions = 4,
    AlternativeOverwriteConfig = 8
}
export declare class SuggestController implements IEditorContribution {
    private readonly _memoryService;
    private readonly _commandService;
    private readonly _contextKeyService;
    private readonly _instantiationService;
    private readonly _logService;
    private readonly _telemetryService;
    static readonly ID: string;
    static get(editor: ICodeEditor): SuggestController | null;
    readonly editor: ICodeEditor;
    readonly model: SuggestModel;
    readonly widget: WindowIdleValue<SuggestWidget>;
    private readonly _alternatives;
    private readonly _lineSuffix;
    private readonly _toDispose;
    private readonly _overtypingCapturer;
    private readonly _selectors;
    private readonly _onWillInsertSuggestItem;
    readonly onWillInsertSuggestItem: Event<{
        item: CompletionItem;
    }>;
    constructor(editor: ICodeEditor, _memoryService: ISuggestMemoryService, _commandService: ICommandService, _contextKeyService: IContextKeyService, _instantiationService: IInstantiationService, _logService: ILogService, _telemetryService: ITelemetryService);
    dispose(): void;
    protected _insertSuggestion(event: ISelectedSuggestion | undefined, flags: InsertFlags): void;
    private _reportSuggestionAcceptedTelemetry;
    getOverwriteInfo(item: CompletionItem, toggleMode: boolean): {
        overwriteBefore: number;
        overwriteAfter: number;
    };
    private _alertCompletionItem;
    triggerSuggest(onlyFrom?: Set<CompletionItemProvider>, auto?: boolean, noFilter?: boolean): void;
    triggerSuggestAndAcceptBest(arg: {
        fallback: string;
    }): void;
    acceptSelectedSuggestion(keepAlternativeSuggestions: boolean, alternativeOverwriteConfig: boolean): void;
    acceptNextSuggestion(): void;
    acceptPrevSuggestion(): void;
    cancelSuggestWidget(): void;
    focusSuggestion(): void;
    selectNextSuggestion(): void;
    selectNextPageSuggestion(): void;
    selectLastSuggestion(): void;
    selectPrevSuggestion(): void;
    selectPrevPageSuggestion(): void;
    selectFirstSuggestion(): void;
    toggleSuggestionDetails(): void;
    toggleExplainMode(): void;
    toggleSuggestionFocus(): void;
    resetWidgetSize(): void;
    forceRenderingAbove(): void;
    stopForceRenderingAbove(): void;
    registerSelector(selector: ISuggestItemPreselector): IDisposable;
}
export declare class TriggerSuggestAction extends EditorAction {
    static readonly id = "editor.action.triggerSuggest";
    constructor();
    run(_accessor: ServicesAccessor, editor: ICodeEditor, args: any): void;
}
export {};
