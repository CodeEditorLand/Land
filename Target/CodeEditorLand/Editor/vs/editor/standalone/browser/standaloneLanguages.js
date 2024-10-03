import { Color } from '../../../base/common/color.js';
import { Range } from '../../common/core/range.js';
import * as languages from '../../common/languages.js';
import { ILanguageService } from '../../common/languages/language.js';
import { ILanguageConfigurationService } from '../../common/languages/languageConfigurationRegistry.js';
import { ModesRegistry } from '../../common/languages/modesRegistry.js';
import { ILanguageFeaturesService } from '../../common/services/languageFeatures.js';
import * as standaloneEnums from '../../common/standalone/standaloneEnums.js';
import { StandaloneServices } from './standaloneServices.js';
import { compile } from '../common/monarch/monarchCompile.js';
import { MonarchTokenizer } from '../common/monarch/monarchLexer.js';
import { IStandaloneThemeService } from '../common/standaloneTheme.js';
import { IConfigurationService } from '../../../platform/configuration/common/configuration.js';
import { IMarkerService } from '../../../platform/markers/common/markers.js';
export function register(language) {
    ModesRegistry.registerLanguage(language);
}
export function getLanguages() {
    let result = [];
    result = result.concat(ModesRegistry.getLanguages());
    return result;
}
export function getEncodedLanguageId(languageId) {
    const languageService = StandaloneServices.get(ILanguageService);
    return languageService.languageIdCodec.encodeLanguageId(languageId);
}
export function onLanguage(languageId, callback) {
    return StandaloneServices.withServices(() => {
        const languageService = StandaloneServices.get(ILanguageService);
        const disposable = languageService.onDidRequestRichLanguageFeatures((encounteredLanguageId) => {
            if (encounteredLanguageId === languageId) {
                disposable.dispose();
                callback();
            }
        });
        return disposable;
    });
}
export function onLanguageEncountered(languageId, callback) {
    return StandaloneServices.withServices(() => {
        const languageService = StandaloneServices.get(ILanguageService);
        const disposable = languageService.onDidRequestBasicLanguageFeatures((encounteredLanguageId) => {
            if (encounteredLanguageId === languageId) {
                disposable.dispose();
                callback();
            }
        });
        return disposable;
    });
}
export function setLanguageConfiguration(languageId, configuration) {
    const languageService = StandaloneServices.get(ILanguageService);
    if (!languageService.isRegisteredLanguageId(languageId)) {
        throw new Error(`Cannot set configuration for unknown language ${languageId}`);
    }
    const languageConfigurationService = StandaloneServices.get(ILanguageConfigurationService);
    return languageConfigurationService.register(languageId, configuration, 100);
}
export class EncodedTokenizationSupportAdapter {
    constructor(languageId, actual) {
        this._languageId = languageId;
        this._actual = actual;
    }
    dispose() {
    }
    getInitialState() {
        return this._actual.getInitialState();
    }
    tokenize(line, hasEOL, state) {
        if (typeof this._actual.tokenize === 'function') {
            return TokenizationSupportAdapter.adaptTokenize(this._languageId, this._actual, line, state);
        }
        throw new Error('Not supported!');
    }
    tokenizeEncoded(line, hasEOL, state) {
        const result = this._actual.tokenizeEncoded(line, state);
        return new languages.EncodedTokenizationResult(result.tokens, result.endState);
    }
}
export class TokenizationSupportAdapter {
    constructor(_languageId, _actual, _languageService, _standaloneThemeService) {
        this._languageId = _languageId;
        this._actual = _actual;
        this._languageService = _languageService;
        this._standaloneThemeService = _standaloneThemeService;
    }
    dispose() {
    }
    getInitialState() {
        return this._actual.getInitialState();
    }
    static _toClassicTokens(tokens, language) {
        const result = [];
        let previousStartIndex = 0;
        for (let i = 0, len = tokens.length; i < len; i++) {
            const t = tokens[i];
            let startIndex = t.startIndex;
            if (i === 0) {
                startIndex = 0;
            }
            else if (startIndex < previousStartIndex) {
                startIndex = previousStartIndex;
            }
            result[i] = new languages.Token(startIndex, t.scopes, language);
            previousStartIndex = startIndex;
        }
        return result;
    }
    static adaptTokenize(language, actual, line, state) {
        const actualResult = actual.tokenize(line, state);
        const tokens = TokenizationSupportAdapter._toClassicTokens(actualResult.tokens, language);
        let endState;
        if (actualResult.endState.equals(state)) {
            endState = state;
        }
        else {
            endState = actualResult.endState;
        }
        return new languages.TokenizationResult(tokens, endState);
    }
    tokenize(line, hasEOL, state) {
        return TokenizationSupportAdapter.adaptTokenize(this._languageId, this._actual, line, state);
    }
    _toBinaryTokens(languageIdCodec, tokens) {
        const languageId = languageIdCodec.encodeLanguageId(this._languageId);
        const tokenTheme = this._standaloneThemeService.getColorTheme().tokenTheme;
        const result = [];
        let resultLen = 0;
        let previousStartIndex = 0;
        for (let i = 0, len = tokens.length; i < len; i++) {
            const t = tokens[i];
            const metadata = tokenTheme.match(languageId, t.scopes) | 1024;
            if (resultLen > 0 && result[resultLen - 1] === metadata) {
                continue;
            }
            let startIndex = t.startIndex;
            if (i === 0) {
                startIndex = 0;
            }
            else if (startIndex < previousStartIndex) {
                startIndex = previousStartIndex;
            }
            result[resultLen++] = startIndex;
            result[resultLen++] = metadata;
            previousStartIndex = startIndex;
        }
        const actualResult = new Uint32Array(resultLen);
        for (let i = 0; i < resultLen; i++) {
            actualResult[i] = result[i];
        }
        return actualResult;
    }
    tokenizeEncoded(line, hasEOL, state) {
        const actualResult = this._actual.tokenize(line, state);
        const tokens = this._toBinaryTokens(this._languageService.languageIdCodec, actualResult.tokens);
        let endState;
        if (actualResult.endState.equals(state)) {
            endState = state;
        }
        else {
            endState = actualResult.endState;
        }
        return new languages.EncodedTokenizationResult(tokens, endState);
    }
}
function isATokensProvider(provider) {
    return (typeof provider.getInitialState === 'function');
}
function isEncodedTokensProvider(provider) {
    return 'tokenizeEncoded' in provider;
}
function isThenable(obj) {
    return obj && typeof obj.then === 'function';
}
export function setColorMap(colorMap) {
    const standaloneThemeService = StandaloneServices.get(IStandaloneThemeService);
    if (colorMap) {
        const result = [null];
        for (let i = 1, len = colorMap.length; i < len; i++) {
            result[i] = Color.fromHex(colorMap[i]);
        }
        standaloneThemeService.setColorMapOverride(result);
    }
    else {
        standaloneThemeService.setColorMapOverride(null);
    }
}
function createTokenizationSupportAdapter(languageId, provider) {
    if (isEncodedTokensProvider(provider)) {
        return new EncodedTokenizationSupportAdapter(languageId, provider);
    }
    else {
        return new TokenizationSupportAdapter(languageId, provider, StandaloneServices.get(ILanguageService), StandaloneServices.get(IStandaloneThemeService));
    }
}
export function registerTokensProviderFactory(languageId, factory) {
    const adaptedFactory = new languages.LazyTokenizationSupport(async () => {
        const result = await Promise.resolve(factory.create());
        if (!result) {
            return null;
        }
        if (isATokensProvider(result)) {
            return createTokenizationSupportAdapter(languageId, result);
        }
        return new MonarchTokenizer(StandaloneServices.get(ILanguageService), StandaloneServices.get(IStandaloneThemeService), languageId, compile(languageId, result), StandaloneServices.get(IConfigurationService));
    });
    return languages.TokenizationRegistry.registerFactory(languageId, adaptedFactory);
}
export function setTokensProvider(languageId, provider) {
    const languageService = StandaloneServices.get(ILanguageService);
    if (!languageService.isRegisteredLanguageId(languageId)) {
        throw new Error(`Cannot set tokens provider for unknown language ${languageId}`);
    }
    if (isThenable(provider)) {
        return registerTokensProviderFactory(languageId, { create: () => provider });
    }
    return languages.TokenizationRegistry.register(languageId, createTokenizationSupportAdapter(languageId, provider));
}
export function setMonarchTokensProvider(languageId, languageDef) {
    const create = (languageDef) => {
        return new MonarchTokenizer(StandaloneServices.get(ILanguageService), StandaloneServices.get(IStandaloneThemeService), languageId, compile(languageId, languageDef), StandaloneServices.get(IConfigurationService));
    };
    if (isThenable(languageDef)) {
        return registerTokensProviderFactory(languageId, { create: () => languageDef });
    }
    return languages.TokenizationRegistry.register(languageId, create(languageDef));
}
export function registerReferenceProvider(languageSelector, provider) {
    const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
    return languageFeaturesService.referenceProvider.register(languageSelector, provider);
}
export function registerRenameProvider(languageSelector, provider) {
    const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
    return languageFeaturesService.renameProvider.register(languageSelector, provider);
}
export function registerNewSymbolNameProvider(languageSelector, provider) {
    const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
    return languageFeaturesService.newSymbolNamesProvider.register(languageSelector, provider);
}
export function registerSignatureHelpProvider(languageSelector, provider) {
    const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
    return languageFeaturesService.signatureHelpProvider.register(languageSelector, provider);
}
export function registerHoverProvider(languageSelector, provider) {
    const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
    return languageFeaturesService.hoverProvider.register(languageSelector, {
        provideHover: async (model, position, token, context) => {
            const word = model.getWordAtPosition(position);
            return Promise.resolve(provider.provideHover(model, position, token, context)).then((value) => {
                if (!value) {
                    return undefined;
                }
                if (!value.range && word) {
                    value.range = new Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn);
                }
                if (!value.range) {
                    value.range = new Range(position.lineNumber, position.column, position.lineNumber, position.column);
                }
                return value;
            });
        }
    });
}
export function registerDocumentSymbolProvider(languageSelector, provider) {
    const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
    return languageFeaturesService.documentSymbolProvider.register(languageSelector, provider);
}
export function registerDocumentHighlightProvider(languageSelector, provider) {
    const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
    return languageFeaturesService.documentHighlightProvider.register(languageSelector, provider);
}
export function registerLinkedEditingRangeProvider(languageSelector, provider) {
    const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
    return languageFeaturesService.linkedEditingRangeProvider.register(languageSelector, provider);
}
export function registerDefinitionProvider(languageSelector, provider) {
    const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
    return languageFeaturesService.definitionProvider.register(languageSelector, provider);
}
export function registerImplementationProvider(languageSelector, provider) {
    const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
    return languageFeaturesService.implementationProvider.register(languageSelector, provider);
}
export function registerTypeDefinitionProvider(languageSelector, provider) {
    const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
    return languageFeaturesService.typeDefinitionProvider.register(languageSelector, provider);
}
export function registerCodeLensProvider(languageSelector, provider) {
    const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
    return languageFeaturesService.codeLensProvider.register(languageSelector, provider);
}
export function registerCodeActionProvider(languageSelector, provider, metadata) {
    const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
    return languageFeaturesService.codeActionProvider.register(languageSelector, {
        providedCodeActionKinds: metadata?.providedCodeActionKinds,
        documentation: metadata?.documentation,
        provideCodeActions: (model, range, context, token) => {
            const markerService = StandaloneServices.get(IMarkerService);
            const markers = markerService.read({ resource: model.uri }).filter(m => {
                return Range.areIntersectingOrTouching(m, range);
            });
            return provider.provideCodeActions(model, range, { markers, only: context.only, trigger: context.trigger }, token);
        },
        resolveCodeAction: provider.resolveCodeAction
    });
}
export function registerDocumentFormattingEditProvider(languageSelector, provider) {
    const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
    return languageFeaturesService.documentFormattingEditProvider.register(languageSelector, provider);
}
export function registerDocumentRangeFormattingEditProvider(languageSelector, provider) {
    const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
    return languageFeaturesService.documentRangeFormattingEditProvider.register(languageSelector, provider);
}
export function registerOnTypeFormattingEditProvider(languageSelector, provider) {
    const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
    return languageFeaturesService.onTypeFormattingEditProvider.register(languageSelector, provider);
}
export function registerLinkProvider(languageSelector, provider) {
    const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
    return languageFeaturesService.linkProvider.register(languageSelector, provider);
}
export function registerCompletionItemProvider(languageSelector, provider) {
    const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
    return languageFeaturesService.completionProvider.register(languageSelector, provider);
}
export function registerColorProvider(languageSelector, provider) {
    const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
    return languageFeaturesService.colorProvider.register(languageSelector, provider);
}
export function registerFoldingRangeProvider(languageSelector, provider) {
    const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
    return languageFeaturesService.foldingRangeProvider.register(languageSelector, provider);
}
export function registerDeclarationProvider(languageSelector, provider) {
    const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
    return languageFeaturesService.declarationProvider.register(languageSelector, provider);
}
export function registerSelectionRangeProvider(languageSelector, provider) {
    const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
    return languageFeaturesService.selectionRangeProvider.register(languageSelector, provider);
}
export function registerDocumentSemanticTokensProvider(languageSelector, provider) {
    const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
    return languageFeaturesService.documentSemanticTokensProvider.register(languageSelector, provider);
}
export function registerDocumentRangeSemanticTokensProvider(languageSelector, provider) {
    const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
    return languageFeaturesService.documentRangeSemanticTokensProvider.register(languageSelector, provider);
}
export function registerInlineCompletionsProvider(languageSelector, provider) {
    const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
    return languageFeaturesService.inlineCompletionsProvider.register(languageSelector, provider);
}
export function registerInlineEditProvider(languageSelector, provider) {
    const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
    return languageFeaturesService.inlineEditProvider.register(languageSelector, provider);
}
export function registerInlayHintsProvider(languageSelector, provider) {
    const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService);
    return languageFeaturesService.inlayHintsProvider.register(languageSelector, provider);
}
export function createMonacoLanguagesAPI() {
    return {
        register: register,
        getLanguages: getLanguages,
        onLanguage: onLanguage,
        onLanguageEncountered: onLanguageEncountered,
        getEncodedLanguageId: getEncodedLanguageId,
        setLanguageConfiguration: setLanguageConfiguration,
        setColorMap: setColorMap,
        registerTokensProviderFactory: registerTokensProviderFactory,
        setTokensProvider: setTokensProvider,
        setMonarchTokensProvider: setMonarchTokensProvider,
        registerReferenceProvider: registerReferenceProvider,
        registerRenameProvider: registerRenameProvider,
        registerNewSymbolNameProvider: registerNewSymbolNameProvider,
        registerCompletionItemProvider: registerCompletionItemProvider,
        registerSignatureHelpProvider: registerSignatureHelpProvider,
        registerHoverProvider: registerHoverProvider,
        registerDocumentSymbolProvider: registerDocumentSymbolProvider,
        registerDocumentHighlightProvider: registerDocumentHighlightProvider,
        registerLinkedEditingRangeProvider: registerLinkedEditingRangeProvider,
        registerDefinitionProvider: registerDefinitionProvider,
        registerImplementationProvider: registerImplementationProvider,
        registerTypeDefinitionProvider: registerTypeDefinitionProvider,
        registerCodeLensProvider: registerCodeLensProvider,
        registerCodeActionProvider: registerCodeActionProvider,
        registerDocumentFormattingEditProvider: registerDocumentFormattingEditProvider,
        registerDocumentRangeFormattingEditProvider: registerDocumentRangeFormattingEditProvider,
        registerOnTypeFormattingEditProvider: registerOnTypeFormattingEditProvider,
        registerLinkProvider: registerLinkProvider,
        registerColorProvider: registerColorProvider,
        registerFoldingRangeProvider: registerFoldingRangeProvider,
        registerDeclarationProvider: registerDeclarationProvider,
        registerSelectionRangeProvider: registerSelectionRangeProvider,
        registerDocumentSemanticTokensProvider: registerDocumentSemanticTokensProvider,
        registerDocumentRangeSemanticTokensProvider: registerDocumentRangeSemanticTokensProvider,
        registerInlineCompletionsProvider: registerInlineCompletionsProvider,
        registerInlineEditProvider: registerInlineEditProvider,
        registerInlayHintsProvider: registerInlayHintsProvider,
        DocumentHighlightKind: standaloneEnums.DocumentHighlightKind,
        CompletionItemKind: standaloneEnums.CompletionItemKind,
        CompletionItemTag: standaloneEnums.CompletionItemTag,
        CompletionItemInsertTextRule: standaloneEnums.CompletionItemInsertTextRule,
        SymbolKind: standaloneEnums.SymbolKind,
        SymbolTag: standaloneEnums.SymbolTag,
        IndentAction: standaloneEnums.IndentAction,
        CompletionTriggerKind: standaloneEnums.CompletionTriggerKind,
        SignatureHelpTriggerKind: standaloneEnums.SignatureHelpTriggerKind,
        InlayHintKind: standaloneEnums.InlayHintKind,
        InlineCompletionTriggerKind: standaloneEnums.InlineCompletionTriggerKind,
        InlineEditTriggerKind: standaloneEnums.InlineEditTriggerKind,
        CodeActionTriggerType: standaloneEnums.CodeActionTriggerType,
        NewSymbolNameTag: standaloneEnums.NewSymbolNameTag,
        NewSymbolNameTriggerKind: standaloneEnums.NewSymbolNameTriggerKind,
        PartialAcceptTriggerKind: standaloneEnums.PartialAcceptTriggerKind,
        HoverVerbosityAction: standaloneEnums.HoverVerbosityAction,
        FoldingRangeKind: languages.FoldingRangeKind,
        SelectedSuggestionInfo: languages.SelectedSuggestionInfo,
    };
}
