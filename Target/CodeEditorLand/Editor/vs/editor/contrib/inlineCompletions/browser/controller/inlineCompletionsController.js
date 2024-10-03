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
var InlineCompletionsController_1;
import { createStyleSheetFromObservable } from '../../../../../base/browser/domObservable.js';
import { alert } from '../../../../../base/browser/ui/aria/aria.js';
import { timeout } from '../../../../../base/common/async.js';
import { cancelOnDispose } from '../../../../../base/common/cancellation.js';
import { createHotClass, readHotReloadableExport } from '../../../../../base/common/hotReloadHelpers.js';
import { Disposable, toDisposable } from '../../../../../base/common/lifecycle.js';
import { autorun, constObservable, derived, derivedDisposable, derivedObservableWithCache, mapObservableArrayCached, observableFromEvent, observableSignal, runOnChange, runOnChangeWithStore, transaction, waitForState } from '../../../../../base/common/observable.js';
import { isUndefined } from '../../../../../base/common/types.js';
import { localize } from '../../../../../nls.js';
import { IAccessibilityService } from '../../../../../platform/accessibility/common/accessibility.js';
import { AccessibilitySignal, IAccessibilitySignalService } from '../../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../../platform/keybinding/common/keybinding.js';
import { bindContextKey } from '../../../../../platform/observable/common/platformObservableUtils.js';
import { hotClassGetOriginalInstance } from '../../../../../platform/observable/common/wrapInHotClass.js';
import { CoreEditingCommands } from '../../../../browser/coreCommands.js';
import { observableCodeEditor } from '../../../../browser/observableCodeEditor.js';
import { LineRange } from '../../../../common/core/lineRange.js';
import { Position } from '../../../../common/core/position.js';
import { ILanguageFeatureDebounceService } from '../../../../common/services/languageFeatureDebounce.js';
import { ILanguageFeaturesService } from '../../../../common/services/languageFeatures.js';
import { InlineCompletionsHintsWidget, InlineSuggestionHintsContentWidget } from '../hintsWidget/inlineCompletionsHintsWidget.js';
import { InlineCompletionsModel } from '../model/inlineCompletionsModel.js';
import { SuggestWidgetAdaptor } from '../model/suggestWidgetAdaptor.js';
import { convertItemsToStableObservables } from '../utils.js';
import { GhostTextView } from '../view/ghostText/ghostTextView.js';
import { InlineEditsViewAndDiffProducer } from '../view/inlineEdits/inlineEditsView.js';
import { inlineSuggestCommitId } from './commandIds.js';
import { InlineCompletionContextKeys } from './inlineCompletionContextKeys.js';
let InlineCompletionsController = class InlineCompletionsController extends Disposable {
    static { InlineCompletionsController_1 = this; }
    static { this.hot = createHotClass(InlineCompletionsController_1); }
    static { this.ID = 'editor.contrib.inlineCompletionsController'; }
    static get(editor) {
        return hotClassGetOriginalInstance(editor.getContribution(InlineCompletionsController_1.ID));
    }
    constructor(editor, _instantiationService, _contextKeyService, _configurationService, _commandService, _debounceService, _languageFeaturesService, _accessibilitySignalService, _keybindingService, _accessibilityService) {
        super();
        this.editor = editor;
        this._instantiationService = _instantiationService;
        this._contextKeyService = _contextKeyService;
        this._configurationService = _configurationService;
        this._commandService = _commandService;
        this._debounceService = _debounceService;
        this._languageFeaturesService = _languageFeaturesService;
        this._accessibilitySignalService = _accessibilitySignalService;
        this._keybindingService = _keybindingService;
        this._accessibilityService = _accessibilityService;
        this._editorObs = observableCodeEditor(this.editor);
        this._positions = derived(this, reader => this._editorObs.selections.read(reader)?.map(s => s.getEndPosition()) ?? [new Position(1, 1)]);
        this._suggestWidgetAdaptor = this._register(new SuggestWidgetAdaptor(this.editor, () => {
            this._editorObs.forceUpdate();
            return this.model.get()?.selectedInlineCompletion.get()?.toSingleTextEdit(undefined);
        }, (item) => this._editorObs.forceUpdate(_tx => {
            this.model.get()?.handleSuggestAccepted(item);
        })));
        this._suggestWidgetSelectedItem = observableFromEvent(this, cb => this._suggestWidgetAdaptor.onDidSelectedItemChange(() => {
            this._editorObs.forceUpdate(_tx => cb(undefined));
        }), () => this._suggestWidgetAdaptor.selectedItem);
        this._enabledInConfig = observableFromEvent(this, this.editor.onDidChangeConfiguration, () => this.editor.getOption(64).enabled);
        this._isScreenReaderEnabled = observableFromEvent(this, this._accessibilityService.onDidChangeScreenReaderOptimized, () => this._accessibilityService.isScreenReaderOptimized());
        this._editorDictationInProgress = observableFromEvent(this, this._contextKeyService.onDidChangeContext, () => this._contextKeyService.getContext(this.editor.getDomNode()).getValue('editorDictation.inProgress') === true);
        this._enabled = derived(this, reader => this._enabledInConfig.read(reader) && (!this._isScreenReaderEnabled.read(reader) || !this._editorDictationInProgress.read(reader)));
        this._debounceValue = this._debounceService.for(this._languageFeaturesService.inlineCompletionsProvider, 'InlineCompletionsDebounce', { min: 50, max: 50 });
        this.model = derivedDisposable(this, reader => {
            if (this._editorObs.isReadonly.read(reader)) {
                return undefined;
            }
            const textModel = this._editorObs.model.read(reader);
            if (!textModel) {
                return undefined;
            }
            const model = this._instantiationService.createInstance(InlineCompletionsModel, textModel, this._suggestWidgetSelectedItem, this._editorObs.versionId, this._positions, this._debounceValue, observableFromEvent(this.editor.onDidChangeConfiguration, () => this.editor.getOption(121).preview), observableFromEvent(this.editor.onDidChangeConfiguration, () => this.editor.getOption(121).previewMode), observableFromEvent(this.editor.onDidChangeConfiguration, () => this.editor.getOption(64).mode), this._enabled);
            return model;
        }).recomputeInitiallyAndOnChange(this._store);
        this._ghostTexts = derived(this, (reader) => {
            const model = this.model.read(reader);
            return model?.ghostTexts.read(reader) ?? [];
        });
        this._stablizedGhostTexts = convertItemsToStableObservables(this._ghostTexts, this._store);
        this._ghostTextWidgets = mapObservableArrayCached(this, this._stablizedGhostTexts, (ghostText, store) => derivedDisposable((reader) => this._instantiationService.createInstance(readHotReloadableExport(GhostTextView, reader), this.editor, {
            ghostText: ghostText,
            minReservedLineCount: constObservable(0),
            targetTextModel: this.model.map(v => v?.textModel),
        })).recomputeInitiallyAndOnChange(store)).recomputeInitiallyAndOnChange(this._store);
        this._inlineEdit = derived(this, reader => {
            const s = this.model.read(reader)?.stateWithInlineEdit.read(reader);
            if (s?.kind === 'inlineEdit') {
                return s.inlineEdit;
            }
            return undefined;
        });
        this._everHadInlineEdit = derivedObservableWithCache(this, (reader, last) => last || !!this._inlineEdit.read(reader));
        this._inlineEditWidget = derivedDisposable(reader => {
            if (!this._everHadInlineEdit.read(reader)) {
                return undefined;
            }
            return this._instantiationService.createInstance(InlineEditsViewAndDiffProducer.hot.read(reader), this.editor, this._inlineEdit);
        })
            .recomputeInitiallyAndOnChange(this._store);
        this._playAccessibilitySignal = observableSignal(this);
        this._fontFamily = this._editorObs.getOption(64).map(val => val.fontFamily);
        this._cursorIsInIndentation = derived(this, reader => {
            const cursorPos = this._editorObs.cursorPosition.read(reader);
            if (cursorPos === null) {
                return false;
            }
            const model = this._editorObs.model.read(reader);
            if (!model) {
                return false;
            }
            this._editorObs.versionId.read(reader);
            const indentMaxColumn = model.getLineIndentColumn(cursorPos.lineNumber);
            return cursorPos.column <= indentMaxColumn;
        });
        this._register(new InlineCompletionContextKeys(this._contextKeyService, this.model));
        this._register(runOnChange(this._editorObs.onDidType, (_value, _changes) => {
            if (this._enabled.get()) {
                this.model.get()?.trigger();
            }
        }));
        this._register(this._commandService.onDidExecuteCommand((e) => {
            const commands = new Set([
                CoreEditingCommands.Tab.id,
                CoreEditingCommands.DeleteLeft.id,
                CoreEditingCommands.DeleteRight.id,
                inlineSuggestCommitId,
                'acceptSelectedSuggestion',
            ]);
            if (commands.has(e.commandId) && editor.hasTextFocus() && this._enabled.get()) {
                this._editorObs.forceUpdate(tx => {
                    this.model.get()?.trigger(tx);
                });
            }
        }));
        this._register(runOnChange(this._editorObs.selections, (_value, _, changes) => {
            if (changes.some(e => e.reason === 3 || e.source === 'api')) {
                this.model.get()?.stop();
            }
        }));
        this._register(this.editor.onDidBlurEditorWidget(() => {
            if (this._contextKeyService.getContextKeyValue('accessibleViewIsShown')
                || this._configurationService.getValue('editor.inlineSuggest.keepOnBlur')
                || editor.getOption(64).keepOnBlur
                || InlineSuggestionHintsContentWidget.dropDownVisible) {
                return;
            }
            transaction(tx => {
                this.model.get()?.stop(tx);
            });
        }));
        this._register(autorun(reader => {
            const state = this.model.read(reader)?.state.read(reader);
            if (state?.suggestItem) {
                if (state.primaryGhostText.lineCount >= 2) {
                    this._suggestWidgetAdaptor.forceRenderingAbove();
                }
            }
            else {
                this._suggestWidgetAdaptor.stopForceRenderingAbove();
            }
        }));
        this._register(toDisposable(() => {
            this._suggestWidgetAdaptor.stopForceRenderingAbove();
        }));
        const currentInlineCompletionBySemanticId = derivedObservableWithCache(this, (reader, last) => {
            const model = this.model.read(reader);
            const state = model?.state.read(reader);
            if (this._suggestWidgetSelectedItem.get()) {
                return last;
            }
            return state?.inlineCompletion?.semanticId;
        });
        this._register(runOnChangeWithStore(derived(reader => {
            this._playAccessibilitySignal.read(reader);
            currentInlineCompletionBySemanticId.read(reader);
            return {};
        }), async (_value, _, _deltas, store) => {
            const model = this.model.get();
            const state = model?.state.get();
            if (!state || !model) {
                return;
            }
            const lineText = model.textModel.getLineContent(state.primaryGhostText.lineNumber);
            await timeout(50, cancelOnDispose(store));
            await waitForState(this._suggestWidgetSelectedItem, isUndefined, () => false, cancelOnDispose(store));
            await this._accessibilitySignalService.playSignal(AccessibilitySignal.inlineSuggestion);
            if (this.editor.getOption(8)) {
                this._provideScreenReaderUpdate(state.primaryGhostText.renderForScreenReader(lineText));
            }
        }));
        this._register(new InlineCompletionsHintsWidget(this.editor, this.model, this._instantiationService));
        this._register(createStyleSheetFromObservable(derived(reader => {
            const fontFamily = this._fontFamily.read(reader);
            if (fontFamily === '' || fontFamily === 'default') {
                return '';
            }
            return `
.monaco-editor .ghost-text-decoration,
.monaco-editor .ghost-text-decoration-preview,
.monaco-editor .ghost-text {
	font-family: ${fontFamily};
}`;
        })));
        this._register(this._configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('accessibility.verbosity.inlineCompletions')) {
                this.editor.updateOptions({ inlineCompletionsAccessibilityVerbose: this._configurationService.getValue('accessibility.verbosity.inlineCompletions') });
            }
        }));
        this.editor.updateOptions({ inlineCompletionsAccessibilityVerbose: this._configurationService.getValue('accessibility.verbosity.inlineCompletions') });
        this._register(bindContextKey(InlineCompletionContextKeys.cursorInIndentation, this._contextKeyService, reader => this._cursorIsInIndentation.read(reader)));
        this._register(bindContextKey(InlineCompletionContextKeys.hasSelection, this._contextKeyService, reader => !this._editorObs.cursorSelection.read(reader)?.isEmpty()));
        this._register(bindContextKey(InlineCompletionContextKeys.cursorAtInlineEdit, this._contextKeyService, reader => {
            const cursorPos = this._editorObs.cursorPosition.read(reader);
            if (cursorPos === null) {
                return false;
            }
            const edit = this.model.read(reader)?.stateInlineEdit.read(reader);
            if (!edit) {
                return false;
            }
            return LineRange.fromRangeInclusive(edit.inlineEdit.range).contains(cursorPos.lineNumber);
        }));
    }
    playAccessibilitySignal(tx) {
        this._playAccessibilitySignal.trigger(tx);
    }
    _provideScreenReaderUpdate(content) {
        const accessibleViewShowing = this._contextKeyService.getContextKeyValue('accessibleViewIsShown');
        const accessibleViewKeybinding = this._keybindingService.lookupKeybinding('editor.action.accessibleView');
        let hint;
        if (!accessibleViewShowing && accessibleViewKeybinding && this.editor.getOption(152)) {
            hint = localize('showAccessibleViewHint', "Inspect this in the accessible view ({0})", accessibleViewKeybinding.getAriaLabel());
        }
        alert(hint ? content + ', ' + hint : content);
    }
    shouldShowHoverAt(range) {
        const ghostText = this.model.get()?.primaryGhostText.get();
        if (ghostText) {
            return ghostText.parts.some(p => range.containsPosition(new Position(ghostText.lineNumber, p.column)));
        }
        return false;
    }
    shouldShowHoverAtViewZone(viewZoneId) {
        return this._ghostTextWidgets.get()[0]?.get().ownsViewZone(viewZoneId) ?? false;
    }
    hide() {
        transaction(tx => {
            this.model.get()?.stop(tx);
        });
    }
    jump() {
        const m = this.model.get();
        const s = m?.stateInlineEdit.get();
        if (!s) {
            return;
        }
        transaction(tx => {
            m.dontRefetchSignal.trigger(tx);
            this.editor.setPosition(s.inlineEdit.range.getStartPosition(), 'inlineCompletions.jump');
            this.editor.revealLine(s.inlineEdit.range.startLineNumber);
            this.editor.focus();
        });
    }
};
InlineCompletionsController = InlineCompletionsController_1 = __decorate([
    __param(1, IInstantiationService),
    __param(2, IContextKeyService),
    __param(3, IConfigurationService),
    __param(4, ICommandService),
    __param(5, ILanguageFeatureDebounceService),
    __param(6, ILanguageFeaturesService),
    __param(7, IAccessibilitySignalService),
    __param(8, IKeybindingService),
    __param(9, IAccessibilityService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], InlineCompletionsController);
export { InlineCompletionsController };
