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
var WordHighlighter_1, WordHighlighterContribution_1;
import * as nls from '../../../../nls.js';
import { alert } from '../../../../base/browser/ui/aria/aria.js';
import { createCancelablePromise, Delayer, first } from '../../../../base/common/async.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { onUnexpectedError, onUnexpectedExternalError } from '../../../../base/common/errors.js';
import { Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { ResourceMap } from '../../../../base/common/map.js';
import { matchesScheme, Schemas } from '../../../../base/common/network.js';
import { isEqual } from '../../../../base/common/resources.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { isDiffEditor } from '../../../browser/editorBrowser.js';
import { EditorAction, registerEditorAction, registerEditorContribution, registerModelAndPositionCommand } from '../../../browser/editorExtensions.js';
import { ICodeEditorService } from '../../../browser/services/codeEditorService.js';
import { Range } from '../../../common/core/range.js';
import { EditorContextKeys } from '../../../common/editorContextKeys.js';
import { registerEditorFeature } from '../../../common/editorFeatures.js';
import { LanguageFeatureRegistry } from '../../../common/languageFeatureRegistry.js';
import { score } from '../../../common/languageSelector.js';
import { shouldSynchronizeModel } from '../../../common/model.js';
import { ILanguageFeaturesService } from '../../../common/services/languageFeatures.js';
import { ITextModelService } from '../../../common/services/resolverService.js';
import { getHighlightDecorationOptions } from './highlightDecorations.js';
import { TextualMultiDocumentHighlightFeature } from './textualHighlightProvider.js';
const ctxHasWordHighlights = new RawContextKey('hasWordHighlights', false);
export function getOccurrencesAtPosition(registry, model, position, token) {
    const orderedByScore = registry.ordered(model);
    return first(orderedByScore.map(provider => () => {
        return Promise.resolve(provider.provideDocumentHighlights(model, position, token))
            .then(undefined, onUnexpectedExternalError);
    }), (result) => result !== undefined && result !== null).then(result => {
        if (result) {
            const map = new ResourceMap();
            map.set(model.uri, result);
            return map;
        }
        return new ResourceMap();
    });
}
export function getOccurrencesAcrossMultipleModels(registry, model, position, token, otherModels) {
    const orderedByScore = registry.ordered(model);
    return first(orderedByScore.map(provider => () => {
        const filteredModels = otherModels.filter(otherModel => {
            return shouldSynchronizeModel(otherModel);
        }).filter(otherModel => {
            return score(provider.selector, otherModel.uri, otherModel.getLanguageId(), true, undefined, undefined) > 0;
        });
        return Promise.resolve(provider.provideMultiDocumentHighlights(model, position, filteredModels, token))
            .then(undefined, onUnexpectedExternalError);
    }), (result) => result !== undefined && result !== null);
}
class OccurenceAtPositionRequest {
    constructor(_model, _selection, _wordSeparators) {
        this._model = _model;
        this._selection = _selection;
        this._wordSeparators = _wordSeparators;
        this._wordRange = this._getCurrentWordRange(_model, _selection);
        this._result = null;
    }
    get result() {
        if (!this._result) {
            this._result = createCancelablePromise(token => this._compute(this._model, this._selection, this._wordSeparators, token));
        }
        return this._result;
    }
    _getCurrentWordRange(model, selection) {
        const word = model.getWordAtPosition(selection.getPosition());
        if (word) {
            return new Range(selection.startLineNumber, word.startColumn, selection.startLineNumber, word.endColumn);
        }
        return null;
    }
    isValid(model, selection, decorations) {
        const lineNumber = selection.startLineNumber;
        const startColumn = selection.startColumn;
        const endColumn = selection.endColumn;
        const currentWordRange = this._getCurrentWordRange(model, selection);
        let requestIsValid = Boolean(this._wordRange && this._wordRange.equalsRange(currentWordRange));
        for (let i = 0, len = decorations.length; !requestIsValid && i < len; i++) {
            const range = decorations.getRange(i);
            if (range && range.startLineNumber === lineNumber) {
                if (range.startColumn <= startColumn && range.endColumn >= endColumn) {
                    requestIsValid = true;
                }
            }
        }
        return requestIsValid;
    }
    cancel() {
        this.result.cancel();
    }
}
class SemanticOccurenceAtPositionRequest extends OccurenceAtPositionRequest {
    constructor(model, selection, wordSeparators, providers) {
        super(model, selection, wordSeparators);
        this._providers = providers;
    }
    _compute(model, selection, wordSeparators, token) {
        return getOccurrencesAtPosition(this._providers, model, selection.getPosition(), token).then(value => {
            if (!value) {
                return new ResourceMap();
            }
            return value;
        });
    }
}
class MultiModelOccurenceRequest extends OccurenceAtPositionRequest {
    constructor(model, selection, wordSeparators, providers, otherModels) {
        super(model, selection, wordSeparators);
        this._providers = providers;
        this._otherModels = otherModels;
    }
    _compute(model, selection, wordSeparators, token) {
        return getOccurrencesAcrossMultipleModels(this._providers, model, selection.getPosition(), token, this._otherModels).then(value => {
            if (!value) {
                return new ResourceMap();
            }
            return value;
        });
    }
}
function computeOccurencesAtPosition(registry, model, selection, wordSeparators) {
    return new SemanticOccurenceAtPositionRequest(model, selection, wordSeparators, registry);
}
function computeOccurencesMultiModel(registry, model, selection, wordSeparators, otherModels) {
    return new MultiModelOccurenceRequest(model, selection, wordSeparators, registry, otherModels);
}
registerModelAndPositionCommand('_executeDocumentHighlights', async (accessor, model, position) => {
    const languageFeaturesService = accessor.get(ILanguageFeaturesService);
    const map = await getOccurrencesAtPosition(languageFeaturesService.documentHighlightProvider, model, position, CancellationToken.None);
    return map?.get(model.uri);
});
let WordHighlighter = class WordHighlighter {
    static { WordHighlighter_1 = this; }
    static { this.storedDecorationIDs = new ResourceMap(); }
    static { this.query = null; }
    constructor(editor, providers, multiProviders, contextKeyService, textModelService, codeEditorService) {
        this.toUnhook = new DisposableStore();
        this.workerRequestTokenId = 0;
        this.workerRequestCompleted = false;
        this.workerRequestValue = new ResourceMap();
        this.lastCursorPositionChangeTime = 0;
        this.renderDecorationsTimer = -1;
        this.runDelayer = this.toUnhook.add(new Delayer(25));
        this.editor = editor;
        this.providers = providers;
        this.multiDocumentProviders = multiProviders;
        this.codeEditorService = codeEditorService;
        this.textModelService = textModelService;
        this._hasWordHighlights = ctxHasWordHighlights.bindTo(contextKeyService);
        this._ignorePositionChangeEvent = false;
        this.occurrencesHighlight = this.editor.getOption(83);
        this.model = this.editor.getModel();
        this.toUnhook.add(editor.onDidChangeCursorPosition((e) => {
            if (this._ignorePositionChangeEvent) {
                return;
            }
            if (this.occurrencesHighlight === 'off') {
                return;
            }
            this.runDelayer.trigger(() => { this._onPositionChanged(e); });
        }));
        this.toUnhook.add(editor.onDidFocusEditorText((e) => {
            if (this.occurrencesHighlight === 'off') {
                return;
            }
            if (!this.workerRequest) {
                this.runDelayer.trigger(() => { this._run(); });
            }
        }));
        this.toUnhook.add(editor.onDidChangeModelContent((e) => {
            if (!matchesScheme(this.model.uri, 'output')) {
                this._stopAll();
            }
        }));
        this.toUnhook.add(editor.onDidChangeModel((e) => {
            if (!e.newModelUrl && e.oldModelUrl) {
                this._stopSingular();
            }
            else if (WordHighlighter_1.query) {
                this._run();
            }
        }));
        this.toUnhook.add(editor.onDidChangeConfiguration((e) => {
            const newValue = this.editor.getOption(83);
            if (this.occurrencesHighlight !== newValue) {
                this.occurrencesHighlight = newValue;
                switch (newValue) {
                    case 'off':
                        this._stopAll();
                        break;
                    case 'singleFile':
                        this._stopAll(WordHighlighter_1.query?.modelInfo?.modelURI);
                        break;
                    case 'multiFile':
                        if (WordHighlighter_1.query) {
                            this._run(true);
                        }
                        break;
                    default:
                        console.warn('Unknown occurrencesHighlight setting value:', newValue);
                        break;
                }
            }
        }));
        this.toUnhook.add(editor.onDidBlurEditorWidget(() => {
            const activeEditor = this.codeEditorService.getFocusedCodeEditor();
            if (!activeEditor) {
                this._stopAll();
            }
            else if (activeEditor.getModel()?.uri.scheme === Schemas.vscodeNotebookCell && this.editor.getModel()?.uri.scheme !== Schemas.vscodeNotebookCell) {
                this._stopAll();
            }
        }));
        this.decorations = this.editor.createDecorationsCollection();
        this.workerRequestTokenId = 0;
        this.workerRequest = null;
        this.workerRequestCompleted = false;
        this.lastCursorPositionChangeTime = 0;
        this.renderDecorationsTimer = -1;
        if (WordHighlighter_1.query) {
            this._run();
        }
    }
    hasDecorations() {
        return (this.decorations.length > 0);
    }
    restore() {
        if (this.occurrencesHighlight === 'off') {
            return;
        }
        this.runDelayer.cancel();
        this._run();
    }
    trigger() {
        this.runDelayer.cancel();
        this._run(false, true);
    }
    stop() {
        if (this.occurrencesHighlight === 'off') {
            return;
        }
        this._stopAll();
    }
    _getSortedHighlights() {
        return (this.decorations.getRanges()
            .sort(Range.compareRangesUsingStarts));
    }
    moveNext() {
        const highlights = this._getSortedHighlights();
        const index = highlights.findIndex((range) => range.containsPosition(this.editor.getPosition()));
        const newIndex = ((index + 1) % highlights.length);
        const dest = highlights[newIndex];
        try {
            this._ignorePositionChangeEvent = true;
            this.editor.setPosition(dest.getStartPosition());
            this.editor.revealRangeInCenterIfOutsideViewport(dest);
            const word = this._getWord();
            if (word) {
                const lineContent = this.editor.getModel().getLineContent(dest.startLineNumber);
                alert(`${lineContent}, ${newIndex + 1} of ${highlights.length} for '${word.word}'`);
            }
        }
        finally {
            this._ignorePositionChangeEvent = false;
        }
    }
    moveBack() {
        const highlights = this._getSortedHighlights();
        const index = highlights.findIndex((range) => range.containsPosition(this.editor.getPosition()));
        const newIndex = ((index - 1 + highlights.length) % highlights.length);
        const dest = highlights[newIndex];
        try {
            this._ignorePositionChangeEvent = true;
            this.editor.setPosition(dest.getStartPosition());
            this.editor.revealRangeInCenterIfOutsideViewport(dest);
            const word = this._getWord();
            if (word) {
                const lineContent = this.editor.getModel().getLineContent(dest.startLineNumber);
                alert(`${lineContent}, ${newIndex + 1} of ${highlights.length} for '${word.word}'`);
            }
        }
        finally {
            this._ignorePositionChangeEvent = false;
        }
    }
    _removeSingleDecorations() {
        if (!this.editor.hasModel()) {
            return;
        }
        const currentDecorationIDs = WordHighlighter_1.storedDecorationIDs.get(this.editor.getModel().uri);
        if (!currentDecorationIDs) {
            return;
        }
        this.editor.removeDecorations(currentDecorationIDs);
        WordHighlighter_1.storedDecorationIDs.delete(this.editor.getModel().uri);
        if (this.decorations.length > 0) {
            this.decorations.clear();
            this._hasWordHighlights.set(false);
        }
    }
    _removeAllDecorations(preservedModel) {
        const currentEditors = this.codeEditorService.listCodeEditors();
        const deleteURI = [];
        for (const editor of currentEditors) {
            if (!editor.hasModel() || isEqual(editor.getModel().uri, preservedModel)) {
                continue;
            }
            const currentDecorationIDs = WordHighlighter_1.storedDecorationIDs.get(editor.getModel().uri);
            if (!currentDecorationIDs) {
                continue;
            }
            editor.removeDecorations(currentDecorationIDs);
            deleteURI.push(editor.getModel().uri);
            const editorHighlighterContrib = WordHighlighterContribution.get(editor);
            if (!editorHighlighterContrib?.wordHighlighter) {
                continue;
            }
            if (editorHighlighterContrib.wordHighlighter.decorations.length > 0) {
                editorHighlighterContrib.wordHighlighter.decorations.clear();
                editorHighlighterContrib.wordHighlighter.workerRequest = null;
                editorHighlighterContrib.wordHighlighter._hasWordHighlights.set(false);
            }
        }
        for (const uri of deleteURI) {
            WordHighlighter_1.storedDecorationIDs.delete(uri);
        }
    }
    _stopSingular() {
        this._removeSingleDecorations();
        if (this.editor.hasTextFocus()) {
            if (this.editor.getModel()?.uri.scheme !== Schemas.vscodeNotebookCell && WordHighlighter_1.query?.modelInfo?.modelURI.scheme !== Schemas.vscodeNotebookCell) {
                WordHighlighter_1.query = null;
                this._run();
            }
            else {
                if (WordHighlighter_1.query?.modelInfo) {
                    WordHighlighter_1.query.modelInfo = null;
                }
            }
        }
        if (this.renderDecorationsTimer !== -1) {
            clearTimeout(this.renderDecorationsTimer);
            this.renderDecorationsTimer = -1;
        }
        if (this.workerRequest !== null) {
            this.workerRequest.cancel();
            this.workerRequest = null;
        }
        if (!this.workerRequestCompleted) {
            this.workerRequestTokenId++;
            this.workerRequestCompleted = true;
        }
    }
    _stopAll(preservedModel) {
        this._removeAllDecorations(preservedModel);
        if (this.renderDecorationsTimer !== -1) {
            clearTimeout(this.renderDecorationsTimer);
            this.renderDecorationsTimer = -1;
        }
        if (this.workerRequest !== null) {
            this.workerRequest.cancel();
            this.workerRequest = null;
        }
        if (!this.workerRequestCompleted) {
            this.workerRequestTokenId++;
            this.workerRequestCompleted = true;
        }
    }
    _onPositionChanged(e) {
        if (this.occurrencesHighlight === 'off') {
            this._stopAll();
            return;
        }
        if (e.reason !== 3 && this.editor.getModel()?.uri.scheme !== Schemas.vscodeNotebookCell) {
            this._stopAll();
            return;
        }
        this._run();
    }
    _getWord() {
        const editorSelection = this.editor.getSelection();
        const lineNumber = editorSelection.startLineNumber;
        const startColumn = editorSelection.startColumn;
        if (this.model.isDisposed()) {
            return null;
        }
        return this.model.getWordAtPosition({
            lineNumber: lineNumber,
            column: startColumn
        });
    }
    getOtherModelsToHighlight(model) {
        if (!model) {
            return [];
        }
        const isNotebookEditor = model.uri.scheme === Schemas.vscodeNotebookCell;
        if (isNotebookEditor) {
            const currentModels = [];
            const currentEditors = this.codeEditorService.listCodeEditors();
            for (const editor of currentEditors) {
                const tempModel = editor.getModel();
                if (tempModel && tempModel !== model && tempModel.uri.scheme === Schemas.vscodeNotebookCell) {
                    currentModels.push(tempModel);
                }
            }
            return currentModels;
        }
        const currentModels = [];
        const currentEditors = this.codeEditorService.listCodeEditors();
        for (const editor of currentEditors) {
            if (!isDiffEditor(editor)) {
                continue;
            }
            const diffModel = editor.getModel();
            if (!diffModel) {
                continue;
            }
            if (model === diffModel.modified) {
                currentModels.push(diffModel.modified);
            }
        }
        if (currentModels.length) {
            return currentModels;
        }
        if (this.occurrencesHighlight === 'singleFile') {
            return [];
        }
        for (const editor of currentEditors) {
            const tempModel = editor.getModel();
            const isValidModel = tempModel && tempModel !== model;
            if (isValidModel) {
                currentModels.push(tempModel);
            }
        }
        return currentModels;
    }
    async _run(multiFileConfigChange, noDelay) {
        const hasTextFocus = this.editor.hasTextFocus();
        if (!hasTextFocus) {
            if (!WordHighlighter_1.query) {
                this._stopAll();
                return;
            }
        }
        else {
            const editorSelection = this.editor.getSelection();
            if (!editorSelection || editorSelection.startLineNumber !== editorSelection.endLineNumber) {
                WordHighlighter_1.query = null;
                this._stopAll();
                return;
            }
            const startColumn = editorSelection.startColumn;
            const endColumn = editorSelection.endColumn;
            const word = this._getWord();
            if (!word || word.startColumn > startColumn || word.endColumn < endColumn) {
                WordHighlighter_1.query = null;
                this._stopAll();
                return;
            }
            WordHighlighter_1.query = {
                modelInfo: {
                    modelURI: this.model.uri,
                    selection: editorSelection,
                }
            };
        }
        this.lastCursorPositionChangeTime = (new Date()).getTime();
        if (isEqual(this.editor.getModel().uri, WordHighlighter_1.query.modelInfo?.modelURI)) {
            if (!multiFileConfigChange) {
                const currentModelDecorationRanges = this.decorations.getRanges();
                for (const storedRange of currentModelDecorationRanges) {
                    if (storedRange.containsPosition(this.editor.getPosition())) {
                        return;
                    }
                }
            }
            this._stopAll(multiFileConfigChange ? this.model.uri : undefined);
            const myRequestId = ++this.workerRequestTokenId;
            this.workerRequestCompleted = false;
            const otherModelsToHighlight = this.getOtherModelsToHighlight(this.editor.getModel());
            if (!WordHighlighter_1.query || !WordHighlighter_1.query.modelInfo) {
                return;
            }
            const queryModelRef = await this.textModelService.createModelReference(WordHighlighter_1.query.modelInfo.modelURI);
            const queryModel = queryModelRef.object.textEditorModel;
            this.workerRequest = this.computeWithModel(queryModel, WordHighlighter_1.query.modelInfo.selection, otherModelsToHighlight);
            this.workerRequest?.result.then(data => {
                if (myRequestId === this.workerRequestTokenId) {
                    this.workerRequestCompleted = true;
                    this.workerRequestValue = data || [];
                    this._beginRenderDecorations();
                }
            }, onUnexpectedError);
        }
        else if (this.model.uri.scheme === Schemas.vscodeNotebookCell) {
            const myRequestId = ++this.workerRequestTokenId;
            this.workerRequestCompleted = false;
            if (!WordHighlighter_1.query || !WordHighlighter_1.query.modelInfo) {
                return;
            }
            const queryModelRef = await this.textModelService.createModelReference(WordHighlighter_1.query.modelInfo.modelURI);
            const queryModel = queryModelRef.object.textEditorModel;
            this.workerRequest = this.computeWithModel(queryModel, WordHighlighter_1.query.modelInfo.selection, [this.model]);
            this.workerRequest?.result.then(data => {
                if (myRequestId === this.workerRequestTokenId) {
                    this.workerRequestCompleted = true;
                    this.workerRequestValue = data || [];
                    this._beginRenderDecorations(noDelay);
                }
            }, onUnexpectedError);
        }
    }
    computeWithModel(model, selection, otherModels) {
        if (!otherModels.length) {
            return computeOccurencesAtPosition(this.providers, model, selection, this.editor.getOption(134));
        }
        else {
            return computeOccurencesMultiModel(this.multiDocumentProviders, model, selection, this.editor.getOption(134), otherModels);
        }
    }
    _beginRenderDecorations(noDelay) {
        const currentTime = (new Date()).getTime();
        const minimumRenderTime = this.lastCursorPositionChangeTime + (noDelay ? 0 : 250);
        if (currentTime >= minimumRenderTime) {
            this.renderDecorationsTimer = -1;
            this.renderDecorations();
        }
        else {
            this.renderDecorationsTimer = setTimeout(() => {
                this.renderDecorations();
            }, (minimumRenderTime - currentTime));
        }
    }
    renderDecorations() {
        this.renderDecorationsTimer = -1;
        const currentEditors = this.codeEditorService.listCodeEditors();
        for (const editor of currentEditors) {
            const editorHighlighterContrib = WordHighlighterContribution.get(editor);
            if (!editorHighlighterContrib) {
                continue;
            }
            const newDecorations = [];
            const uri = editor.getModel()?.uri;
            if (uri && this.workerRequestValue.has(uri)) {
                const oldDecorationIDs = WordHighlighter_1.storedDecorationIDs.get(uri);
                const newDocumentHighlights = this.workerRequestValue.get(uri);
                if (newDocumentHighlights) {
                    for (const highlight of newDocumentHighlights) {
                        if (!highlight.range) {
                            continue;
                        }
                        newDecorations.push({
                            range: highlight.range,
                            options: getHighlightDecorationOptions(highlight.kind)
                        });
                    }
                }
                let newDecorationIDs = [];
                editor.changeDecorations((changeAccessor) => {
                    newDecorationIDs = changeAccessor.deltaDecorations(oldDecorationIDs ?? [], newDecorations);
                });
                WordHighlighter_1.storedDecorationIDs = WordHighlighter_1.storedDecorationIDs.set(uri, newDecorationIDs);
                if (newDecorations.length > 0) {
                    editorHighlighterContrib.wordHighlighter?.decorations.set(newDecorations);
                    editorHighlighterContrib.wordHighlighter?._hasWordHighlights.set(true);
                }
            }
        }
        this.workerRequest = null;
    }
    dispose() {
        this._stopSingular();
        this.toUnhook.dispose();
    }
};
WordHighlighter = WordHighlighter_1 = __decorate([
    __param(4, ITextModelService),
    __param(5, ICodeEditorService),
    __metadata("design:paramtypes", [Object, LanguageFeatureRegistry,
        LanguageFeatureRegistry, Object, Object, Object])
], WordHighlighter);
let WordHighlighterContribution = class WordHighlighterContribution extends Disposable {
    static { WordHighlighterContribution_1 = this; }
    static { this.ID = 'editor.contrib.wordHighlighter'; }
    static get(editor) {
        return editor.getContribution(WordHighlighterContribution_1.ID);
    }
    constructor(editor, contextKeyService, languageFeaturesService, codeEditorService, textModelService) {
        super();
        this._wordHighlighter = null;
        const createWordHighlighterIfPossible = () => {
            if (editor.hasModel() && !editor.getModel().isTooLargeForTokenization()) {
                this._wordHighlighter = new WordHighlighter(editor, languageFeaturesService.documentHighlightProvider, languageFeaturesService.multiDocumentHighlightProvider, contextKeyService, textModelService, codeEditorService);
            }
        };
        this._register(editor.onDidChangeModel((e) => {
            if (this._wordHighlighter) {
                if (!e.newModelUrl && e.oldModelUrl?.scheme !== Schemas.vscodeNotebookCell) {
                    this.wordHighlighter?.stop();
                }
                this._wordHighlighter.dispose();
                this._wordHighlighter = null;
            }
            createWordHighlighterIfPossible();
        }));
        createWordHighlighterIfPossible();
    }
    get wordHighlighter() {
        return this._wordHighlighter;
    }
    saveViewState() {
        if (this._wordHighlighter && this._wordHighlighter.hasDecorations()) {
            return true;
        }
        return false;
    }
    moveNext() {
        this._wordHighlighter?.moveNext();
    }
    moveBack() {
        this._wordHighlighter?.moveBack();
    }
    restoreViewState(state) {
        if (this._wordHighlighter && state) {
            this._wordHighlighter.restore();
        }
    }
    stopHighlighting() {
        this._wordHighlighter?.stop();
    }
    dispose() {
        if (this._wordHighlighter) {
            this._wordHighlighter.dispose();
            this._wordHighlighter = null;
        }
        super.dispose();
    }
};
WordHighlighterContribution = WordHighlighterContribution_1 = __decorate([
    __param(1, IContextKeyService),
    __param(2, ILanguageFeaturesService),
    __param(3, ICodeEditorService),
    __param(4, ITextModelService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], WordHighlighterContribution);
export { WordHighlighterContribution };
class WordHighlightNavigationAction extends EditorAction {
    constructor(next, opts) {
        super(opts);
        this._isNext = next;
    }
    run(accessor, editor) {
        const controller = WordHighlighterContribution.get(editor);
        if (!controller) {
            return;
        }
        if (this._isNext) {
            controller.moveNext();
        }
        else {
            controller.moveBack();
        }
    }
}
class NextWordHighlightAction extends WordHighlightNavigationAction {
    constructor() {
        super(true, {
            id: 'editor.action.wordHighlight.next',
            label: nls.localize('wordHighlight.next.label', "Go to Next Symbol Highlight"),
            alias: 'Go to Next Symbol Highlight',
            precondition: ctxHasWordHighlights,
            kbOpts: {
                kbExpr: EditorContextKeys.editorTextFocus,
                primary: 65,
                weight: 100
            }
        });
    }
}
class PrevWordHighlightAction extends WordHighlightNavigationAction {
    constructor() {
        super(false, {
            id: 'editor.action.wordHighlight.prev',
            label: nls.localize('wordHighlight.previous.label', "Go to Previous Symbol Highlight"),
            alias: 'Go to Previous Symbol Highlight',
            precondition: ctxHasWordHighlights,
            kbOpts: {
                kbExpr: EditorContextKeys.editorTextFocus,
                primary: 1024 | 65,
                weight: 100
            }
        });
    }
}
class TriggerWordHighlightAction extends EditorAction {
    constructor() {
        super({
            id: 'editor.action.wordHighlight.trigger',
            label: nls.localize('wordHighlight.trigger.label', "Trigger Symbol Highlight"),
            alias: 'Trigger Symbol Highlight',
            precondition: undefined,
            kbOpts: {
                kbExpr: EditorContextKeys.editorTextFocus,
                primary: 0,
                weight: 100
            }
        });
    }
    run(accessor, editor, args) {
        const controller = WordHighlighterContribution.get(editor);
        if (!controller) {
            return;
        }
        controller.restoreViewState(true);
    }
}
registerEditorContribution(WordHighlighterContribution.ID, WordHighlighterContribution, 0);
registerEditorAction(NextWordHighlightAction);
registerEditorAction(PrevWordHighlightAction);
registerEditorAction(TriggerWordHighlightAction);
registerEditorFeature(TextualMultiDocumentHighlightFeature);
