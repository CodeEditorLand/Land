import { Disposable } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { IExtensionsProfileScannerService } from '../common/extensionsProfileScannerService.js';
import { IExtensionsScannerService } from '../common/extensionsScannerService.js';
import { INativeServerExtensionManagementService } from './extensionManagementService.js';
import { IExtensionIdentifier } from '../../extensions/common/extensions.js';
import { IFileService } from '../../files/common/files.js';
import { ILogService } from '../../log/common/log.js';
import { IUriIdentityService } from '../../uriIdentity/common/uriIdentity.js';
import { IUserDataProfilesService } from '../../userDataProfile/common/userDataProfile.js';
export interface DidChangeProfileExtensionsEvent {
    readonly added?: {
        readonly extensions: readonly IExtensionIdentifier[];
        readonly profileLocation: URI;
    };
    readonly removed?: {
        readonly extensions: readonly IExtensionIdentifier[];
        readonly profileLocation: URI;
    };
}
export declare class ExtensionsWatcher extends Disposable {
    private readonly extensionManagementService;
    private readonly extensionsScannerService;
    private readonly userDataProfilesService;
    private readonly extensionsProfileScannerService;
    private readonly uriIdentityService;
    private readonly fileService;
    private readonly logService;
    private readonly _onDidChangeExtensionsByAnotherSource;
    readonly onDidChangeExtensionsByAnotherSource: import("../../../workbench/workbench.web.main.internal.js").Event<DidChangeProfileExtensionsEvent>;
    private readonly allExtensions;
    private readonly extensionsProfileWatchDisposables;
    constructor(extensionManagementService: INativeServerExtensionManagementService, extensionsScannerService: IExtensionsScannerService, userDataProfilesService: IUserDataProfilesService, extensionsProfileScannerService: IExtensionsProfileScannerService, uriIdentityService: IUriIdentityService, fileService: IFileService, logService: ILogService);
    private initialize;
    private registerListeners;
    private onDidChangeProfiles;
    private onAddExtensions;
    private onDidAddExtensions;
    private onRemoveExtensions;
    private onDidRemoveExtensions;
    private onDidFilesChange;
    private onDidExtensionsProfileChange;
    private populateExtensionsFromProfile;
    private uninstallExtensionsNotInProfiles;
    private addExtensionWithKey;
    private removeExtensionWithKey;
    private getKey;
    private fromKey;
}
