import { Event } from '../../../base/common/event.js';
import { IDisposable } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { ILanguageIdCodec } from '../languages.js';
export declare const ILanguageService: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ILanguageService>;
export interface ILanguageExtensionPoint {
    id: string;
    extensions?: string[];
    filenames?: string[];
    filenamePatterns?: string[];
    firstLine?: string;
    aliases?: string[];
    mimetypes?: string[];
    configuration?: URI;
    icon?: ILanguageIcon;
}
export interface ILanguageSelection {
    readonly languageId: string;
    readonly onDidChange: Event<string>;
}
export interface ILanguageNameIdPair {
    readonly languageName: string;
    readonly languageId: string;
}
export interface ILanguageIcon {
    readonly light: URI;
    readonly dark: URI;
}
export interface ILanguageService {
    readonly _serviceBrand: undefined;
    readonly languageIdCodec: ILanguageIdCodec;
    onDidRequestBasicLanguageFeatures: Event<string>;
    onDidRequestRichLanguageFeatures: Event<string>;
    onDidChange: Event<void>;
    registerLanguage(def: ILanguageExtensionPoint): IDisposable;
    isRegisteredLanguageId(languageId: string): boolean;
    getRegisteredLanguageIds(): string[];
    getSortedRegisteredLanguageNames(): ILanguageNameIdPair[];
    getLanguageName(languageId: string): string | null;
    getMimeType(languageId: string): string | null;
    getIcon(languageId: string): ILanguageIcon | null;
    getExtensions(languageId: string): ReadonlyArray<string>;
    getFilenames(languageId: string): ReadonlyArray<string>;
    getConfigurationFiles(languageId: string): ReadonlyArray<URI>;
    getLanguageIdByLanguageName(languageName: string): string | null;
    getLanguageIdByMimeType(mimeType: string | null | undefined): string | null;
    guessLanguageIdByFilepathOrFirstLine(resource: URI, firstLine?: string): string | null;
    createById(languageId: string | null | undefined): ILanguageSelection;
    createByMimeType(mimeType: string | null | undefined): ILanguageSelection;
    createByFilepathOrFirstLine(resource: URI | null, firstLine?: string): ILanguageSelection;
    requestBasicLanguageFeatures(languageId: string): void;
    requestRichLanguageFeatures(languageId: string): void;
}
