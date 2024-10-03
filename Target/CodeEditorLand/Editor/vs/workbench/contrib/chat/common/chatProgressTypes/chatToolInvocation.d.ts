import { DeferredPromise } from '../../../../../base/common/async.js';
import { IChatToolInvocation, IChatToolInvocationSerialized } from '../chatService.js';
import { IToolConfirmationMessages } from '../languageModelToolsService.js';
export declare class ChatToolInvocation implements IChatToolInvocation {
    readonly invocationMessage: string;
    private _confirmationMessages;
    readonly kind: 'toolInvocation';
    private _isComplete;
    get isComplete(): boolean;
    private _isCanceled;
    get isCanceled(): boolean | undefined;
    private _confirmDeferred;
    get confirmed(): DeferredPromise<boolean>;
    private _isConfirmed;
    get isConfirmed(): boolean | undefined;
    constructor(invocationMessage: string, _confirmationMessages: IToolConfirmationMessages | undefined);
    complete(): void;
    get confirmationMessages(): IToolConfirmationMessages | undefined;
    toJSON(): IChatToolInvocationSerialized;
}
