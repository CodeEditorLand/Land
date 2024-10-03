import { Disposable } from '../../../../../base/common/lifecycle.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IChatContentPart, IChatContentPartRenderContext } from './chatContentParts.js';
import { IChatProgressRenderableResponseContent } from '../../common/chatModel.js';
import { IChatCommandButton } from '../../common/chatService.js';
export declare class ChatCommandButtonContentPart extends Disposable implements IChatContentPart {
    private readonly commandService;
    readonly domNode: HTMLElement;
    constructor(commandButton: IChatCommandButton, context: IChatContentPartRenderContext, commandService: ICommandService);
    hasSameContent(other: IChatProgressRenderableResponseContent): boolean;
}
