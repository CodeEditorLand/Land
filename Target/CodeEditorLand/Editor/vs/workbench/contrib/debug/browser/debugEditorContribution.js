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
import { addDisposableListener, isKeyboardEvent } from '../../../../base/browser/dom.js';
import { DomEmitter } from '../../../../base/browser/event.js';
import { StandardKeyboardEvent } from '../../../../base/browser/keyboardEvent.js';
import { RunOnceScheduler } from '../../../../base/common/async.js';
import { CancellationToken, CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { memoize } from '../../../../base/common/decorators.js';
import { illegalArgument, onUnexpectedExternalError } from '../../../../base/common/errors.js';
import { Event } from '../../../../base/common/event.js';
import { visit } from '../../../../base/common/json.js';
import { setProperty } from '../../../../base/common/jsonEdit.js';
import { DisposableStore, MutableDisposable, dispose, toDisposable } from '../../../../base/common/lifecycle.js';
import { clamp } from '../../../../base/common/numbers.js';
import { basename } from '../../../../base/common/path.js';
import * as env from '../../../../base/common/platform.js';
import * as strings from '../../../../base/common/strings.js';
import { assertType, isDefined } from '../../../../base/common/types.js';
import { URI } from '../../../../base/common/uri.js';
import { CoreEditingCommands } from '../../../../editor/browser/coreCommands.js';
import { EditOperation } from '../../../../editor/common/core/editOperation.js';
import { Position } from '../../../../editor/common/core/position.js';
import { Range } from '../../../../editor/common/core/range.js';
import { DEFAULT_WORD_REGEXP } from '../../../../editor/common/core/wordHelper.js';
import { InjectedTextCursorStops } from '../../../../editor/common/model.js';
import { ILanguageFeatureDebounceService } from '../../../../editor/common/services/languageFeatureDebounce.js';
import { ILanguageFeaturesService } from '../../../../editor/common/services/languageFeatures.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { ContentHoverController } from '../../../../editor/contrib/hover/browser/contentHoverController.js';
import * as nls from '../../../../nls.js';
import { CommandsRegistry, ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { registerColor } from '../../../../platform/theme/common/colorRegistry.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { DebugHoverWidget } from './debugHover.js';
import { ExceptionWidget } from './exceptionWidget.js';
import { CONTEXT_EXCEPTION_WIDGET_VISIBLE, IDebugService } from '../common/debug.js';
import { Expression } from '../common/debugModel.js';
import { IHostService } from '../../../services/host/browser/host.js';
const MAX_NUM_INLINE_VALUES = 100;
const MAX_INLINE_DECORATOR_LENGTH = 150;
const MAX_TOKENIZATION_LINE_LEN = 500;
const DEAFULT_INLINE_DEBOUNCE_DELAY = 200;
export const debugInlineForeground = registerColor('editor.inlineValuesForeground', {
    dark: '#ffffff80',
    light: '#00000080',
    hcDark: '#ffffff80',
    hcLight: '#00000080'
}, nls.localize('editor.inlineValuesForeground', "Color for the debug inline value text."));
export const debugInlineBackground = registerColor('editor.inlineValuesBackground', '#ffc80033', nls.localize('editor.inlineValuesBackground', "Color for the debug inline value background."));
class InlineSegment {
    constructor(column, text) {
        this.column = column;
        this.text = text;
    }
}
function createInlineValueDecoration(lineNumber, contentText, column = 1073741824) {
    if (contentText.length > MAX_INLINE_DECORATOR_LENGTH) {
        contentText = contentText.substring(0, MAX_INLINE_DECORATOR_LENGTH) + '...';
    }
    return [
        {
            range: {
                startLineNumber: lineNumber,
                endLineNumber: lineNumber,
                startColumn: column,
                endColumn: column
            },
            options: {
                description: 'debug-inline-value-decoration-spacer',
                after: {
                    content: strings.noBreakWhitespace,
                    cursorStops: InjectedTextCursorStops.None
                },
                showIfCollapsed: true,
            }
        },
        {
            range: {
                startLineNumber: lineNumber,
                endLineNumber: lineNumber,
                startColumn: column,
                endColumn: column
            },
            options: {
                description: 'debug-inline-value-decoration',
                after: {
                    content: replaceWsWithNoBreakWs(contentText),
                    inlineClassName: 'debug-inline-value',
                    inlineClassNameAffectsLetterSpacing: true,
                    cursorStops: InjectedTextCursorStops.None
                },
                showIfCollapsed: true,
            }
        },
    ];
}
function replaceWsWithNoBreakWs(str) {
    return str.replace(/[ \t]/g, strings.noBreakWhitespace);
}
function createInlineValueDecorationsInsideRange(expressions, ranges, model, wordToLineNumbersMap) {
    const nameValueMap = new Map();
    for (const expr of expressions) {
        nameValueMap.set(expr.name, expr.value);
        if (nameValueMap.size >= MAX_NUM_INLINE_VALUES) {
            break;
        }
    }
    const lineToNamesMap = new Map();
    nameValueMap.forEach((_value, name) => {
        const lineNumbers = wordToLineNumbersMap.get(name);
        if (lineNumbers) {
            for (const lineNumber of lineNumbers) {
                if (ranges.some(r => lineNumber >= r.startLineNumber && lineNumber <= r.endLineNumber)) {
                    if (!lineToNamesMap.has(lineNumber)) {
                        lineToNamesMap.set(lineNumber, []);
                    }
                    if (lineToNamesMap.get(lineNumber).indexOf(name) === -1) {
                        lineToNamesMap.get(lineNumber).push(name);
                    }
                }
            }
        }
    });
    return [...lineToNamesMap].map(([line, names]) => ({
        line,
        variables: names.sort((first, second) => {
            const content = model.getLineContent(line);
            return content.indexOf(first) - content.indexOf(second);
        }).map(name => ({ name, value: nameValueMap.get(name) }))
    }));
}
function getWordToLineNumbersMap(model, lineNumber, result) {
    const lineLength = model.getLineLength(lineNumber);
    if (lineLength > MAX_TOKENIZATION_LINE_LEN) {
        return;
    }
    const lineContent = model.getLineContent(lineNumber);
    model.tokenization.forceTokenization(lineNumber);
    const lineTokens = model.tokenization.getLineTokens(lineNumber);
    for (let tokenIndex = 0, tokenCount = lineTokens.getCount(); tokenIndex < tokenCount; tokenIndex++) {
        const tokenType = lineTokens.getStandardTokenType(tokenIndex);
        if (tokenType === 0) {
            DEFAULT_WORD_REGEXP.lastIndex = 0;
            const tokenStartOffset = lineTokens.getStartOffset(tokenIndex);
            const tokenEndOffset = lineTokens.getEndOffset(tokenIndex);
            const tokenStr = lineContent.substring(tokenStartOffset, tokenEndOffset);
            const wordMatch = DEFAULT_WORD_REGEXP.exec(tokenStr);
            if (wordMatch) {
                const word = wordMatch[0];
                if (!result.has(word)) {
                    result.set(word, []);
                }
                result.get(word).push(lineNumber);
            }
        }
    }
}
let DebugEditorContribution = class DebugEditorContribution {
    constructor(editor, debugService, instantiationService, commandService, configurationService, hostService, uriIdentityService, contextKeyService, languageFeaturesService, featureDebounceService) {
        this.editor = editor;
        this.debugService = debugService;
        this.instantiationService = instantiationService;
        this.commandService = commandService;
        this.configurationService = configurationService;
        this.hostService = hostService;
        this.uriIdentityService = uriIdentityService;
        this.languageFeaturesService = languageFeaturesService;
        this.mouseDown = false;
        this.gutterIsHovered = false;
        this.altListener = new MutableDisposable();
        this.altPressed = false;
        this.oldDecorations = this.editor.createDecorationsCollection();
        this.displayedStore = new DisposableStore();
        this.defaultHoverLockout = new MutableDisposable();
        this.debounceInfo = featureDebounceService.for(languageFeaturesService.inlineValuesProvider, 'InlineValues', { min: DEAFULT_INLINE_DEBOUNCE_DELAY });
        this.hoverWidget = this.instantiationService.createInstance(DebugHoverWidget, this.editor);
        this.toDispose = [this.defaultHoverLockout, this.altListener, this.displayedStore];
        this.registerListeners();
        this.exceptionWidgetVisible = CONTEXT_EXCEPTION_WIDGET_VISIBLE.bindTo(contextKeyService);
        this.toggleExceptionWidget();
    }
    registerListeners() {
        this.toDispose.push(this.debugService.getViewModel().onDidFocusStackFrame(e => this.onFocusStackFrame(e.stackFrame)));
        this.toDispose.push(this.editor.onMouseDown((e) => this.onEditorMouseDown(e)));
        this.toDispose.push(this.editor.onMouseUp(() => this.mouseDown = false));
        this.toDispose.push(this.editor.onMouseMove((e) => this.onEditorMouseMove(e)));
        this.toDispose.push(this.editor.onMouseLeave((e) => {
            const hoverDomNode = this.hoverWidget.getDomNode();
            if (!hoverDomNode) {
                return;
            }
            const rect = hoverDomNode.getBoundingClientRect();
            if (e.event.posx < rect.left || e.event.posx > rect.right || e.event.posy < rect.top || e.event.posy > rect.bottom) {
                this.hideHoverWidget();
            }
        }));
        this.toDispose.push(this.editor.onKeyDown((e) => this.onKeyDown(e)));
        this.toDispose.push(this.editor.onDidChangeModelContent(() => {
            this._wordToLineNumbersMap = undefined;
            this.updateInlineValuesScheduler.schedule();
        }));
        this.toDispose.push(this.debugService.getViewModel().onWillUpdateViews(() => this.updateInlineValuesScheduler.schedule()));
        this.toDispose.push(this.debugService.getViewModel().onDidEvaluateLazyExpression(() => this.updateInlineValuesScheduler.schedule()));
        this.toDispose.push(this.editor.onDidChangeModel(async () => {
            this.addDocumentListeners();
            this.toggleExceptionWidget();
            this.hideHoverWidget();
            this._wordToLineNumbersMap = undefined;
            const stackFrame = this.debugService.getViewModel().focusedStackFrame;
            await this.updateInlineValueDecorations(stackFrame);
        }));
        this.toDispose.push(this.editor.onDidScrollChange(() => {
            this.hideHoverWidget();
            const model = this.editor.getModel();
            if (model && this.languageFeaturesService.inlineValuesProvider.has(model)) {
                this.updateInlineValuesScheduler.schedule();
            }
        }));
        this.toDispose.push(this.configurationService.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration('editor.hover')) {
                this.updateHoverConfiguration();
            }
        }));
        this.toDispose.push(this.debugService.onDidChangeState((state) => {
            if (state !== 2) {
                this.toggleExceptionWidget();
            }
        }));
        this.updateHoverConfiguration();
    }
    updateHoverConfiguration() {
        const model = this.editor.getModel();
        if (model) {
            this.editorHoverOptions = this.configurationService.getValue('editor.hover', {
                resource: model.uri,
                overrideIdentifier: model.getLanguageId()
            });
        }
    }
    addDocumentListeners() {
        const stackFrame = this.debugService.getViewModel().focusedStackFrame;
        const model = this.editor.getModel();
        if (model) {
            this.applyDocumentListeners(model, stackFrame);
        }
    }
    applyDocumentListeners(model, stackFrame) {
        if (!stackFrame || !this.uriIdentityService.extUri.isEqual(model.uri, stackFrame.source.uri)) {
            this.altListener.clear();
            return;
        }
        const ownerDocument = this.editor.getContainerDomNode().ownerDocument;
        this.altListener.value = addDisposableListener(ownerDocument, 'keydown', keydownEvent => {
            const standardKeyboardEvent = new StandardKeyboardEvent(keydownEvent);
            if (standardKeyboardEvent.keyCode === 6) {
                this.altPressed = true;
                const debugHoverWasVisible = this.hoverWidget.isVisible();
                this.hoverWidget.hide();
                this.defaultHoverLockout.clear();
                if (debugHoverWasVisible && this.hoverPosition) {
                    this.showEditorHover(this.hoverPosition.position, false);
                }
                const onKeyUp = new DomEmitter(ownerDocument, 'keyup');
                const listener = Event.any(this.hostService.onDidChangeFocus, onKeyUp.event)(keyupEvent => {
                    let standardKeyboardEvent = undefined;
                    if (isKeyboardEvent(keyupEvent)) {
                        standardKeyboardEvent = new StandardKeyboardEvent(keyupEvent);
                    }
                    if (!standardKeyboardEvent || standardKeyboardEvent.keyCode === 6) {
                        this.altPressed = false;
                        this.preventDefaultEditorHover();
                        listener.dispose();
                        onKeyUp.dispose();
                    }
                });
            }
        });
    }
    async showHover(position, focus, mouseEvent) {
        this.preventDefaultEditorHover();
        const sf = this.debugService.getViewModel().focusedStackFrame;
        const model = this.editor.getModel();
        if (sf && model && this.uriIdentityService.extUri.isEqual(sf.source.uri, model.uri)) {
            const result = await this.hoverWidget.showAt(position, focus, mouseEvent);
            if (result === 1) {
                this.showEditorHover(position, focus);
            }
        }
        else {
            this.showEditorHover(position, focus);
        }
    }
    preventDefaultEditorHover() {
        if (this.defaultHoverLockout.value || this.editorHoverOptions?.enabled === false) {
            return;
        }
        const hoverController = this.editor.getContribution(ContentHoverController.ID);
        hoverController?.hideContentHover();
        this.editor.updateOptions({ hover: { enabled: false } });
        this.defaultHoverLockout.value = {
            dispose: () => {
                this.editor.updateOptions({
                    hover: { enabled: this.editorHoverOptions?.enabled ?? true }
                });
            }
        };
    }
    showEditorHover(position, focus) {
        const hoverController = this.editor.getContribution(ContentHoverController.ID);
        const range = new Range(position.lineNumber, position.column, position.lineNumber, position.column);
        this.defaultHoverLockout.clear();
        hoverController?.showContentHover(range, 1, 0, focus);
    }
    async onFocusStackFrame(sf) {
        const model = this.editor.getModel();
        if (model) {
            this.applyDocumentListeners(model, sf);
            if (sf && this.uriIdentityService.extUri.isEqual(sf.source.uri, model.uri)) {
                await this.toggleExceptionWidget();
            }
            else {
                this.hideHoverWidget();
            }
        }
        await this.updateInlineValueDecorations(sf);
    }
    get hoverDelay() {
        const baseDelay = this.editorHoverOptions?.delay || 0;
        const delayFactor = clamp(2 - (baseDelay - 300) / 600, 1, 2);
        return baseDelay * delayFactor;
    }
    get showHoverScheduler() {
        const scheduler = new RunOnceScheduler(() => {
            if (this.hoverPosition && !this.altPressed) {
                this.showHover(this.hoverPosition.position, false, this.hoverPosition.event);
            }
        }, this.hoverDelay);
        this.toDispose.push(scheduler);
        return scheduler;
    }
    hideHoverWidget() {
        if (this.hoverWidget.willBeVisible()) {
            this.hoverWidget.hide();
        }
        this.showHoverScheduler.cancel();
        this.defaultHoverLockout.clear();
    }
    onEditorMouseDown(mouseEvent) {
        this.mouseDown = true;
        if (mouseEvent.target.type === 9 && mouseEvent.target.detail === DebugHoverWidget.ID) {
            return;
        }
        this.hideHoverWidget();
    }
    onEditorMouseMove(mouseEvent) {
        if (this.debugService.state !== 2) {
            return;
        }
        const target = mouseEvent.target;
        const stopKey = env.isMacintosh ? 'metaKey' : 'ctrlKey';
        if (!this.altPressed) {
            if (target.type === 2) {
                this.defaultHoverLockout.clear();
                this.gutterIsHovered = true;
            }
            else if (this.gutterIsHovered) {
                this.gutterIsHovered = false;
                this.updateHoverConfiguration();
            }
        }
        if (target.type === 9 && target.detail === DebugHoverWidget.ID && !mouseEvent.event[stopKey]) {
            const sticky = this.editorHoverOptions?.sticky ?? true;
            if (sticky || this.hoverWidget.isShowingComplexValue) {
                return;
            }
        }
        if (target.type === 6) {
            if (target.position && !Position.equals(target.position, this.hoverPosition?.position || null) && !this.hoverWidget.isInSafeTriangle(mouseEvent.event.posx, mouseEvent.event.posy)) {
                this.hoverPosition = { position: target.position, event: mouseEvent.event };
                this.preventDefaultEditorHover();
                this.showHoverScheduler.schedule(this.hoverDelay);
            }
        }
        else if (!this.mouseDown) {
            this.hideHoverWidget();
        }
    }
    onKeyDown(e) {
        const stopKey = env.isMacintosh ? 57 : 5;
        if (e.keyCode !== stopKey && e.keyCode !== 6) {
            this.hideHoverWidget();
        }
    }
    async toggleExceptionWidget() {
        const model = this.editor.getModel();
        const focusedSf = this.debugService.getViewModel().focusedStackFrame;
        const callStack = focusedSf ? focusedSf.thread.getCallStack() : null;
        if (!model || !focusedSf || !callStack || callStack.length === 0) {
            this.closeExceptionWidget();
            return;
        }
        const exceptionSf = callStack.find(sf => !!(sf && sf.source && sf.source.available && sf.source.presentationHint !== 'deemphasize'));
        if (!exceptionSf || exceptionSf !== focusedSf) {
            this.closeExceptionWidget();
            return;
        }
        const sameUri = this.uriIdentityService.extUri.isEqual(exceptionSf.source.uri, model.uri);
        if (this.exceptionWidget && !sameUri) {
            this.closeExceptionWidget();
        }
        else if (sameUri) {
            const exceptionInfo = await focusedSf.thread.exceptionInfo;
            if (exceptionInfo) {
                this.showExceptionWidget(exceptionInfo, this.debugService.getViewModel().focusedSession, exceptionSf.range.startLineNumber, exceptionSf.range.startColumn);
            }
        }
    }
    showExceptionWidget(exceptionInfo, debugSession, lineNumber, column) {
        if (this.exceptionWidget) {
            this.exceptionWidget.dispose();
        }
        this.exceptionWidget = this.instantiationService.createInstance(ExceptionWidget, this.editor, exceptionInfo, debugSession);
        this.exceptionWidget.show({ lineNumber, column }, 0);
        this.exceptionWidget.focus();
        this.editor.revealRangeInCenter({
            startLineNumber: lineNumber,
            startColumn: column,
            endLineNumber: lineNumber,
            endColumn: column,
        });
        this.exceptionWidgetVisible.set(true);
    }
    closeExceptionWidget() {
        if (this.exceptionWidget) {
            const shouldFocusEditor = this.exceptionWidget.hasFocus();
            this.exceptionWidget.dispose();
            this.exceptionWidget = undefined;
            this.exceptionWidgetVisible.set(false);
            if (shouldFocusEditor) {
                this.editor.focus();
            }
        }
    }
    async addLaunchConfiguration() {
        const model = this.editor.getModel();
        if (!model) {
            return;
        }
        let configurationsArrayPosition;
        let lastProperty;
        const getConfigurationPosition = () => {
            let depthInArray = 0;
            visit(model.getValue(), {
                onObjectProperty: (property) => {
                    lastProperty = property;
                },
                onArrayBegin: (offset) => {
                    if (lastProperty === 'configurations' && depthInArray === 0) {
                        configurationsArrayPosition = model.getPositionAt(offset + 1);
                    }
                    depthInArray++;
                },
                onArrayEnd: () => {
                    depthInArray--;
                }
            });
        };
        getConfigurationPosition();
        if (!configurationsArrayPosition) {
            const { tabSize, insertSpaces } = model.getOptions();
            const eol = model.getEOL();
            const edit = (basename(model.uri.fsPath) === 'launch.json') ?
                setProperty(model.getValue(), ['configurations'], [], { tabSize, insertSpaces, eol })[0] :
                setProperty(model.getValue(), ['launch'], { 'configurations': [] }, { tabSize, insertSpaces, eol })[0];
            const startPosition = model.getPositionAt(edit.offset);
            const lineNumber = startPosition.lineNumber;
            const range = new Range(lineNumber, startPosition.column, lineNumber, model.getLineMaxColumn(lineNumber));
            model.pushEditOperations(null, [EditOperation.replace(range, edit.content)], () => null);
            getConfigurationPosition();
        }
        if (!configurationsArrayPosition) {
            return;
        }
        this.editor.focus();
        const insertLine = (position) => {
            if (model.getLineLastNonWhitespaceColumn(position.lineNumber) > position.column) {
                this.editor.setPosition(position);
                CoreEditingCommands.LineBreakInsert.runEditorCommand(null, this.editor, null);
            }
            this.editor.setPosition(position);
            return this.commandService.executeCommand('editor.action.insertLineAfter');
        };
        await insertLine(configurationsArrayPosition);
        await this.commandService.executeCommand('editor.action.triggerSuggest');
    }
    get removeInlineValuesScheduler() {
        return new RunOnceScheduler(() => {
            this.displayedStore.clear();
            this.oldDecorations.clear();
        }, 100);
    }
    get updateInlineValuesScheduler() {
        const model = this.editor.getModel();
        return new RunOnceScheduler(async () => await this.updateInlineValueDecorations(this.debugService.getViewModel().focusedStackFrame), model ? this.debounceInfo.get(model) : DEAFULT_INLINE_DEBOUNCE_DELAY);
    }
    async updateInlineValueDecorations(stackFrame) {
        const var_value_format = '{0} = {1}';
        const separator = ', ';
        const model = this.editor.getModel();
        const inlineValuesSetting = this.configurationService.getValue('debug').inlineValues;
        const inlineValuesTurnedOn = inlineValuesSetting === true || inlineValuesSetting === 'on' || (inlineValuesSetting === 'auto' && model && this.languageFeaturesService.inlineValuesProvider.has(model));
        if (!inlineValuesTurnedOn || !model || !stackFrame || model.uri.toString() !== stackFrame.source.uri.toString()) {
            if (!this.removeInlineValuesScheduler.isScheduled()) {
                this.removeInlineValuesScheduler.schedule();
            }
            return;
        }
        this.removeInlineValuesScheduler.cancel();
        this.displayedStore.clear();
        const viewRanges = this.editor.getVisibleRangesPlusViewportAboveBelow();
        let allDecorations;
        const cts = new CancellationTokenSource();
        this.displayedStore.add(toDisposable(() => cts.dispose(true)));
        if (this.languageFeaturesService.inlineValuesProvider.has(model)) {
            const findVariable = async (_key, caseSensitiveLookup) => {
                const scopes = await stackFrame.getMostSpecificScopes(stackFrame.range);
                const key = caseSensitiveLookup ? _key : _key.toLowerCase();
                for (const scope of scopes) {
                    const variables = await scope.getChildren();
                    const found = variables.find(v => caseSensitiveLookup ? (v.name === key) : (v.name.toLowerCase() === key));
                    if (found) {
                        return found.value;
                    }
                }
                return undefined;
            };
            const ctx = {
                frameId: stackFrame.frameId,
                stoppedLocation: new Range(stackFrame.range.startLineNumber, stackFrame.range.startColumn + 1, stackFrame.range.endLineNumber, stackFrame.range.endColumn + 1)
            };
            const providers = this.languageFeaturesService.inlineValuesProvider.ordered(model).reverse();
            allDecorations = [];
            const lineDecorations = new Map();
            const promises = providers.flatMap(provider => viewRanges.map(range => Promise.resolve(provider.provideInlineValues(model, range, ctx, cts.token)).then(async (result) => {
                if (result) {
                    for (const iv of result) {
                        let text = undefined;
                        switch (iv.type) {
                            case 'text':
                                text = iv.text;
                                break;
                            case 'variable': {
                                let va = iv.variableName;
                                if (!va) {
                                    const lineContent = model.getLineContent(iv.range.startLineNumber);
                                    va = lineContent.substring(iv.range.startColumn - 1, iv.range.endColumn - 1);
                                }
                                const value = await findVariable(va, iv.caseSensitiveLookup);
                                if (value) {
                                    text = strings.format(var_value_format, va, value);
                                }
                                break;
                            }
                            case 'expression': {
                                let expr = iv.expression;
                                if (!expr) {
                                    const lineContent = model.getLineContent(iv.range.startLineNumber);
                                    expr = lineContent.substring(iv.range.startColumn - 1, iv.range.endColumn - 1);
                                }
                                if (expr) {
                                    const expression = new Expression(expr);
                                    await expression.evaluate(stackFrame.thread.session, stackFrame, 'watch', true);
                                    if (expression.available) {
                                        text = strings.format(var_value_format, expr, expression.value);
                                    }
                                }
                                break;
                            }
                        }
                        if (text) {
                            const line = iv.range.startLineNumber;
                            let lineSegments = lineDecorations.get(line);
                            if (!lineSegments) {
                                lineSegments = [];
                                lineDecorations.set(line, lineSegments);
                            }
                            if (!lineSegments.some(iv => iv.text === text)) {
                                lineSegments.push(new InlineSegment(iv.range.startColumn, text));
                            }
                        }
                    }
                }
            }, err => {
                onUnexpectedExternalError(err);
            })));
            const startTime = Date.now();
            await Promise.all(promises);
            this.updateInlineValuesScheduler.delay = this.debounceInfo.update(model, Date.now() - startTime);
            lineDecorations.forEach((segments, line) => {
                if (segments.length > 0) {
                    segments = segments.sort((a, b) => a.column - b.column);
                    const text = segments.map(s => s.text).join(separator);
                    allDecorations.push(...createInlineValueDecoration(line, text));
                }
            });
        }
        else {
            const scopes = await stackFrame.getMostSpecificScopes(stackFrame.range);
            const scopesWithVariables = await Promise.all(scopes.map(async (scope) => ({ scope, variables: await scope.getChildren() })));
            const valuesPerLine = new Map();
            for (const { scope, variables } of scopesWithVariables) {
                let scopeRange = new Range(0, 0, stackFrame.range.startLineNumber, stackFrame.range.startColumn);
                if (scope.range) {
                    scopeRange = scopeRange.setStartPosition(scope.range.startLineNumber, scope.range.startColumn);
                }
                const ownRanges = viewRanges.map(r => r.intersectRanges(scopeRange)).filter(isDefined);
                this._wordToLineNumbersMap ??= new WordsToLineNumbersCache(model);
                for (const range of ownRanges) {
                    this._wordToLineNumbersMap.ensureRangePopulated(range);
                }
                const mapped = createInlineValueDecorationsInsideRange(variables, ownRanges, model, this._wordToLineNumbersMap.value);
                for (const { line, variables } of mapped) {
                    let values = valuesPerLine.get(line);
                    if (!values) {
                        values = new Map();
                        valuesPerLine.set(line, values);
                    }
                    for (const { name, value } of variables) {
                        if (!values.has(name)) {
                            values.set(name, value);
                        }
                    }
                }
            }
            allDecorations = [...valuesPerLine.entries()].flatMap(([line, values]) => createInlineValueDecoration(line, [...values].map(([n, v]) => `${n} = ${v}`).join(', ')));
        }
        if (cts.token.isCancellationRequested) {
            return;
        }
        let preservePosition;
        if (this.editor.getOption(135) !== 'off') {
            const position = this.editor.getPosition();
            if (position && this.editor.getVisibleRanges().some(r => r.containsPosition(position))) {
                preservePosition = { position, top: this.editor.getTopForPosition(position.lineNumber, position.column) };
            }
        }
        this.oldDecorations.set(allDecorations);
        if (preservePosition) {
            const top = this.editor.getTopForPosition(preservePosition.position.lineNumber, preservePosition.position.column);
            this.editor.setScrollTop(this.editor.getScrollTop() - (preservePosition.top - top), 1);
        }
    }
    dispose() {
        if (this.hoverWidget) {
            this.hoverWidget.dispose();
        }
        if (this.configurationWidget) {
            this.configurationWidget.dispose();
        }
        this.toDispose = dispose(this.toDispose);
    }
};
__decorate([
    memoize,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], DebugEditorContribution.prototype, "showHoverScheduler", null);
__decorate([
    memoize,
    __metadata("design:type", RunOnceScheduler),
    __metadata("design:paramtypes", [])
], DebugEditorContribution.prototype, "removeInlineValuesScheduler", null);
__decorate([
    memoize,
    __metadata("design:type", RunOnceScheduler),
    __metadata("design:paramtypes", [])
], DebugEditorContribution.prototype, "updateInlineValuesScheduler", null);
DebugEditorContribution = __decorate([
    __param(1, IDebugService),
    __param(2, IInstantiationService),
    __param(3, ICommandService),
    __param(4, IConfigurationService),
    __param(5, IHostService),
    __param(6, IUriIdentityService),
    __param(7, IContextKeyService),
    __param(8, ILanguageFeaturesService),
    __param(9, ILanguageFeatureDebounceService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], DebugEditorContribution);
export { DebugEditorContribution };
class WordsToLineNumbersCache {
    constructor(model) {
        this.model = model;
        this.value = new Map();
        this.intervals = new Uint8Array(Math.ceil(model.getLineCount() / 8));
    }
    ensureRangePopulated(range) {
        for (let lineNumber = range.startLineNumber; lineNumber <= range.endLineNumber; lineNumber++) {
            const bin = lineNumber >> 3;
            const bit = 1 << (lineNumber & 0b111);
            if (!(this.intervals[bin] & bit)) {
                getWordToLineNumbersMap(this.model, lineNumber, this.value);
                this.intervals[bin] |= bit;
            }
        }
    }
}
CommandsRegistry.registerCommand('_executeInlineValueProvider', async (accessor, uri, iRange, context) => {
    assertType(URI.isUri(uri));
    assertType(Range.isIRange(iRange));
    if (!context || typeof context.frameId !== 'number' || !Range.isIRange(context.stoppedLocation)) {
        throw illegalArgument('context');
    }
    const model = accessor.get(IModelService).getModel(uri);
    if (!model) {
        throw illegalArgument('uri');
    }
    const range = Range.lift(iRange);
    const { inlineValuesProvider } = accessor.get(ILanguageFeaturesService);
    const providers = inlineValuesProvider.ordered(model);
    const providerResults = await Promise.all(providers.map(provider => provider.provideInlineValues(model, range, context, CancellationToken.None)));
    return providerResults.flat().filter(isDefined);
});
