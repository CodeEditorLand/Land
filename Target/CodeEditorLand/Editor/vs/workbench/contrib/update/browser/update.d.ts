import { Disposable } from '../../../../base/common/lifecycle.js';
import { IActivityService } from '../../../services/activity/common/activity.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IUpdateService } from '../../../../platform/update/common/update.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IBrowserWorkbenchEnvironmentService } from '../../../services/environment/browser/environmentService.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { RawContextKey, IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
export declare const CONTEXT_UPDATE_STATE: RawContextKey<string>;
export declare const MAJOR_MINOR_UPDATE_AVAILABLE: RawContextKey<boolean>;
export declare const RELEASE_NOTES_URL: RawContextKey<string>;
export declare const DOWNLOAD_URL: RawContextKey<string>;
export declare function showReleaseNotesInEditor(instantiationService: IInstantiationService, version: string, useCurrentFile: boolean): Promise<boolean>;
export declare class ProductContribution implements IWorkbenchContribution {
    private static readonly KEY;
    constructor(storageService: IStorageService, instantiationService: IInstantiationService, notificationService: INotificationService, environmentService: IBrowserWorkbenchEnvironmentService, openerService: IOpenerService, configurationService: IConfigurationService, hostService: IHostService, productService: IProductService, contextKeyService: IContextKeyService);
}
export declare class UpdateContribution extends Disposable implements IWorkbenchContribution {
    private readonly storageService;
    private readonly instantiationService;
    private readonly notificationService;
    private readonly dialogService;
    private readonly updateService;
    private readonly activityService;
    private readonly contextKeyService;
    private readonly productService;
    private readonly openerService;
    private readonly configurationService;
    private readonly hostService;
    private state;
    private readonly badgeDisposable;
    private updateStateContextKey;
    private majorMinorUpdateAvailableContextKey;
    constructor(storageService: IStorageService, instantiationService: IInstantiationService, notificationService: INotificationService, dialogService: IDialogService, updateService: IUpdateService, activityService: IActivityService, contextKeyService: IContextKeyService, productService: IProductService, openerService: IOpenerService, configurationService: IConfigurationService, hostService: IHostService);
    private onUpdateStateChange;
    private onError;
    private onUpdateNotAvailable;
    private onUpdateAvailable;
    private onUpdateDownloaded;
    private onUpdateReady;
    private shouldShowNotification;
    private registerGlobalActivityActions;
}
export declare class SwitchProductQualityContribution extends Disposable implements IWorkbenchContribution {
    private readonly productService;
    private readonly environmentService;
    constructor(productService: IProductService, environmentService: IBrowserWorkbenchEnvironmentService);
    private registerGlobalActivityActions;
}
