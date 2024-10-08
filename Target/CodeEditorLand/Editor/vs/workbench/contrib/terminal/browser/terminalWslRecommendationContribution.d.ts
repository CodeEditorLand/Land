import { Disposable } from "../../../../base/common/lifecycle.js";
import { IExtensionManagementService } from "../../../../platform/extensionManagement/common/extensionManagement.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import type { IWorkbenchContribution } from "../../../common/contributions.js";
import { ITerminalService } from "./terminal.js";
export declare class TerminalWslRecommendationContribution extends Disposable implements IWorkbenchContribution {
    static ID: string;
    constructor(instantiationService: IInstantiationService, productService: IProductService, notificationService: INotificationService, extensionManagementService: IExtensionManagementService, terminalService: ITerminalService);
}
