import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Event } from '../../../../base/common/event.js';
import { IMarkdownString } from '../../../../base/common/htmlContent.js';
import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { URI } from '../../../../base/common/uri.js';
import { Command, ProviderResult } from '../../../../editor/common/languages.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { ExtensionIdentifier } from '../../../../platform/extensions/common/extensions.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IRequestService } from '../../../../platform/request/common/request.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IChatProgressHistoryResponseContent, IChatRequestVariableData, ISerializableChatAgentData } from './chatModel.js';
import { IRawChatCommandContribution, RawChatParticipantLocation } from './chatParticipantContribTypes.js';
import { IChatFollowup, IChatLocationData, IChatProgress, IChatResponseErrorDetails, IChatTaskDto } from './chatService.js';
export interface IChatAgentHistoryEntry {
    request: IChatAgentRequest;
    response: ReadonlyArray<IChatProgressHistoryResponseContent | IChatTaskDto>;
    result: IChatAgentResult;
}
export declare enum ChatAgentLocation {
    Panel = "panel",
    Terminal = "terminal",
    Notebook = "notebook",
    Editor = "editor",
    EditingSession = "editing-session"
}
export declare namespace ChatAgentLocation {
    function fromRaw(value: RawChatParticipantLocation | string): ChatAgentLocation;
}
export interface IChatAgentData {
    id: string;
    name: string;
    fullName?: string;
    description?: string;
    supportsModelPicker?: boolean;
    when?: string;
    extensionId: ExtensionIdentifier;
    extensionPublisherId: string;
    /** This is the extension publisher id, or, in the case of a dynamically registered participant (remote agent), whatever publisher name we have for it */
    publisherDisplayName?: string;
    extensionDisplayName: string;
    /** The agent invoked when no agent is specified */
    isDefault?: boolean;
    /** This agent is not contributed in package.json, but is registered dynamically */
    isDynamic?: boolean;
    metadata: IChatAgentMetadata;
    slashCommands: IChatAgentCommand[];
    locations: ChatAgentLocation[];
    disambiguation: {
        category: string;
        description: string;
        examples: string[];
    }[];
    supportsToolReferences?: boolean;
}
export interface IChatWelcomeMessageContent {
    icon: ThemeIcon;
    title: string;
    message: IMarkdownString;
}
export declare function isChatWelcomeMessageContent(obj: any): obj is IChatWelcomeMessageContent;
export interface IChatAgentImplementation {
    invoke(request: IChatAgentRequest, progress: (part: IChatProgress) => void, history: IChatAgentHistoryEntry[], token: CancellationToken): Promise<IChatAgentResult>;
    provideFollowups?(request: IChatAgentRequest, result: IChatAgentResult, history: IChatAgentHistoryEntry[], token: CancellationToken): Promise<IChatFollowup[]>;
    provideWelcomeMessage?(token: CancellationToken): ProviderResult<IChatWelcomeMessageContent | undefined>;
    provideChatTitle?: (history: IChatAgentHistoryEntry[], token: CancellationToken) => Promise<string | undefined>;
    provideSampleQuestions?(location: ChatAgentLocation, token: CancellationToken): ProviderResult<IChatFollowup[] | undefined>;
}
export interface IChatParticipantDetectionResult {
    participant: string;
    command?: string;
}
export interface IChatParticipantMetadata {
    participant: string;
    command?: string;
    disambiguation: {
        category: string;
        description: string;
        examples: string[];
    }[];
}
export interface IChatParticipantDetectionProvider {
    provideParticipantDetection(request: IChatAgentRequest, history: IChatAgentHistoryEntry[], options: {
        location: ChatAgentLocation;
        participants: IChatParticipantMetadata[];
    }, token: CancellationToken): Promise<IChatParticipantDetectionResult | null | undefined>;
}
export type IChatAgent = IChatAgentData & IChatAgentImplementation;
export interface IChatAgentCommand extends IRawChatCommandContribution {
    followupPlaceholder?: string;
}
export interface IChatRequesterInformation {
    name: string;
    /**
     * A full URI for the icon of the requester.
     */
    icon?: URI;
}
export interface IChatAgentMetadata {
    helpTextPrefix?: string | IMarkdownString;
    helpTextVariablesPrefix?: string | IMarkdownString;
    helpTextPostfix?: string | IMarkdownString;
    isSecondary?: boolean;
    icon?: URI;
    iconDark?: URI;
    themeIcon?: ThemeIcon;
    sampleRequest?: string;
    supportIssueReporting?: boolean;
    followupPlaceholder?: string;
    isSticky?: boolean;
    requester?: IChatRequesterInformation;
    supportsSlowVariables?: boolean;
}
export interface IChatAgentRequest {
    sessionId: string;
    requestId: string;
    agentId: string;
    command?: string;
    message: string;
    attempt?: number;
    enableCommandDetection?: boolean;
    isParticipantDetected?: boolean;
    variables: IChatRequestVariableData;
    location: ChatAgentLocation;
    locationData?: IChatLocationData;
    acceptedConfirmationData?: any[];
    rejectedConfirmationData?: any[];
    userSelectedModelId?: string;
}
export interface IChatQuestion {
    readonly prompt: string;
    readonly participant?: string;
    readonly command?: string;
}
export interface IChatAgentResultTimings {
    firstProgress?: number;
    totalElapsed: number;
}
export interface IChatAgentResult {
    errorDetails?: IChatResponseErrorDetails;
    timings?: IChatAgentResultTimings;
    /** Extra properties that the agent can use to identify a result */
    readonly metadata?: {
        readonly [key: string]: any;
    };
    nextQuestion?: IChatQuestion;
}
export declare const IChatAgentService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IChatAgentService>;
export interface IChatAgentCompletionItem {
    id: string;
    name?: string;
    fullName?: string;
    icon?: ThemeIcon;
    value: unknown;
    command?: Command;
}
export interface IChatAgentService {
    _serviceBrand: undefined;
    /**
     * undefined when an agent was removed IChatAgent
     */
    readonly onDidChangeAgents: Event<IChatAgent | undefined>;
    registerAgent(id: string, data: IChatAgentData): IDisposable;
    registerAgentImplementation(id: string, agent: IChatAgentImplementation): IDisposable;
    registerDynamicAgent(data: IChatAgentData, agentImpl: IChatAgentImplementation): IDisposable;
    registerAgentCompletionProvider(id: string, provider: (query: string, token: CancellationToken) => Promise<IChatAgentCompletionItem[]>): IDisposable;
    getAgentCompletionItems(id: string, query: string, token: CancellationToken): Promise<IChatAgentCompletionItem[]>;
    registerChatParticipantDetectionProvider(handle: number, provider: IChatParticipantDetectionProvider): IDisposable;
    detectAgentOrCommand(request: IChatAgentRequest, history: IChatAgentHistoryEntry[], options: {
        location: ChatAgentLocation;
    }, token: CancellationToken): Promise<{
        agent: IChatAgentData;
        command?: IChatAgentCommand;
    } | undefined>;
    hasChatParticipantDetectionProviders(): boolean;
    invokeAgent(agent: string, request: IChatAgentRequest, progress: (part: IChatProgress) => void, history: IChatAgentHistoryEntry[], token: CancellationToken): Promise<IChatAgentResult>;
    getFollowups(id: string, request: IChatAgentRequest, result: IChatAgentResult, history: IChatAgentHistoryEntry[], token: CancellationToken): Promise<IChatFollowup[]>;
    getChatTitle(id: string, history: IChatAgentHistoryEntry[], token: CancellationToken): Promise<string | undefined>;
    getAgent(id: string): IChatAgentData | undefined;
    getAgentByFullyQualifiedId(id: string): IChatAgentData | undefined;
    getAgents(): IChatAgentData[];
    getActivatedAgents(): Array<IChatAgent>;
    getAgentsByName(name: string): IChatAgentData[];
    agentHasDupeName(id: string): boolean;
    /**
     * Get the default agent (only if activated)
     */
    getDefaultAgent(location: ChatAgentLocation): IChatAgent | undefined;
    /**
     * Get the default agent data that has been contributed (may not be activated yet)
     */
    getContributedDefaultAgent(location: ChatAgentLocation): IChatAgentData | undefined;
    getSecondaryAgent(): IChatAgentData | undefined;
    updateAgent(id: string, updateMetadata: IChatAgentMetadata): void;
}
export declare class ChatAgentService extends Disposable implements IChatAgentService {
    private readonly contextKeyService;
    static readonly AGENT_LEADER = "@";
    _serviceBrand: undefined;
    private _agents;
    private readonly _onDidChangeAgents;
    readonly onDidChangeAgents: Event<IChatAgent | undefined>;
    private readonly _agentsContextKeys;
    private readonly _hasDefaultAgent;
    private readonly _defaultAgentRegistered;
    private readonly _editingAgentRegistered;
    constructor(contextKeyService: IContextKeyService);
    registerAgent(id: string, data: IChatAgentData): IDisposable;
    private _updateAgentsContextKeys;
    private _updateContextKeys;
    registerAgentImplementation(id: string, agentImpl: IChatAgentImplementation): IDisposable;
    registerDynamicAgent(data: IChatAgentData, agentImpl: IChatAgentImplementation): IDisposable;
    private _agentCompletionProviders;
    registerAgentCompletionProvider(id: string, provider: (query: string, token: CancellationToken) => Promise<IChatAgentCompletionItem[]>): {
        dispose: () => void;
    };
    getAgentCompletionItems(id: string, query: string, token: CancellationToken): Promise<IChatAgentCompletionItem[]>;
    updateAgent(id: string, updateMetadata: IChatAgentMetadata): void;
    getDefaultAgent(location: ChatAgentLocation): IChatAgent | undefined;
    getContributedDefaultAgent(location: ChatAgentLocation): IChatAgentData | undefined;
    getSecondaryAgent(): IChatAgentData | undefined;
    getAgent(id: string): IChatAgentData | undefined;
    private _agentIsEnabled;
    getAgentByFullyQualifiedId(id: string): IChatAgentData | undefined;
    /**
     * Returns all agent datas that exist- static registered and dynamic ones.
     */
    getAgents(): IChatAgentData[];
    getActivatedAgents(): IChatAgent[];
    getAgentsByName(name: string): IChatAgentData[];
    agentHasDupeName(id: string): boolean;
    invokeAgent(id: string, request: IChatAgentRequest, progress: (part: IChatProgress) => void, history: IChatAgentHistoryEntry[], token: CancellationToken): Promise<IChatAgentResult>;
    getFollowups(id: string, request: IChatAgentRequest, result: IChatAgentResult, history: IChatAgentHistoryEntry[], token: CancellationToken): Promise<IChatFollowup[]>;
    getChatTitle(id: string, history: IChatAgentHistoryEntry[], token: CancellationToken): Promise<string | undefined>;
    private _chatParticipantDetectionProviders;
    registerChatParticipantDetectionProvider(handle: number, provider: IChatParticipantDetectionProvider): IDisposable;
    hasChatParticipantDetectionProviders(): boolean;
    detectAgentOrCommand(request: IChatAgentRequest, history: IChatAgentHistoryEntry[], options: {
        location: ChatAgentLocation;
    }, token: CancellationToken): Promise<{
        agent: IChatAgentData;
        command?: IChatAgentCommand;
    } | undefined>;
}
export declare class MergedChatAgent implements IChatAgent {
    private readonly data;
    private readonly impl;
    constructor(data: IChatAgentData, impl: IChatAgentImplementation);
    when?: string | undefined;
    publisherDisplayName?: string | undefined;
    isDynamic?: boolean | undefined;
    get id(): string;
    get name(): string;
    get fullName(): string;
    get description(): string;
    get extensionId(): ExtensionIdentifier;
    get extensionPublisherId(): string;
    get extensionPublisherDisplayName(): string | undefined;
    get extensionDisplayName(): string;
    get isDefault(): boolean | undefined;
    get metadata(): IChatAgentMetadata;
    get slashCommands(): IChatAgentCommand[];
    get locations(): ChatAgentLocation[];
    get disambiguation(): {
        category: string;
        description: string;
        examples: string[];
    }[];
    invoke(request: IChatAgentRequest, progress: (part: IChatProgress) => void, history: IChatAgentHistoryEntry[], token: CancellationToken): Promise<IChatAgentResult>;
    provideFollowups(request: IChatAgentRequest, result: IChatAgentResult, history: IChatAgentHistoryEntry[], token: CancellationToken): Promise<IChatFollowup[]>;
    provideWelcomeMessage(token: CancellationToken): ProviderResult<IChatWelcomeMessageContent | undefined>;
    provideSampleQuestions(location: ChatAgentLocation, token: CancellationToken): ProviderResult<IChatFollowup[] | undefined>;
    toJSON(): IChatAgentData;
}
export declare const IChatAgentNameService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IChatAgentNameService>;
export interface IChatAgentNameService {
    _serviceBrand: undefined;
    getAgentNameRestriction(chatAgentData: IChatAgentData): boolean;
}
export declare class ChatAgentNameService implements IChatAgentNameService {
    private readonly requestService;
    private readonly logService;
    private readonly storageService;
    private static readonly StorageKey;
    _serviceBrand: undefined;
    private readonly url;
    private registry;
    private disposed;
    constructor(productService: IProductService, requestService: IRequestService, logService: ILogService, storageService: IStorageService);
    private refresh;
    private update;
    /**
     * Returns true if the agent is allowed to use this name
     */
    getAgentNameRestriction(chatAgentData: IChatAgentData): boolean;
    private checkAgentNameRestriction;
    dispose(): void;
}
export declare function getFullyQualifiedId(chatAgentData: IChatAgentData): string;
export declare function reviveSerializedAgent(raw: ISerializableChatAgentData): IChatAgentData;
