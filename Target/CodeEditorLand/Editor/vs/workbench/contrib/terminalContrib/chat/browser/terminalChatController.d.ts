import type { Terminal as RawXtermTerminal } from '@xterm/xterm';
import { Event } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IChatCodeBlockContextProviderService, IChatWidget } from '../../../chat/browser/chat.js';
import { IChatService } from '../../../chat/common/chatService.js';
import { ITerminalContribution, ITerminalInstance, ITerminalService, IXtermTerminal } from '../../../terminal/browser/terminal.js';
import { TerminalWidgetManager } from '../../../terminal/browser/widgets/widgetManager.js';
import { ITerminalProcessManager } from '../../../terminal/common/terminal.js';
import { TerminalChatWidget } from './terminalChatWidget.js';
import { IChatResponseModel } from '../../../chat/common/chatModel.js';
import { IViewsService } from '../../../../services/views/common/viewsService.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
declare const enum Message {
    NONE = 0,
    ACCEPT_SESSION = 1,
    CANCEL_SESSION = 2,
    PAUSE_SESSION = 4,
    CANCEL_REQUEST = 8,
    CANCEL_INPUT = 16,
    ACCEPT_INPUT = 32,
    RERUN_INPUT = 64
}
export declare class TerminalChatController extends Disposable implements ITerminalContribution {
    private readonly _instance;
    private readonly _terminalService;
    private readonly _instantiationService;
    private readonly _contextKeyService;
    private readonly _chatService;
    private readonly _chatCodeBlockContextProviderService;
    private readonly _viewsService;
    private readonly _storageService;
    static readonly ID = "terminal.chat";
    static get(instance: ITerminalInstance): TerminalChatController | null;
    static activeChatController?: TerminalChatController;
    private static _storageKey;
    private static _promptHistory;
    private _terminalChatWidget;
    get terminalChatWidget(): TerminalChatWidget | undefined;
    get chatWidget(): IChatWidget | undefined;
    private readonly _requestActiveContextKey;
    private readonly _responseContainsCodeBlockContextKey;
    private readonly _responseContainsMulitpleCodeBlocksContextKey;
    private _messages;
    private _lastResponseContent;
    get lastResponseContent(): string | undefined;
    readonly onDidAcceptInput: Event<Message>;
    get onDidHide(): Event<any>;
    private _terminalAgentName;
    private readonly _model;
    get scopedContextKeyService(): IContextKeyService;
    private _sessionCtor;
    private _historyOffset;
    private _historyCandidate;
    private _historyUpdate;
    private _currentRequestId;
    private _activeRequestCts?;
    constructor(_instance: ITerminalInstance, processManager: ITerminalProcessManager, widgetManager: TerminalWidgetManager, _terminalService: ITerminalService, _instantiationService: IInstantiationService, _contextKeyService: IContextKeyService, _chatService: IChatService, _chatCodeBlockContextProviderService: IChatCodeBlockContextProviderService, _viewsService: IViewsService, _storageService: IStorageService);
    xtermReady(xterm: IXtermTerminal & {
        raw: RawXtermTerminal;
    }): void;
    private _createSession;
    private _forcedPlaceholder;
    private _updatePlaceholder;
    private _getPlaceholderText;
    setPlaceholder(text: string): void;
    resetPlaceholder(): void;
    clear(): void;
    acceptInput(isVoiceInput?: boolean): Promise<IChatResponseModel | undefined>;
    updateInput(text: string, selectAll?: boolean): void;
    getInput(): string;
    focus(): void;
    hasFocus(): boolean;
    populateHistory(up: boolean): void;
    cancel(): void;
    acceptCommand(shouldExecute: boolean): Promise<void>;
    reveal(): Promise<void>;
    viewInChat(): Promise<void>;
}
export {};
