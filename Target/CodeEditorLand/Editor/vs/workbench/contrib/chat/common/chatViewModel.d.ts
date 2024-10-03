import { Event } from '../../../../base/common/event.js';
import { IMarkdownString } from '../../../../base/common/htmlContent.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { URI } from '../../../../base/common/uri.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IChatAgentCommand, IChatAgentData, IChatAgentNameService, IChatAgentResult } from './chatAgents.js';
import { ChatModelInitState, IChatModel, IChatProgressRenderableResponseContent, IChatRequestModel, IChatRequestVariableEntry, IChatResponseModel, IChatTextEditGroup, IResponse } from './chatModel.js';
import { IParsedChatRequest } from './chatParserTypes.js';
import { ChatAgentVoteDirection, ChatAgentVoteDownReason, IChatCodeCitation, IChatContentReference, IChatFollowup, IChatProgressMessage, IChatResponseErrorDetails, IChatTask, IChatUsedContext } from './chatService.js';
import { CodeBlockModelCollection } from './codeBlockModelCollection.js';
export declare function isRequestVM(item: unknown): item is IChatRequestViewModel;
export declare function isResponseVM(item: unknown): item is IChatResponseViewModel;
export type IChatViewModelChangeEvent = IChatAddRequestEvent | IChangePlaceholderEvent | IChatSessionInitEvent | null;
export interface IChatAddRequestEvent {
    kind: 'addRequest';
}
export interface IChangePlaceholderEvent {
    kind: 'changePlaceholder';
}
export interface IChatSessionInitEvent {
    kind: 'initialize';
}
export interface IChatViewModel {
    readonly model: IChatModel;
    readonly initState: ChatModelInitState;
    readonly sessionId: string;
    readonly onDidDisposeModel: Event<void>;
    readonly onDidChange: Event<IChatViewModelChangeEvent>;
    readonly requestInProgress: boolean;
    readonly inputPlaceholder?: string;
    getItems(): (IChatRequestViewModel | IChatResponseViewModel)[];
    setInputPlaceholder(text: string): void;
    resetInputPlaceholder(): void;
}
export interface IChatRequestViewModel {
    readonly id: string;
    readonly sessionId: string;
    readonly dataId: string;
    readonly username: string;
    readonly avatarIcon?: URI | ThemeIcon;
    readonly message: IParsedChatRequest | IChatFollowup;
    readonly messageText: string;
    readonly attempt: number;
    readonly variables: IChatRequestVariableEntry[];
    currentRenderedHeight: number | undefined;
    readonly contentReferences?: ReadonlyArray<IChatContentReference>;
    readonly confirmation?: string;
}
export interface IChatResponseMarkdownRenderData {
    renderedWordCount: number;
    lastRenderTime: number;
    isFullyRendered: boolean;
    originalMarkdown: IMarkdownString;
}
export interface IChatResponseMarkdownRenderData2 {
    renderedWordCount: number;
    lastRenderTime: number;
    isFullyRendered: boolean;
    originalMarkdown: IMarkdownString;
}
export interface IChatProgressMessageRenderData {
    progressMessage: IChatProgressMessage;
    isAtEndOfResponse: boolean;
    isLast: boolean;
}
export interface IChatTaskRenderData {
    task: IChatTask;
    isSettled: boolean;
    progressLength: number;
}
export interface IChatResponseRenderData {
    renderedParts: IChatRendererContent[];
    renderedWordCount: number;
    lastRenderTime: number;
}
export interface IChatReferences {
    references: ReadonlyArray<IChatContentReference>;
    kind: 'references';
}
export interface IChatCodeCitations {
    citations: ReadonlyArray<IChatCodeCitation>;
    kind: 'codeCitations';
}
export type IChatRendererContent = IChatProgressRenderableResponseContent | IChatReferences | IChatCodeCitations;
export interface IChatLiveUpdateData {
    firstWordTime: number;
    lastUpdateTime: number;
    impliedWordLoadRate: number;
    lastWordCount: number;
}
export interface IChatResponseViewModel {
    readonly model: IChatResponseModel;
    readonly id: string;
    readonly sessionId: string;
    readonly dataId: string;
    readonly requestId: string;
    readonly username: string;
    readonly avatarIcon?: URI | ThemeIcon;
    readonly agent?: IChatAgentData;
    readonly slashCommand?: IChatAgentCommand;
    readonly agentOrSlashCommandDetected: boolean;
    readonly response: IResponse;
    readonly usedContext: IChatUsedContext | undefined;
    readonly contentReferences: ReadonlyArray<IChatContentReference>;
    readonly codeCitations: ReadonlyArray<IChatCodeCitation>;
    readonly progressMessages: ReadonlyArray<IChatProgressMessage>;
    readonly isComplete: boolean;
    readonly isCanceled: boolean;
    readonly isStale: boolean;
    readonly vote: ChatAgentVoteDirection | undefined;
    readonly voteDownReason: ChatAgentVoteDownReason | undefined;
    readonly replyFollowups?: IChatFollowup[];
    readonly errorDetails?: IChatResponseErrorDetails;
    readonly result?: IChatAgentResult;
    readonly contentUpdateTimings?: IChatLiveUpdateData;
    renderData?: IChatResponseRenderData;
    currentRenderedHeight: number | undefined;
    setVote(vote: ChatAgentVoteDirection): void;
    setVoteDownReason(reason: ChatAgentVoteDownReason | undefined): void;
    usedReferencesExpanded?: boolean;
    vulnerabilitiesListExpanded: boolean;
    setEditApplied(edit: IChatTextEditGroup, editCount: number): void;
}
export declare class ChatViewModel extends Disposable implements IChatViewModel {
    private readonly _model;
    readonly codeBlockModelCollection: CodeBlockModelCollection;
    private readonly instantiationService;
    private readonly _onDidDisposeModel;
    readonly onDidDisposeModel: Event<void>;
    private readonly _onDidChange;
    readonly onDidChange: Event<IChatViewModelChangeEvent>;
    private readonly _items;
    private _inputPlaceholder;
    get inputPlaceholder(): string | undefined;
    get model(): IChatModel;
    setInputPlaceholder(text: string): void;
    resetInputPlaceholder(): void;
    get sessionId(): string;
    get requestInProgress(): boolean;
    get initState(): ChatModelInitState;
    constructor(_model: IChatModel, codeBlockModelCollection: CodeBlockModelCollection, instantiationService: IInstantiationService);
    private onAddResponse;
    getItems(): (IChatRequestViewModel | IChatResponseViewModel)[];
    dispose(): void;
    updateCodeBlockTextModels(model: IChatRequestViewModel | IChatResponseViewModel): void;
}
export declare class ChatRequestViewModel implements IChatRequestViewModel {
    private readonly _model;
    get id(): string;
    get dataId(): string;
    get sessionId(): string;
    get username(): string;
    get avatarIcon(): URI | undefined;
    get message(): IParsedChatRequest;
    get messageText(): string;
    get attempt(): number;
    get variables(): IChatRequestVariableEntry[];
    get contentReferences(): readonly IChatContentReference[] | undefined;
    get confirmation(): string | undefined;
    currentRenderedHeight: number | undefined;
    constructor(_model: IChatRequestModel);
}
export declare class ChatResponseViewModel extends Disposable implements IChatResponseViewModel {
    private readonly _model;
    private readonly logService;
    private readonly chatAgentNameService;
    private _modelChangeCount;
    private readonly _onDidChange;
    readonly onDidChange: Event<void>;
    get model(): IChatResponseModel;
    get id(): string;
    get dataId(): string;
    get sessionId(): string;
    get username(): string;
    get avatarIcon(): URI | ThemeIcon | undefined;
    get agent(): IChatAgentData | undefined;
    get slashCommand(): IChatAgentCommand | undefined;
    get agentOrSlashCommandDetected(): boolean;
    get response(): IResponse;
    get usedContext(): IChatUsedContext | undefined;
    get contentReferences(): ReadonlyArray<IChatContentReference>;
    get codeCitations(): ReadonlyArray<IChatCodeCitation>;
    get progressMessages(): ReadonlyArray<IChatProgressMessage>;
    get isComplete(): boolean;
    get isCanceled(): boolean;
    get replyFollowups(): IChatFollowup[] | undefined;
    get result(): IChatAgentResult | undefined;
    get errorDetails(): IChatResponseErrorDetails | undefined;
    get vote(): ChatAgentVoteDirection | undefined;
    get voteDownReason(): ChatAgentVoteDownReason | undefined;
    get requestId(): string;
    get isStale(): boolean;
    renderData: IChatResponseRenderData | undefined;
    currentRenderedHeight: number | undefined;
    private _usedReferencesExpanded;
    get usedReferencesExpanded(): boolean | undefined;
    set usedReferencesExpanded(v: boolean);
    private _vulnerabilitiesListExpanded;
    get vulnerabilitiesListExpanded(): boolean;
    set vulnerabilitiesListExpanded(v: boolean);
    private _contentUpdateTimings;
    get contentUpdateTimings(): IChatLiveUpdateData | undefined;
    constructor(_model: IChatResponseModel, logService: ILogService, chatAgentNameService: IChatAgentNameService);
    private trace;
    setVote(vote: ChatAgentVoteDirection): void;
    setVoteDownReason(reason: ChatAgentVoteDownReason | undefined): void;
    setEditApplied(edit: IChatTextEditGroup, editCount: number): void;
}
