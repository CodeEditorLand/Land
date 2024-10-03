import { FormattedTextRenderOptions } from './formattedTextRenderer.js';
import { IMarkdownString } from '../common/htmlContent.js';
import * as marked from '../common/marked/marked.js';
import { URI } from '../common/uri.js';
export interface MarkedOptions extends marked.MarkedOptions {
    baseUrl?: never;
}
export interface MarkdownRenderOptions extends FormattedTextRenderOptions {
    readonly codeBlockRenderer?: (languageId: string, value: string) => Promise<HTMLElement>;
    readonly codeBlockRendererSync?: (languageId: string, value: string) => HTMLElement;
    readonly asyncRenderCallback?: () => void;
    readonly fillInIncompleteTokens?: boolean;
    readonly remoteImageIsAllowed?: (uri: URI) => boolean;
    readonly sanitizerOptions?: ISanitizerOptions;
}
export interface ISanitizerOptions {
    replaceWithPlaintext?: boolean;
    allowedTags?: string[];
}
export declare function renderMarkdown(markdown: IMarkdownString, options?: MarkdownRenderOptions, markedOptions?: MarkedOptions): {
    element: HTMLElement;
    dispose: () => void;
};
export declare const allowedMarkdownAttr: string[];
export declare function renderStringAsPlaintext(string: IMarkdownString | string): any;
export declare function renderMarkdownAsPlaintext(markdown: IMarkdownString, withCodeBlocks?: boolean): any;
export declare function fillInIncompleteTokens(tokens: marked.TokensList): marked.TokensList;
