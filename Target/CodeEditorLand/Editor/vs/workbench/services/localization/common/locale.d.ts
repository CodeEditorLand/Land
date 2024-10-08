import { ILanguagePackItem } from '../../../../platform/languagePacks/common/languagePacks.js';
export declare const ILocaleService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ILocaleService>;
export interface ILocaleService {
    readonly _serviceBrand: undefined;
    setLocale(languagePackItem: ILanguagePackItem, skipDialog?: boolean): Promise<void>;
    clearLocalePreference(): Promise<void>;
}
export declare const IActiveLanguagePackService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IActiveLanguagePackService>;
export interface IActiveLanguagePackService {
    readonly _serviceBrand: undefined;
    getExtensionIdProvidingCurrentLocale(): Promise<string | undefined>;
}
