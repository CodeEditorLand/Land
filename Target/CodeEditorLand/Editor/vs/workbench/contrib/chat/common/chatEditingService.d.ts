import { CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { Event } from '../../../../base/common/event.js';
import { IObservable, ITransaction } from '../../../../base/common/observable.js';
import { URI } from '../../../../base/common/uri.js';
import { TextEdit } from '../../../../editor/common/languages.js';
import { ITextModel } from '../../../../editor/common/model.js';
import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { IChatResponseModel } from './chatModel.js';
export declare const IChatEditingService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IChatEditingService>;
export interface IChatEditingService {
    _serviceBrand: undefined;
    readonly onDidCreateEditingSession: Event<IChatEditingSession>;
    /**
     * emitted when a session is created, changed or disposed
     */
    readonly onDidChangeEditingSession: Event<void>;
    readonly currentEditingSession: IChatEditingSession | null;
    readonly currentAutoApplyOperation: CancellationTokenSource | null;
    startOrContinueEditingSession(chatSessionId: string, options?: {
        silent: boolean;
    }): Promise<IChatEditingSession>;
    addFileToWorkingSet(resource: URI): Promise<void>;
    triggerEditComputation(responseModel: IChatResponseModel): Promise<void>;
    getEditingSession(resource: URI): IChatEditingSession | null;
}
export interface IChatEditingSession {
    readonly chatSessionId: string;
    readonly onDidChange: Event<void>;
    readonly onDidDispose: Event<void>;
    readonly state: IObservable<ChatEditingSessionState>;
    readonly workingSet: IObservable<readonly URI[]>;
    readonly entries: IObservable<readonly IModifiedFileEntry[]>;
    readonly isVisible: boolean;
    show(): Promise<void>;
    remove(...uris: URI[]): void;
    accept(...uris: URI[]): Promise<void>;
    reject(...uris: URI[]): Promise<void>;
    /**
     * Will lead to this object getting disposed
     */
    stop(): Promise<void>;
}
export declare const enum WorkingSetEntryState {
    Modified = 0,
    Accepted = 1,
    Rejected = 2,
    Attached = 3
}
export interface IModifiedFileEntry {
    readonly originalURI: URI;
    readonly originalModel: ITextModel;
    readonly modifiedURI: URI;
    readonly state: IObservable<WorkingSetEntryState>;
    accept(transaction: ITransaction | undefined): Promise<void>;
    reject(transaction: ITransaction | undefined): Promise<void>;
}
export interface IChatEditingSessionStream {
    textEdits(resource: URI, textEdits: TextEdit[], responseModel: IChatResponseModel): void;
}
export declare const enum ChatEditingSessionState {
    Initial = 0,
    StreamingEdits = 1,
    Idle = 2,
    Disposed = 3
}
export declare const CHAT_EDITING_MULTI_DIFF_SOURCE_RESOLVER_SCHEME = "chat-editing-multi-diff-source";
export declare const chatEditingWidgetFileStateContextKey: RawContextKey<WorkingSetEntryState>;
export declare const decidedChatEditingResourceContextKey: RawContextKey<string[]>;
export declare const chatEditingResourceContextKey: RawContextKey<string | undefined>;
export declare const inChatEditingSessionContextKey: RawContextKey<boolean | undefined>;
export declare const applyingChatEditsContextKey: RawContextKey<boolean | undefined>;
