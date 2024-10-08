import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IRemoteAgentService } from '../../../services/remote/common/remoteAgentService.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IBannerService } from '../../../services/banner/browser/bannerService.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
export declare class InitialRemoteConnectionHealthContribution implements IWorkbenchContribution {
    private readonly _remoteAgentService;
    private readonly _environmentService;
    private readonly _telemetryService;
    private readonly bannerService;
    private readonly dialogService;
    private readonly openerService;
    private readonly hostService;
    private readonly storageService;
    private readonly productService;
    constructor(_remoteAgentService: IRemoteAgentService, _environmentService: IWorkbenchEnvironmentService, _telemetryService: ITelemetryService, bannerService: IBannerService, dialogService: IDialogService, openerService: IOpenerService, hostService: IHostService, storageService: IStorageService, productService: IProductService);
    private _confirmConnection;
    private _checkInitialRemoteConnectionHealth;
    private _measureExtHostLatency;
}
