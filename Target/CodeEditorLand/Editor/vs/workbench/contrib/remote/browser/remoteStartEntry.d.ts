import { Disposable } from '../../../../base/common/lifecycle.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IExtensionManagementService } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IWorkbenchExtensionEnablementService } from '../../../services/extensionManagement/common/extensionManagement.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
export declare const showStartEntryInWeb: RawContextKey<boolean>;
export declare class RemoteStartEntry extends Disposable implements IWorkbenchContribution {
    private readonly commandService;
    private readonly productService;
    private readonly extensionManagementService;
    private readonly extensionEnablementService;
    private readonly telemetryService;
    private readonly contextKeyService;
    private static readonly REMOTE_WEB_START_ENTRY_ACTIONS_COMMAND_ID;
    private readonly remoteExtensionId;
    private readonly startCommand;
    constructor(commandService: ICommandService, productService: IProductService, extensionManagementService: IExtensionManagementService, extensionEnablementService: IWorkbenchExtensionEnablementService, telemetryService: ITelemetryService, contextKeyService: IContextKeyService);
    private registerActions;
    private registerListeners;
    private _init;
    private showWebRemoteStartActions;
}
