import { IButtonStyles } from '../../../../base/browser/ui/button/button.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ChatAgentLocation, IChatAgentService } from '../common/chatAgents.js';
import { IChatFollowup } from '../common/chatService.js';
export declare class ChatFollowups<T extends IChatFollowup> extends Disposable {
    private readonly location;
    private readonly options;
    private readonly clickHandler;
    private readonly chatAgentService;
    constructor(container: HTMLElement, followups: T[], location: ChatAgentLocation, options: IButtonStyles | undefined, clickHandler: (followup: T) => void, chatAgentService: IChatAgentService);
    private renderFollowup;
}
