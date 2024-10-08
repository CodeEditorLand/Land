import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IWorkbenchAssignmentService } from '../../../services/assignment/common/assignmentService.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { ChatAgentLocation, IChatAgentService } from './chatAgents.js';
import { ChatModel, IChatModel, IChatRequestModel, IChatRequestVariableData, IExportableChatData, ISerializableChatData } from './chatModel.js';
import { IParsedChatRequest } from './chatParserTypes.js';
import { IChatCompleteResponse, IChatDetail, IChatSendRequestData, IChatSendRequestOptions, IChatService, IChatTransferredSessionData, IChatUserActionEvent } from './chatService.js';
import { IChatSlashCommandService } from './chatSlashCommands.js';
import { IChatVariablesService } from './chatVariables.js';
export declare class ChatService extends Disposable implements IChatService {
    private readonly storageService;
    private readonly logService;
    private readonly extensionService;
    private readonly instantiationService;
    private readonly telemetryService;
    private readonly workspaceContextService;
    private readonly chatSlashCommandService;
    private readonly chatVariablesService;
    private readonly chatAgentService;
    private readonly configurationService;
    _serviceBrand: undefined;
    private readonly _sessionModels;
    private readonly _pendingRequests;
    private _persistedSessions;
    /** Just for empty windows, need to enforce that a chat was deleted, even though other windows still have it */
    private _deletedChatIds;
    private _transferredSessionData;
    get transferredSessionData(): IChatTransferredSessionData | undefined;
    private readonly _onDidPerformUserAction;
    readonly onDidPerformUserAction: Event<IChatUserActionEvent>;
    private readonly _onDidDisposeSession;
    readonly onDidDisposeSession: Event<{
        sessionId: string;
        reason: "initializationFailed" | "cleared";
    }>;
    private readonly _sessionFollowupCancelTokens;
    private readonly _chatServiceTelemetry;
    constructor(storageService: IStorageService, logService: ILogService, extensionService: IExtensionService, instantiationService: IInstantiationService, telemetryService: ITelemetryService, workspaceContextService: IWorkspaceContextService, chatSlashCommandService: IChatSlashCommandService, chatVariablesService: IChatVariablesService, chatAgentService: IChatAgentService, workbenchAssignmentService: IWorkbenchAssignmentService, contextKeyService: IContextKeyService, configurationService: IConfigurationService);
    isEnabled(location: ChatAgentLocation): boolean;
    private saveState;
    private syncEmptyWindowChats;
    notifyUserAction(action: IChatUserActionEvent): void;
    setChatSessionTitle(sessionId: string, title: string): void;
    private trace;
    private error;
    private deserializeChats;
    private getTransferredSessionData;
    /**
     * Returns an array of chat details for all persisted chat sessions that have at least one request.
     * The array is sorted by creation date in descending order.
     * Chat sessions that have already been loaded into the chat view are excluded from the result.
     * Imported chat sessions are also excluded from the result.
     */
    getHistory(): IChatDetail[];
    removeHistoryEntry(sessionId: string): void;
    clearAllHistoryEntries(): void;
    startSession(location: ChatAgentLocation, token: CancellationToken): ChatModel;
    private _startSession;
    private initializeSession;
    getSession(sessionId: string): IChatModel | undefined;
    getOrRestoreSession(sessionId: string): ChatModel | undefined;
    loadSessionFromContent(data: IExportableChatData | ISerializableChatData): IChatModel | undefined;
    resendRequest(request: IChatRequestModel, options?: IChatSendRequestOptions): Promise<void>;
    sendRequest(sessionId: string, request: string, options?: IChatSendRequestOptions): Promise<IChatSendRequestData | undefined>;
    private parseChatRequest;
    private refreshFollowupsCancellationToken;
    private _sendRequestAsync;
    private getHistoryEntriesFromModel;
    removeRequest(sessionId: string, requestId: string): Promise<void>;
    adoptRequest(sessionId: string, request: IChatRequestModel): Promise<void>;
    addCompleteRequest(sessionId: string, message: IParsedChatRequest | string, variableData: IChatRequestVariableData | undefined, attempt: number | undefined, response: IChatCompleteResponse): Promise<void>;
    cancelCurrentRequestForSession(sessionId: string): void;
    clearSession(sessionId: string): void;
    hasSessions(): boolean;
    transferChatSession(transferredSessionData: IChatTransferredSessionData, toWorkspace: URI): void;
}
