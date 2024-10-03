import { IManagedHoverOptions } from '../../../../base/browser/ui/hover/hover.js';
import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IChatAgentData, IChatAgentNameService, IChatAgentService } from '../common/chatAgents.js';
import { IExtensionsWorkbenchService } from '../../extensions/common/extensions.js';
export declare class ChatAgentHover extends Disposable {
    private readonly chatAgentService;
    private readonly extensionService;
    private readonly chatAgentNameService;
    readonly domNode: HTMLElement;
    private readonly icon;
    private readonly name;
    private readonly extensionName;
    private readonly publisherName;
    private readonly description;
    private readonly _onDidChangeContents;
    readonly onDidChangeContents: Event<void>;
    constructor(chatAgentService: IChatAgentService, extensionService: IExtensionsWorkbenchService, chatAgentNameService: IChatAgentNameService);
    setAgent(id: string): void;
}
export declare function getChatAgentHoverOptions(getAgent: () => IChatAgentData | undefined, commandService: ICommandService): IManagedHoverOptions;
