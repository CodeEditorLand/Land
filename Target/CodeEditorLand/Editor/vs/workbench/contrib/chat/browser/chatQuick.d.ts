import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { IQuickChatOpenOptions, IQuickChatService } from './chat.js';
import { IChatService } from '../common/chatService.js';
export declare class QuickChatService extends Disposable implements IQuickChatService {
    private readonly quickInputService;
    private readonly chatService;
    private readonly instantiationService;
    readonly _serviceBrand: undefined;
    private readonly _onDidClose;
    readonly onDidClose: Event<void>;
    private _input;
    private _currentChat;
    private _container;
    constructor(quickInputService: IQuickInputService, chatService: IChatService, instantiationService: IInstantiationService);
    get enabled(): boolean;
    get focused(): boolean;
    toggle(options?: IQuickChatOpenOptions): void;
    open(options?: IQuickChatOpenOptions): void;
    focus(): void;
    close(): void;
    openInChatView(): Promise<void>;
}
