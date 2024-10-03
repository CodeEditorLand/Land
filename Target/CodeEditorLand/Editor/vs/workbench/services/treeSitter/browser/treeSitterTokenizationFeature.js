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
import { Emitter, Event } from '../../../../base/common/event.js';
import { Disposable, DisposableMap, DisposableStore } from '../../../../base/common/lifecycle.js';
import { FileAccess } from '../../../../base/common/network.js';
import { LazyTokenizationSupport, TreeSitterTokenizationRegistry } from '../../../../editor/common/languages.js';
import { EDITOR_EXPERIMENTAL_PREFER_TREESITTER, ITreeSitterParserService } from '../../../../editor/common/services/treeSitterParserService.js';
import { ColumnRange } from '../../../../editor/contrib/inlineCompletions/browser/utils.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { createDecorator, IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { findMetadata } from '../../themes/common/colorThemeData.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
const ALLOWED_SUPPORT = ['typescript'];
export const ITreeSitterTokenizationFeature = createDecorator('treeSitterTokenizationFeature');
let TreeSitterTokenizationFeature = class TreeSitterTokenizationFeature extends Disposable {
    constructor(_languageService, _configurationService, _instantiationService, _fileService) {
        super();
        this._languageService = _languageService;
        this._configurationService = _configurationService;
        this._instantiationService = _instantiationService;
        this._fileService = _fileService;
        this._tokenizersRegistrations = new DisposableMap();
        this._handleGrammarsExtPoint();
        this._register(this._configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(EDITOR_EXPERIMENTAL_PREFER_TREESITTER)) {
                this._handleGrammarsExtPoint();
            }
        }));
    }
    _getSetting() {
        return this._configurationService.getValue(EDITOR_EXPERIMENTAL_PREFER_TREESITTER) || [];
    }
    _handleGrammarsExtPoint() {
        const setting = this._getSetting();
        for (const languageId of setting) {
            if (ALLOWED_SUPPORT.includes(languageId) && !this._tokenizersRegistrations.has(languageId)) {
                const lazyTokenizationSupport = new LazyTokenizationSupport(() => this._createTokenizationSupport(languageId));
                const disposableStore = new DisposableStore();
                disposableStore.add(lazyTokenizationSupport);
                disposableStore.add(TreeSitterTokenizationRegistry.registerFactory(languageId, lazyTokenizationSupport));
                this._tokenizersRegistrations.set(languageId, disposableStore);
                TreeSitterTokenizationRegistry.getOrCreate(languageId);
            }
        }
        const languagesToUnregister = [...this._tokenizersRegistrations.keys()].filter(languageId => !setting.includes(languageId));
        for (const languageId of languagesToUnregister) {
            this._tokenizersRegistrations.deleteAndDispose(languageId);
        }
    }
    async _fetchQueries(newLanguage) {
        const languageLocation = `vs/editor/common/languages/highlights/${newLanguage}.scm`;
        const query = await this._fileService.readFile(FileAccess.asFileUri(languageLocation));
        return query.value.toString();
    }
    async _createTokenizationSupport(languageId) {
        const queries = await this._fetchQueries(languageId);
        return this._instantiationService.createInstance(TreeSitterTokenizationSupport, queries, languageId, this._languageService.languageIdCodec);
    }
};
TreeSitterTokenizationFeature = __decorate([
    __param(0, ILanguageService),
    __param(1, IConfigurationService),
    __param(2, IInstantiationService),
    __param(3, IFileService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], TreeSitterTokenizationFeature);
let TreeSitterTokenizationSupport = class TreeSitterTokenizationSupport extends Disposable {
    constructor(_queries, _languageId, _languageIdCodec, _treeSitterService, _themeService) {
        super();
        this._queries = _queries;
        this._languageId = _languageId;
        this._languageIdCodec = _languageIdCodec;
        this._treeSitterService = _treeSitterService;
        this._themeService = _themeService;
        this._onDidChangeTokens = new Emitter();
        this.onDidChangeTokens = this._onDidChangeTokens.event;
        this._register(Event.runAndSubscribe(this._themeService.onDidColorThemeChange, () => this.reset()));
        this._register(this._treeSitterService.onDidUpdateTree((e) => {
            const maxLine = e.textModel.getLineCount();
            this._onDidChangeTokens.fire({
                textModel: e.textModel,
                changes: {
                    semanticTokensApplied: false,
                    ranges: e.ranges.map(range => ({ fromLineNumber: range.startLineNumber, toLineNumber: range.endLineNumber < maxLine ? range.endLineNumber : maxLine })),
                }
            });
        }));
    }
    _getTree(textModel) {
        return this._treeSitterService.getParseResult(textModel);
    }
    _ensureQuery() {
        if (!this._query) {
            const language = this._treeSitterService.getOrInitLanguage(this._languageId);
            if (!language) {
                if (!this._languageAddedListener) {
                    this._languageAddedListener = this._register(Event.onceIf(this._treeSitterService.onDidAddLanguage, e => e.id === this._languageId)((e) => {
                        this._query = e.language.query(this._queries);
                    }));
                }
                return;
            }
            this._query = language.query(this._queries);
        }
        return this._query;
    }
    reset() {
        this._colorThemeData = this._themeService.getColorTheme();
    }
    captureAtPosition(lineNumber, column, textModel) {
        const tree = this._getTree(textModel);
        const captures = this._captureAtRange(lineNumber, new ColumnRange(column, column), tree?.tree);
        return captures;
    }
    captureAtPositionTree(lineNumber, column, tree) {
        const captures = this._captureAtRange(lineNumber, new ColumnRange(column, column), tree);
        return captures;
    }
    _captureAtRange(lineNumber, columnRange, tree) {
        const query = this._ensureQuery();
        if (!tree || !query) {
            return [];
        }
        return query.captures(tree.rootNode, { startPosition: { row: lineNumber - 1, column: columnRange.startColumn - 1 }, endPosition: { row: lineNumber - 1, column: columnRange.endColumnExclusive } });
    }
    tokenizeEncoded(lineNumber, textModel) {
        const lineLength = textModel.getLineMaxColumn(lineNumber);
        const tree = this._getTree(textModel);
        const captures = this._captureAtRange(lineNumber, new ColumnRange(1, lineLength), tree?.tree);
        if (captures.length === 0) {
            return undefined;
        }
        const endOffsetsAndScopes = Array(captures.length);
        endOffsetsAndScopes.fill({ endOffset: 0, scopes: [] });
        let tokenIndex = 0;
        const lineStartOffset = textModel.getOffsetAt({ lineNumber: lineNumber, column: 1 });
        const increaseSizeOfTokensByOneToken = () => {
            endOffsetsAndScopes.push({ endOffset: 0, scopes: [] });
        };
        const encodedLanguageId = this._languageIdCodec.encodeLanguageId(this._languageId);
        for (let captureIndex = 0; captureIndex < captures.length; captureIndex++) {
            const capture = captures[captureIndex];
            const tokenEndIndex = capture.node.endIndex < lineStartOffset + lineLength ? capture.node.endIndex : lineStartOffset + lineLength;
            const tokenStartIndex = capture.node.startIndex < lineStartOffset ? lineStartOffset : capture.node.startIndex;
            const lineRelativeOffset = tokenEndIndex - lineStartOffset;
            let previousTokenEnd;
            const currentTokenLength = tokenEndIndex - tokenStartIndex;
            if (captureIndex > 0) {
                previousTokenEnd = endOffsetsAndScopes[(tokenIndex - 1)].endOffset;
            }
            else {
                previousTokenEnd = tokenStartIndex - lineStartOffset - 1;
            }
            const intermediateTokenOffset = lineRelativeOffset - currentTokenLength;
            if ((previousTokenEnd >= 0) && (previousTokenEnd < intermediateTokenOffset)) {
                endOffsetsAndScopes[tokenIndex] = { endOffset: intermediateTokenOffset, scopes: [] };
                tokenIndex++;
                increaseSizeOfTokensByOneToken();
            }
            const addCurrentTokenToArray = () => {
                endOffsetsAndScopes[tokenIndex] = { endOffset: lineRelativeOffset, scopes: [capture.name] };
                tokenIndex++;
            };
            if (previousTokenEnd >= lineRelativeOffset) {
                const previousTokenStartOffset = ((tokenIndex >= 2) ? endOffsetsAndScopes[tokenIndex - 2].endOffset : 0);
                const originalPreviousTokenEndOffset = endOffsetsAndScopes[tokenIndex - 1].endOffset;
                if ((previousTokenStartOffset + currentTokenLength) === originalPreviousTokenEndOffset) {
                    endOffsetsAndScopes[tokenIndex - 1].scopes[endOffsetsAndScopes[tokenIndex - 1].scopes.length - 1] = capture.name;
                }
                else {
                    endOffsetsAndScopes[tokenIndex - 1].endOffset = intermediateTokenOffset;
                    addCurrentTokenToArray();
                    increaseSizeOfTokensByOneToken();
                    endOffsetsAndScopes[tokenIndex].endOffset = originalPreviousTokenEndOffset;
                    endOffsetsAndScopes[tokenIndex].scopes = endOffsetsAndScopes[tokenIndex - 2].scopes;
                    tokenIndex++;
                }
            }
            else {
                addCurrentTokenToArray();
            }
        }
        if (captures[captures.length - 1].node.endPosition.column + 1 < lineLength) {
            increaseSizeOfTokensByOneToken();
            endOffsetsAndScopes[tokenIndex].endOffset = lineLength - 1;
            tokenIndex++;
        }
        const tokens = new Uint32Array((tokenIndex) * 2);
        for (let i = 0; i < tokenIndex; i++) {
            const token = endOffsetsAndScopes[i];
            if (token.endOffset === 0 && token.scopes.length === 0) {
                break;
            }
            tokens[i * 2] = token.endOffset;
            tokens[i * 2 + 1] = findMetadata(this._colorThemeData, token.scopes, encodedLanguageId);
        }
        return tokens;
    }
    dispose() {
        super.dispose();
        this._query?.delete();
        this._query = undefined;
    }
};
TreeSitterTokenizationSupport = __decorate([
    __param(3, ITreeSitterParserService),
    __param(4, IThemeService),
    __metadata("design:paramtypes", [String, String, Object, Object, Object])
], TreeSitterTokenizationSupport);
registerSingleton(ITreeSitterTokenizationFeature, TreeSitterTokenizationFeature, 0);
