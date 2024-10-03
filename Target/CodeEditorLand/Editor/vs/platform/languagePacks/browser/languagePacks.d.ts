import { URI } from '../../../base/common/uri.js';
import { IExtensionGalleryService } from '../../extensionManagement/common/extensionManagement.js';
import { IExtensionResourceLoaderService } from '../../extensionResourceLoader/common/extensionResourceLoader.js';
import { ILanguagePackItem, LanguagePackBaseService } from '../common/languagePacks.js';
import { ILogService } from '../../log/common/log.js';
export declare class WebLanguagePacksService extends LanguagePackBaseService {
    private readonly extensionResourceLoaderService;
    private readonly logService;
    constructor(extensionResourceLoaderService: IExtensionResourceLoaderService, extensionGalleryService: IExtensionGalleryService, logService: ILogService);
    getBuiltInExtensionTranslationsUri(id: string, language: string): Promise<URI | undefined>;
    getInstalledLanguages(): Promise<ILanguagePackItem[]>;
}
