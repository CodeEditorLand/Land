declare class _Hooks {
    static passThroughHooks: Set<string>;
    constructor(options: any);
    options: any;
    /**
     * Process markdown before marked
     */
    preprocess(markdown: any): any;
    /**
     * Process HTML after marked is finished
     */
    postprocess(html: any): any;
    /**
     * Process all tokens before walk tokens
     */
    processAllTokens(tokens: any): any;
}
/**
 * Block Lexer
 */
declare class _Lexer {
    /**
     * Expose Rules
     */
    static get rules(): {
        block: {
            normal: {
                blockquote: RegExp;
                code: RegExp;
                def: RegExp;
                fences: RegExp;
                heading: RegExp;
                hr: RegExp;
                html: RegExp;
                lheading: RegExp;
                list: RegExp;
                newline: RegExp;
                paragraph: RegExp;
                table: {
                    exec: () => null;
                };
                text: RegExp;
            };
            gfm: {
                table: RegExp;
                paragraph: RegExp;
                blockquote: RegExp;
                code: RegExp;
                def: RegExp;
                fences: RegExp;
                heading: RegExp;
                hr: RegExp;
                html: RegExp;
                lheading: RegExp;
                list: RegExp;
                newline: RegExp;
                text: RegExp;
            };
            pedantic: {
                html: RegExp;
                def: RegExp;
                heading: RegExp;
                fences: {
                    exec: () => null;
                };
                lheading: RegExp;
                paragraph: RegExp;
                blockquote: RegExp;
                code: RegExp;
                hr: RegExp;
                list: RegExp;
                newline: RegExp;
                table: {
                    exec: () => null;
                };
                text: RegExp;
            };
        };
        inline: {
            normal: {
                _backpedal: {
                    exec: () => null;
                };
                anyPunctuation: RegExp;
                autolink: RegExp;
                blockSkip: RegExp;
                br: RegExp;
                code: RegExp;
                del: {
                    exec: () => null;
                };
                emStrongLDelim: RegExp;
                emStrongRDelimAst: RegExp;
                emStrongRDelimUnd: RegExp;
                escape: RegExp;
                link: RegExp;
                nolink: RegExp;
                punctuation: RegExp;
                reflink: RegExp;
                reflinkSearch: RegExp;
                tag: RegExp;
                text: RegExp;
                url: {
                    exec: () => null;
                };
            };
            gfm: {
                escape: RegExp;
                url: RegExp;
                _backpedal: RegExp;
                del: RegExp;
                text: RegExp;
                anyPunctuation: RegExp;
                autolink: RegExp;
                blockSkip: RegExp;
                br: RegExp;
                code: RegExp;
                emStrongLDelim: RegExp;
                emStrongRDelimAst: RegExp;
                emStrongRDelimUnd: RegExp;
                link: RegExp;
                nolink: RegExp;
                punctuation: RegExp;
                reflink: RegExp;
                reflinkSearch: RegExp;
                tag: RegExp;
            };
            breaks: {
                br: RegExp;
                text: RegExp;
                escape: RegExp;
                url: RegExp;
                _backpedal: RegExp;
                del: RegExp;
                anyPunctuation: RegExp;
                autolink: RegExp;
                blockSkip: RegExp;
                code: RegExp;
                emStrongLDelim: RegExp;
                emStrongRDelimAst: RegExp;
                emStrongRDelimUnd: RegExp;
                link: RegExp;
                nolink: RegExp;
                punctuation: RegExp;
                reflink: RegExp;
                reflinkSearch: RegExp;
                tag: RegExp;
            };
            pedantic: {
                link: RegExp;
                reflink: RegExp;
                _backpedal: {
                    exec: () => null;
                };
                anyPunctuation: RegExp;
                autolink: RegExp;
                blockSkip: RegExp;
                br: RegExp;
                code: RegExp;
                del: {
                    exec: () => null;
                };
                emStrongLDelim: RegExp;
                emStrongRDelimAst: RegExp;
                emStrongRDelimUnd: RegExp;
                escape: RegExp;
                nolink: RegExp;
                punctuation: RegExp;
                reflinkSearch: RegExp;
                tag: RegExp;
                text: RegExp;
                url: {
                    exec: () => null;
                };
            };
        };
    };
    /**
     * Static Lex Method
     */
    static lex(src: any, options: any): any[];
    /**
     * Static Lex Inline Method
     */
    static lexInline(src: any, options: any): any[];
    constructor(options: any);
    tokens: any[];
    options: any;
    state: {
        inLink: boolean;
        inRawBlock: boolean;
        top: boolean;
    };
    tokenizer: any;
    inlineQueue: any[];
    /**
     * Preprocessing
     */
    lex(src: any): any[];
    blockTokens(src: any, tokens?: any[], lastParagraphClipped?: boolean): any[];
    inline(src: any, tokens?: any[]): any[];
    /**
     * Lexing/Compiling
     */
    inlineTokens(src: any, tokens?: any[]): any[];
}
export class Marked {
    constructor(...args: any[]);
    defaults: {
        async: boolean;
        breaks: boolean;
        extensions: null;
        gfm: boolean;
        hooks: null;
        pedantic: boolean;
        renderer: null;
        silent: boolean;
        tokenizer: null;
        walkTokens: null;
    };
    options: (opt: any) => this;
    parse: (src: any, options: any) => any;
    parseInline: (src: any, options: any) => any;
    Parser: typeof _Parser;
    Renderer: typeof _Renderer;
    TextRenderer: typeof _TextRenderer;
    Lexer: typeof _Lexer;
    Tokenizer: typeof _Tokenizer;
    Hooks: typeof _Hooks;
    /**
     * Run callback for every token
     */
    walkTokens(tokens: any, callback: any): any;
    use(...args: any[]): this;
    setOptions(opt: any): this;
    lexer(src: any, options: any): any[];
    parser(tokens: any, options: any): string;
    parseMarkdown(lexer: any, parser: any): (src: any, options: any) => any;
    onError(silent: any, async: any): (e: any) => string | Promise<string>;
}
/**
 * Parsing & Compiling
 */
declare class _Parser {
    /**
     * Static Parse Method
     */
    static parse(tokens: any, options: any): string;
    /**
     * Static Parse Inline Method
     */
    static parseInline(tokens: any, options: any): string;
    constructor(options: any);
    options: any;
    renderer: any;
    textRenderer: _TextRenderer;
    /**
     * Parse Loop
     */
    parse(tokens: any, top?: boolean): string;
    /**
     * Parse Inline Tokens
     */
    parseInline(tokens: any, renderer: any): string;
}
/**
 * Renderer
 */
declare class _Renderer {
    constructor(options: any);
    options: any;
    parser: any;
    space(token: any): string;
    code({ text, lang, escaped }: {
        text: any;
        lang: any;
        escaped: any;
    }): string;
    blockquote({ tokens }: {
        tokens: any;
    }): string;
    html({ text }: {
        text: any;
    }): any;
    heading({ tokens, depth }: {
        tokens: any;
        depth: any;
    }): string;
    hr(token: any): string;
    list(token: any): string;
    listitem(item: any): string;
    checkbox({ checked }: {
        checked: any;
    }): string;
    paragraph({ tokens }: {
        tokens: any;
    }): string;
    table(token: any): string;
    tablerow({ text }: {
        text: any;
    }): string;
    tablecell(token: any): string;
    /**
     * span level renderer
     */
    strong({ tokens }: {
        tokens: any;
    }): string;
    em({ tokens }: {
        tokens: any;
    }): string;
    codespan({ text }: {
        text: any;
    }): string;
    br(token: any): string;
    del({ tokens }: {
        tokens: any;
    }): string;
    link({ href, title, tokens }: {
        href: any;
        title: any;
        tokens: any;
    }): any;
    image({ href, title, text }: {
        href: any;
        title: any;
        text: any;
    }): any;
    text(token: any): any;
}
/**
 * TextRenderer
 * returns only the textual part of the token
 */
declare class _TextRenderer {
    strong({ text }: {
        text: any;
    }): any;
    em({ text }: {
        text: any;
    }): any;
    codespan({ text }: {
        text: any;
    }): any;
    del({ text }: {
        text: any;
    }): any;
    html({ text }: {
        text: any;
    }): any;
    text({ text }: {
        text: any;
    }): any;
    link({ text }: {
        text: any;
    }): string;
    image({ text }: {
        text: any;
    }): string;
    br(): string;
}
/**
 * Tokenizer
 */
declare class _Tokenizer {
    constructor(options: any);
    options: any;
    rules: any;
    lexer: any;
    space(src: any): {
        type: string;
        raw: any;
    } | undefined;
    code(src: any): {
        type: string;
        raw: any;
        codeBlockStyle: string;
        text: any;
    } | undefined;
    fences(src: any): {
        type: string;
        raw: any;
        lang: any;
        text: any;
    } | undefined;
    heading(src: any): {
        type: string;
        raw: any;
        depth: any;
        text: any;
        tokens: any;
    } | undefined;
    hr(src: any): {
        type: string;
        raw: any;
    } | undefined;
    blockquote(src: any): any;
    list(src: any): {
        type: string;
        raw: string;
        ordered: boolean;
        start: string | number;
        loose: boolean;
        items: never[];
    } | undefined;
    html(src: any): {
        type: string;
        block: boolean;
        raw: any;
        pre: boolean;
        text: any;
    } | undefined;
    def(src: any): {
        type: string;
        tag: any;
        raw: any;
        href: any;
        title: any;
    } | undefined;
    table(src: any): {
        type: string;
        raw: any;
        header: never[];
        align: never[];
        rows: never[];
    } | undefined;
    lheading(src: any): {
        type: string;
        raw: any;
        depth: number;
        text: any;
        tokens: any;
    } | undefined;
    paragraph(src: any): {
        type: string;
        raw: any;
        text: any;
        tokens: any;
    } | undefined;
    text(src: any): {
        type: string;
        raw: any;
        text: any;
        tokens: any;
    } | undefined;
    escape(src: any): {
        type: string;
        raw: any;
        text: any;
    } | undefined;
    tag(src: any): {
        type: string;
        raw: any;
        inLink: any;
        inRawBlock: any;
        block: boolean;
        text: any;
    } | undefined;
    link(src: any): {
        type: string;
        raw: any;
        href: any;
        title: any;
        text: any;
    } | undefined;
    reflink(src: any, links: any): {
        type: string;
        raw: any;
        href: any;
        title: any;
        text: any;
    } | {
        type: string;
        raw: any;
        text: any;
    } | undefined;
    emStrong(src: any, maskedSrc: any, prevChar?: string): {
        type: string;
        raw: any;
        text: any;
        tokens: any;
    } | undefined;
    codespan(src: any): {
        type: string;
        raw: any;
        text: any;
    } | undefined;
    br(src: any): {
        type: string;
        raw: any;
    } | undefined;
    del(src: any): {
        type: string;
        raw: any;
        text: any;
        tokens: any;
    } | undefined;
    autolink(src: any): {
        type: string;
        raw: any;
        text: any;
        href: any;
        tokens: {
            type: string;
            raw: any;
            text: any;
        }[];
    } | undefined;
    url(src: any): {
        type: string;
        raw: any;
        text: any;
        href: any;
        tokens: {
            type: string;
            raw: any;
            text: any;
        }[];
    } | undefined;
    inlineText(src: any): {
        type: string;
        raw: any;
        text: any;
    } | undefined;
}
declare namespace _defaults {
    let async: boolean;
    let breaks: boolean;
    let extensions: null;
    let gfm: boolean;
    let hooks: null;
    let pedantic: boolean;
    let renderer: null;
    let silent: boolean;
    let tokenizer: null;
    let walkTokens: null;
}
/**
 * marked v14.0.0 - a markdown parser
 * Copyright (c) 2011-2024, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/markedjs/marked
 */
/**
 * DO NOT EDIT THIS FILE
 * The code in this file is generated from files in ./src/
 */
/**
 * Gets the original marked default options.
 */
declare function _getDefaults(): {
    async: boolean;
    breaks: boolean;
    extensions: null;
    gfm: boolean;
    hooks: null;
    pedantic: boolean;
    renderer: null;
    silent: boolean;
    tokenizer: null;
    walkTokens: null;
};
/**
 * Static Lex Method
 */
export function lexer(src: any, options: any): any[];
export function marked(src: any, opt: any): any;
export namespace marked {
    export function options(options: any): typeof marked;
    export function setOptions(options: any): typeof marked;
    export { _getDefaults as getDefaults };
    export { _defaults as defaults };
    /**
     * Use Extension
     */
    export function use(...args: any[]): typeof marked;
    /**
     * Run callback for every token
     */
    export function walkTokens(tokens: any, callback: any): any;
    import parseInline = Marked.parseInline;
    export { parseInline };
    export { _Parser as Parser };
    import parser = _Parser.parse;
    export { parser };
    export { _Renderer as Renderer };
    export { _TextRenderer as TextRenderer };
    export { _Lexer as Lexer };
    import lexer = _Lexer.lex;
    export { lexer };
    export { _Tokenizer as Tokenizer };
    export { _Hooks as Hooks };
    export { marked as parse };
}
export function options(options: any): typeof marked;
export function parse(src: any, opt: any): any;
export namespace parse { }
export function parseInline(src: any, options: any): any;
/**
 * Static Parse Method
 */
export function parser(tokens: any, options: any): string;
export function setOptions(options: any): typeof marked;
/**
 * Use Extension
 */
export function use(...args: any[]): typeof marked;
/**
 * Run callback for every token
 */
export function walkTokens(tokens: any, callback: any): any;
declare const markedInstance: Marked;
export { _Hooks as Hooks, _Lexer as Lexer, _Parser as Parser, _Renderer as Renderer, _TextRenderer as TextRenderer, _Tokenizer as Tokenizer, _defaults as defaults, _getDefaults as getDefaults };
