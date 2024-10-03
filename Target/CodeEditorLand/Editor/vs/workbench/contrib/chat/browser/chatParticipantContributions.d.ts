import { Disposable } from '../../../../base/common/lifecycle.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IExtensionsWorkbenchService } from '../../extensions/common/extensions.js';
import { IChatAgentService } from '../common/chatAgents.js';
export declare class ChatExtensionPointHandler implements IWorkbenchContribution {
    private readonly _chatAgentService;
    private readonly logService;
    static readonly ID = "workbench.contrib.chatExtensionPointHandler";
    private _viewContainer;
    private _participantRegistrationDisposables;
    constructor(_chatAgentService: IChatAgentService, logService: ILogService);
    private handleAndRegisterChatExtensions;
    private registerViewContainer;
    private registerDefaultParticipantView;
    private registerChatEditingView;
}
export declare class ChatCompatibilityNotifier extends Disposable implements IWorkbenchContribution {
    private readonly productService;
    static readonly ID = "workbench.contrib.chatCompatNotifier";
    private registeredWelcomeView;
    constructor(extensionsWorkbenchService: IExtensionsWorkbenchService, contextKeyService: IContextKeyService, productService: IProductService);
    private registerWelcomeView;
}
