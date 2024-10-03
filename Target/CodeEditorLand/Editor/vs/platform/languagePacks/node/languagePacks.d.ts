import { INativeEnvironmentService } from '../../environment/common/environment.js';
import { IExtensionGalleryService, IExtensionManagementService } from '../../extensionManagement/common/extensionManagement.js';
import { ILogService } from '../../log/common/log.js';
import { ILanguagePackItem, LanguagePackBaseService } from '../common/languagePacks.js';
import { URI } from '../../../base/common/uri.js';
export declare class NativeLanguagePackService extends LanguagePackBaseService {
    private readonly extensionManagementService;
    private readonly logService;
    private readonly cache;
    constructor(extensionManagementService: IExtensionManagementService, environmentService: INativeEnvironmentService, extensionGalleryService: IExtensionGalleryService, logService: ILogService);
    getBuiltInExtensionTranslationsUri(id: string, language: string): Promise<URI | undefined>;
    getInstalledLanguages(): Promise<Array<ILanguagePackItem>>;
    private postInstallExtension;
    private postUninstallExtension;
    update(): Promise<boolean>;
}
