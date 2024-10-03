import { CommentThreadChangedEvent, CommentInfo, Comment, CommentReaction, CommentingRanges, CommentThread, CommentOptions, PendingCommentThread, CommentingRangeResourceHint } from '../../../../editor/common/languages.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { Event } from '../../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { URI, UriComponents } from '../../../../base/common/uri.js';
import { Range, IRange } from '../../../../editor/common/core/range.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { ICommentThreadChangedEvent } from '../common/commentModel.js';
import { CommentMenus } from './commentMenus.js';
import { ICellRange } from '../../notebook/common/notebookRange.js';
import { IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { ICommentsModel } from './commentsModel.js';
import { IModelService } from '../../../../editor/common/services/model.js';
export declare const ICommentService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ICommentService>;
interface IResourceCommentThreadEvent {
    resource: URI;
    commentInfos: ICommentInfo[];
}
export interface ICommentInfo<T = IRange> extends CommentInfo<T> {
    uniqueOwner: string;
    label?: string;
}
export interface INotebookCommentInfo {
    extensionId?: string;
    threads: CommentThread<ICellRange>[];
    uniqueOwner: string;
    label?: string;
}
export interface IWorkspaceCommentThreadsEvent {
    ownerId: string;
    ownerLabel: string;
    commentThreads: CommentThread[];
}
export interface INotebookCommentThreadChangedEvent extends CommentThreadChangedEvent<ICellRange> {
    uniqueOwner: string;
}
export interface ICommentController {
    id: string;
    label: string;
    features: {
        reactionGroup?: CommentReaction[];
        reactionHandler?: boolean;
        options?: CommentOptions;
    };
    options?: CommentOptions;
    contextValue?: string;
    owner: string;
    activeComment: {
        thread: CommentThread;
        comment?: Comment;
    } | undefined;
    createCommentThreadTemplate(resource: UriComponents, range: IRange | undefined, editorId?: string): Promise<void>;
    updateCommentThreadTemplate(threadHandle: number, range: IRange): Promise<void>;
    deleteCommentThreadMain(commentThreadId: string): void;
    toggleReaction(uri: URI, thread: CommentThread, comment: Comment, reaction: CommentReaction, token: CancellationToken): Promise<void>;
    getDocumentComments(resource: URI, token: CancellationToken): Promise<ICommentInfo<IRange>>;
    getNotebookComments(resource: URI, token: CancellationToken): Promise<INotebookCommentInfo>;
    setActiveCommentAndThread(commentInfo: {
        thread: CommentThread;
        comment?: Comment;
    } | undefined): Promise<void>;
}
export interface IContinueOnCommentProvider {
    provideContinueOnComments(): PendingCommentThread[];
}
export interface ICommentService {
    readonly _serviceBrand: undefined;
    readonly onDidSetResourceCommentInfos: Event<IResourceCommentThreadEvent>;
    readonly onDidSetAllCommentThreads: Event<IWorkspaceCommentThreadsEvent>;
    readonly onDidUpdateCommentThreads: Event<ICommentThreadChangedEvent>;
    readonly onDidUpdateNotebookCommentThreads: Event<INotebookCommentThreadChangedEvent>;
    readonly onDidChangeActiveEditingCommentThread: Event<CommentThread | null>;
    readonly onDidChangeCurrentCommentThread: Event<CommentThread | undefined>;
    readonly onDidUpdateCommentingRanges: Event<{
        uniqueOwner: string;
    }>;
    readonly onDidChangeActiveCommentingRange: Event<{
        range: Range;
        commentingRangesInfo: CommentingRanges;
    }>;
    readonly onDidSetDataProvider: Event<void>;
    readonly onDidDeleteDataProvider: Event<string | undefined>;
    readonly onDidChangeCommentingEnabled: Event<boolean>;
    readonly isCommentingEnabled: boolean;
    readonly commentsModel: ICommentsModel;
    readonly lastActiveCommentcontroller: ICommentController | undefined;
    setDocumentComments(resource: URI, commentInfos: ICommentInfo[]): void;
    setWorkspaceComments(uniqueOwner: string, commentsByResource: CommentThread<IRange | ICellRange>[]): void;
    removeWorkspaceComments(uniqueOwner: string): void;
    registerCommentController(uniqueOwner: string, commentControl: ICommentController): void;
    unregisterCommentController(uniqueOwner?: string): void;
    getCommentController(uniqueOwner: string): ICommentController | undefined;
    createCommentThreadTemplate(uniqueOwner: string, resource: URI, range: Range | undefined, editorId?: string): Promise<void>;
    updateCommentThreadTemplate(uniqueOwner: string, threadHandle: number, range: Range): Promise<void>;
    getCommentMenus(uniqueOwner: string): CommentMenus;
    updateComments(ownerId: string, event: CommentThreadChangedEvent<IRange>): void;
    updateNotebookComments(ownerId: string, event: CommentThreadChangedEvent<ICellRange>): void;
    disposeCommentThread(ownerId: string, threadId: string): void;
    getDocumentComments(resource: URI): Promise<(ICommentInfo | null)[]>;
    getNotebookComments(resource: URI): Promise<(INotebookCommentInfo | null)[]>;
    updateCommentingRanges(ownerId: string, resourceHints?: CommentingRangeResourceHint): void;
    hasReactionHandler(uniqueOwner: string): boolean;
    toggleReaction(uniqueOwner: string, resource: URI, thread: CommentThread<IRange | ICellRange>, comment: Comment, reaction: CommentReaction): Promise<void>;
    setActiveEditingCommentThread(commentThread: CommentThread<IRange | ICellRange> | null): void;
    setCurrentCommentThread(commentThread: CommentThread<IRange | ICellRange> | undefined): void;
    setActiveCommentAndThread(uniqueOwner: string, commentInfo: {
        thread: CommentThread<IRange | ICellRange>;
        comment?: Comment;
    } | undefined): Promise<void>;
    enableCommenting(enable: boolean): void;
    registerContinueOnCommentProvider(provider: IContinueOnCommentProvider): IDisposable;
    removeContinueOnComment(pendingComment: {
        range: IRange | undefined;
        uri: URI;
        uniqueOwner: string;
        isReply?: boolean;
    }): PendingCommentThread | undefined;
    resourceHasCommentingRanges(resource: URI): boolean;
}
export declare class CommentService extends Disposable implements ICommentService {
    protected readonly instantiationService: IInstantiationService;
    private readonly layoutService;
    private readonly configurationService;
    private readonly storageService;
    private readonly logService;
    private readonly modelService;
    readonly _serviceBrand: undefined;
    private readonly _onDidSetDataProvider;
    readonly onDidSetDataProvider: Event<void>;
    private readonly _onDidDeleteDataProvider;
    readonly onDidDeleteDataProvider: Event<string | undefined>;
    private readonly _onDidSetResourceCommentInfos;
    readonly onDidSetResourceCommentInfos: Event<IResourceCommentThreadEvent>;
    private readonly _onDidSetAllCommentThreads;
    readonly onDidSetAllCommentThreads: Event<IWorkspaceCommentThreadsEvent>;
    private readonly _onDidUpdateCommentThreads;
    readonly onDidUpdateCommentThreads: Event<ICommentThreadChangedEvent>;
    private readonly _onDidUpdateNotebookCommentThreads;
    readonly onDidUpdateNotebookCommentThreads: Event<INotebookCommentThreadChangedEvent>;
    private readonly _onDidUpdateCommentingRanges;
    readonly onDidUpdateCommentingRanges: Event<{
        uniqueOwner: string;
    }>;
    private readonly _onDidChangeActiveEditingCommentThread;
    readonly onDidChangeActiveEditingCommentThread: Event<CommentThread<IRange> | null>;
    private readonly _onDidChangeCurrentCommentThread;
    readonly onDidChangeCurrentCommentThread: Event<CommentThread<IRange> | undefined>;
    private readonly _onDidChangeCommentingEnabled;
    readonly onDidChangeCommentingEnabled: Event<boolean>;
    private readonly _onDidChangeActiveCommentingRange;
    readonly onDidChangeActiveCommentingRange: Event<{
        range: Range;
        commentingRangesInfo: CommentingRanges;
    }>;
    private _commentControls;
    private _commentMenus;
    private _isCommentingEnabled;
    private _workspaceHasCommenting;
    private _continueOnComments;
    private _continueOnCommentProviders;
    private readonly _commentsModel;
    readonly commentsModel: ICommentsModel;
    private _commentingRangeResources;
    private _commentingRangeResourceHintSchemes;
    constructor(instantiationService: IInstantiationService, layoutService: IWorkbenchLayoutService, configurationService: IConfigurationService, contextKeyService: IContextKeyService, storageService: IStorageService, logService: ILogService, modelService: IModelService);
    private _updateResourcesWithCommentingRanges;
    private _handleConfiguration;
    private _handleZenMode;
    private get _defaultCommentingEnablement();
    get isCommentingEnabled(): boolean;
    enableCommenting(enable: boolean): void;
    setCurrentCommentThread(commentThread: CommentThread | undefined): void;
    setActiveEditingCommentThread(commentThread: CommentThread | null): void;
    get lastActiveCommentcontroller(): ICommentController | undefined;
    private _lastActiveCommentController;
    setActiveCommentAndThread(uniqueOwner: string, commentInfo: {
        thread: CommentThread<IRange>;
        comment?: Comment;
    } | undefined): Promise<void>;
    setDocumentComments(resource: URI, commentInfos: ICommentInfo[]): void;
    private setModelThreads;
    private updateModelThreads;
    setWorkspaceComments(uniqueOwner: string, commentsByResource: CommentThread[]): void;
    removeWorkspaceComments(uniqueOwner: string): void;
    registerCommentController(uniqueOwner: string, commentControl: ICommentController): void;
    unregisterCommentController(uniqueOwner?: string): void;
    getCommentController(uniqueOwner: string): ICommentController | undefined;
    createCommentThreadTemplate(uniqueOwner: string, resource: URI, range: Range | undefined, editorId?: string): Promise<void>;
    updateCommentThreadTemplate(uniqueOwner: string, threadHandle: number, range: Range): Promise<void>;
    disposeCommentThread(uniqueOwner: string, threadId: string): void;
    getCommentMenus(uniqueOwner: string): CommentMenus;
    updateComments(ownerId: string, event: CommentThreadChangedEvent<IRange>): void;
    updateNotebookComments(ownerId: string, event: CommentThreadChangedEvent<ICellRange>): void;
    updateCommentingRanges(ownerId: string, resourceHints?: CommentingRangeResourceHint): void;
    toggleReaction(uniqueOwner: string, resource: URI, thread: CommentThread, comment: Comment, reaction: CommentReaction): Promise<void>;
    hasReactionHandler(uniqueOwner: string): boolean;
    getDocumentComments(resource: URI): Promise<(ICommentInfo | null)[]>;
    getNotebookComments(resource: URI): Promise<(INotebookCommentInfo | null)[]>;
    registerContinueOnCommentProvider(provider: IContinueOnCommentProvider): IDisposable;
    private _saveContinueOnComments;
    removeContinueOnComment(pendingComment: {
        range: IRange;
        uri: URI;
        uniqueOwner: string;
        isReply?: boolean;
    }): PendingCommentThread | undefined;
    private _addContinueOnComments;
    resourceHasCommentingRanges(resource: URI): boolean;
}
export {};
