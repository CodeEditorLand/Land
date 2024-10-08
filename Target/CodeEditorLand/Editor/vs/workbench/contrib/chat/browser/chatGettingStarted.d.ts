import { IWorkbenchContribution } from '../../../common/contributions.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IActivityService } from '../../../services/activity/common/activity.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IExtensionManagementService } from '../../../../platform/extensionManagement/common/extensionManagement.js';
export declare class ChatGettingStartedContribution extends Disposable implements IWorkbenchContribution {
    private readonly contextService;
    private readonly productService;
    private readonly storageService;
    private readonly activityService;
    private readonly extensionService;
    private readonly commandService;
    private readonly configurationService;
    private readonly extensionManagementService;
    static readonly ID = "workbench.contrib.chatGettingStarted";
    private readonly showChatGettingStartedDisposable;
    constructor(contextService: IContextKeyService, productService: IProductService, storageService: IStorageService, activityService: IActivityService, extensionService: IExtensionService, commandService: ICommandService, configurationService: IConfigurationService, extensionManagementService: IExtensionManagementService);
    private registerListeners;
    private displayBadge;
    private displayChatPanel;
}
