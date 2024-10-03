import { URI } from '../../../base/common/uri.js';
export interface ILanguageAssociation {
    readonly id: string;
    readonly mime: string;
    readonly filename?: string;
    readonly extension?: string;
    readonly filepattern?: string;
    readonly firstline?: RegExp;
}
export declare function registerPlatformLanguageAssociation(association: ILanguageAssociation, warnOnOverwrite?: boolean): void;
export declare function registerConfiguredLanguageAssociation(association: ILanguageAssociation): void;
export declare function clearPlatformLanguageAssociations(): void;
export declare function clearConfiguredLanguageAssociations(): void;
export declare function getMimeTypes(resource: URI | null, firstLine?: string): string[];
export declare function getLanguageIds(resource: URI | null, firstLine?: string): string[];
