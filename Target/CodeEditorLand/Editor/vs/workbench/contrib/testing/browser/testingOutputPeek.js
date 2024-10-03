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
var TestingOutputPeekController_1, TestResultsPeek_1;
import * as dom from '../../../../base/browser/dom.js';
import { alert } from '../../../../base/browser/ui/aria/aria.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { Color } from '../../../../base/common/color.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { stripIcons } from '../../../../base/common/iconLabels.js';
import { Iterable } from '../../../../base/common/iterator.js';
import { Lazy } from '../../../../base/common/lazy.js';
import { Disposable, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { observableValue } from '../../../../base/common/observable.js';
import { count } from '../../../../base/common/strings.js';
import { isCodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { EditorAction2 } from '../../../../editor/browser/editorExtensions.js';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.js';
import { EmbeddedCodeEditorWidget } from '../../../../editor/browser/widget/codeEditor/embeddedCodeEditorWidget.js';
import { EmbeddedDiffEditorWidget } from '../../../../editor/browser/widget/diffEditor/embeddedDiffEditorWidget.js';
import { Range } from '../../../../editor/common/core/range.js';
import { EditorContextKeys } from '../../../../editor/common/editorContextKeys.js';
import { ITextModelService } from '../../../../editor/common/services/resolverService.js';
import { IPeekViewService, PeekViewWidget, peekViewTitleForeground, peekViewTitleInfoForeground } from '../../../../editor/contrib/peekView/browser/peekView.js';
import { localize, localize2 } from '../../../../nls.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { createAndFillInActionBarActions } from '../../../../platform/actions/browser/menuEntryActionViewItem.js';
import { Action2, IMenuService, MenuId } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ContextKeyExpr, IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ServiceCollection } from '../../../../platform/instantiation/common/serviceCollection.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { bindContextKey } from '../../../../platform/observable/common/platformObservableUtils.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { editorBackground } from '../../../../platform/theme/common/colorRegistry.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { ViewPane } from '../../../browser/parts/views/viewPane.js';
import { IViewDescriptorService } from '../../../common/views.js';
import { renderTestMessageAsText } from './testMessageColorizer.js';
import { MessageSubject, TaskSubject, TestOutputSubject, inspectSubjectHasStack, mapFindTestMessage } from './testResultsView/testResultsSubject.js';
import { TestResultsViewContent } from './testResultsView/testResultsViewContent.js';
import { testingMessagePeekBorder, testingPeekBorder, testingPeekHeaderBackground, testingPeekMessageHeaderBackground } from './theme.js';
import { getTestingConfiguration } from '../common/configuration.js';
import { MutableObservableValue, staticObservableValue } from '../common/observableValue.js';
import { StoredValue } from '../common/storedValue.js';
import { resultItemParents } from '../common/testResult.js';
import { ITestResultService } from '../common/testResultService.js';
import { ITestService } from '../common/testService.js';
import { ITestMessage } from '../common/testTypes.js';
import { TestingContextKeys } from '../common/testingContextKeys.js';
import { ITestingPeekOpener } from '../common/testingPeekOpener.js';
import { isFailedState } from '../common/testingStates.js';
import { buildTestUri, parseTestUri } from '../common/testingUri.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
function* allMessages(results) {
    for (const result of results) {
        for (const test of result.tests) {
            for (let taskIndex = 0; taskIndex < test.tasks.length; taskIndex++) {
                for (let messageIndex = 0; messageIndex < test.tasks[taskIndex].messages.length; messageIndex++) {
                    yield { result, test, taskIndex, messageIndex };
                }
            }
        }
    }
}
let TestingPeekOpener = class TestingPeekOpener extends Disposable {
    constructor(configuration, editorService, codeEditorService, testResults, testService, storageService, viewsService, commandService, notificationService) {
        super();
        this.configuration = configuration;
        this.editorService = editorService;
        this.codeEditorService = codeEditorService;
        this.testResults = testResults;
        this.testService = testService;
        this.storageService = storageService;
        this.viewsService = viewsService;
        this.commandService = commandService;
        this.notificationService = notificationService;
        this.historyVisible = this._register(MutableObservableValue.stored(new StoredValue({
            key: 'testHistoryVisibleInPeek',
            scope: 0,
            target: 0,
        }, this.storageService), false));
        this._register(testResults.onTestChanged(this.openPeekOnFailure, this));
    }
    async open() {
        let uri;
        const active = this.editorService.activeTextEditorControl;
        if (isCodeEditor(active) && active.getModel()?.uri) {
            const modelUri = active.getModel()?.uri;
            if (modelUri) {
                uri = await this.getFileCandidateMessage(modelUri, active.getPosition());
            }
        }
        if (!uri) {
            uri = this.lastUri;
        }
        if (!uri) {
            uri = this.getAnyCandidateMessage();
        }
        if (!uri) {
            return false;
        }
        return this.showPeekFromUri(uri);
    }
    tryPeekFirstError(result, test, options) {
        const candidate = this.getFailedCandidateMessage(test);
        if (!candidate) {
            return false;
        }
        this.showPeekFromUri({
            type: 2,
            documentUri: candidate.location.uri,
            taskIndex: candidate.taskId,
            messageIndex: candidate.index,
            resultId: result.id,
            testExtId: test.item.extId,
        }, undefined, { selection: candidate.location.range, selectionRevealType: 3, ...options });
        return true;
    }
    peekUri(uri, options = {}) {
        const parsed = parseTestUri(uri);
        const result = parsed && this.testResults.getResult(parsed.resultId);
        if (!parsed || !result || !('testExtId' in parsed)) {
            return false;
        }
        if (!('messageIndex' in parsed)) {
            return false;
        }
        const message = result.getStateById(parsed.testExtId)?.tasks[parsed.taskIndex].messages[parsed.messageIndex];
        if (!message?.location) {
            return false;
        }
        this.showPeekFromUri({
            type: 2,
            documentUri: message.location.uri,
            taskIndex: parsed.taskIndex,
            messageIndex: parsed.messageIndex,
            resultId: result.id,
            testExtId: parsed.testExtId,
        }, options.inEditor, { selection: message.location.range, ...options.options });
        return true;
    }
    closeAllPeeks() {
        for (const editor of this.codeEditorService.listCodeEditors()) {
            TestingOutputPeekController.get(editor)?.removePeek();
        }
    }
    openCurrentInEditor() {
        const current = this.getActiveControl();
        if (!current) {
            return;
        }
        const options = { pinned: false, revealIfOpened: true };
        if (current instanceof TaskSubject || current instanceof TestOutputSubject) {
            this.editorService.openEditor({ resource: current.outputUri, options });
            return;
        }
        if (current instanceof TestOutputSubject) {
            this.editorService.openEditor({ resource: current.outputUri, options });
            return;
        }
        const message = current.message;
        if (current.isDiffable) {
            this.editorService.openEditor({
                original: { resource: current.expectedUri },
                modified: { resource: current.actualUri },
                options,
            });
        }
        else if (typeof message.message === 'string') {
            this.editorService.openEditor({ resource: current.messageUri, options });
        }
        else {
            this.commandService.executeCommand('markdown.showPreview', current.messageUri).catch(err => {
                this.notificationService.error(localize('testing.markdownPeekError', 'Could not open markdown preview: {0}.\n\nPlease make sure the markdown extension is enabled.', err.message));
            });
        }
    }
    getActiveControl() {
        const editor = getPeekedEditorFromFocus(this.codeEditorService);
        const controller = editor && TestingOutputPeekController.get(editor);
        return controller?.subject ?? this.viewsService.getActiveViewWithId("workbench.panel.testResults.view")?.subject;
    }
    async showPeekFromUri(uri, editor, options) {
        if (isCodeEditor(editor)) {
            this.lastUri = uri;
            TestingOutputPeekController.get(editor)?.show(buildTestUri(this.lastUri));
            return true;
        }
        const pane = await this.editorService.openEditor({
            resource: uri.documentUri,
            options: { revealIfOpened: true, ...options }
        });
        const control = pane?.getControl();
        if (!isCodeEditor(control)) {
            return false;
        }
        this.lastUri = uri;
        TestingOutputPeekController.get(control)?.show(buildTestUri(this.lastUri));
        return true;
    }
    openPeekOnFailure(evt) {
        if (evt.reason !== 1) {
            return;
        }
        const candidate = this.getFailedCandidateMessage(evt.item);
        if (!candidate) {
            return;
        }
        if (evt.result.request.continuous && !getTestingConfiguration(this.configuration, "testing.automaticallyOpenPeekViewDuringAutoRun")) {
            return;
        }
        const editors = this.codeEditorService.listCodeEditors();
        const cfg = getTestingConfiguration(this.configuration, "testing.automaticallyOpenPeekView");
        switch (cfg) {
            case "failureInVisibleDocument": {
                const editorUris = new Set(editors.map(e => e.getModel()?.uri.toString()));
                if (!Iterable.some(resultItemParents(evt.result, evt.item), i => i.item.uri && editorUris.has(i.item.uri.toString()))) {
                    return;
                }
                break;
            }
            case "failureAnywhere":
                break;
            default:
                return;
        }
        const controllers = editors.map(TestingOutputPeekController.get);
        if (controllers.some(c => c?.subject)) {
            return;
        }
        this.tryPeekFirstError(evt.result, evt.item);
    }
    async getFileCandidateMessage(uri, position) {
        let best;
        let bestDistance = Infinity;
        const demandedUriStr = uri.toString();
        for (const test of this.testService.collection.all) {
            const result = this.testResults.getStateById(test.item.extId);
            if (!result) {
                continue;
            }
            mapFindTestMessage(result[1], (_task, message, messageIndex, taskIndex) => {
                if (message.type !== 0 || !message.location || message.location.uri.toString() !== demandedUriStr) {
                    return;
                }
                const distance = position ? Math.abs(position.lineNumber - message.location.range.startLineNumber) : 0;
                if (!best || distance <= bestDistance) {
                    bestDistance = distance;
                    best = {
                        type: 2,
                        testExtId: result[1].item.extId,
                        resultId: result[0].id,
                        taskIndex,
                        messageIndex,
                        documentUri: uri,
                    };
                }
            });
        }
        return best;
    }
    getAnyCandidateMessage() {
        const seen = new Set();
        for (const result of this.testResults.results) {
            for (const test of result.tests) {
                if (seen.has(test.item.extId)) {
                    continue;
                }
                seen.add(test.item.extId);
                const found = mapFindTestMessage(test, (task, message, messageIndex, taskIndex) => (message.location && {
                    type: 2,
                    testExtId: test.item.extId,
                    resultId: result.id,
                    taskIndex,
                    messageIndex,
                    documentUri: message.location.uri,
                }));
                if (found) {
                    return found;
                }
            }
        }
        return undefined;
    }
    getFailedCandidateMessage(test) {
        const fallbackLocation = test.item.uri && test.item.range
            ? { uri: test.item.uri, range: test.item.range }
            : undefined;
        let best;
        mapFindTestMessage(test, (task, message, messageIndex, taskId) => {
            const location = message.location || fallbackLocation;
            if (!isFailedState(task.state) || !location) {
                return;
            }
            if (best && message.type !== 0) {
                return;
            }
            best = { taskId, index: messageIndex, message, location };
        });
        return best;
    }
};
TestingPeekOpener = __decorate([
    __param(0, IConfigurationService),
    __param(1, IEditorService),
    __param(2, ICodeEditorService),
    __param(3, ITestResultService),
    __param(4, ITestService),
    __param(5, IStorageService),
    __param(6, IViewsService),
    __param(7, ICommandService),
    __param(8, INotificationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object])
], TestingPeekOpener);
export { TestingPeekOpener };
let TestingOutputPeekController = TestingOutputPeekController_1 = class TestingOutputPeekController extends Disposable {
    static get(editor) {
        return editor.getContribution("editor.contrib.testingOutputPeek");
    }
    get subject() {
        return this.peek.value?.current;
    }
    constructor(editor, codeEditorService, instantiationService, testResults, contextKeyService) {
        super();
        this.editor = editor;
        this.codeEditorService = codeEditorService;
        this.instantiationService = instantiationService;
        this.testResults = testResults;
        this.peek = this._register(new MutableDisposable());
        this.visible = TestingContextKeys.isPeekVisible.bindTo(contextKeyService);
        this._register(editor.onDidChangeModel(() => this.peek.clear()));
        this._register(testResults.onResultsChanged(this.closePeekOnCertainResultEvents, this));
        this._register(testResults.onTestChanged(this.closePeekOnTestChange, this));
    }
    async show(uri) {
        const subject = this.retrieveTest(uri);
        if (subject) {
            this.showSubject(subject);
        }
    }
    async showSubject(subject) {
        if (!this.peek.value) {
            this.peek.value = this.instantiationService.createInstance(TestResultsPeek, this.editor);
            this.peek.value.onDidClose(() => {
                this.visible.set(false);
                this.peek.value = undefined;
            });
            this.visible.set(true);
            this.peek.value.create();
        }
        if (subject instanceof MessageSubject) {
            alert(renderTestMessageAsText(subject.message.message));
        }
        this.peek.value.setModel(subject);
    }
    async openAndShow(uri) {
        const subject = this.retrieveTest(uri);
        if (!subject) {
            return;
        }
        if (!subject.revealLocation || subject.revealLocation.uri.toString() === this.editor.getModel()?.uri.toString()) {
            return this.show(uri);
        }
        const otherEditor = await this.codeEditorService.openCodeEditor({
            resource: subject.revealLocation.uri,
            options: { pinned: false, revealIfOpened: true }
        }, this.editor);
        if (otherEditor) {
            TestingOutputPeekController_1.get(otherEditor)?.removePeek();
            return TestingOutputPeekController_1.get(otherEditor)?.show(uri);
        }
    }
    removePeek() {
        this.peek.clear();
    }
    collapseStack() {
        this.peek.value?.collapseStack();
    }
    next() {
        const subject = this.peek.value?.current;
        if (!subject) {
            return;
        }
        let found = false;
        for (const { messageIndex, taskIndex, result, test } of allMessages(this.testResults.results)) {
            if (subject instanceof TaskSubject && result.id === subject.result.id) {
                found = true;
            }
            if (found) {
                this.openAndShow(buildTestUri({
                    type: 2,
                    messageIndex,
                    taskIndex,
                    resultId: result.id,
                    testExtId: test.item.extId
                }));
                return;
            }
            if (subject instanceof TestOutputSubject && subject.test.item.extId === test.item.extId && subject.taskIndex === taskIndex && subject.result.id === result.id) {
                found = true;
            }
            if (subject instanceof MessageSubject && subject.test.extId === test.item.extId && subject.messageIndex === messageIndex && subject.taskIndex === taskIndex && subject.result.id === result.id) {
                found = true;
            }
        }
    }
    previous() {
        const subject = this.peek.value?.current;
        if (!subject) {
            return;
        }
        let previous;
        for (const m of allMessages(this.testResults.results)) {
            if (subject instanceof TaskSubject) {
                if (m.result.id === subject.result.id) {
                    break;
                }
                continue;
            }
            if (subject instanceof TestOutputSubject) {
                if (m.test.item.extId === subject.test.item.extId && m.result.id === subject.result.id && m.taskIndex === subject.taskIndex) {
                    break;
                }
                continue;
            }
            if (subject.test.extId === m.test.item.extId && subject.messageIndex === m.messageIndex && subject.taskIndex === m.taskIndex && subject.result.id === m.result.id) {
                break;
            }
            previous = m;
        }
        if (previous) {
            this.openAndShow(buildTestUri({
                type: 2,
                messageIndex: previous.messageIndex,
                taskIndex: previous.taskIndex,
                resultId: previous.result.id,
                testExtId: previous.test.item.extId
            }));
        }
    }
    removeIfPeekingForTest(testId) {
        const c = this.peek.value?.current;
        if (c && c instanceof MessageSubject && c.test.extId === testId) {
            this.peek.clear();
        }
    }
    closePeekOnTestChange(evt) {
        if (evt.reason !== 1 || evt.previousState === evt.item.ownComputedState) {
            return;
        }
        this.removeIfPeekingForTest(evt.item.item.extId);
    }
    closePeekOnCertainResultEvents(evt) {
        if ('started' in evt) {
            this.peek.clear();
        }
        if ('removed' in evt && this.testResults.results.length === 0) {
            this.peek.clear();
        }
    }
    retrieveTest(uri) {
        const parts = parseTestUri(uri);
        if (!parts) {
            return undefined;
        }
        const result = this.testResults.results.find(r => r.id === parts.resultId);
        if (!result) {
            return;
        }
        if (parts.type === 0) {
            return new TaskSubject(result, parts.taskIndex);
        }
        if (parts.type === 1) {
            const test = result.getStateById(parts.testExtId);
            if (!test) {
                return;
            }
            return new TestOutputSubject(result, parts.taskIndex, test);
        }
        const { testExtId, taskIndex, messageIndex } = parts;
        const test = result?.getStateById(testExtId);
        if (!test || !test.tasks[parts.taskIndex]) {
            return;
        }
        return new MessageSubject(result, test, taskIndex, messageIndex);
    }
};
TestingOutputPeekController = TestingOutputPeekController_1 = __decorate([
    __param(1, ICodeEditorService),
    __param(2, IInstantiationService),
    __param(3, ITestResultService),
    __param(4, IContextKeyService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], TestingOutputPeekController);
export { TestingOutputPeekController };
let TestResultsPeek = class TestResultsPeek extends PeekViewWidget {
    static { TestResultsPeek_1 = this; }
    get current() {
        return this._current.get();
    }
    constructor(editor, themeService, peekViewService, testingPeek, contextKeyService, menuService, instantiationService, modelService, codeEditorService, uriIdentityService) {
        super(editor, { showFrame: true, frameWidth: 1, showArrow: true, isResizeable: true, isAccessible: true, className: 'test-output-peek' }, instantiationService);
        this.themeService = themeService;
        this.testingPeek = testingPeek;
        this.contextKeyService = contextKeyService;
        this.menuService = menuService;
        this.modelService = modelService;
        this.codeEditorService = codeEditorService;
        this.uriIdentityService = uriIdentityService;
        this.visibilityChange = this._disposables.add(new Emitter());
        this._current = observableValue('testPeekCurrent', undefined);
        this._disposables.add(themeService.onDidColorThemeChange(this.applyTheme, this));
        this._disposables.add(this.onDidClose(() => this.visibilityChange.fire(false)));
        peekViewService.addExclusiveWidget(editor, this);
    }
    applyTheme() {
        const theme = this.themeService.getColorTheme();
        const isError = this.current instanceof MessageSubject && this.current.message.type === 0;
        const borderColor = (isError ? theme.getColor(testingPeekBorder) : theme.getColor(testingMessagePeekBorder)) || Color.transparent;
        const headerBg = (isError ? theme.getColor(testingPeekHeaderBackground) : theme.getColor(testingPeekMessageHeaderBackground)) || Color.transparent;
        const editorBg = theme.getColor(editorBackground);
        this.style({
            arrowColor: borderColor,
            frameColor: borderColor,
            headerBackgroundColor: editorBg && headerBg ? headerBg.makeOpaque(editorBg) : headerBg,
            primaryHeadingColor: theme.getColor(peekViewTitleForeground),
            secondaryHeadingColor: theme.getColor(peekViewTitleInfoForeground)
        });
    }
    _fillContainer(container) {
        if (!this.scopedContextKeyService) {
            this.scopedContextKeyService = this._disposables.add(this.contextKeyService.createScoped(container));
            TestingContextKeys.isInPeek.bindTo(this.scopedContextKeyService).set(true);
            const instaService = this._disposables.add(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, this.scopedContextKeyService])));
            this.content = this._disposables.add(instaService.createInstance(TestResultsViewContent, this.editor, { historyVisible: this.testingPeek.historyVisible, showRevealLocationOnMessages: false, locationForProgress: "workbench.panel.testResults.view" }));
            this._disposables.add(this.content.onClose(() => {
                TestingOutputPeekController.get(this.editor)?.removePeek();
            }));
        }
        super._fillContainer(container);
    }
    _fillHead(container) {
        super._fillHead(container);
        const menuContextKeyService = this._disposables.add(this.contextKeyService.createScoped(container));
        this._disposables.add(bindContextKey(TestingContextKeys.peekHasStack, menuContextKeyService, reader => inspectSubjectHasStack(this._current.read(reader))));
        const menu = this.menuService.createMenu(MenuId.TestPeekTitle, menuContextKeyService);
        const actionBar = this._actionbarWidget;
        this._disposables.add(menu.onDidChange(() => {
            actions.length = 0;
            createAndFillInActionBarActions(menu, undefined, actions);
            while (actionBar.getAction(1)) {
                actionBar.pull(0);
            }
            actionBar.push(actions, { label: false, icon: true, index: 0 });
        }));
        const actions = [];
        createAndFillInActionBarActions(menu, undefined, actions);
        actionBar.push(actions, { label: false, icon: true, index: 0 });
    }
    _fillBody(containerElement) {
        this.content.fillBody(containerElement);
        this._disposables.add(this.content.onDidRequestReveal(sub => {
            TestingOutputPeekController.get(this.editor)?.show(sub instanceof MessageSubject
                ? sub.messageUri
                : sub.outputUri);
        }));
    }
    setModel(subject) {
        if (subject instanceof TaskSubject || subject instanceof TestOutputSubject) {
            this._current.set(subject, undefined);
            return this.showInPlace(subject);
        }
        const message = subject.message;
        const previous = this.current;
        const revealLocation = subject.revealLocation?.range.getStartPosition();
        if (!revealLocation && !previous) {
            return Promise.resolve();
        }
        this._current.set(subject, undefined);
        if (!revealLocation) {
            return this.showInPlace(subject);
        }
        const peekLines = TestResultsPeek_1.lastHeightInLines || Math.max(inspectSubjectHasStack(subject) ? Math.ceil(this.getVisibleEditorLines() / 2) : 0, hintMessagePeekHeight(message));
        this.show(revealLocation, peekLines);
        this.editor.revealRangeNearTopIfOutsideViewport(Range.fromPositions(revealLocation), 0);
        return this.showInPlace(subject);
    }
    collapseStack() {
        this.content.collapseStack();
    }
    getVisibleEditorLines() {
        return Math.round(this.editor.getDomNode().clientHeight / this.editor.getOption(69));
    }
    async showInPlace(subject) {
        if (subject instanceof MessageSubject) {
            const message = subject.message;
            this.setTitle(firstLine(renderTestMessageAsText(message.message)), stripIcons(subject.test.label));
        }
        else {
            this.setTitle(localize('testOutputTitle', 'Test Output'));
        }
        this.applyTheme();
        await this.content.reveal({ subject, preserveFocus: false });
    }
    _relayout(newHeightInLines) {
        super._relayout(newHeightInLines);
        TestResultsPeek_1.lastHeightInLines = newHeightInLines;
    }
    _doLayoutBody(height, width) {
        super._doLayoutBody(height, width);
        this.content.onLayoutBody(height, width);
    }
    _onWidth(width) {
        super._onWidth(width);
        if (this.dimension) {
            this.dimension = new dom.Dimension(width, this.dimension.height);
        }
        this.content.onWidth(width);
    }
};
TestResultsPeek = TestResultsPeek_1 = __decorate([
    __param(1, IThemeService),
    __param(2, IPeekViewService),
    __param(3, ITestingPeekOpener),
    __param(4, IContextKeyService),
    __param(5, IMenuService),
    __param(6, IInstantiationService),
    __param(7, ITextModelService),
    __param(8, ICodeEditorService),
    __param(9, IUriIdentityService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], TestResultsPeek);
let TestResultsView = class TestResultsView extends ViewPane {
    constructor(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, hoverService, resultService) {
        super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, hoverService);
        this.resultService = resultService;
        this.content = new Lazy(() => this._register(this.instantiationService.createInstance(TestResultsViewContent, undefined, {
            historyVisible: staticObservableValue(true),
            showRevealLocationOnMessages: true,
            locationForProgress: "workbench.view.testing",
        })));
    }
    get subject() {
        return this.content.rawValue?.current;
    }
    showLatestRun(preserveFocus = false) {
        const result = this.resultService.results.find(r => r.tasks.length);
        if (!result) {
            return;
        }
        this.content.rawValue?.reveal({ preserveFocus, subject: new TaskSubject(result, 0) });
    }
    renderBody(container) {
        super.renderBody(container);
        if (this.isBodyVisible()) {
            this.renderContent(container);
        }
        else {
            this._register(Event.once(Event.filter(this.onDidChangeBodyVisibility, Boolean))(() => this.renderContent(container)));
        }
    }
    layoutBody(height, width) {
        super.layoutBody(height, width);
        this.content.rawValue?.onLayoutBody(height, width);
    }
    renderContent(container) {
        const content = this.content.value;
        content.fillBody(container);
        this._register(content.onDidRequestReveal(subject => content.reveal({ preserveFocus: true, subject })));
        const [lastResult] = this.resultService.results;
        if (lastResult && lastResult.tasks.length) {
            content.reveal({ preserveFocus: true, subject: new TaskSubject(lastResult, 0) });
        }
    }
};
TestResultsView = __decorate([
    __param(1, IKeybindingService),
    __param(2, IContextMenuService),
    __param(3, IConfigurationService),
    __param(4, IContextKeyService),
    __param(5, IViewDescriptorService),
    __param(6, IInstantiationService),
    __param(7, IOpenerService),
    __param(8, IThemeService),
    __param(9, ITelemetryService),
    __param(10, IHoverService),
    __param(11, ITestResultService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], TestResultsView);
export { TestResultsView };
const hintMessagePeekHeight = (msg) => {
    const msgHeight = ITestMessage.isDiffable(msg)
        ? Math.max(hintPeekStrHeight(msg.actual), hintPeekStrHeight(msg.expected))
        : hintPeekStrHeight(typeof msg.message === 'string' ? msg.message : msg.message.value);
    return msgHeight + 8;
};
const firstLine = (str) => {
    const index = str.indexOf('\n');
    return index === -1 ? str : str.slice(0, index);
};
const hintPeekStrHeight = (str) => Math.min(count(str, '\n'), 24);
function getOuterEditorFromDiffEditor(codeEditorService) {
    const diffEditors = codeEditorService.listDiffEditors();
    for (const diffEditor of diffEditors) {
        if (diffEditor.hasTextFocus() && diffEditor instanceof EmbeddedDiffEditorWidget) {
            return diffEditor.getParentEditor();
        }
    }
    return null;
}
export class CloseTestPeek extends EditorAction2 {
    constructor() {
        super({
            id: 'editor.closeTestPeek',
            title: localize2('close', 'Close'),
            icon: Codicon.close,
            precondition: ContextKeyExpr.or(TestingContextKeys.isInPeek, TestingContextKeys.isPeekVisible),
            keybinding: {
                weight: 100 - 101,
                primary: 9,
                when: ContextKeyExpr.not('config.editor.stablePeek')
            }
        });
    }
    runEditorCommand(accessor, editor) {
        const parent = getPeekedEditorFromFocus(accessor.get(ICodeEditorService));
        TestingOutputPeekController.get(parent ?? editor)?.removePeek();
    }
}
const navWhen = ContextKeyExpr.and(EditorContextKeys.focus, TestingContextKeys.isPeekVisible);
const getPeekedEditorFromFocus = (codeEditorService) => {
    const editor = codeEditorService.getFocusedCodeEditor() || codeEditorService.getActiveCodeEditor();
    return editor && getPeekedEditor(codeEditorService, editor);
};
const getPeekedEditor = (codeEditorService, editor) => {
    if (TestingOutputPeekController.get(editor)?.subject) {
        return editor;
    }
    if (editor instanceof EmbeddedCodeEditorWidget) {
        return editor.getParentEditor();
    }
    const outer = getOuterEditorFromDiffEditor(codeEditorService);
    if (outer) {
        return outer;
    }
    return editor;
};
export class GoToNextMessageAction extends Action2 {
    static { this.ID = 'testing.goToNextMessage'; }
    constructor() {
        super({
            id: GoToNextMessageAction.ID,
            f1: true,
            title: localize2('testing.goToNextMessage', 'Go to Next Test Failure'),
            metadata: {
                description: localize2('testing.goToNextMessage.description', 'Shows the next failure message in your file')
            },
            icon: Codicon.arrowDown,
            category: Categories.Test,
            keybinding: {
                primary: 512 | 66,
                weight: 100 + 1,
                when: navWhen,
            },
            menu: [{
                    id: MenuId.TestPeekTitle,
                    group: 'navigation',
                    order: 2,
                }, {
                    id: MenuId.CommandPalette,
                    when: navWhen
                }],
        });
    }
    run(accessor) {
        const editor = getPeekedEditorFromFocus(accessor.get(ICodeEditorService));
        if (editor) {
            TestingOutputPeekController.get(editor)?.next();
        }
    }
}
export class GoToPreviousMessageAction extends Action2 {
    static { this.ID = 'testing.goToPreviousMessage'; }
    constructor() {
        super({
            id: GoToPreviousMessageAction.ID,
            f1: true,
            title: localize2('testing.goToPreviousMessage', 'Go to Previous Test Failure'),
            metadata: {
                description: localize2('testing.goToPreviousMessage.description', 'Shows the previous failure message in your file')
            },
            icon: Codicon.arrowUp,
            category: Categories.Test,
            keybinding: {
                primary: 1024 | 512 | 66,
                weight: 100 + 1,
                when: navWhen
            },
            menu: [{
                    id: MenuId.TestPeekTitle,
                    group: 'navigation',
                    order: 1,
                }, {
                    id: MenuId.CommandPalette,
                    when: navWhen
                }],
        });
    }
    run(accessor) {
        const editor = getPeekedEditorFromFocus(accessor.get(ICodeEditorService));
        if (editor) {
            TestingOutputPeekController.get(editor)?.previous();
        }
    }
}
export class CollapsePeekStack extends Action2 {
    static { this.ID = 'testing.collapsePeekStack'; }
    constructor() {
        super({
            id: CollapsePeekStack.ID,
            title: localize2('testing.collapsePeekStack', 'Collapse Stack Frames'),
            icon: Codicon.collapseAll,
            category: Categories.Test,
            menu: [{
                    id: MenuId.TestPeekTitle,
                    when: TestingContextKeys.peekHasStack,
                    group: 'navigation',
                    order: 4,
                }],
        });
    }
    run(accessor) {
        const editor = getPeekedEditorFromFocus(accessor.get(ICodeEditorService));
        if (editor) {
            TestingOutputPeekController.get(editor)?.collapseStack();
        }
    }
}
export class OpenMessageInEditorAction extends Action2 {
    static { this.ID = 'testing.openMessageInEditor'; }
    constructor() {
        super({
            id: OpenMessageInEditorAction.ID,
            f1: false,
            title: localize2('testing.openMessageInEditor', 'Open in Editor'),
            icon: Codicon.goToFile,
            category: Categories.Test,
            menu: [{ id: MenuId.TestPeekTitle }],
        });
    }
    run(accessor) {
        accessor.get(ITestingPeekOpener).openCurrentInEditor();
    }
}
export class ToggleTestingPeekHistory extends Action2 {
    static { this.ID = 'testing.toggleTestingPeekHistory'; }
    constructor() {
        super({
            id: ToggleTestingPeekHistory.ID,
            f1: true,
            title: localize2('testing.toggleTestingPeekHistory', 'Toggle Test History in Peek'),
            metadata: {
                description: localize2('testing.toggleTestingPeekHistory.description', 'Shows or hides the history of test runs in the peek view')
            },
            icon: Codicon.history,
            category: Categories.Test,
            menu: [{
                    id: MenuId.TestPeekTitle,
                    group: 'navigation',
                    order: 3,
                }],
            keybinding: {
                weight: 200,
                primary: 512 | 38,
                when: TestingContextKeys.isPeekVisible.isEqualTo(true),
            },
        });
    }
    run(accessor) {
        const opener = accessor.get(ITestingPeekOpener);
        opener.historyVisible.value = !opener.historyVisible.value;
    }
}
