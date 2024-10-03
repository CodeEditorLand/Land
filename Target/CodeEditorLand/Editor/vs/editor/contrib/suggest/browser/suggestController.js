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
var SuggestController_1;
import { alert } from '../../../../base/browser/ui/aria/aria.js';
import { isNonEmptyArray } from '../../../../base/common/arrays.js';
import { CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { onUnexpectedError, onUnexpectedExternalError } from '../../../../base/common/errors.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { KeyCodeChord } from '../../../../base/common/keybindings.js';
import { DisposableStore, dispose, MutableDisposable, toDisposable } from '../../../../base/common/lifecycle.js';
import * as platform from '../../../../base/common/platform.js';
import { StopWatch } from '../../../../base/common/stopwatch.js';
import { assertType, isObject } from '../../../../base/common/types.js';
import { StableEditorScrollState } from '../../../browser/stableEditorScroll.js';
import { EditorAction, EditorCommand, registerEditorAction, registerEditorCommand, registerEditorContribution } from '../../../browser/editorExtensions.js';
import { EditOperation } from '../../../common/core/editOperation.js';
import { Position } from '../../../common/core/position.js';
import { Range } from '../../../common/core/range.js';
import { EditorContextKeys } from '../../../common/editorContextKeys.js';
import { SnippetController2 } from '../../snippet/browser/snippetController2.js';
import { SnippetParser } from '../../snippet/browser/snippetParser.js';
import { ISuggestMemoryService } from './suggestMemory.js';
import { WordContextKey } from './wordContextKey.js';
import * as nls from '../../../../nls.js';
import { CommandsRegistry, ICommandService } from '../../../../platform/commands/common/commands.js';
import { ContextKeyExpr, IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { Context as SuggestContext, suggestWidgetStatusbarMenu } from './suggest.js';
import { SuggestAlternatives } from './suggestAlternatives.js';
import { CommitCharacterController } from './suggestCommitCharacters.js';
import { SuggestModel } from './suggestModel.js';
import { OvertypingCapturer } from './suggestOvertypingCapturer.js';
import { SuggestWidget } from './suggestWidget.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { basename, extname } from '../../../../base/common/resources.js';
import { hash } from '../../../../base/common/hash.js';
import { WindowIdleValue, getWindow } from '../../../../base/browser/dom.js';
import { ModelDecorationOptions } from '../../../common/model/textModel.js';
const _sticky = false;
class LineSuffix {
    constructor(_model, _position) {
        this._model = _model;
        this._position = _position;
        this._decorationOptions = ModelDecorationOptions.register({
            description: 'suggest-line-suffix',
            stickiness: 1
        });
        const maxColumn = _model.getLineMaxColumn(_position.lineNumber);
        if (maxColumn !== _position.column) {
            const offset = _model.getOffsetAt(_position);
            const end = _model.getPositionAt(offset + 1);
            _model.changeDecorations(accessor => {
                if (this._marker) {
                    accessor.removeDecoration(this._marker);
                }
                this._marker = accessor.addDecoration(Range.fromPositions(_position, end), this._decorationOptions);
            });
        }
    }
    dispose() {
        if (this._marker && !this._model.isDisposed()) {
            this._model.changeDecorations(accessor => {
                accessor.removeDecoration(this._marker);
                this._marker = undefined;
            });
        }
    }
    delta(position) {
        if (this._model.isDisposed() || this._position.lineNumber !== position.lineNumber) {
            return 0;
        }
        if (this._marker) {
            const range = this._model.getDecorationRange(this._marker);
            const end = this._model.getOffsetAt(range.getStartPosition());
            return end - this._model.getOffsetAt(position);
        }
        else {
            return this._model.getLineMaxColumn(position.lineNumber) - position.column;
        }
    }
}
let SuggestController = class SuggestController {
    static { SuggestController_1 = this; }
    static { this.ID = 'editor.contrib.suggestController'; }
    static get(editor) {
        return editor.getContribution(SuggestController_1.ID);
    }
    constructor(editor, _memoryService, _commandService, _contextKeyService, _instantiationService, _logService, _telemetryService) {
        this._memoryService = _memoryService;
        this._commandService = _commandService;
        this._contextKeyService = _contextKeyService;
        this._instantiationService = _instantiationService;
        this._logService = _logService;
        this._telemetryService = _telemetryService;
        this._lineSuffix = new MutableDisposable();
        this._toDispose = new DisposableStore();
        this._selectors = new PriorityRegistry(s => s.priority);
        this._onWillInsertSuggestItem = new Emitter();
        this.onWillInsertSuggestItem = this._onWillInsertSuggestItem.event;
        this.editor = editor;
        this.model = _instantiationService.createInstance(SuggestModel, this.editor);
        this._selectors.register({
            priority: 0,
            select: (model, pos, items) => this._memoryService.select(model, pos, items)
        });
        const ctxInsertMode = SuggestContext.InsertMode.bindTo(_contextKeyService);
        ctxInsertMode.set(editor.getOption(121).insertMode);
        this._toDispose.add(this.model.onDidTrigger(() => ctxInsertMode.set(editor.getOption(121).insertMode)));
        this.widget = this._toDispose.add(new WindowIdleValue(getWindow(editor.getDomNode()), () => {
            const widget = this._instantiationService.createInstance(SuggestWidget, this.editor);
            this._toDispose.add(widget);
            this._toDispose.add(widget.onDidSelect(item => this._insertSuggestion(item, 0), this));
            const commitCharacterController = new CommitCharacterController(this.editor, widget, this.model, item => this._insertSuggestion(item, 2));
            this._toDispose.add(commitCharacterController);
            const ctxMakesTextEdit = SuggestContext.MakesTextEdit.bindTo(this._contextKeyService);
            const ctxHasInsertAndReplace = SuggestContext.HasInsertAndReplaceRange.bindTo(this._contextKeyService);
            const ctxCanResolve = SuggestContext.CanResolve.bindTo(this._contextKeyService);
            this._toDispose.add(toDisposable(() => {
                ctxMakesTextEdit.reset();
                ctxHasInsertAndReplace.reset();
                ctxCanResolve.reset();
            }));
            this._toDispose.add(widget.onDidFocus(({ item }) => {
                const position = this.editor.getPosition();
                const startColumn = item.editStart.column;
                const endColumn = position.column;
                let value = true;
                if (this.editor.getOption(1) === 'smart'
                    && this.model.state === 2
                    && !item.completion.additionalTextEdits
                    && !(item.completion.insertTextRules & 4)
                    && endColumn - startColumn === item.completion.insertText.length) {
                    const oldText = this.editor.getModel().getValueInRange({
                        startLineNumber: position.lineNumber,
                        startColumn,
                        endLineNumber: position.lineNumber,
                        endColumn
                    });
                    value = oldText !== item.completion.insertText;
                }
                ctxMakesTextEdit.set(value);
                ctxHasInsertAndReplace.set(!Position.equals(item.editInsertEnd, item.editReplaceEnd));
                ctxCanResolve.set(Boolean(item.provider.resolveCompletionItem) || Boolean(item.completion.documentation) || item.completion.detail !== item.completion.label);
            }));
            this._toDispose.add(widget.onDetailsKeyDown(e => {
                if (e.toKeyCodeChord().equals(new KeyCodeChord(true, false, false, false, 33)) ||
                    (platform.isMacintosh && e.toKeyCodeChord().equals(new KeyCodeChord(false, false, false, true, 33)))) {
                    e.stopPropagation();
                    return;
                }
                if (!e.toKeyCodeChord().isModifierKey()) {
                    this.editor.focus();
                }
            }));
            return widget;
        }));
        this._overtypingCapturer = this._toDispose.add(new WindowIdleValue(getWindow(editor.getDomNode()), () => {
            return this._toDispose.add(new OvertypingCapturer(this.editor, this.model));
        }));
        this._alternatives = this._toDispose.add(new WindowIdleValue(getWindow(editor.getDomNode()), () => {
            return this._toDispose.add(new SuggestAlternatives(this.editor, this._contextKeyService));
        }));
        this._toDispose.add(_instantiationService.createInstance(WordContextKey, editor));
        this._toDispose.add(this.model.onDidTrigger(e => {
            this.widget.value.showTriggered(e.auto, e.shy ? 250 : 50);
            this._lineSuffix.value = new LineSuffix(this.editor.getModel(), e.position);
        }));
        this._toDispose.add(this.model.onDidSuggest(e => {
            if (e.triggerOptions.shy) {
                return;
            }
            let index = -1;
            for (const selector of this._selectors.itemsOrderedByPriorityDesc) {
                index = selector.select(this.editor.getModel(), this.editor.getPosition(), e.completionModel.items);
                if (index !== -1) {
                    break;
                }
            }
            if (index === -1) {
                index = 0;
            }
            if (this.model.state === 0) {
                return;
            }
            let noFocus = false;
            if (e.triggerOptions.auto) {
                const options = this.editor.getOption(121);
                if (options.selectionMode === 'never' || options.selectionMode === 'always') {
                    noFocus = options.selectionMode === 'never';
                }
                else if (options.selectionMode === 'whenTriggerCharacter') {
                    noFocus = e.triggerOptions.triggerKind !== 1;
                }
                else if (options.selectionMode === 'whenQuickSuggestion') {
                    noFocus = e.triggerOptions.triggerKind === 1 && !e.triggerOptions.refilter;
                }
            }
            this.widget.value.showSuggestions(e.completionModel, index, e.isFrozen, e.triggerOptions.auto, noFocus);
        }));
        this._toDispose.add(this.model.onDidCancel(e => {
            if (!e.retrigger) {
                this.widget.value.hideWidget();
            }
        }));
        this._toDispose.add(this.editor.onDidBlurEditorWidget(() => {
            if (!_sticky) {
                this.model.cancel();
                this.model.clear();
            }
        }));
        const acceptSuggestionsOnEnter = SuggestContext.AcceptSuggestionsOnEnter.bindTo(_contextKeyService);
        const updateFromConfig = () => {
            const acceptSuggestionOnEnter = this.editor.getOption(1);
            acceptSuggestionsOnEnter.set(acceptSuggestionOnEnter === 'on' || acceptSuggestionOnEnter === 'smart');
        };
        this._toDispose.add(this.editor.onDidChangeConfiguration(() => updateFromConfig()));
        updateFromConfig();
    }
    dispose() {
        this._alternatives.dispose();
        this._toDispose.dispose();
        this.widget.dispose();
        this.model.dispose();
        this._lineSuffix.dispose();
        this._onWillInsertSuggestItem.dispose();
    }
    _insertSuggestion(event, flags) {
        if (!event || !event.item) {
            this._alternatives.value.reset();
            this.model.cancel();
            this.model.clear();
            return;
        }
        if (!this.editor.hasModel()) {
            return;
        }
        const snippetController = SnippetController2.get(this.editor);
        if (!snippetController) {
            return;
        }
        this._onWillInsertSuggestItem.fire({ item: event.item });
        const model = this.editor.getModel();
        const modelVersionNow = model.getAlternativeVersionId();
        const { item } = event;
        const tasks = [];
        const cts = new CancellationTokenSource();
        if (!(flags & 1)) {
            this.editor.pushUndoStop();
        }
        const info = this.getOverwriteInfo(item, Boolean(flags & 8));
        this._memoryService.memorize(model, this.editor.getPosition(), item);
        const isResolved = item.isResolved;
        let _commandExectionDuration = -1;
        let _additionalEditsAppliedAsync = -1;
        if (Array.isArray(item.completion.additionalTextEdits)) {
            this.model.cancel();
            const scrollState = StableEditorScrollState.capture(this.editor);
            this.editor.executeEdits('suggestController.additionalTextEdits.sync', item.completion.additionalTextEdits.map(edit => {
                let range = Range.lift(edit.range);
                if (range.startLineNumber === item.position.lineNumber && range.startColumn > item.position.column) {
                    const columnDelta = this.editor.getPosition().column - item.position.column;
                    const startColumnDelta = columnDelta;
                    const endColumnDelta = Range.spansMultipleLines(range) ? 0 : columnDelta;
                    range = new Range(range.startLineNumber, range.startColumn + startColumnDelta, range.endLineNumber, range.endColumn + endColumnDelta);
                }
                return EditOperation.replaceMove(range, edit.text);
            }));
            scrollState.restoreRelativeVerticalPositionOfCursor(this.editor);
        }
        else if (!isResolved) {
            const sw = new StopWatch();
            let position;
            const docListener = model.onDidChangeContent(e => {
                if (e.isFlush) {
                    cts.cancel();
                    docListener.dispose();
                    return;
                }
                for (const change of e.changes) {
                    const thisPosition = Range.getEndPosition(change.range);
                    if (!position || Position.isBefore(thisPosition, position)) {
                        position = thisPosition;
                    }
                }
            });
            const oldFlags = flags;
            flags |= 2;
            let didType = false;
            const typeListener = this.editor.onWillType(() => {
                typeListener.dispose();
                didType = true;
                if (!(oldFlags & 2)) {
                    this.editor.pushUndoStop();
                }
            });
            tasks.push(item.resolve(cts.token).then(() => {
                if (!item.completion.additionalTextEdits || cts.token.isCancellationRequested) {
                    return undefined;
                }
                if (position && item.completion.additionalTextEdits.some(edit => Position.isBefore(position, Range.getStartPosition(edit.range)))) {
                    return false;
                }
                if (didType) {
                    this.editor.pushUndoStop();
                }
                const scrollState = StableEditorScrollState.capture(this.editor);
                this.editor.executeEdits('suggestController.additionalTextEdits.async', item.completion.additionalTextEdits.map(edit => EditOperation.replaceMove(Range.lift(edit.range), edit.text)));
                scrollState.restoreRelativeVerticalPositionOfCursor(this.editor);
                if (didType || !(oldFlags & 2)) {
                    this.editor.pushUndoStop();
                }
                return true;
            }).then(applied => {
                this._logService.trace('[suggest] async resolving of edits DONE (ms, applied?)', sw.elapsed(), applied);
                _additionalEditsAppliedAsync = applied === true ? 1 : applied === false ? 0 : -2;
            }).finally(() => {
                docListener.dispose();
                typeListener.dispose();
            }));
        }
        let { insertText } = item.completion;
        if (!(item.completion.insertTextRules & 4)) {
            insertText = SnippetParser.escape(insertText);
        }
        this.model.cancel();
        snippetController.insert(insertText, {
            overwriteBefore: info.overwriteBefore,
            overwriteAfter: info.overwriteAfter,
            undoStopBefore: false,
            undoStopAfter: false,
            adjustWhitespace: !(item.completion.insertTextRules & 1),
            clipboardText: event.model.clipboardText,
            overtypingCapturer: this._overtypingCapturer.value
        });
        if (!(flags & 2)) {
            this.editor.pushUndoStop();
        }
        if (item.completion.command) {
            if (item.completion.command.id === TriggerSuggestAction.id) {
                this.model.trigger({ auto: true, retrigger: true });
            }
            else {
                const sw = new StopWatch();
                tasks.push(this._commandService.executeCommand(item.completion.command.id, ...(item.completion.command.arguments ? [...item.completion.command.arguments] : [])).catch(e => {
                    if (item.completion.extensionId) {
                        onUnexpectedExternalError(e);
                    }
                    else {
                        onUnexpectedError(e);
                    }
                }).finally(() => {
                    _commandExectionDuration = sw.elapsed();
                }));
            }
        }
        if (flags & 4) {
            this._alternatives.value.set(event, next => {
                cts.cancel();
                while (model.canUndo()) {
                    if (modelVersionNow !== model.getAlternativeVersionId()) {
                        model.undo();
                    }
                    this._insertSuggestion(next, 1 | 2 | (flags & 8 ? 8 : 0));
                    break;
                }
            });
        }
        this._alertCompletionItem(item);
        Promise.all(tasks).finally(() => {
            this._reportSuggestionAcceptedTelemetry(item, model, isResolved, _commandExectionDuration, _additionalEditsAppliedAsync, event.index, event.model.items);
            this.model.clear();
            cts.dispose();
        });
    }
    _reportSuggestionAcceptedTelemetry(item, model, itemResolved, commandExectionDuration, additionalEditsAppliedAsync, index, completionItems) {
        if (Math.floor(Math.random() * 100) === 0) {
            return;
        }
        const labelMap = new Map();
        for (let i = 0; i < Math.min(30, completionItems.length); i++) {
            const label = completionItems[i].textLabel;
            if (labelMap.has(label)) {
                labelMap.get(label).push(i);
            }
            else {
                labelMap.set(label, [i]);
            }
        }
        const firstIndexArray = labelMap.get(item.textLabel);
        const hasDuplicates = firstIndexArray && firstIndexArray.length > 1;
        const firstIndex = hasDuplicates ? firstIndexArray[0] : -1;
        this._telemetryService.publicLog2('suggest.acceptedSuggestion', {
            extensionId: item.extensionId?.value ?? 'unknown',
            providerId: item.provider._debugDisplayName ?? 'unknown',
            kind: item.completion.kind,
            basenameHash: hash(basename(model.uri)).toString(16),
            languageId: model.getLanguageId(),
            fileExtension: extname(model.uri),
            resolveInfo: !item.provider.resolveCompletionItem ? -1 : itemResolved ? 1 : 0,
            resolveDuration: item.resolveDuration,
            commandDuration: commandExectionDuration,
            additionalEditsAsync: additionalEditsAppliedAsync,
            index,
            firstIndex,
        });
    }
    getOverwriteInfo(item, toggleMode) {
        assertType(this.editor.hasModel());
        let replace = this.editor.getOption(121).insertMode === 'replace';
        if (toggleMode) {
            replace = !replace;
        }
        const overwriteBefore = item.position.column - item.editStart.column;
        const overwriteAfter = (replace ? item.editReplaceEnd.column : item.editInsertEnd.column) - item.position.column;
        const columnDelta = this.editor.getPosition().column - item.position.column;
        const suffixDelta = this._lineSuffix.value ? this._lineSuffix.value.delta(this.editor.getPosition()) : 0;
        return {
            overwriteBefore: overwriteBefore + columnDelta,
            overwriteAfter: overwriteAfter + suffixDelta
        };
    }
    _alertCompletionItem(item) {
        if (isNonEmptyArray(item.completion.additionalTextEdits)) {
            const msg = nls.localize('aria.alert.snippet', "Accepting '{0}' made {1} additional edits", item.textLabel, item.completion.additionalTextEdits.length);
            alert(msg);
        }
    }
    triggerSuggest(onlyFrom, auto, noFilter) {
        if (this.editor.hasModel()) {
            this.model.trigger({
                auto: auto ?? false,
                completionOptions: { providerFilter: onlyFrom, kindFilter: noFilter ? new Set() : undefined }
            });
            this.editor.revealPosition(this.editor.getPosition(), 0);
            this.editor.focus();
        }
    }
    triggerSuggestAndAcceptBest(arg) {
        if (!this.editor.hasModel()) {
            return;
        }
        const positionNow = this.editor.getPosition();
        const fallback = () => {
            if (positionNow.equals(this.editor.getPosition())) {
                this._commandService.executeCommand(arg.fallback);
            }
        };
        const makesTextEdit = (item) => {
            if (item.completion.insertTextRules & 4 || item.completion.additionalTextEdits) {
                return true;
            }
            const position = this.editor.getPosition();
            const startColumn = item.editStart.column;
            const endColumn = position.column;
            if (endColumn - startColumn !== item.completion.insertText.length) {
                return true;
            }
            const textNow = this.editor.getModel().getValueInRange({
                startLineNumber: position.lineNumber,
                startColumn,
                endLineNumber: position.lineNumber,
                endColumn
            });
            return textNow !== item.completion.insertText;
        };
        Event.once(this.model.onDidTrigger)(_ => {
            const listener = [];
            Event.any(this.model.onDidTrigger, this.model.onDidCancel)(() => {
                dispose(listener);
                fallback();
            }, undefined, listener);
            this.model.onDidSuggest(({ completionModel }) => {
                dispose(listener);
                if (completionModel.items.length === 0) {
                    fallback();
                    return;
                }
                const index = this._memoryService.select(this.editor.getModel(), this.editor.getPosition(), completionModel.items);
                const item = completionModel.items[index];
                if (!makesTextEdit(item)) {
                    fallback();
                    return;
                }
                this.editor.pushUndoStop();
                this._insertSuggestion({ index, item, model: completionModel }, 4 | 1 | 2);
            }, undefined, listener);
        });
        this.model.trigger({ auto: false, shy: true });
        this.editor.revealPosition(positionNow, 0);
        this.editor.focus();
    }
    acceptSelectedSuggestion(keepAlternativeSuggestions, alternativeOverwriteConfig) {
        const item = this.widget.value.getFocusedItem();
        let flags = 0;
        if (keepAlternativeSuggestions) {
            flags |= 4;
        }
        if (alternativeOverwriteConfig) {
            flags |= 8;
        }
        this._insertSuggestion(item, flags);
    }
    acceptNextSuggestion() {
        this._alternatives.value.next();
    }
    acceptPrevSuggestion() {
        this._alternatives.value.prev();
    }
    cancelSuggestWidget() {
        this.model.cancel();
        this.model.clear();
        this.widget.value.hideWidget();
    }
    focusSuggestion() {
        this.widget.value.focusSelected();
    }
    selectNextSuggestion() {
        this.widget.value.selectNext();
    }
    selectNextPageSuggestion() {
        this.widget.value.selectNextPage();
    }
    selectLastSuggestion() {
        this.widget.value.selectLast();
    }
    selectPrevSuggestion() {
        this.widget.value.selectPrevious();
    }
    selectPrevPageSuggestion() {
        this.widget.value.selectPreviousPage();
    }
    selectFirstSuggestion() {
        this.widget.value.selectFirst();
    }
    toggleSuggestionDetails() {
        this.widget.value.toggleDetails();
    }
    toggleExplainMode() {
        this.widget.value.toggleExplainMode();
    }
    toggleSuggestionFocus() {
        this.widget.value.toggleDetailsFocus();
    }
    resetWidgetSize() {
        this.widget.value.resetPersistedSize();
    }
    forceRenderingAbove() {
        this.widget.value.forceRenderingAbove();
    }
    stopForceRenderingAbove() {
        if (!this.widget.isInitialized) {
            return;
        }
        this.widget.value.stopForceRenderingAbove();
    }
    registerSelector(selector) {
        return this._selectors.register(selector);
    }
};
SuggestController = SuggestController_1 = __decorate([
    __param(1, ISuggestMemoryService),
    __param(2, ICommandService),
    __param(3, IContextKeyService),
    __param(4, IInstantiationService),
    __param(5, ILogService),
    __param(6, ITelemetryService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object])
], SuggestController);
export { SuggestController };
class PriorityRegistry {
    constructor(prioritySelector) {
        this.prioritySelector = prioritySelector;
        this._items = new Array();
    }
    register(value) {
        if (this._items.indexOf(value) !== -1) {
            throw new Error('Value is already registered');
        }
        this._items.push(value);
        this._items.sort((s1, s2) => this.prioritySelector(s2) - this.prioritySelector(s1));
        return {
            dispose: () => {
                const idx = this._items.indexOf(value);
                if (idx >= 0) {
                    this._items.splice(idx, 1);
                }
            }
        };
    }
    get itemsOrderedByPriorityDesc() {
        return this._items;
    }
}
export class TriggerSuggestAction extends EditorAction {
    static { this.id = 'editor.action.triggerSuggest'; }
    constructor() {
        super({
            id: TriggerSuggestAction.id,
            label: nls.localize('suggest.trigger.label', "Trigger Suggest"),
            alias: 'Trigger Suggest',
            precondition: ContextKeyExpr.and(EditorContextKeys.writable, EditorContextKeys.hasCompletionItemProvider, SuggestContext.Visible.toNegated()),
            kbOpts: {
                kbExpr: EditorContextKeys.textInputFocus,
                primary: 2048 | 10,
                secondary: [2048 | 39],
                mac: { primary: 256 | 10, secondary: [512 | 9, 2048 | 39] },
                weight: 100
            }
        });
    }
    run(_accessor, editor, args) {
        const controller = SuggestController.get(editor);
        if (!controller) {
            return;
        }
        let auto;
        if (args && typeof args === 'object') {
            if (args.auto === true) {
                auto = true;
            }
        }
        controller.triggerSuggest(undefined, auto, undefined);
    }
}
registerEditorContribution(SuggestController.ID, SuggestController, 2);
registerEditorAction(TriggerSuggestAction);
const weight = 100 + 90;
const SuggestCommand = EditorCommand.bindToContribution(SuggestController.get);
registerEditorCommand(new SuggestCommand({
    id: 'acceptSelectedSuggestion',
    precondition: ContextKeyExpr.and(SuggestContext.Visible, SuggestContext.HasFocusedSuggestion),
    handler(x) {
        x.acceptSelectedSuggestion(true, false);
    },
    kbOpts: [{
            primary: 2,
            kbExpr: ContextKeyExpr.and(SuggestContext.Visible, EditorContextKeys.textInputFocus),
            weight,
        }, {
            primary: 3,
            kbExpr: ContextKeyExpr.and(SuggestContext.Visible, EditorContextKeys.textInputFocus, SuggestContext.AcceptSuggestionsOnEnter, SuggestContext.MakesTextEdit),
            weight,
        }],
    menuOpts: [{
            menuId: suggestWidgetStatusbarMenu,
            title: nls.localize('accept.insert', "Insert"),
            group: 'left',
            order: 1,
            when: SuggestContext.HasInsertAndReplaceRange.toNegated()
        }, {
            menuId: suggestWidgetStatusbarMenu,
            title: nls.localize('accept.insert', "Insert"),
            group: 'left',
            order: 1,
            when: ContextKeyExpr.and(SuggestContext.HasInsertAndReplaceRange, SuggestContext.InsertMode.isEqualTo('insert'))
        }, {
            menuId: suggestWidgetStatusbarMenu,
            title: nls.localize('accept.replace', "Replace"),
            group: 'left',
            order: 1,
            when: ContextKeyExpr.and(SuggestContext.HasInsertAndReplaceRange, SuggestContext.InsertMode.isEqualTo('replace'))
        }]
}));
registerEditorCommand(new SuggestCommand({
    id: 'acceptAlternativeSelectedSuggestion',
    precondition: ContextKeyExpr.and(SuggestContext.Visible, EditorContextKeys.textInputFocus, SuggestContext.HasFocusedSuggestion),
    kbOpts: {
        weight: weight,
        kbExpr: EditorContextKeys.textInputFocus,
        primary: 1024 | 3,
        secondary: [1024 | 2],
    },
    handler(x) {
        x.acceptSelectedSuggestion(false, true);
    },
    menuOpts: [{
            menuId: suggestWidgetStatusbarMenu,
            group: 'left',
            order: 2,
            when: ContextKeyExpr.and(SuggestContext.HasInsertAndReplaceRange, SuggestContext.InsertMode.isEqualTo('insert')),
            title: nls.localize('accept.replace', "Replace")
        }, {
            menuId: suggestWidgetStatusbarMenu,
            group: 'left',
            order: 2,
            when: ContextKeyExpr.and(SuggestContext.HasInsertAndReplaceRange, SuggestContext.InsertMode.isEqualTo('replace')),
            title: nls.localize('accept.insert', "Insert")
        }]
}));
CommandsRegistry.registerCommandAlias('acceptSelectedSuggestionOnEnter', 'acceptSelectedSuggestion');
registerEditorCommand(new SuggestCommand({
    id: 'hideSuggestWidget',
    precondition: SuggestContext.Visible,
    handler: x => x.cancelSuggestWidget(),
    kbOpts: {
        weight: weight,
        kbExpr: EditorContextKeys.textInputFocus,
        primary: 9,
        secondary: [1024 | 9]
    }
}));
registerEditorCommand(new SuggestCommand({
    id: 'selectNextSuggestion',
    precondition: ContextKeyExpr.and(SuggestContext.Visible, ContextKeyExpr.or(SuggestContext.MultipleSuggestions, SuggestContext.HasFocusedSuggestion.negate())),
    handler: c => c.selectNextSuggestion(),
    kbOpts: {
        weight: weight,
        kbExpr: EditorContextKeys.textInputFocus,
        primary: 18,
        secondary: [2048 | 18],
        mac: { primary: 18, secondary: [2048 | 18, 256 | 44] }
    }
}));
registerEditorCommand(new SuggestCommand({
    id: 'selectNextPageSuggestion',
    precondition: ContextKeyExpr.and(SuggestContext.Visible, ContextKeyExpr.or(SuggestContext.MultipleSuggestions, SuggestContext.HasFocusedSuggestion.negate())),
    handler: c => c.selectNextPageSuggestion(),
    kbOpts: {
        weight: weight,
        kbExpr: EditorContextKeys.textInputFocus,
        primary: 12,
        secondary: [2048 | 12]
    }
}));
registerEditorCommand(new SuggestCommand({
    id: 'selectLastSuggestion',
    precondition: ContextKeyExpr.and(SuggestContext.Visible, ContextKeyExpr.or(SuggestContext.MultipleSuggestions, SuggestContext.HasFocusedSuggestion.negate())),
    handler: c => c.selectLastSuggestion()
}));
registerEditorCommand(new SuggestCommand({
    id: 'selectPrevSuggestion',
    precondition: ContextKeyExpr.and(SuggestContext.Visible, ContextKeyExpr.or(SuggestContext.MultipleSuggestions, SuggestContext.HasFocusedSuggestion.negate())),
    handler: c => c.selectPrevSuggestion(),
    kbOpts: {
        weight: weight,
        kbExpr: EditorContextKeys.textInputFocus,
        primary: 16,
        secondary: [2048 | 16],
        mac: { primary: 16, secondary: [2048 | 16, 256 | 46] }
    }
}));
registerEditorCommand(new SuggestCommand({
    id: 'selectPrevPageSuggestion',
    precondition: ContextKeyExpr.and(SuggestContext.Visible, ContextKeyExpr.or(SuggestContext.MultipleSuggestions, SuggestContext.HasFocusedSuggestion.negate())),
    handler: c => c.selectPrevPageSuggestion(),
    kbOpts: {
        weight: weight,
        kbExpr: EditorContextKeys.textInputFocus,
        primary: 11,
        secondary: [2048 | 11]
    }
}));
registerEditorCommand(new SuggestCommand({
    id: 'selectFirstSuggestion',
    precondition: ContextKeyExpr.and(SuggestContext.Visible, ContextKeyExpr.or(SuggestContext.MultipleSuggestions, SuggestContext.HasFocusedSuggestion.negate())),
    handler: c => c.selectFirstSuggestion()
}));
registerEditorCommand(new SuggestCommand({
    id: 'focusSuggestion',
    precondition: ContextKeyExpr.and(SuggestContext.Visible, SuggestContext.HasFocusedSuggestion.negate()),
    handler: x => x.focusSuggestion(),
    kbOpts: {
        weight: weight,
        kbExpr: EditorContextKeys.textInputFocus,
        primary: 2048 | 10,
        secondary: [2048 | 39],
        mac: { primary: 256 | 10, secondary: [2048 | 39] }
    },
}));
registerEditorCommand(new SuggestCommand({
    id: 'focusAndAcceptSuggestion',
    precondition: ContextKeyExpr.and(SuggestContext.Visible, SuggestContext.HasFocusedSuggestion.negate()),
    handler: c => {
        c.focusSuggestion();
        c.acceptSelectedSuggestion(true, false);
    }
}));
registerEditorCommand(new SuggestCommand({
    id: 'toggleSuggestionDetails',
    precondition: ContextKeyExpr.and(SuggestContext.Visible, SuggestContext.HasFocusedSuggestion),
    handler: x => x.toggleSuggestionDetails(),
    kbOpts: {
        weight: weight,
        kbExpr: EditorContextKeys.textInputFocus,
        primary: 2048 | 10,
        secondary: [2048 | 39],
        mac: { primary: 256 | 10, secondary: [2048 | 39] }
    },
    menuOpts: [{
            menuId: suggestWidgetStatusbarMenu,
            group: 'right',
            order: 1,
            when: ContextKeyExpr.and(SuggestContext.DetailsVisible, SuggestContext.CanResolve),
            title: nls.localize('detail.more', "Show Less")
        }, {
            menuId: suggestWidgetStatusbarMenu,
            group: 'right',
            order: 1,
            when: ContextKeyExpr.and(SuggestContext.DetailsVisible.toNegated(), SuggestContext.CanResolve),
            title: nls.localize('detail.less', "Show More")
        }]
}));
registerEditorCommand(new SuggestCommand({
    id: 'toggleExplainMode',
    precondition: SuggestContext.Visible,
    handler: x => x.toggleExplainMode(),
    kbOpts: {
        weight: 100,
        primary: 2048 | 90,
    }
}));
registerEditorCommand(new SuggestCommand({
    id: 'toggleSuggestionFocus',
    precondition: SuggestContext.Visible,
    handler: x => x.toggleSuggestionFocus(),
    kbOpts: {
        weight: weight,
        kbExpr: EditorContextKeys.textInputFocus,
        primary: 2048 | 512 | 10,
        mac: { primary: 256 | 512 | 10 }
    }
}));
registerEditorCommand(new SuggestCommand({
    id: 'insertBestCompletion',
    precondition: ContextKeyExpr.and(EditorContextKeys.textInputFocus, ContextKeyExpr.equals('config.editor.tabCompletion', 'on'), WordContextKey.AtEnd, SuggestContext.Visible.toNegated(), SuggestAlternatives.OtherSuggestions.toNegated(), SnippetController2.InSnippetMode.toNegated()),
    handler: (x, arg) => {
        x.triggerSuggestAndAcceptBest(isObject(arg) ? { fallback: 'tab', ...arg } : { fallback: 'tab' });
    },
    kbOpts: {
        weight,
        primary: 2
    }
}));
registerEditorCommand(new SuggestCommand({
    id: 'insertNextSuggestion',
    precondition: ContextKeyExpr.and(EditorContextKeys.textInputFocus, ContextKeyExpr.equals('config.editor.tabCompletion', 'on'), SuggestAlternatives.OtherSuggestions, SuggestContext.Visible.toNegated(), SnippetController2.InSnippetMode.toNegated()),
    handler: x => x.acceptNextSuggestion(),
    kbOpts: {
        weight: weight,
        kbExpr: EditorContextKeys.textInputFocus,
        primary: 2
    }
}));
registerEditorCommand(new SuggestCommand({
    id: 'insertPrevSuggestion',
    precondition: ContextKeyExpr.and(EditorContextKeys.textInputFocus, ContextKeyExpr.equals('config.editor.tabCompletion', 'on'), SuggestAlternatives.OtherSuggestions, SuggestContext.Visible.toNegated(), SnippetController2.InSnippetMode.toNegated()),
    handler: x => x.acceptPrevSuggestion(),
    kbOpts: {
        weight: weight,
        kbExpr: EditorContextKeys.textInputFocus,
        primary: 1024 | 2
    }
}));
registerEditorAction(class extends EditorAction {
    constructor() {
        super({
            id: 'editor.action.resetSuggestSize',
            label: nls.localize('suggest.reset.label', "Reset Suggest Widget Size"),
            alias: 'Reset Suggest Widget Size',
            precondition: undefined
        });
    }
    run(_accessor, editor) {
        SuggestController.get(editor)?.resetWidgetSize();
    }
});
