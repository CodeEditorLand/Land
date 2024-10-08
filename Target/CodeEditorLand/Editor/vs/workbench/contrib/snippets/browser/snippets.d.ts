import { SnippetFile, Snippet } from './snippetsFile.js';
export declare const ISnippetsService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ISnippetsService>;
export interface ISnippetGetOptions {
    includeDisabledSnippets?: boolean;
    includeNoPrefixSnippets?: boolean;
    noRecencySort?: boolean;
    fileTemplateSnippets?: boolean;
}
export interface ISnippetsService {
    readonly _serviceBrand: undefined;
    getSnippetFiles(): Promise<Iterable<SnippetFile>>;
    isEnabled(snippet: Snippet): boolean;
    updateEnablement(snippet: Snippet, enabled: boolean): void;
    updateUsageTimestamp(snippet: Snippet): void;
    getSnippets(languageId: string | undefined, opt?: ISnippetGetOptions): Promise<Snippet[]>;
    getSnippetsSync(languageId: string, opt?: ISnippetGetOptions): Snippet[];
}
