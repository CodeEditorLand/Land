import { IRelativePattern } from '../../base/common/glob.js';
import { URI } from '../../base/common/uri.js';
export interface LanguageFilter {
    readonly language?: string;
    readonly scheme?: string;
    readonly pattern?: string | IRelativePattern;
    readonly notebookType?: string;
    /**
     * This provider is implemented in the UI thread.
     */
    readonly hasAccessToAllModels?: boolean;
    readonly exclusive?: boolean;
    /**
     * This provider comes from a builtin extension.
     */
    readonly isBuiltin?: boolean;
}
export type LanguageSelector = string | LanguageFilter | ReadonlyArray<string | LanguageFilter>;
export declare function score(selector: LanguageSelector | undefined, candidateUri: URI, candidateLanguage: string, candidateIsSynchronized: boolean, candidateNotebookUri: URI | undefined, candidateNotebookType: string | undefined): number;
export declare function targetsNotebooks(selector: LanguageSelector): boolean;
