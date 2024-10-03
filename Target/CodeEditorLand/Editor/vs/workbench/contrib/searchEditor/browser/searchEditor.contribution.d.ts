import { SearchConfiguration } from './searchEditorInput.js';
export type LegacySearchEditorArgs = Partial<{
    query: string;
    includes: string;
    excludes: string;
    contextLines: number;
    wholeWord: boolean;
    caseSensitive: boolean;
    regexp: boolean;
    useIgnores: boolean;
    showIncludesExcludes: boolean;
    triggerSearch: boolean;
    focusResults: boolean;
    location: 'reuse' | 'new';
}>;
export type OpenSearchEditorArgs = Partial<SearchConfiguration & {
    triggerSearch: boolean;
    focusResults: boolean;
    location: 'reuse' | 'new';
}>;
