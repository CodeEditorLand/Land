import { URI } from '../../../../base/common/uri.js';
import { Event } from '../../../../base/common/event.js';
import { ITextModel, IValidEditOperation } from '../../../../editor/common/model.js';
import { EditMode } from '../common/inlineChat.js';
import { IRange, Range } from '../../../../editor/common/core/range.js';
import { DetailedLineRangeMapping, LineRangeMapping } from '../../../../editor/common/diff/rangeMapping.js';
import { IInlineChatSessionService } from './inlineChatSessionService.js';
import { IEditorWorkerService } from '../../../../editor/common/services/editorWorker.js';
import { ICodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { ChatModel, IChatRequestModel, IChatTextEditGroupState } from '../../chat/common/chatModel.js';
import { IChatAgent } from '../../chat/common/chatAgents.js';
import { IDocumentDiff } from '../../../../editor/common/diff/documentDiffProvider.js';
export type TelemetryData = {
    extension: string;
    rounds: string;
    undos: string;
    unstashed: number;
    edits: number;
    finishedByEdit: boolean;
    startTime: string;
    endTime: string;
    editMode: string;
    acceptedHunks: number;
    discardedHunks: number;
    responseTypes: string;
};
export type TelemetryDataClassification = {
    owner: 'jrieken';
    comment: 'Data about an interaction editor session';
    extension: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'The extension providing the data';
    };
    rounds: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'Number of request that were made';
    };
    undos: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'Requests that have been undone';
    };
    edits: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'Did edits happen while the session was active';
    };
    unstashed: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'How often did this session become stashed and resumed';
    };
    finishedByEdit: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'Did edits cause the session to terminate';
    };
    startTime: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'When the session started';
    };
    endTime: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'When the session ended';
    };
    editMode: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'What edit mode was choosen: live, livePreview, preview';
    };
    acceptedHunks: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'Number of accepted hunks';
    };
    discardedHunks: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'Number of discarded hunks';
    };
    responseTypes: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'Comma separated list of response types like edits, message, mixed';
    };
};
export declare class SessionWholeRange {
    private readonly _textModel;
    private static readonly _options;
    private readonly _onDidChange;
    readonly onDidChange: Event<this>;
    private _decorationIds;
    constructor(_textModel: ITextModel, wholeRange: IRange);
    dispose(): void;
    fixup(changes: readonly DetailedLineRangeMapping[]): void;
    get trackedInitialRange(): Range;
    get value(): Range;
}
export declare class Session {
    readonly editMode: EditMode;
    readonly headless: boolean;
    readonly targetUri: URI;
    readonly textModel0: ITextModel;
    readonly textModelN: ITextModel;
    readonly agent: IChatAgent;
    readonly wholeRange: SessionWholeRange;
    readonly hunkData: HunkData;
    readonly chatModel: ChatModel;
    private _isUnstashed;
    private readonly _startTime;
    private readonly _teldata;
    private readonly _versionByRequest;
    constructor(editMode: EditMode, headless: boolean, targetUri: URI, textModel0: ITextModel, textModelN: ITextModel, agent: IChatAgent, wholeRange: SessionWholeRange, hunkData: HunkData, chatModel: ChatModel, versionsByRequest?: [string, number][]);
    get isUnstashed(): boolean;
    markUnstashed(): void;
    markModelVersion(request: IChatRequestModel): void;
    get versionsByRequest(): [string, number][];
    undoChangesUntil(requestId: string): Promise<boolean>;
    get hasChangedText(): boolean;
    asChangedText(changes: readonly LineRangeMapping[]): string | undefined;
    recordExternalEditOccurred(didFinish: boolean): void;
    asTelemetryData(): TelemetryData;
}
export declare class StashedSession {
    private readonly _undoCancelEdits;
    private readonly _sessionService;
    private readonly _logService;
    private readonly _listener;
    private readonly _ctxHasStashedSession;
    private _session;
    constructor(editor: ICodeEditor, session: Session, _undoCancelEdits: IValidEditOperation[], contextKeyService: IContextKeyService, _sessionService: IInlineChatSessionService, _logService: ILogService);
    dispose(): void;
    unstash(): Session | undefined;
}
export declare class HunkData {
    private readonly _editorWorkerService;
    private readonly _textModel0;
    private readonly _textModelN;
    private static readonly _HUNK_TRACKED_RANGE;
    private static readonly _HUNK_THRESHOLD;
    private readonly _store;
    private readonly _data;
    private _ignoreChanges;
    constructor(_editorWorkerService: IEditorWorkerService, _textModel0: ITextModel, _textModelN: ITextModel);
    dispose(): void;
    set ignoreTextModelNChanges(value: boolean);
    get ignoreTextModelNChanges(): boolean;
    private _mirrorChanges;
    recompute(editState: IChatTextEditGroupState, diff?: IDocumentDiff | null): Promise<void>;
    get size(): number;
    get pending(): number;
    private _discardEdits;
    discardAll(): IValidEditOperation[];
    getInfo(): HunkInformation[];
}
export declare const enum HunkState {
    Pending = 0,
    Accepted = 1,
    Rejected = 2
}
export interface HunkInformation {
    getRangesN(): Range[];
    getRanges0(): Range[];
    isInsertion(): boolean;
    discardChanges(): void;
    acceptChanges(): void;
    getState(): HunkState;
}
