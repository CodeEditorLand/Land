import { URI } from '../../base/common/uri.js';
import { Event } from '../../base/common/event.js';
import { IURITransformer } from '../../base/common/uriIpc.js';
import { IServerChannel } from '../../base/parts/ipc/common/ipc.js';
import { IExtensionGalleryService } from '../../platform/extensionManagement/common/extensionManagement.js';
import { ExtensionManagementCLI } from '../../platform/extensionManagement/common/extensionManagementCLI.js';
import { IExtensionsScannerService } from '../../platform/extensionManagement/common/extensionsScannerService.js';
import { IExtensionDescription } from '../../platform/extensions/common/extensions.js';
import { ILogService } from '../../platform/log/common/log.js';
import { IUserDataProfilesService } from '../../platform/userDataProfile/common/userDataProfile.js';
import { IServerEnvironmentService } from './serverEnvironmentService.js';
import { IRemoteExtensionsScannerService } from '../../platform/remote/common/remoteExtensionsScanner.js';
import { ILanguagePackService } from '../../platform/languagePacks/common/languagePacks.js';
export declare class RemoteExtensionsScannerService implements IRemoteExtensionsScannerService {
    private readonly _extensionManagementCLI;
    private readonly _userDataProfilesService;
    private readonly _extensionsScannerService;
    private readonly _logService;
    private readonly _extensionGalleryService;
    private readonly _languagePackService;
    readonly _serviceBrand: undefined;
    private readonly _whenBuiltinExtensionsReady;
    private readonly _whenExtensionsReady;
    constructor(_extensionManagementCLI: ExtensionManagementCLI, environmentService: IServerEnvironmentService, _userDataProfilesService: IUserDataProfilesService, _extensionsScannerService: IExtensionsScannerService, _logService: ILogService, _extensionGalleryService: IExtensionGalleryService, _languagePackService: ILanguagePackService);
    private _asExtensionIdOrVSIX;
    whenExtensionsReady(): Promise<void>;
    scanExtensions(language?: string, profileLocation?: URI, workspaceExtensionLocations?: URI[], extensionDevelopmentLocations?: URI[], languagePackId?: string): Promise<IExtensionDescription[]>;
    private _scanExtensions;
    private _scanDevelopedExtensions;
    private _scanWorkspaceInstalledExtensions;
    private _scanBuiltinExtensions;
    private _scanInstalledExtensions;
    private _ensureLanguagePackIsInstalled;
    private _massageWhenConditions;
}
export declare class RemoteExtensionsScannerChannel implements IServerChannel {
    private service;
    private getUriTransformer;
    constructor(service: RemoteExtensionsScannerService, getUriTransformer: (requestContext: any) => IURITransformer);
    listen(context: any, event: string): Event<any>;
    call(context: any, command: string, args?: any): Promise<any>;
}
