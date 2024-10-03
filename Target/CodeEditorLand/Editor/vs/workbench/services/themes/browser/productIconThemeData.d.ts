import { URI } from '../../../../base/common/uri.js';
import { ExtensionData, IThemeExtensionPoint, IWorkbenchProductIconTheme } from '../common/workbenchThemeService.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IconDefinition, IconContribution } from '../../../../platform/theme/common/iconRegistry.js';
import { IExtensionResourceLoaderService } from '../../../../platform/extensionResourceLoader/common/extensionResourceLoader.js';
export declare const DEFAULT_PRODUCT_ICON_THEME_ID = "";
export declare class ProductIconThemeData implements IWorkbenchProductIconTheme {
    static readonly STORAGE_KEY = "productIconThemeData";
    id: string;
    label: string;
    settingsId: string;
    description?: string;
    isLoaded: boolean;
    location?: URI;
    extensionData?: ExtensionData;
    watch?: boolean;
    iconThemeDocument: ProductIconThemeDocument;
    styleSheetContent?: string;
    private constructor();
    getIcon(iconContribution: IconContribution): IconDefinition | undefined;
    ensureLoaded(fileService: IExtensionResourceLoaderService, logService: ILogService): Promise<string | undefined>;
    reload(fileService: IExtensionResourceLoaderService, logService: ILogService): Promise<string | undefined>;
    private load;
    static fromExtensionTheme(iconTheme: IThemeExtensionPoint, iconThemeLocation: URI, extensionData: ExtensionData): ProductIconThemeData;
    static createUnloadedTheme(id: string): ProductIconThemeData;
    private static _defaultProductIconTheme;
    static get defaultTheme(): ProductIconThemeData;
    static fromStorageData(storageService: IStorageService): ProductIconThemeData | undefined;
    toStorage(storageService: IStorageService): void;
}
interface ProductIconThemeDocument {
    iconDefinitions: Map<string, IconDefinition>;
}
export {};
