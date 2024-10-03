import { Disposable } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { IQuickPickItem } from '../../quickinput/common/quickInput.js';
import { IExtensionGalleryService, IGalleryExtension } from '../../extensionManagement/common/extensionManagement.js';
export declare function getLocale(extension: IGalleryExtension): string | undefined;
export declare const ILanguagePackService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<ILanguagePackService>;
export interface ILanguagePackItem extends IQuickPickItem {
    readonly extensionId?: string;
    readonly galleryExtension?: IGalleryExtension;
}
export interface ILanguagePackService {
    readonly _serviceBrand: undefined;
    getAvailableLanguages(): Promise<Array<ILanguagePackItem>>;
    getInstalledLanguages(): Promise<Array<ILanguagePackItem>>;
    getBuiltInExtensionTranslationsUri(id: string, language: string): Promise<URI | undefined>;
}
export declare abstract class LanguagePackBaseService extends Disposable implements ILanguagePackService {
    protected readonly extensionGalleryService: IExtensionGalleryService;
    readonly _serviceBrand: undefined;
    constructor(extensionGalleryService: IExtensionGalleryService);
    abstract getBuiltInExtensionTranslationsUri(id: string, language: string): Promise<URI | undefined>;
    abstract getInstalledLanguages(): Promise<Array<ILanguagePackItem>>;
    getAvailableLanguages(): Promise<ILanguagePackItem[]>;
    protected createQuickPickItem(locale: string, languageName?: string, languagePack?: IGalleryExtension): IQuickPickItem;
}
