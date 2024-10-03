export { getNLSLanguage, getNLSMessages } from './nls.messages.js';
export interface ILocalizeInfo {
    key: string;
    comment: string[];
}
export interface ILocalizedString {
    original: string;
    value: string;
}
export declare function localize(info: ILocalizeInfo, message: string, ...args: (string | number | boolean | undefined | null)[]): string;
export declare function localize(key: string, message: string, ...args: (string | number | boolean | undefined | null)[]): string;
export declare function localize2(info: ILocalizeInfo, message: string, ...args: (string | number | boolean | undefined | null)[]): ILocalizedString;
export declare function localize2(key: string, message: string, ...args: (string | number | boolean | undefined | null)[]): ILocalizedString;
export interface INLSLanguagePackConfiguration {
    readonly translationsConfigFile: string;
    readonly messagesFile: string;
    readonly corruptMarkerFile: string;
}
export interface INLSConfiguration {
    readonly userLocale: string;
    readonly osLocale: string;
    readonly resolvedLanguage: string;
    readonly languagePack?: INLSLanguagePackConfiguration;
    readonly defaultMessagesFile: string;
    readonly locale: string;
    readonly availableLanguages: Record<string, string>;
    readonly _languagePackSupport?: boolean;
    readonly _languagePackId?: string;
    readonly _translationsConfigFile?: string;
    readonly _cacheRoot?: string;
    readonly _resolvedLanguagePackCoreLocation?: string;
    readonly _corruptedFile?: string;
}
export interface ILanguagePack {
    readonly hash: string;
    readonly label: string | undefined;
    readonly extensions: {
        readonly extensionIdentifier: {
            readonly id: string;
            readonly uuid?: string;
        };
        readonly version: string;
    }[];
    readonly translations: Record<string, string | undefined>;
}
export type ILanguagePacks = Record<string, ILanguagePack | undefined>;
