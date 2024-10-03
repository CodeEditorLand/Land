import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { ExtensionKind } from '../../../../platform/environment/common/environment.js';
import { ExtensionIdentifier } from '../../../../platform/extensions/common/extensions.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IRemoteAuthorityResolverService, ResolverResult } from '../../../../platform/remote/common/remoteAuthorityResolver.js';
import { IRemoteExtensionsScannerService } from '../../../../platform/remote/common/remoteExtensionsScanner.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IWorkspaceTrustManagementService } from '../../../../platform/workspace/common/workspaceTrust.js';
import { IBrowserWorkbenchEnvironmentService } from '../../environment/browser/environmentService.js';
import { IWebExtensionsScannerService, IWorkbenchExtensionEnablementService, IWorkbenchExtensionManagementService } from '../../extensionManagement/common/extensionManagement.js';
import { AbstractExtensionService, ResolvedExtensions } from '../common/abstractExtensionService.js';
import { ExtensionHostKind, ExtensionRunningPreference, IExtensionHostKindPicker } from '../common/extensionHostKind.js';
import { IExtensionManifestPropertiesService } from '../common/extensionManifestPropertiesService.js';
import { IExtensionService } from '../common/extensions.js';
import { ILifecycleService } from '../../lifecycle/common/lifecycle.js';
import { IRemoteAgentService } from '../../remote/common/remoteAgentService.js';
import { IRemoteExplorerService } from '../../remote/common/remoteExplorerService.js';
import { IUserDataInitializationService } from '../../userData/browser/userDataInit.js';
import { IUserDataProfileService } from '../../userDataProfile/common/userDataProfile.js';
export declare class ExtensionService extends AbstractExtensionService implements IExtensionService {
    private readonly _browserEnvironmentService;
    private readonly _webExtensionsScannerService;
    private readonly _userDataInitializationService;
    private readonly _userDataProfileService;
    private readonly _workspaceTrustManagementService;
    private readonly _remoteExplorerService;
    constructor(instantiationService: IInstantiationService, notificationService: INotificationService, _browserEnvironmentService: IBrowserWorkbenchEnvironmentService, telemetryService: ITelemetryService, extensionEnablementService: IWorkbenchExtensionEnablementService, fileService: IFileService, productService: IProductService, extensionManagementService: IWorkbenchExtensionManagementService, contextService: IWorkspaceContextService, configurationService: IConfigurationService, extensionManifestPropertiesService: IExtensionManifestPropertiesService, _webExtensionsScannerService: IWebExtensionsScannerService, logService: ILogService, remoteAgentService: IRemoteAgentService, remoteExtensionsScannerService: IRemoteExtensionsScannerService, lifecycleService: ILifecycleService, remoteAuthorityResolverService: IRemoteAuthorityResolverService, _userDataInitializationService: IUserDataInitializationService, _userDataProfileService: IUserDataProfileService, _workspaceTrustManagementService: IWorkspaceTrustManagementService, _remoteExplorerService: IRemoteExplorerService, dialogService: IDialogService);
    private _initFetchFileSystem;
    private _scanWebExtensions;
    protected _resolveExtensionsDefault(): Promise<ResolvedExtensions>;
    protected _resolveExtensions(): Promise<ResolvedExtensions>;
    protected _onExtensionHostExit(code: number): Promise<void>;
    protected _resolveAuthority(remoteAuthority: string): Promise<ResolverResult>;
}
export declare class BrowserExtensionHostKindPicker implements IExtensionHostKindPicker {
    private readonly _logService;
    constructor(_logService: ILogService);
    pickExtensionHostKind(extensionId: ExtensionIdentifier, extensionKinds: ExtensionKind[], isInstalledLocally: boolean, isInstalledRemotely: boolean, preference: ExtensionRunningPreference): ExtensionHostKind | null;
    static pickRunningLocation(extensionKinds: ExtensionKind[], isInstalledLocally: boolean, isInstalledRemotely: boolean, preference: ExtensionRunningPreference): ExtensionHostKind | null;
}
