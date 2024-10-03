import { CancellationToken } from '../../../base/common/cancellation.js';
import { IDisposable } from '../../../base/common/lifecycle.js';
import { Range } from '../../common/core/range.js';
import * as languages from '../../common/languages.js';
import { ILanguageExtensionPoint, ILanguageService } from '../../common/languages/language.js';
import { LanguageConfiguration } from '../../common/languages/languageConfiguration.js';
import { LanguageSelector } from '../../common/languageSelector.js';
import * as model from '../../common/model.js';
import { IMonarchLanguage } from '../common/monarch/monarchTypes.js';
import { IStandaloneThemeService } from '../common/standaloneTheme.js';
import { IMarkerData } from '../../../platform/markers/common/markers.js';
export declare function register(language: ILanguageExtensionPoint): void;
export declare function getLanguages(): ILanguageExtensionPoint[];
export declare function getEncodedLanguageId(languageId: string): number;
export declare function onLanguage(languageId: string, callback: () => void): IDisposable;
export declare function onLanguageEncountered(languageId: string, callback: () => void): IDisposable;
export declare function setLanguageConfiguration(languageId: string, configuration: LanguageConfiguration): IDisposable;
export declare class EncodedTokenizationSupportAdapter implements languages.ITokenizationSupport, IDisposable {
    private readonly _languageId;
    private readonly _actual;
    constructor(languageId: string, actual: EncodedTokensProvider);
    dispose(): void;
    getInitialState(): languages.IState;
    tokenize(line: string, hasEOL: boolean, state: languages.IState): languages.TokenizationResult;
    tokenizeEncoded(line: string, hasEOL: boolean, state: languages.IState): languages.EncodedTokenizationResult;
}
export declare class TokenizationSupportAdapter implements languages.ITokenizationSupport, IDisposable {
    private readonly _languageId;
    private readonly _actual;
    private readonly _languageService;
    private readonly _standaloneThemeService;
    constructor(_languageId: string, _actual: TokensProvider, _languageService: ILanguageService, _standaloneThemeService: IStandaloneThemeService);
    dispose(): void;
    getInitialState(): languages.IState;
    private static _toClassicTokens;
    static adaptTokenize(language: string, actual: {
        tokenize(line: string, state: languages.IState): ILineTokens;
    }, line: string, state: languages.IState): languages.TokenizationResult;
    tokenize(line: string, hasEOL: boolean, state: languages.IState): languages.TokenizationResult;
    private _toBinaryTokens;
    tokenizeEncoded(line: string, hasEOL: boolean, state: languages.IState): languages.EncodedTokenizationResult;
}
export interface IToken {
    startIndex: number;
    scopes: string;
}
export interface ILineTokens {
    tokens: IToken[];
    endState: languages.IState;
}
export interface IEncodedLineTokens {
    tokens: Uint32Array;
    endState: languages.IState;
}
export interface TokensProviderFactory {
    create(): languages.ProviderResult<TokensProvider | EncodedTokensProvider | IMonarchLanguage>;
}
export interface TokensProvider {
    getInitialState(): languages.IState;
    tokenize(line: string, state: languages.IState): ILineTokens;
}
export interface EncodedTokensProvider {
    getInitialState(): languages.IState;
    tokenizeEncoded(line: string, state: languages.IState): IEncodedLineTokens;
    tokenize?(line: string, state: languages.IState): ILineTokens;
}
export declare function setColorMap(colorMap: string[] | null): void;
export declare function registerTokensProviderFactory(languageId: string, factory: TokensProviderFactory): IDisposable;
export declare function setTokensProvider(languageId: string, provider: TokensProvider | EncodedTokensProvider | Thenable<TokensProvider | EncodedTokensProvider>): IDisposable;
export declare function setMonarchTokensProvider(languageId: string, languageDef: IMonarchLanguage | Thenable<IMonarchLanguage>): IDisposable;
export declare function registerReferenceProvider(languageSelector: LanguageSelector, provider: languages.ReferenceProvider): IDisposable;
export declare function registerRenameProvider(languageSelector: LanguageSelector, provider: languages.RenameProvider): IDisposable;
export declare function registerNewSymbolNameProvider(languageSelector: LanguageSelector, provider: languages.NewSymbolNamesProvider): IDisposable;
export declare function registerSignatureHelpProvider(languageSelector: LanguageSelector, provider: languages.SignatureHelpProvider): IDisposable;
export declare function registerHoverProvider(languageSelector: LanguageSelector, provider: languages.HoverProvider): IDisposable;
export declare function registerDocumentSymbolProvider(languageSelector: LanguageSelector, provider: languages.DocumentSymbolProvider): IDisposable;
export declare function registerDocumentHighlightProvider(languageSelector: LanguageSelector, provider: languages.DocumentHighlightProvider): IDisposable;
export declare function registerLinkedEditingRangeProvider(languageSelector: LanguageSelector, provider: languages.LinkedEditingRangeProvider): IDisposable;
export declare function registerDefinitionProvider(languageSelector: LanguageSelector, provider: languages.DefinitionProvider): IDisposable;
export declare function registerImplementationProvider(languageSelector: LanguageSelector, provider: languages.ImplementationProvider): IDisposable;
export declare function registerTypeDefinitionProvider(languageSelector: LanguageSelector, provider: languages.TypeDefinitionProvider): IDisposable;
export declare function registerCodeLensProvider(languageSelector: LanguageSelector, provider: languages.CodeLensProvider): IDisposable;
export declare function registerCodeActionProvider(languageSelector: LanguageSelector, provider: CodeActionProvider, metadata?: CodeActionProviderMetadata): IDisposable;
export declare function registerDocumentFormattingEditProvider(languageSelector: LanguageSelector, provider: languages.DocumentFormattingEditProvider): IDisposable;
export declare function registerDocumentRangeFormattingEditProvider(languageSelector: LanguageSelector, provider: languages.DocumentRangeFormattingEditProvider): IDisposable;
export declare function registerOnTypeFormattingEditProvider(languageSelector: LanguageSelector, provider: languages.OnTypeFormattingEditProvider): IDisposable;
export declare function registerLinkProvider(languageSelector: LanguageSelector, provider: languages.LinkProvider): IDisposable;
export declare function registerCompletionItemProvider(languageSelector: LanguageSelector, provider: languages.CompletionItemProvider): IDisposable;
export declare function registerColorProvider(languageSelector: LanguageSelector, provider: languages.DocumentColorProvider): IDisposable;
export declare function registerFoldingRangeProvider(languageSelector: LanguageSelector, provider: languages.FoldingRangeProvider): IDisposable;
export declare function registerDeclarationProvider(languageSelector: LanguageSelector, provider: languages.DeclarationProvider): IDisposable;
export declare function registerSelectionRangeProvider(languageSelector: LanguageSelector, provider: languages.SelectionRangeProvider): IDisposable;
export declare function registerDocumentSemanticTokensProvider(languageSelector: LanguageSelector, provider: languages.DocumentSemanticTokensProvider): IDisposable;
export declare function registerDocumentRangeSemanticTokensProvider(languageSelector: LanguageSelector, provider: languages.DocumentRangeSemanticTokensProvider): IDisposable;
export declare function registerInlineCompletionsProvider(languageSelector: LanguageSelector, provider: languages.InlineCompletionsProvider): IDisposable;
export declare function registerInlineEditProvider(languageSelector: LanguageSelector, provider: languages.InlineEditProvider): IDisposable;
export declare function registerInlayHintsProvider(languageSelector: LanguageSelector, provider: languages.InlayHintsProvider): IDisposable;
export interface CodeActionContext {
    readonly markers: IMarkerData[];
    readonly only?: string;
    readonly trigger: languages.CodeActionTriggerType;
}
export interface CodeActionProvider {
    provideCodeActions(model: model.ITextModel, range: Range, context: CodeActionContext, token: CancellationToken): languages.ProviderResult<languages.CodeActionList>;
    resolveCodeAction?(codeAction: languages.CodeAction, token: CancellationToken): languages.ProviderResult<languages.CodeAction>;
}
export interface CodeActionProviderMetadata {
    readonly providedCodeActionKinds?: readonly string[];
    readonly documentation?: ReadonlyArray<{
        readonly kind: string;
        readonly command: languages.Command;
    }>;
}
export declare function createMonacoLanguagesAPI(): typeof monaco.languages;
