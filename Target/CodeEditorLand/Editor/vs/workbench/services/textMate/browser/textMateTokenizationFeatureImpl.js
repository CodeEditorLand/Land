var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TextMateTokenizationFeature_1;
import { canASAR, importAMDNodeModule, resolveAmdNodeModulePath } from '../../../../amdX.js';
import * as dom from '../../../../base/browser/dom.js';
import { equals as equalArray } from '../../../../base/common/arrays.js';
import { Color } from '../../../../base/common/color.js';
import { onUnexpectedError } from '../../../../base/common/errors.js';
import { Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { FileAccess, nodeModulesAsarUnpackedPath, nodeModulesPath } from '../../../../base/common/network.js';
import { observableFromEvent } from '../../../../base/common/observable.js';
import { isWeb } from '../../../../base/common/platform.js';
import * as resources from '../../../../base/common/resources.js';
import * as types from '../../../../base/common/types.js';
import { LazyTokenizationSupport, TokenizationRegistry } from '../../../../editor/common/languages.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { generateTokensCSSForColorMap } from '../../../../editor/common/languages/supports/tokenization.js';
import * as nls from '../../../../nls.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IExtensionResourceLoaderService } from '../../../../platform/extensionResourceLoader/common/extensionResourceLoader.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IProgressService } from '../../../../platform/progress/common/progress.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { TextMateTokenizationSupport } from './tokenizationSupport/textMateTokenizationSupport.js';
import { TokenizationSupportWithLineLimit } from './tokenizationSupport/tokenizationSupportWithLineLimit.js';
import { ThreadedBackgroundTokenizerFactory } from './backgroundTokenization/threadedBackgroundTokenizerFactory.js';
import { TMGrammarFactory, missingTMGrammarErrorMessage } from '../common/TMGrammarFactory.js';
import { grammarsExtPoint } from '../common/TMGrammars.js';
import { IWorkbenchThemeService } from '../../themes/common/workbenchThemeService.js';
let TextMateTokenizationFeature = class TextMateTokenizationFeature extends Disposable {
    static { TextMateTokenizationFeature_1 = this; }
    static { this.reportTokenizationTimeCounter = { sync: 0, async: 0 }; }
    constructor(_languageService, _themeService, _extensionResourceLoaderService, _notificationService, _logService, _configurationService, _progressService, _environmentService, _instantiationService, _telemetryService) {
        super();
        this._languageService = _languageService;
        this._themeService = _themeService;
        this._extensionResourceLoaderService = _extensionResourceLoaderService;
        this._notificationService = _notificationService;
        this._logService = _logService;
        this._configurationService = _configurationService;
        this._progressService = _progressService;
        this._environmentService = _environmentService;
        this._instantiationService = _instantiationService;
        this._telemetryService = _telemetryService;
        this._createdModes = [];
        this._encounteredLanguages = [];
        this._debugMode = false;
        this._debugModePrintFunc = () => { };
        this._grammarDefinitions = null;
        this._grammarFactory = null;
        this._tokenizersRegistrations = new DisposableStore();
        this._currentTheme = null;
        this._currentTokenColorMap = null;
        this._threadedBackgroundTokenizerFactory = this._instantiationService.createInstance(ThreadedBackgroundTokenizerFactory, (timeMs, languageId, sourceExtensionId, lineLength, isRandomSample) => this._reportTokenizationTime(timeMs, languageId, sourceExtensionId, lineLength, true, isRandomSample), () => this.getAsyncTokenizationEnabled());
        this._vscodeOniguruma = null;
        this._styleElement = dom.createStyleSheet();
        this._styleElement.className = 'vscode-tokens-styles';
        grammarsExtPoint.setHandler((extensions) => this._handleGrammarsExtPoint(extensions));
        this._updateTheme(this._themeService.getColorTheme(), true);
        this._register(this._themeService.onDidColorThemeChange(() => {
            this._updateTheme(this._themeService.getColorTheme(), false);
        }));
        this._register(this._languageService.onDidRequestRichLanguageFeatures((languageId) => {
            this._createdModes.push(languageId);
        }));
    }
    getAsyncTokenizationEnabled() {
        return !!this._configurationService.getValue('editor.experimental.asyncTokenization');
    }
    getAsyncTokenizationVerification() {
        return !!this._configurationService.getValue('editor.experimental.asyncTokenizationVerification');
    }
    _handleGrammarsExtPoint(extensions) {
        this._grammarDefinitions = null;
        if (this._grammarFactory) {
            this._grammarFactory.dispose();
            this._grammarFactory = null;
        }
        this._tokenizersRegistrations.clear();
        this._grammarDefinitions = [];
        for (const extension of extensions) {
            const grammars = extension.value;
            for (const grammar of grammars) {
                const validatedGrammar = this._validateGrammarDefinition(extension, grammar);
                if (validatedGrammar) {
                    this._grammarDefinitions.push(validatedGrammar);
                    if (validatedGrammar.language) {
                        const lazyTokenizationSupport = new LazyTokenizationSupport(() => this._createTokenizationSupport(validatedGrammar.language));
                        this._tokenizersRegistrations.add(lazyTokenizationSupport);
                        this._tokenizersRegistrations.add(TokenizationRegistry.registerFactory(validatedGrammar.language, lazyTokenizationSupport));
                    }
                }
            }
        }
        this._threadedBackgroundTokenizerFactory.setGrammarDefinitions(this._grammarDefinitions);
        for (const createdMode of this._createdModes) {
            TokenizationRegistry.getOrCreate(createdMode);
        }
    }
    _validateGrammarDefinition(extension, grammar) {
        if (!validateGrammarExtensionPoint(extension.description.extensionLocation, grammar, extension.collector, this._languageService)) {
            return null;
        }
        const grammarLocation = resources.joinPath(extension.description.extensionLocation, grammar.path);
        const embeddedLanguages = Object.create(null);
        if (grammar.embeddedLanguages) {
            const scopes = Object.keys(grammar.embeddedLanguages);
            for (let i = 0, len = scopes.length; i < len; i++) {
                const scope = scopes[i];
                const language = grammar.embeddedLanguages[scope];
                if (typeof language !== 'string') {
                    continue;
                }
                if (this._languageService.isRegisteredLanguageId(language)) {
                    embeddedLanguages[scope] = this._languageService.languageIdCodec.encodeLanguageId(language);
                }
            }
        }
        const tokenTypes = Object.create(null);
        if (grammar.tokenTypes) {
            const scopes = Object.keys(grammar.tokenTypes);
            for (const scope of scopes) {
                const tokenType = grammar.tokenTypes[scope];
                switch (tokenType) {
                    case 'string':
                        tokenTypes[scope] = 2;
                        break;
                    case 'other':
                        tokenTypes[scope] = 0;
                        break;
                    case 'comment':
                        tokenTypes[scope] = 1;
                        break;
                }
            }
        }
        const validLanguageId = grammar.language && this._languageService.isRegisteredLanguageId(grammar.language) ? grammar.language : undefined;
        function asStringArray(array, defaultValue) {
            if (!Array.isArray(array)) {
                return defaultValue;
            }
            if (!array.every(e => typeof e === 'string')) {
                return defaultValue;
            }
            return array;
        }
        return {
            location: grammarLocation,
            language: validLanguageId,
            scopeName: grammar.scopeName,
            embeddedLanguages: embeddedLanguages,
            tokenTypes: tokenTypes,
            injectTo: grammar.injectTo,
            balancedBracketSelectors: asStringArray(grammar.balancedBracketScopes, ['*']),
            unbalancedBracketSelectors: asStringArray(grammar.unbalancedBracketScopes, []),
            sourceExtensionId: extension.description.id,
        };
    }
    startDebugMode(printFn, onStop) {
        if (this._debugMode) {
            this._notificationService.error(nls.localize('alreadyDebugging', "Already Logging."));
            return;
        }
        this._debugModePrintFunc = printFn;
        this._debugMode = true;
        if (this._debugMode) {
            this._progressService.withProgress({
                location: 15,
                buttons: [nls.localize('stop', "Stop")]
            }, (progress) => {
                progress.report({
                    message: nls.localize('progress1', "Preparing to log TM Grammar parsing. Press Stop when finished.")
                });
                return this._getVSCodeOniguruma().then((vscodeOniguruma) => {
                    vscodeOniguruma.setDefaultDebugCall(true);
                    progress.report({
                        message: nls.localize('progress2', "Now logging TM Grammar parsing. Press Stop when finished.")
                    });
                    return new Promise((resolve, reject) => { });
                });
            }, (choice) => {
                this._getVSCodeOniguruma().then((vscodeOniguruma) => {
                    this._debugModePrintFunc = () => { };
                    this._debugMode = false;
                    vscodeOniguruma.setDefaultDebugCall(false);
                    onStop();
                });
            });
        }
    }
    _canCreateGrammarFactory() {
        return !!this._grammarDefinitions;
    }
    async _getOrCreateGrammarFactory() {
        if (this._grammarFactory) {
            return this._grammarFactory;
        }
        const [vscodeTextmate, vscodeOniguruma] = await Promise.all([importAMDNodeModule('vscode-textmate', 'release/main.js'), this._getVSCodeOniguruma()]);
        const onigLib = Promise.resolve({
            createOnigScanner: (sources) => vscodeOniguruma.createOnigScanner(sources),
            createOnigString: (str) => vscodeOniguruma.createOnigString(str)
        });
        if (this._grammarFactory) {
            return this._grammarFactory;
        }
        this._grammarFactory = new TMGrammarFactory({
            logTrace: (msg) => this._logService.trace(msg),
            logError: (msg, err) => this._logService.error(msg, err),
            readFile: (resource) => this._extensionResourceLoaderService.readExtensionResource(resource)
        }, this._grammarDefinitions || [], vscodeTextmate, onigLib);
        this._updateTheme(this._themeService.getColorTheme(), true);
        return this._grammarFactory;
    }
    async _createTokenizationSupport(languageId) {
        if (!this._languageService.isRegisteredLanguageId(languageId)) {
            return null;
        }
        if (!this._canCreateGrammarFactory()) {
            return null;
        }
        try {
            const grammarFactory = await this._getOrCreateGrammarFactory();
            if (!grammarFactory.has(languageId)) {
                return null;
            }
            const encodedLanguageId = this._languageService.languageIdCodec.encodeLanguageId(languageId);
            const r = await grammarFactory.createGrammar(languageId, encodedLanguageId);
            if (!r.grammar) {
                return null;
            }
            const maxTokenizationLineLength = observableConfigValue('editor.maxTokenizationLineLength', languageId, -1, this._configurationService);
            const tokenization = new TextMateTokenizationSupport(r.grammar, r.initialState, r.containsEmbeddedLanguages, (textModel, tokenStore) => this._threadedBackgroundTokenizerFactory.createBackgroundTokenizer(textModel, tokenStore, maxTokenizationLineLength), () => this.getAsyncTokenizationVerification(), (timeMs, lineLength, isRandomSample) => {
                this._reportTokenizationTime(timeMs, languageId, r.sourceExtensionId, lineLength, false, isRandomSample);
            }, true);
            const disposable = tokenization.onDidEncounterLanguage((encodedLanguageId) => {
                if (!this._encounteredLanguages[encodedLanguageId]) {
                    const languageId = this._languageService.languageIdCodec.decodeLanguageId(encodedLanguageId);
                    this._encounteredLanguages[encodedLanguageId] = true;
                    this._languageService.requestBasicLanguageFeatures(languageId);
                }
            });
            return new TokenizationSupportWithLineLimit(encodedLanguageId, tokenization, disposable, maxTokenizationLineLength);
        }
        catch (err) {
            if (err.message && err.message === missingTMGrammarErrorMessage) {
                return null;
            }
            onUnexpectedError(err);
            return null;
        }
    }
    _updateTheme(colorTheme, forceUpdate) {
        if (!forceUpdate && this._currentTheme && this._currentTokenColorMap && equalsTokenRules(this._currentTheme.settings, colorTheme.tokenColors)
            && equalArray(this._currentTokenColorMap, colorTheme.tokenColorMap)) {
            return;
        }
        this._currentTheme = { name: colorTheme.label, settings: colorTheme.tokenColors };
        this._currentTokenColorMap = colorTheme.tokenColorMap;
        this._grammarFactory?.setTheme(this._currentTheme, this._currentTokenColorMap);
        const colorMap = toColorMap(this._currentTokenColorMap);
        const cssRules = generateTokensCSSForColorMap(colorMap);
        this._styleElement.textContent = cssRules;
        TokenizationRegistry.setColorMap(colorMap);
        if (this._currentTheme && this._currentTokenColorMap) {
            this._threadedBackgroundTokenizerFactory.acceptTheme(this._currentTheme, this._currentTokenColorMap);
        }
    }
    async createTokenizer(languageId) {
        if (!this._languageService.isRegisteredLanguageId(languageId)) {
            return null;
        }
        const grammarFactory = await this._getOrCreateGrammarFactory();
        if (!grammarFactory.has(languageId)) {
            return null;
        }
        const encodedLanguageId = this._languageService.languageIdCodec.encodeLanguageId(languageId);
        const { grammar } = await grammarFactory.createGrammar(languageId, encodedLanguageId);
        return grammar;
    }
    _getVSCodeOniguruma() {
        if (!this._vscodeOniguruma) {
            this._vscodeOniguruma = (async () => {
                const [vscodeOniguruma, wasm] = await Promise.all([importAMDNodeModule('vscode-oniguruma', 'release/main.js'), this._loadVSCodeOnigurumaWASM()]);
                await vscodeOniguruma.loadWASM({
                    data: wasm,
                    print: (str) => {
                        this._debugModePrintFunc(str);
                    }
                });
                return vscodeOniguruma;
            })();
        }
        return this._vscodeOniguruma;
    }
    async _loadVSCodeOnigurumaWASM() {
        if (isWeb) {
            const response = await fetch(resolveAmdNodeModulePath('vscode-oniguruma', 'release/onig.wasm'));
            return await response.arrayBuffer();
        }
        else {
            const response = await fetch(canASAR && this._environmentService.isBuilt
                ? FileAccess.asBrowserUri(`${nodeModulesAsarUnpackedPath}/vscode-oniguruma/release/onig.wasm`).toString(true)
                : FileAccess.asBrowserUri(`${nodeModulesPath}/vscode-oniguruma/release/onig.wasm`).toString(true));
            return response;
        }
    }
    _reportTokenizationTime(timeMs, languageId, sourceExtensionId, lineLength, fromWorker, isRandomSample) {
        const key = fromWorker ? 'async' : 'sync';
        if (TextMateTokenizationFeature_1.reportTokenizationTimeCounter[key] > 50) {
            return;
        }
        if (TextMateTokenizationFeature_1.reportTokenizationTimeCounter[key] === 0) {
            setTimeout(() => {
                TextMateTokenizationFeature_1.reportTokenizationTimeCounter[key] = 0;
            }, 1000 * 60 * 60);
        }
        TextMateTokenizationFeature_1.reportTokenizationTimeCounter[key]++;
        this._telemetryService.publicLog2('editor.tokenizedLine', {
            timeMs,
            languageId,
            lineLength,
            fromWorker,
            sourceExtensionId,
            isRandomSample,
            tokenizationSetting: this.getAsyncTokenizationEnabled() ? (this.getAsyncTokenizationVerification() ? 2 : 1) : 0,
        });
    }
};
TextMateTokenizationFeature = TextMateTokenizationFeature_1 = __decorate([
    __param(0, ILanguageService),
    __param(1, IWorkbenchThemeService),
    __param(2, IExtensionResourceLoaderService),
    __param(3, INotificationService),
    __param(4, ILogService),
    __param(5, IConfigurationService),
    __param(6, IProgressService),
    __param(7, IWorkbenchEnvironmentService),
    __param(8, IInstantiationService),
    __param(9, ITelemetryService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], TextMateTokenizationFeature);
export { TextMateTokenizationFeature };
function toColorMap(colorMap) {
    const result = [null];
    for (let i = 1, len = colorMap.length; i < len; i++) {
        result[i] = Color.fromHex(colorMap[i]);
    }
    return result;
}
function equalsTokenRules(a, b) {
    if (!b || !a || b.length !== a.length) {
        return false;
    }
    for (let i = b.length - 1; i >= 0; i--) {
        const r1 = b[i];
        const r2 = a[i];
        if (r1.scope !== r2.scope) {
            return false;
        }
        const s1 = r1.settings;
        const s2 = r2.settings;
        if (s1 && s2) {
            if (s1.fontStyle !== s2.fontStyle || s1.foreground !== s2.foreground || s1.background !== s2.background) {
                return false;
            }
        }
        else if (!s1 || !s2) {
            return false;
        }
    }
    return true;
}
function validateGrammarExtensionPoint(extensionLocation, syntax, collector, _languageService) {
    if (syntax.language && ((typeof syntax.language !== 'string') || !_languageService.isRegisteredLanguageId(syntax.language))) {
        collector.error(nls.localize('invalid.language', "Unknown language in `contributes.{0}.language`. Provided value: {1}", grammarsExtPoint.name, String(syntax.language)));
        return false;
    }
    if (!syntax.scopeName || (typeof syntax.scopeName !== 'string')) {
        collector.error(nls.localize('invalid.scopeName', "Expected string in `contributes.{0}.scopeName`. Provided value: {1}", grammarsExtPoint.name, String(syntax.scopeName)));
        return false;
    }
    if (!syntax.path || (typeof syntax.path !== 'string')) {
        collector.error(nls.localize('invalid.path.0', "Expected string in `contributes.{0}.path`. Provided value: {1}", grammarsExtPoint.name, String(syntax.path)));
        return false;
    }
    if (syntax.injectTo && (!Array.isArray(syntax.injectTo) || syntax.injectTo.some(scope => typeof scope !== 'string'))) {
        collector.error(nls.localize('invalid.injectTo', "Invalid value in `contributes.{0}.injectTo`. Must be an array of language scope names. Provided value: {1}", grammarsExtPoint.name, JSON.stringify(syntax.injectTo)));
        return false;
    }
    if (syntax.embeddedLanguages && !types.isObject(syntax.embeddedLanguages)) {
        collector.error(nls.localize('invalid.embeddedLanguages', "Invalid value in `contributes.{0}.embeddedLanguages`. Must be an object map from scope name to language. Provided value: {1}", grammarsExtPoint.name, JSON.stringify(syntax.embeddedLanguages)));
        return false;
    }
    if (syntax.tokenTypes && !types.isObject(syntax.tokenTypes)) {
        collector.error(nls.localize('invalid.tokenTypes', "Invalid value in `contributes.{0}.tokenTypes`. Must be an object map from scope name to token type. Provided value: {1}", grammarsExtPoint.name, JSON.stringify(syntax.tokenTypes)));
        return false;
    }
    const grammarLocation = resources.joinPath(extensionLocation, syntax.path);
    if (!resources.isEqualOrParent(grammarLocation, extensionLocation)) {
        collector.warn(nls.localize('invalid.path.1', "Expected `contributes.{0}.path` ({1}) to be included inside extension's folder ({2}). This might make the extension non-portable.", grammarsExtPoint.name, grammarLocation.path, extensionLocation.path));
    }
    return true;
}
function observableConfigValue(key, languageId, defaultValue, configurationService) {
    return observableFromEvent((handleChange) => configurationService.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration(key, { overrideIdentifier: languageId })) {
            handleChange(e);
        }
    }), () => configurationService.getValue(key, { overrideIdentifier: languageId }) ?? defaultValue);
}
