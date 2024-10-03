var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { DeferredPromise } from '../../../../base/common/async.js';
import { CancellationToken, CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { toErrorMessage } from '../../../../base/common/errorMessage.js';
import { ErrorNoTelemetry } from '../../../../base/common/errors.js';
import { Emitter } from '../../../../base/common/event.js';
import { MarkdownString } from '../../../../base/common/htmlContent.js';
import { Iterable } from '../../../../base/common/iterator.js';
import { Disposable, DisposableMap } from '../../../../base/common/lifecycle.js';
import { revive } from '../../../../base/common/marshalling.js';
import { StopWatch } from '../../../../base/common/stopwatch.js';
import { URI } from '../../../../base/common/uri.js';
import { localize } from '../../../../nls.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { Progress } from '../../../../platform/progress/common/progress.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IWorkbenchAssignmentService } from '../../../services/assignment/common/assignmentService.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { ChatAgentLocation, IChatAgentService } from './chatAgents.js';
import { ChatModel, ChatRequestModel, normalizeSerializableChatData, toChatHistoryContent, updateRanges } from './chatModel.js';
import { ChatRequestAgentPart, ChatRequestAgentSubcommandPart, ChatRequestSlashCommandPart, chatAgentLeader, chatSubcommandLeader, getPromptText } from './chatParserTypes.js';
import { ChatRequestParser } from './chatRequestParser.js';
import { ChatServiceTelemetry } from './chatServiceTelemetry.js';
import { IChatSlashCommandService } from './chatSlashCommands.js';
import { IChatVariablesService } from './chatVariables.js';
const serializedChatKey = 'interactive.sessions';
const globalChatKey = 'chat.workspaceTransfer';
const SESSION_TRANSFER_EXPIRATION_IN_MILLISECONDS = 1000 * 60;
const maxPersistedSessions = 25;
class CancellableRequest {
    constructor(cancellationTokenSource, requestId) {
        this.cancellationTokenSource = cancellationTokenSource;
        this.requestId = requestId;
    }
    dispose() {
        this.cancellationTokenSource.dispose();
    }
    cancel() {
        this.cancellationTokenSource.cancel();
    }
}
let ChatService = class ChatService extends Disposable {
    get transferredSessionData() {
        return this._transferredSessionData;
    }
    constructor(storageService, logService, extensionService, instantiationService, telemetryService, workspaceContextService, chatSlashCommandService, chatVariablesService, chatAgentService, workbenchAssignmentService, contextKeyService, configurationService) {
        super();
        this.storageService = storageService;
        this.logService = logService;
        this.extensionService = extensionService;
        this.instantiationService = instantiationService;
        this.telemetryService = telemetryService;
        this.workspaceContextService = workspaceContextService;
        this.chatSlashCommandService = chatSlashCommandService;
        this.chatVariablesService = chatVariablesService;
        this.chatAgentService = chatAgentService;
        this.configurationService = configurationService;
        this._sessionModels = this._register(new DisposableMap());
        this._pendingRequests = this._register(new DisposableMap());
        this._deletedChatIds = new Set();
        this._onDidPerformUserAction = this._register(new Emitter());
        this.onDidPerformUserAction = this._onDidPerformUserAction.event;
        this._onDidDisposeSession = this._register(new Emitter());
        this.onDidDisposeSession = this._onDidDisposeSession.event;
        this._sessionFollowupCancelTokens = this._register(new DisposableMap());
        this._chatServiceTelemetry = this.instantiationService.createInstance(ChatServiceTelemetry);
        const isEmptyWindow = !workspaceContextService.getWorkspace().folders.length;
        const sessionData = storageService.get(serializedChatKey, isEmptyWindow ? -1 : 1, '');
        if (sessionData) {
            this._persistedSessions = this.deserializeChats(sessionData);
            const countsForLog = Object.keys(this._persistedSessions).length;
            if (countsForLog > 0) {
                this.trace('constructor', `Restored ${countsForLog} persisted sessions`);
            }
        }
        else {
            this._persistedSessions = {};
        }
        const transferredData = this.getTransferredSessionData();
        const transferredChat = transferredData?.chat;
        if (transferredChat) {
            this.trace('constructor', `Transferred session ${transferredChat.sessionId}`);
            this._persistedSessions[transferredChat.sessionId] = transferredChat;
            this._transferredSessionData = { sessionId: transferredChat.sessionId, inputValue: transferredData.inputValue };
        }
        this._register(storageService.onWillSaveState(() => this.saveState()));
    }
    isEnabled(location) {
        return this.chatAgentService.getContributedDefaultAgent(location) !== undefined;
    }
    saveState() {
        const liveChats = Array.from(this._sessionModels.values())
            .filter(session => session.initialLocation === ChatAgentLocation.Panel)
            .filter(session => session.getRequests().length > 0);
        const isEmptyWindow = !this.workspaceContextService.getWorkspace().folders.length;
        if (isEmptyWindow) {
            this.syncEmptyWindowChats(liveChats);
        }
        else {
            let allSessions = liveChats;
            allSessions = allSessions.concat(Object.values(this._persistedSessions)
                .filter(session => !this._sessionModels.has(session.sessionId))
                .filter(session => session.requests.length));
            allSessions.sort((a, b) => (b.creationDate ?? 0) - (a.creationDate ?? 0));
            allSessions = allSessions.slice(0, maxPersistedSessions);
            if (allSessions.length) {
                this.trace('onWillSaveState', `Persisting ${allSessions.length} sessions`);
            }
            const serialized = JSON.stringify(allSessions);
            if (allSessions.length) {
                this.trace('onWillSaveState', `Persisting ${serialized.length} chars`);
            }
            this.storageService.store(serializedChatKey, serialized, 1, 1);
        }
        this._deletedChatIds.clear();
    }
    syncEmptyWindowChats(thisWindowChats) {
        const sessionData = this.storageService.get(serializedChatKey, -1, '');
        const originalPersistedSessions = this._persistedSessions;
        let persistedSessions;
        if (sessionData) {
            persistedSessions = this.deserializeChats(sessionData);
            const countsForLog = Object.keys(persistedSessions).length;
            if (countsForLog > 0) {
                this.trace('constructor', `Restored ${countsForLog} persisted sessions`);
            }
        }
        else {
            persistedSessions = {};
        }
        this._deletedChatIds.forEach(id => delete persistedSessions[id]);
        Object.values(originalPersistedSessions).forEach(session => {
            const persistedSession = persistedSessions[session.sessionId];
            if (persistedSession && session.requests.length > persistedSession.requests.length) {
                persistedSessions[session.sessionId] = session;
            }
            else if (!persistedSession && session.isNew) {
                session.isNew = false;
                persistedSessions[session.sessionId] = session;
            }
        });
        this._persistedSessions = persistedSessions;
        const allSessions = { ...this._persistedSessions };
        for (const chat of thisWindowChats) {
            allSessions[chat.sessionId] = chat;
        }
        let sessionsList = Object.values(allSessions);
        sessionsList.sort((a, b) => (b.creationDate ?? 0) - (a.creationDate ?? 0));
        sessionsList = sessionsList.slice(0, maxPersistedSessions);
        const data = JSON.stringify(sessionsList);
        this.storageService.store(serializedChatKey, data, -1, 1);
    }
    notifyUserAction(action) {
        this._chatServiceTelemetry.notifyUserAction(action);
        this._onDidPerformUserAction.fire(action);
    }
    setChatSessionTitle(sessionId, title) {
        const model = this._sessionModels.get(sessionId);
        if (model) {
            model.setCustomTitle(title);
            return;
        }
        const session = this._persistedSessions[sessionId];
        if (session) {
            session.customTitle = title;
        }
    }
    trace(method, message) {
        if (message) {
            this.logService.trace(`ChatService#${method}: ${message}`);
        }
        else {
            this.logService.trace(`ChatService#${method}`);
        }
    }
    error(method, message) {
        this.logService.error(`ChatService#${method} ${message}`);
    }
    deserializeChats(sessionData) {
        try {
            const arrayOfSessions = revive(JSON.parse(sessionData));
            if (!Array.isArray(arrayOfSessions)) {
                throw new Error('Expected array');
            }
            const sessions = arrayOfSessions.reduce((acc, session) => {
                for (const request of session.requests) {
                    if (Array.isArray(request.response)) {
                        request.response = request.response.map((response) => {
                            if (typeof response === 'string') {
                                return new MarkdownString(response);
                            }
                            return response;
                        });
                    }
                    else if (typeof request.response === 'string') {
                        request.response = [new MarkdownString(request.response)];
                    }
                }
                acc[session.sessionId] = normalizeSerializableChatData(session);
                return acc;
            }, {});
            return sessions;
        }
        catch (err) {
            this.error('deserializeChats', `Malformed session data: ${err}. [${sessionData.substring(0, 20)}${sessionData.length > 20 ? '...' : ''}]`);
            return {};
        }
    }
    getTransferredSessionData() {
        const data = this.storageService.getObject(globalChatKey, 0, []);
        const workspaceUri = this.workspaceContextService.getWorkspace().folders[0]?.uri;
        if (!workspaceUri) {
            return;
        }
        const thisWorkspace = workspaceUri.toString();
        const currentTime = Date.now();
        const transferred = data.find(item => URI.revive(item.toWorkspace).toString() === thisWorkspace && (currentTime - item.timestampInMilliseconds < SESSION_TRANSFER_EXPIRATION_IN_MILLISECONDS));
        const filtered = data.filter(item => URI.revive(item.toWorkspace).toString() !== thisWorkspace && (currentTime - item.timestampInMilliseconds < SESSION_TRANSFER_EXPIRATION_IN_MILLISECONDS));
        this.storageService.store(globalChatKey, JSON.stringify(filtered), 0, 1);
        return transferred;
    }
    getHistory() {
        const persistedSessions = Object.values(this._persistedSessions)
            .filter(session => session.requests.length > 0)
            .filter(session => !this._sessionModels.has(session.sessionId));
        const persistedSessionItems = persistedSessions
            .filter(session => !session.isImported)
            .map(session => {
            const title = session.customTitle ?? ChatModel.getDefaultTitle(session.requests);
            return {
                sessionId: session.sessionId,
                title,
                lastMessageDate: session.lastMessageDate,
                isActive: false,
            };
        });
        const liveSessionItems = Array.from(this._sessionModels.values())
            .filter(session => !session.isImported)
            .map(session => {
            const title = session.title || localize('newChat', "New Chat");
            return {
                sessionId: session.sessionId,
                title,
                lastMessageDate: session.lastMessageDate,
                isActive: true,
            };
        });
        return [...liveSessionItems, ...persistedSessionItems];
    }
    removeHistoryEntry(sessionId) {
        if (this._persistedSessions[sessionId]) {
            this._deletedChatIds.add(sessionId);
            delete this._persistedSessions[sessionId];
            this.saveState();
        }
    }
    clearAllHistoryEntries() {
        Object.values(this._persistedSessions).forEach(session => this._deletedChatIds.add(session.sessionId));
        this._persistedSessions = {};
        this.saveState();
    }
    startSession(location, token) {
        this.trace('startSession');
        return this._startSession(undefined, location, token);
    }
    _startSession(someSessionHistory, location, token) {
        const model = this.instantiationService.createInstance(ChatModel, someSessionHistory, location);
        this._sessionModels.set(model.sessionId, model);
        this.initializeSession(model, token);
        return model;
    }
    async initializeSession(model, token) {
        try {
            this.trace('initializeSession', `Initialize session ${model.sessionId}`);
            model.startInitialize();
            await this.extensionService.whenInstalledExtensionsRegistered();
            const defaultAgentData = this.chatAgentService.getContributedDefaultAgent(model.initialLocation) ?? this.chatAgentService.getContributedDefaultAgent(ChatAgentLocation.Panel);
            if (!defaultAgentData) {
                throw new ErrorNoTelemetry('No default agent contributed');
            }
            await this.extensionService.activateByEvent(`onChatParticipant:${defaultAgentData.id}`);
            const defaultAgent = this.chatAgentService.getActivatedAgents().find(agent => agent.id === defaultAgentData.id);
            if (!defaultAgent) {
                throw new ErrorNoTelemetry('No default agent registered');
            }
            const welcomeMessage = await defaultAgent.provideWelcomeMessage?.(token) ?? undefined;
            const sampleQuestions = await defaultAgent.provideSampleQuestions?.(model.initialLocation, token) ?? undefined;
            model.initialize(welcomeMessage, sampleQuestions);
        }
        catch (err) {
            this.trace('startSession', `initializeSession failed: ${err}`);
            model.setInitializationError(err);
            this._sessionModels.deleteAndDispose(model.sessionId);
            this._onDidDisposeSession.fire({ sessionId: model.sessionId, reason: 'initializationFailed' });
        }
    }
    getSession(sessionId) {
        return this._sessionModels.get(sessionId);
    }
    getOrRestoreSession(sessionId) {
        this.trace('getOrRestoreSession', `sessionId: ${sessionId}`);
        const model = this._sessionModels.get(sessionId);
        if (model) {
            return model;
        }
        const sessionData = revive(this._persistedSessions[sessionId]);
        if (!sessionData) {
            return undefined;
        }
        if (sessionId === this.transferredSessionData?.sessionId) {
            this._transferredSessionData = undefined;
        }
        return this._startSession(sessionData, sessionData.initialLocation ?? ChatAgentLocation.Panel, CancellationToken.None);
    }
    loadSessionFromContent(data) {
        return this._startSession(data, data.initialLocation ?? ChatAgentLocation.Panel, CancellationToken.None);
    }
    async resendRequest(request, options) {
        const model = this._sessionModels.get(request.session.sessionId);
        if (!model && model !== request.session) {
            throw new Error(`Unknown session: ${request.session.sessionId}`);
        }
        await model.waitForInitialization();
        const cts = this._pendingRequests.get(request.session.sessionId);
        if (cts) {
            this.trace('resendRequest', `Session ${request.session.sessionId} already has a pending request, cancelling...`);
            cts.cancel();
        }
        const location = options?.location ?? model.initialLocation;
        const attempt = options?.attempt ?? 0;
        const enableCommandDetection = !options?.noCommandDetection;
        const defaultAgent = this.chatAgentService.getDefaultAgent(location);
        model.removeRequest(request.id, 1);
        const resendOptions = {
            ...options,
            locationData: request.locationData,
            attachedContext: request.attachedContext,
        };
        await this._sendRequestAsync(model, model.sessionId, request.message, attempt, enableCommandDetection, defaultAgent, location, resendOptions).responseCompletePromise;
    }
    async sendRequest(sessionId, request, options) {
        this.trace('sendRequest', `sessionId: ${sessionId}, message: ${request.substring(0, 20)}${request.length > 20 ? '[...]' : ''}}`);
        if (!request.trim() && !options?.slashCommand && !options?.agentId) {
            this.trace('sendRequest', 'Rejected empty message');
            return;
        }
        const model = this._sessionModels.get(sessionId);
        if (!model) {
            throw new Error(`Unknown session: ${sessionId}`);
        }
        await model.waitForInitialization();
        if (this._pendingRequests.has(sessionId)) {
            this.trace('sendRequest', `Session ${sessionId} already has a pending request`);
            return;
        }
        const location = options?.location ?? model.initialLocation;
        const attempt = options?.attempt ?? 0;
        const defaultAgent = this.chatAgentService.getDefaultAgent(location);
        const parsedRequest = this.parseChatRequest(sessionId, request, location, options);
        const agent = parsedRequest.parts.find((r) => r instanceof ChatRequestAgentPart)?.agent ?? defaultAgent;
        const agentSlashCommandPart = parsedRequest.parts.find((r) => r instanceof ChatRequestAgentSubcommandPart);
        return {
            ...this._sendRequestAsync(model, sessionId, parsedRequest, attempt, !options?.noCommandDetection, defaultAgent, location, options),
            agent,
            slashCommand: agentSlashCommandPart?.command,
        };
    }
    parseChatRequest(sessionId, request, location, options) {
        let parserContext = options?.parserContext;
        if (options?.agentId) {
            const agent = this.chatAgentService.getAgent(options.agentId);
            if (!agent) {
                throw new Error(`Unknown agent: ${options.agentId}`);
            }
            parserContext = { selectedAgent: agent };
            const commandPart = options.slashCommand ? ` ${chatSubcommandLeader}${options.slashCommand}` : '';
            request = `${chatAgentLeader}${agent.name}${commandPart} ${request}`;
        }
        const parsedRequest = this.instantiationService.createInstance(ChatRequestParser).parseChatRequest(sessionId, request, location, parserContext);
        return parsedRequest;
    }
    refreshFollowupsCancellationToken(sessionId) {
        this._sessionFollowupCancelTokens.get(sessionId)?.cancel();
        const newTokenSource = new CancellationTokenSource();
        this._sessionFollowupCancelTokens.set(sessionId, newTokenSource);
        return newTokenSource.token;
    }
    _sendRequestAsync(model, sessionId, parsedRequest, attempt, enableCommandDetection, defaultAgent, location, options) {
        const followupsCancelToken = this.refreshFollowupsCancellationToken(sessionId);
        let request;
        const agentPart = 'kind' in parsedRequest ? undefined : parsedRequest.parts.find((r) => r instanceof ChatRequestAgentPart);
        const agentSlashCommandPart = 'kind' in parsedRequest ? undefined : parsedRequest.parts.find((r) => r instanceof ChatRequestAgentSubcommandPart);
        const commandPart = 'kind' in parsedRequest ? undefined : parsedRequest.parts.find((r) => r instanceof ChatRequestSlashCommandPart);
        const requests = [...model.getRequests()];
        let gotProgress = false;
        const requestType = commandPart ? 'slashCommand' : 'string';
        const responseCreated = new DeferredPromise();
        let responseCreatedComplete = false;
        function completeResponseCreated() {
            if (!responseCreatedComplete && request?.response) {
                responseCreated.complete(request.response);
                responseCreatedComplete = true;
            }
        }
        const source = new CancellationTokenSource();
        const token = source.token;
        const sendRequestInternal = async () => {
            const progressCallback = (progress) => {
                if (token.isCancellationRequested) {
                    return;
                }
                gotProgress = true;
                if (progress.kind === 'markdownContent') {
                    this.trace('sendRequest', `Provider returned progress for session ${model.sessionId}, ${progress.content.value.length} chars`);
                }
                else {
                    this.trace('sendRequest', `Provider returned progress: ${JSON.stringify(progress)}`);
                }
                model.acceptResponseProgress(request, progress);
                completeResponseCreated();
            };
            let detectedAgent;
            let detectedCommand;
            const stopWatch = new StopWatch(false);
            const listener = token.onCancellationRequested(() => {
                this.trace('sendRequest', `Request for session ${model.sessionId} was cancelled`);
                this.telemetryService.publicLog2('interactiveSessionProviderInvoked', {
                    timeToFirstProgress: undefined,
                    totalTime: stopWatch.elapsed(),
                    result: 'cancelled',
                    requestType,
                    agent: agentPart?.agent.id ?? '',
                    agentExtensionId: agentPart?.agent.extensionId.value ?? '',
                    slashCommand: agentSlashCommandPart ? agentSlashCommandPart.command.name : commandPart?.slashCommand.command,
                    chatSessionId: model.sessionId,
                    location,
                    citations: request?.response?.codeCitations.length ?? 0,
                    numCodeBlocks: getCodeBlocks(request.response?.response.toString() ?? '').length,
                    isParticipantDetected: !!detectedAgent,
                    enableCommandDetection
                });
                model.cancelRequest(request);
            });
            try {
                let rawResult;
                let agentOrCommandFollowups = undefined;
                let chatTitlePromise;
                if (agentPart || (defaultAgent && !commandPart)) {
                    const prepareChatAgentRequest = async (agent, command, enableCommandDetection, chatRequest, isParticipantDetected) => {
                        const initVariableData = { variables: [] };
                        request = chatRequest ?? model.addRequest(parsedRequest, initVariableData, attempt, agent, command, options?.confirmation, options?.locationData, options?.attachedContext);
                        const variableData = await this.chatVariablesService.resolveVariables(parsedRequest, request.attachedContext, model, progressCallback, token);
                        model.updateRequest(request, variableData);
                        const promptTextResult = getPromptText(request.message);
                        const updatedVariableData = updateRanges(variableData, promptTextResult.diff);
                        return {
                            sessionId,
                            requestId: request.id,
                            agentId: agent.id,
                            message: promptTextResult.message,
                            command: command?.name,
                            variables: updatedVariableData,
                            enableCommandDetection,
                            isParticipantDetected,
                            attempt,
                            location,
                            locationData: request.locationData,
                            acceptedConfirmationData: options?.acceptedConfirmationData,
                            rejectedConfirmationData: options?.rejectedConfirmationData,
                            userSelectedModelId: options?.userSelectedModelId
                        };
                    };
                    if (this.configurationService.getValue('chat.experimental.detectParticipant.enabled') !== false && this.chatAgentService.hasChatParticipantDetectionProviders() && !agentPart && !commandPart && enableCommandDetection) {
                        const defaultAgentHistory = this.getHistoryEntriesFromModel(requests, model.sessionId, location, defaultAgent.id);
                        const chatAgentRequest = await prepareChatAgentRequest(defaultAgent, agentSlashCommandPart?.command, enableCommandDetection, undefined, false);
                        const result = await this.chatAgentService.detectAgentOrCommand(chatAgentRequest, defaultAgentHistory, { location }, token);
                        if (result && this.chatAgentService.getAgent(result.agent.id)?.locations?.includes(location)) {
                            request.response?.setAgent(result.agent, result.command);
                            detectedAgent = result.agent;
                            detectedCommand = result.command;
                        }
                    }
                    const agent = (detectedAgent ?? agentPart?.agent ?? defaultAgent);
                    const command = detectedCommand ?? agentSlashCommandPart?.command;
                    await this.extensionService.activateByEvent(`onChatParticipant:${agent.id}`);
                    const history = this.getHistoryEntriesFromModel(requests, model.sessionId, location, agent.id);
                    const requestProps = await prepareChatAgentRequest(agent, command, enableCommandDetection, request, !!detectedAgent);
                    const pendingRequest = this._pendingRequests.get(sessionId);
                    if (pendingRequest && !pendingRequest.requestId) {
                        pendingRequest.requestId = requestProps.requestId;
                    }
                    completeResponseCreated();
                    const agentResult = await this.chatAgentService.invokeAgent(agent.id, requestProps, progressCallback, history, token);
                    rawResult = agentResult;
                    agentOrCommandFollowups = this.chatAgentService.getFollowups(agent.id, requestProps, agentResult, history, followupsCancelToken);
                    chatTitlePromise = model.getRequests().length === 1 && !model.customTitle ? this.chatAgentService.getChatTitle(defaultAgent.id, this.getHistoryEntriesFromModel(model.getRequests(), model.sessionId, location, agent.id), CancellationToken.None) : undefined;
                }
                else if (commandPart && this.chatSlashCommandService.hasCommand(commandPart.slashCommand.command)) {
                    request = model.addRequest(parsedRequest, { variables: [] }, attempt);
                    completeResponseCreated();
                    const history = [];
                    for (const request of model.getRequests()) {
                        if (!request.response) {
                            continue;
                        }
                        history.push({ role: 1, content: [{ type: 'text', value: request.message.text }] });
                        history.push({ role: 2, content: [{ type: 'text', value: request.response.response.toString() }] });
                    }
                    const message = parsedRequest.text;
                    const commandResult = await this.chatSlashCommandService.executeCommand(commandPart.slashCommand.command, message.substring(commandPart.slashCommand.command.length + 1).trimStart(), new Progress(p => {
                        progressCallback(p);
                    }), history, location, token);
                    agentOrCommandFollowups = Promise.resolve(commandResult?.followUp);
                    rawResult = {};
                }
                else {
                    throw new Error(`Cannot handle request`);
                }
                if (token.isCancellationRequested) {
                    return;
                }
                else {
                    if (!rawResult) {
                        this.trace('sendRequest', `Provider returned no response for session ${model.sessionId}`);
                        rawResult = { errorDetails: { message: localize('emptyResponse', "Provider returned null response") } };
                    }
                    const result = rawResult.errorDetails?.responseIsFiltered ? 'filtered' :
                        rawResult.errorDetails && gotProgress ? 'errorWithOutput' :
                            rawResult.errorDetails ? 'error' :
                                'success';
                    const commandForTelemetry = agentSlashCommandPart ? agentSlashCommandPart.command.name : commandPart?.slashCommand.command;
                    this.telemetryService.publicLog2('interactiveSessionProviderInvoked', {
                        timeToFirstProgress: rawResult.timings?.firstProgress,
                        totalTime: rawResult.timings?.totalElapsed,
                        result,
                        requestType,
                        agent: agentPart?.agent.id ?? '',
                        agentExtensionId: agentPart?.agent.extensionId.value ?? '',
                        slashCommand: commandForTelemetry,
                        chatSessionId: model.sessionId,
                        enableCommandDetection,
                        isParticipantDetected: !!detectedAgent,
                        location,
                        citations: request.response?.codeCitations.length ?? 0,
                        numCodeBlocks: getCodeBlocks(request.response?.response.toString() ?? '').length
                    });
                    model.setResponse(request, rawResult);
                    completeResponseCreated();
                    this.trace('sendRequest', `Provider returned response for session ${model.sessionId}`);
                    model.completeResponse(request);
                    if (agentOrCommandFollowups) {
                        agentOrCommandFollowups.then(followups => {
                            model.setFollowups(request, followups);
                            this._chatServiceTelemetry.retrievedFollowups(agentPart?.agent.id ?? '', commandForTelemetry, followups?.length ?? 0);
                        });
                    }
                    chatTitlePromise?.then(title => {
                        if (title) {
                            model.setCustomTitle(title);
                        }
                    });
                }
            }
            catch (err) {
                const result = 'error';
                this.telemetryService.publicLog2('interactiveSessionProviderInvoked', {
                    timeToFirstProgress: undefined,
                    totalTime: undefined,
                    result,
                    requestType,
                    agent: agentPart?.agent.id ?? '',
                    agentExtensionId: agentPart?.agent.extensionId.value ?? '',
                    slashCommand: agentSlashCommandPart ? agentSlashCommandPart.command.name : commandPart?.slashCommand.command,
                    chatSessionId: model.sessionId,
                    location,
                    citations: 0,
                    numCodeBlocks: 0,
                    enableCommandDetection,
                    isParticipantDetected: !!detectedAgent
                });
                this.logService.error(`Error while handling chat request: ${toErrorMessage(err, true)}`);
                if (request) {
                    const rawResult = { errorDetails: { message: err.message } };
                    model.setResponse(request, rawResult);
                    completeResponseCreated();
                    model.completeResponse(request);
                }
            }
            finally {
                listener.dispose();
            }
        };
        const rawResponsePromise = sendRequestInternal();
        this._pendingRequests.set(model.sessionId, new CancellableRequest(source));
        rawResponsePromise.finally(() => {
            this._pendingRequests.deleteAndDispose(model.sessionId);
        });
        return {
            responseCreatedPromise: responseCreated.p,
            responseCompletePromise: rawResponsePromise,
        };
    }
    getHistoryEntriesFromModel(requests, sessionId, location, forAgentId) {
        const history = [];
        for (const request of requests) {
            if (!request.response) {
                continue;
            }
            const defaultAgentId = this.chatAgentService.getDefaultAgent(location)?.id;
            if (forAgentId !== request.response.agent?.id && forAgentId !== defaultAgentId) {
                continue;
            }
            const promptTextResult = getPromptText(request.message);
            const historyRequest = {
                sessionId: sessionId,
                requestId: request.id,
                agentId: request.response.agent?.id ?? '',
                message: promptTextResult.message,
                command: request.response.slashCommand?.name,
                variables: updateRanges(request.variableData, promptTextResult.diff),
                location: ChatAgentLocation.Panel
            };
            history.push({ request: historyRequest, response: toChatHistoryContent(request.response.response.value), result: request.response.result ?? {} });
        }
        return history;
    }
    async removeRequest(sessionId, requestId) {
        const model = this._sessionModels.get(sessionId);
        if (!model) {
            throw new Error(`Unknown session: ${sessionId}`);
        }
        await model.waitForInitialization();
        const pendingRequest = this._pendingRequests.get(sessionId);
        if (pendingRequest?.requestId === requestId) {
            pendingRequest.cancel();
            this._pendingRequests.deleteAndDispose(sessionId);
        }
        model.removeRequest(requestId);
    }
    async adoptRequest(sessionId, request) {
        if (!(request instanceof ChatRequestModel)) {
            throw new TypeError('Can only adopt requests of type ChatRequestModel');
        }
        const target = this._sessionModels.get(sessionId);
        if (!target) {
            throw new Error(`Unknown session: ${sessionId}`);
        }
        await target.waitForInitialization();
        const oldOwner = request.session;
        target.adoptRequest(request);
        if (request.response && !request.response.isComplete) {
            const cts = this._pendingRequests.deleteAndLeak(oldOwner.sessionId);
            if (cts) {
                cts.requestId = request.id;
                this._pendingRequests.set(target.sessionId, cts);
            }
        }
    }
    async addCompleteRequest(sessionId, message, variableData, attempt, response) {
        this.trace('addCompleteRequest', `message: ${message}`);
        const model = this._sessionModels.get(sessionId);
        if (!model) {
            throw new Error(`Unknown session: ${sessionId}`);
        }
        await model.waitForInitialization();
        const parsedRequest = typeof message === 'string' ?
            this.instantiationService.createInstance(ChatRequestParser).parseChatRequest(sessionId, message) :
            message;
        const request = model.addRequest(parsedRequest, variableData || { variables: [] }, attempt ?? 0);
        if (typeof response.message === 'string') {
            model.acceptResponseProgress(request, { content: new MarkdownString(response.message), kind: 'markdownContent' });
        }
        else {
            for (const part of response.message) {
                model.acceptResponseProgress(request, part, true);
            }
        }
        model.setResponse(request, response.result || {});
        if (response.followups !== undefined) {
            model.setFollowups(request, response.followups);
        }
        model.completeResponse(request);
    }
    cancelCurrentRequestForSession(sessionId) {
        this.trace('cancelCurrentRequestForSession', `sessionId: ${sessionId}`);
        this._pendingRequests.get(sessionId)?.cancel();
        this._pendingRequests.deleteAndDispose(sessionId);
    }
    clearSession(sessionId) {
        this.trace('clearSession', `sessionId: ${sessionId}`);
        const model = this._sessionModels.get(sessionId);
        if (!model) {
            throw new Error(`Unknown session: ${sessionId}`);
        }
        if (model.initialLocation === ChatAgentLocation.Panel) {
            const sessionData = JSON.parse(JSON.stringify(model));
            sessionData.isNew = true;
            this._persistedSessions[sessionId] = sessionData;
        }
        this._sessionModels.deleteAndDispose(sessionId);
        this._pendingRequests.get(sessionId)?.cancel();
        this._pendingRequests.deleteAndDispose(sessionId);
        this._onDidDisposeSession.fire({ sessionId, reason: 'cleared' });
    }
    hasSessions() {
        return !!Object.values(this._persistedSessions);
    }
    transferChatSession(transferredSessionData, toWorkspace) {
        const model = Iterable.find(this._sessionModels.values(), model => model.sessionId === transferredSessionData.sessionId);
        if (!model) {
            throw new Error(`Failed to transfer session. Unknown session ID: ${transferredSessionData.sessionId}`);
        }
        const existingRaw = this.storageService.getObject(globalChatKey, 0, []);
        existingRaw.push({
            chat: model.toJSON(),
            timestampInMilliseconds: Date.now(),
            toWorkspace: toWorkspace,
            inputValue: transferredSessionData.inputValue,
        });
        this.storageService.store(globalChatKey, JSON.stringify(existingRaw), 0, 1);
        this.trace('transferChatSession', `Transferred session ${model.sessionId} to workspace ${toWorkspace.toString()}`);
    }
};
ChatService = __decorate([
    __param(0, IStorageService),
    __param(1, ILogService),
    __param(2, IExtensionService),
    __param(3, IInstantiationService),
    __param(4, ITelemetryService),
    __param(5, IWorkspaceContextService),
    __param(6, IChatSlashCommandService),
    __param(7, IChatVariablesService),
    __param(8, IChatAgentService),
    __param(9, IWorkbenchAssignmentService),
    __param(10, IContextKeyService),
    __param(11, IConfigurationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], ChatService);
export { ChatService };
function getCodeBlocks(text) {
    const lines = text.split('\n');
    const codeBlockLanguages = [];
    let codeBlockState;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (codeBlockState) {
            if (new RegExp(`^\\s*${codeBlockState.delimiter}\\s*$`).test(line)) {
                codeBlockLanguages.push(codeBlockState.languageId);
                codeBlockState = undefined;
            }
        }
        else {
            const match = line.match(/^(\s*)(`{3,}|~{3,})(\w*)/);
            if (match) {
                codeBlockState = { delimiter: match[2], languageId: match[3] };
            }
        }
    }
    return codeBlockLanguages;
}
