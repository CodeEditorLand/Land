import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { ICodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { ISingleEditOperation } from '../../../../editor/common/core/editOperation.js';
import { Position } from '../../../../editor/common/core/position.js';
import { IModelDeltaDecoration, IValidEditOperation } from '../../../../editor/common/model.js';
import { ModelDecorationOptions } from '../../../../editor/common/model/textModel.js';
import { IEditorWorkerService } from '../../../../editor/common/services/editorWorker.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { HunkInformation, Session } from './inlineChatSession.js';
import { InlineChatZoneWidget } from './inlineChatZoneWidget.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ITextFileService } from '../../../services/textfile/common/textfiles.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IMenuService } from '../../../../platform/actions/common/actions.js';
export interface IEditObserver {
    start(): void;
    stop(): void;
}
export declare const enum HunkAction {
    Accept = 0,
    Discard = 1,
    MoveNext = 2,
    MovePrev = 3,
    ToggleDiff = 4
}
export declare abstract class EditModeStrategy {
    protected readonly _session: Session;
    protected readonly _editor: ICodeEditor;
    protected readonly _zone: InlineChatZoneWidget;
    private readonly _textFileService;
    protected readonly _instaService: IInstantiationService;
    protected static _decoBlock: ModelDecorationOptions;
    protected readonly _store: DisposableStore;
    protected readonly _onDidAccept: Emitter<void>;
    protected readonly _onDidDiscard: Emitter<void>;
    readonly onDidAccept: Event<void>;
    readonly onDidDiscard: Event<void>;
    constructor(_session: Session, _editor: ICodeEditor, _zone: InlineChatZoneWidget, _textFileService: ITextFileService, _instaService: IInstantiationService);
    dispose(): void;
    performHunkAction(_hunk: HunkInformation | undefined, action: HunkAction): void;
    protected _doApplyChanges(ignoreLocal: boolean): Promise<void>;
    abstract apply(): Promise<void>;
    cancel(): IValidEditOperation[];
    abstract makeProgressiveChanges(edits: ISingleEditOperation[], obs: IEditObserver, timings: ProgressingEditsOptions, undoStopBefore: boolean): Promise<void>;
    abstract makeChanges(edits: ISingleEditOperation[], obs: IEditObserver, undoStopBefore: boolean): Promise<void>;
    abstract renderChanges(): Promise<Position | undefined>;
    abstract hasFocus(): boolean;
    getWholeRangeDecoration(): IModelDeltaDecoration[];
}
export declare class PreviewStrategy extends EditModeStrategy {
    private readonly _ctxDocumentChanged;
    constructor(session: Session, editor: ICodeEditor, zone: InlineChatZoneWidget, modelService: IModelService, contextKeyService: IContextKeyService, textFileService: ITextFileService, instaService: IInstantiationService);
    dispose(): void;
    apply(): Promise<void>;
    makeChanges(): Promise<void>;
    makeProgressiveChanges(): Promise<void>;
    renderChanges(): Promise<undefined>;
    hasFocus(): boolean;
}
export interface ProgressingEditsOptions {
    duration: number;
    token: CancellationToken;
}
export declare class LiveStrategy extends EditModeStrategy {
    private readonly _showOverlayToolbar;
    protected readonly _editorWorkerService: IEditorWorkerService;
    private readonly _accessibilityService;
    private readonly _configService;
    private readonly _menuService;
    private readonly _contextService;
    private readonly _decoInsertedText;
    private readonly _decoInsertedTextRange;
    private readonly _ctxCurrentChangeHasDiff;
    private readonly _ctxCurrentChangeShowsDiff;
    private readonly _progressiveEditingDecorations;
    private readonly _lensActionsFactory;
    private _editCount;
    constructor(session: Session, editor: ICodeEditor, zone: InlineChatZoneWidget, _showOverlayToolbar: boolean, contextKeyService: IContextKeyService, _editorWorkerService: IEditorWorkerService, _accessibilityService: IAccessibilityService, _configService: IConfigurationService, _menuService: IMenuService, _contextService: IContextKeyService, textFileService: ITextFileService, instaService: IInstantiationService);
    dispose(): void;
    private _resetDiff;
    apply(): Promise<void>;
    cancel(): IValidEditOperation[];
    makeChanges(edits: ISingleEditOperation[], obs: IEditObserver, undoStopBefore: boolean): Promise<void>;
    makeProgressiveChanges(edits: ISingleEditOperation[], obs: IEditObserver, opts: ProgressingEditsOptions, undoStopBefore: boolean): Promise<void>;
    private _makeChanges;
    performHunkAction(hunk: HunkInformation | undefined, action: HunkAction): void;
    private _findDisplayData;
    private readonly _hunkDisplayData;
    renderChanges(): Promise<Position | undefined>;
    hasFocus(): boolean;
    getWholeRangeDecoration(): IModelDeltaDecoration[];
}
