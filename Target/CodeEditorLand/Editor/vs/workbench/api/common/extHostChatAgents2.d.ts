import type * as vscode from 'vscode';
import { CancellationToken } from '../../../base/common/cancellation.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { IExtensionDescription } from '../../../platform/extensions/common/extensions.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { ChatAgentLocation, IChatAgentRequest, IChatAgentResult, IChatWelcomeMessageContent } from '../../contrib/chat/common/chatAgents.js';
import { IChatFollowup, IChatUserActionEvent, IChatVoteAction } from '../../contrib/chat/common/chatService.js';
import { Dto } from '../../services/extensions/common/proxyIdentifier.js';
import { ExtHostChatAgentsShape2, IChatAgentCompletionItem, IChatAgentHistoryEntryDto, IMainContext } from './extHost.protocol.js';
import { ExtHostCommands } from './extHostCommands.js';
import { ExtHostDocuments } from './extHostDocuments.js';
import { ExtHostLanguageModels } from './extHostLanguageModels.js';
export declare class ExtHostChatAgents2 extends Disposable implements ExtHostChatAgentsShape2 {
    private readonly _logService;
    private readonly _commands;
    private readonly _documents;
    private readonly _languageModels;
    private static _idPool;
    private readonly _agents;
    private readonly _proxy;
    private static _participantDetectionProviderIdPool;
    private readonly _participantDetectionProviders;
    private readonly _sessionDisposables;
    private readonly _completionDisposables;
    constructor(mainContext: IMainContext, _logService: ILogService, _commands: ExtHostCommands, _documents: ExtHostDocuments, _languageModels: ExtHostLanguageModels);
    transferActiveChat(newWorkspace: vscode.Uri): void;
    createChatAgent(extension: IExtensionDescription, id: string, handler: vscode.ChatExtendedRequestHandler): vscode.ChatParticipant;
    createDynamicChatAgent(extension: IExtensionDescription, id: string, dynamicProps: vscode.DynamicChatParticipantProps, handler: vscode.ChatExtendedRequestHandler): vscode.ChatParticipant;
    registerChatParticipantDetectionProvider(extension: IExtensionDescription, provider: vscode.ChatParticipantDetectionProvider): vscode.Disposable;
    $detectChatParticipant(handle: number, requestDto: Dto<IChatAgentRequest>, context: {
        history: IChatAgentHistoryEntryDto[];
    }, options: {
        location: ChatAgentLocation;
        participants?: vscode.ChatParticipantMetadata[];
    }, token: CancellationToken): Promise<vscode.ChatParticipantDetectionResult | null | undefined>;
    private _createRequest;
    $invokeAgent(handle: number, requestDto: Dto<IChatAgentRequest>, context: {
        history: IChatAgentHistoryEntryDto[];
    }, token: CancellationToken): Promise<IChatAgentResult | undefined>;
    private prepareHistoryTurns;
    $releaseSession(sessionId: string): void;
    $provideFollowups(requestDto: Dto<IChatAgentRequest>, handle: number, result: IChatAgentResult, context: {
        history: IChatAgentHistoryEntryDto[];
    }, token: CancellationToken): Promise<IChatFollowup[]>;
    $acceptFeedback(handle: number, result: IChatAgentResult, voteAction: IChatVoteAction): void;
    $acceptAction(handle: number, result: IChatAgentResult, event: IChatUserActionEvent): void;
    $invokeCompletionProvider(handle: number, query: string, token: CancellationToken): Promise<IChatAgentCompletionItem[]>;
    $provideWelcomeMessage(handle: number, token: CancellationToken): Promise<IChatWelcomeMessageContent | undefined>;
    $provideChatTitle(handle: number, context: IChatAgentHistoryEntryDto[], token: CancellationToken): Promise<string | undefined>;
    $provideSampleQuestions(handle: number, location: ChatAgentLocation, token: CancellationToken): Promise<IChatFollowup[] | undefined>;
}
