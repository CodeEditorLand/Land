import { ChatViewPane } from '../chatViewPane.js';
import { IChatRequestViewModel, IChatResponseViewModel } from '../../common/chatViewModel.js';
import { IWorkbenchContribution } from '../../../../common/contributions.js';
import { IActionViewItemService } from '../../../../../platform/actions/browser/actionViewItemService.js';
import { IChatAgentService } from '../../common/chatAgents.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
export interface IChatViewTitleActionContext {
    chatView: ChatViewPane;
}
export declare function isChatViewTitleActionContext(obj: unknown): obj is IChatViewTitleActionContext;
export declare const CHAT_CATEGORY: import("../../../../../nls.js").ILocalizedString;
export declare const CHAT_OPEN_ACTION_ID = "workbench.action.chat.open";
export interface IChatViewOpenOptions {
    query: string;
    isPartialQuery?: boolean;
    previousRequests?: IChatViewOpenRequestEntry[];
}
export interface IChatViewOpenRequestEntry {
    request: string;
    response: string;
}
export declare function registerChatActions(): void;
export declare function stringifyItem(item: IChatRequestViewModel | IChatResponseViewModel, includeName?: boolean): string;
export declare class ChatCommandCenterRendering implements IWorkbenchContribution {
    static readonly ID = "chat.commandCenterRendering";
    private readonly _store;
    constructor(actionViewItemService: IActionViewItemService, agentService: IChatAgentService, instantiationService: IInstantiationService);
    dispose(): void;
}
