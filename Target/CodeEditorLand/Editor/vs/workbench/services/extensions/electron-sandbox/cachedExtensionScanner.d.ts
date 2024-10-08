import { IExtensionDescription } from '../../../../platform/extensions/common/extensions.js';
import { IExtensionsScannerService } from '../../../../platform/extensionManagement/common/extensionsScannerService.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IHostService } from '../../host/browser/host.js';
import { IUserDataProfileService } from '../../userDataProfile/common/userDataProfile.js';
import { IWorkbenchExtensionManagementService } from '../../extensionManagement/common/extensionManagement.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
export declare class CachedExtensionScanner {
    private readonly _notificationService;
    private readonly _hostService;
    private readonly _extensionsScannerService;
    private readonly _userDataProfileService;
    private readonly _extensionManagementService;
    private readonly _environmentService;
    private readonly _logService;
    readonly scannedExtensions: Promise<IExtensionDescription[]>;
    private _scannedExtensionsResolve;
    private _scannedExtensionsReject;
    constructor(_notificationService: INotificationService, _hostService: IHostService, _extensionsScannerService: IExtensionsScannerService, _userDataProfileService: IUserDataProfileService, _extensionManagementService: IWorkbenchExtensionManagementService, _environmentService: IWorkbenchEnvironmentService, _logService: ILogService);
    startScanningExtensions(): Promise<void>;
    private _scanInstalledExtensions;
}
