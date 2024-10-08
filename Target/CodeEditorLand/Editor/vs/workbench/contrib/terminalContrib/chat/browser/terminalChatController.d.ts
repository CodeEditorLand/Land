import type { Terminal as RawXtermTerminal } from '@xterm/xterm';
import { Event } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IChatCodeBlockContextProviderService, IChatWidget } from '../../../chat/browser/chat.js';
import { IChatService } from '../../../chat/common/chatService.js';
import { ITerminalContribution, ITerminalInstance, ITerminalService, IXtermTerminal } from '../../../terminal/browser/terminal.js';
import { TerminalChatWidget } from './terminalChatWidget.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { IViewsService } from '../../../../services/views/common/viewsService.js';
import { IChatResponseModel } from '../../../chat/common/chatModel.js';
import type { ITerminalContributionContext } from '../../../terminal/browser/terminalExtensions.js';
declare const enum Message {
    None = 0,
    AcceptSession = 1,
    CancelSession = 2,
    PauseSession = 4,
    CancelRequest = 8,
    CancelInput = 16,
    AcceptInput = 32,
    ReturnInput = 64
}
export declare class TerminalChatController extends Disposable implements ITerminalContribution {
    private readonly _ctx;
    private readonly _chatService;
    private readonly _contextKeyService;
    private readonly _instantiationService;
    private readonly _storageService;
    private readonly _terminalService;
    private readonly _viewsService;
    static readonly ID = "terminal.chat";
    static get(instance: ITerminalInstance): TerminalChatController | null;
    /**
     * The controller for the currently focused chat widget. This is used to track action context since 'active terminals'
     * are only tracked for non-detached terminal instanecs.
     */
    static activeChatController?: TerminalChatController;
    private static _storageKey;
    private static _promptHistory;
    /**
     * The chat widget for the controller, this is lazy as we don't want to instantiate it until
     * both it's required and xterm is ready.
     */
    private _terminalChatWidget;
    /**
     * The terminal chat widget for the controller, this will be undefined if xterm is not ready yet (ie. the
     * terminal is still initializing). This wraps the inline chat widget.
     */
    get terminalChatWidget(): TerminalChatWidget | undefined;
    /**
     * The base chat widget for the controller, this will be undefined if xterm is not ready yet (ie. the
     * terminal is still initializing).
     */
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
    constructor(_ctx: ITerminalContributionContext, chatCodeBlockContextProviderService: IChatCodeBlockContextProviderService, _chatService: IChatService, _contextKeyService: IContextKeyService, _instantiationService: IInstantiationService, _storageService: IStorageService, _terminalService: ITerminalService, _viewsService: IViewsService);
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
