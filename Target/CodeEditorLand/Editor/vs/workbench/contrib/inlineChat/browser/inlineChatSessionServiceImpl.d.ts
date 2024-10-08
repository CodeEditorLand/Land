import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Event } from '../../../../base/common/event.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { IActiveCodeEditor, ICodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { Range } from '../../../../editor/common/core/range.js';
import { IValidEditOperation } from '../../../../editor/common/model.js';
import { IEditorWorkerService } from '../../../../editor/common/services/editorWorker.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { ITextModelService } from '../../../../editor/common/services/resolverService.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IChatAgentService } from '../../chat/common/chatAgents.js';
import { IChatService } from '../../chat/common/chatService.js';
import { EditMode } from '../common/inlineChat.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { Session, StashedSession } from './inlineChatSession.js';
import { IInlineChatSessionEndEvent, IInlineChatSessionEvent, IInlineChatSessionService, ISessionKeyComputer } from './inlineChatSessionService.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { ITextFileService } from '../../../services/textfile/common/textfiles.js';
export declare class InlineChatError extends Error {
    static readonly code = "InlineChatError";
    constructor(message: string);
}
export declare class InlineChatSessionServiceImpl implements IInlineChatSessionService {
    private readonly _telemetryService;
    private readonly _modelService;
    private readonly _textModelService;
    private readonly _editorWorkerService;
    private readonly _logService;
    private readonly _instaService;
    private readonly _editorService;
    private readonly _textFileService;
    private readonly _languageService;
    private readonly _chatService;
    private readonly _chatAgentService;
    _serviceBrand: undefined;
    private readonly _store;
    private readonly _onWillStartSession;
    readonly onWillStartSession: Event<IActiveCodeEditor>;
    private readonly _onDidMoveSession;
    readonly onDidMoveSession: Event<IInlineChatSessionEvent>;
    private readonly _onDidEndSession;
    readonly onDidEndSession: Event<IInlineChatSessionEndEvent>;
    private readonly _onDidStashSession;
    readonly onDidStashSession: Event<IInlineChatSessionEvent>;
    private readonly _sessions;
    private readonly _keyComputers;
    constructor(_telemetryService: ITelemetryService, _modelService: IModelService, _textModelService: ITextModelService, _editorWorkerService: IEditorWorkerService, _logService: ILogService, _instaService: IInstantiationService, _editorService: IEditorService, _textFileService: ITextFileService, _languageService: ILanguageService, _chatService: IChatService, _chatAgentService: IChatAgentService);
    dispose(): void;
    createSession(editor: IActiveCodeEditor, options: {
        editMode: EditMode;
        headless?: boolean;
        wholeRange?: Range;
        session?: Session;
    }, token: CancellationToken): Promise<Session | undefined>;
    moveSession(session: Session, target: ICodeEditor): void;
    releaseSession(session: Session): void;
    private _releaseSession;
    stashSession(session: Session, editor: ICodeEditor, undoCancelEdits: IValidEditOperation[]): StashedSession;
    getCodeEditor(session: Session): ICodeEditor;
    getSession(editor: ICodeEditor, uri: URI): Session | undefined;
    private _key;
    registerSessionKeyComputer(scheme: string, value: ISessionKeyComputer): IDisposable;
}
export declare class InlineChatEnabler {
    static Id: string;
    private readonly _ctxHasProvider;
    private readonly _ctxPossible;
    private readonly _store;
    constructor(contextKeyService: IContextKeyService, chatAgentService: IChatAgentService, editorService: IEditorService);
    dispose(): void;
}
