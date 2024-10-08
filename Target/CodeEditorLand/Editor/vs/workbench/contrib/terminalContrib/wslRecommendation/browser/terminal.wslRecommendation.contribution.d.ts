import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IExtensionManagementService } from '../../../../../platform/extensionManagement/common/extensionManagement.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../../platform/notification/common/notification.js';
import { IProductService } from '../../../../../platform/product/common/productService.js';
import { type IWorkbenchContribution } from '../../../../common/contributions.js';
import { ITerminalService } from '../../../terminal/browser/terminal.js';
export declare class TerminalWslRecommendationContribution extends Disposable implements IWorkbenchContribution {
    static ID: string;
    constructor(extensionManagementService: IExtensionManagementService, instantiationService: IInstantiationService, notificationService: INotificationService, productService: IProductService, terminalService: ITerminalService);
}
