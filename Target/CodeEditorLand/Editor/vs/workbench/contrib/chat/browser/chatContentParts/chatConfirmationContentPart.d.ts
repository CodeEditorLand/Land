import { Disposable, IDisposable } from '../../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IChatContentPart, IChatContentPartRenderContext } from './chatContentParts.js';
import { IChatProgressRenderableResponseContent } from '../../common/chatModel.js';
import { IChatConfirmation, IChatService } from '../../common/chatService.js';
export declare class ChatConfirmationContentPart extends Disposable implements IChatContentPart {
    private readonly instantiationService;
    private readonly chatService;
    readonly domNode: HTMLElement;
    private readonly _onDidChangeHeight;
    readonly onDidChangeHeight: import("../../../../workbench.web.main.internal.js").Event<void>;
    constructor(confirmation: IChatConfirmation, context: IChatContentPartRenderContext, instantiationService: IInstantiationService, chatService: IChatService);
    hasSameContent(other: IChatProgressRenderableResponseContent): boolean;
    addDisposable(disposable: IDisposable): void;
}
