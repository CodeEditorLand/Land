import { Color } from '../../../base/common/color.js';
import { Event } from '../../../base/common/event.js';
import { IJSONSchema } from '../../../base/common/jsonSchema.js';
import { IColorTheme } from './themeService.js';
type TokenClassificationString = string;
export declare const typeAndModifierIdPattern = "^\\w+[-_\\w+]*$";
export interface TokenSelector {
    match(type: string, modifiers: string[], language: string): number;
    readonly id: string;
}
export interface TokenTypeOrModifierContribution {
    readonly num: number;
    readonly id: string;
    readonly superType?: string;
    readonly description: string;
    readonly deprecationMessage?: string;
}
export interface TokenStyleData {
    foreground: Color | undefined;
    bold: boolean | undefined;
    underline: boolean | undefined;
    strikethrough: boolean | undefined;
    italic: boolean | undefined;
}
export declare class TokenStyle implements Readonly<TokenStyleData> {
    readonly foreground: Color | undefined;
    readonly bold: boolean | undefined;
    readonly underline: boolean | undefined;
    readonly strikethrough: boolean | undefined;
    readonly italic: boolean | undefined;
    constructor(foreground: Color | undefined, bold: boolean | undefined, underline: boolean | undefined, strikethrough: boolean | undefined, italic: boolean | undefined);
}
export declare namespace TokenStyle {
    function toJSONObject(style: TokenStyle): any;
    function fromJSONObject(obj: any): TokenStyle | undefined;
    function equals(s1: any, s2: any): boolean;
    function is(s: any): s is TokenStyle;
    function fromData(data: {
        foreground: Color | undefined;
        bold: boolean | undefined;
        underline: boolean | undefined;
        strikethrough: boolean | undefined;
        italic: boolean | undefined;
    }): TokenStyle;
    function fromSettings(foreground: string | undefined, fontStyle: string | undefined): TokenStyle;
    function fromSettings(foreground: string | undefined, fontStyle: string | undefined, bold: boolean | undefined, underline: boolean | undefined, strikethrough: boolean | undefined, italic: boolean | undefined): TokenStyle;
}
export type ProbeScope = string[];
export interface TokenStyleFunction {
    (theme: IColorTheme): TokenStyle | undefined;
}
export interface TokenStyleDefaults {
    scopesToProbe?: ProbeScope[];
    light?: TokenStyleValue;
    dark?: TokenStyleValue;
    hcDark?: TokenStyleValue;
    hcLight?: TokenStyleValue;
}
export interface SemanticTokenDefaultRule {
    selector: TokenSelector;
    defaults: TokenStyleDefaults;
}
export interface SemanticTokenRule {
    style: TokenStyle;
    selector: TokenSelector;
}
export declare namespace SemanticTokenRule {
    function fromJSONObject(registry: ITokenClassificationRegistry, o: any): SemanticTokenRule | undefined;
    function toJSONObject(rule: SemanticTokenRule): any;
    function equals(r1: SemanticTokenRule | undefined, r2: SemanticTokenRule | undefined): boolean;
    function is(r: any): r is SemanticTokenRule;
}
/**
 * A TokenStyle Value is either a token style literal, or a TokenClassificationString
 */
export type TokenStyleValue = TokenStyle | TokenClassificationString;
export interface ITokenClassificationRegistry {
    readonly onDidChangeSchema: Event<void>;
    /**
     * Register a token type to the registry.
     * @param id The TokenType id as used in theme description files
     * @param description the description
     */
    registerTokenType(id: string, description: string, superType?: string, deprecationMessage?: string): void;
    /**
     * Register a token modifier to the registry.
     * @param id The TokenModifier id as used in theme description files
     * @param description the description
     */
    registerTokenModifier(id: string, description: string): void;
    /**
     * Parses a token selector from a selector string.
     * @param selectorString selector string in the form (*|type)(.modifier)*
     * @param language language to which the selector applies or undefined if the selector is for all languafe
     * @returns the parsesd selector
     * @throws an error if the string is not a valid selector
     */
    parseTokenSelector(selectorString: string, language?: string): TokenSelector;
    /**
     * Register a TokenStyle default to the registry.
     * @param selector The rule selector
     * @param defaults The default values
     */
    registerTokenStyleDefault(selector: TokenSelector, defaults: TokenStyleDefaults): void;
    /**
     * Deregister a TokenStyle default to the registry.
     * @param selector The rule selector
     */
    deregisterTokenStyleDefault(selector: TokenSelector): void;
    /**
     * Deregister a TokenType from the registry.
     */
    deregisterTokenType(id: string): void;
    /**
     * Deregister a TokenModifier from the registry.
     */
    deregisterTokenModifier(id: string): void;
    /**
     * Get all TokenType contributions
     */
    getTokenTypes(): TokenTypeOrModifierContribution[];
    /**
     * Get all TokenModifier contributions
     */
    getTokenModifiers(): TokenTypeOrModifierContribution[];
    /**
     * The styling rules to used when a schema does not define any styling rules.
     */
    getTokenStylingDefaultRules(): SemanticTokenDefaultRule[];
    /**
     * JSON schema for an object to assign styling to token classifications
     */
    getTokenStylingSchema(): IJSONSchema;
}
export declare function parseClassifierString(s: string, defaultLanguage: string): {
    type: string;
    modifiers: string[];
    language: string;
};
export declare function parseClassifierString(s: string, defaultLanguage?: string): {
    type: string;
    modifiers: string[];
    language: string | undefined;
};
export declare function getTokenClassificationRegistry(): ITokenClassificationRegistry;
export declare const tokenStylingSchemaId = "vscode://schemas/token-styling";
export {};
