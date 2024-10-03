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
var TestRunElementRenderer_1;
import * as dom from '../../../../../base/browser/dom.js';
import { ActionBar } from '../../../../../base/browser/ui/actionbar/actionbar.js';
import { renderLabelWithIcons } from '../../../../../base/browser/ui/iconLabel/iconLabels.js';
import { Action, Separator } from '../../../../../base/common/actions.js';
import { RunOnceScheduler } from '../../../../../base/common/async.js';
import { Codicon } from '../../../../../base/common/codicons.js';
import { Emitter, Event } from '../../../../../base/common/event.js';
import { Iterable } from '../../../../../base/common/iterator.js';
import { Disposable, DisposableStore } from '../../../../../base/common/lifecycle.js';
import { autorun } from '../../../../../base/common/observable.js';
import { count } from '../../../../../base/common/strings.js';
import { ThemeIcon } from '../../../../../base/common/themables.js';
import { isDefined } from '../../../../../base/common/types.js';
import { localize } from '../../../../../nls.js';
import { MenuEntryActionViewItem, createAndFillInActionBarActions } from '../../../../../platform/actions/browser/menuEntryActionViewItem.js';
import { IMenuService, MenuId, MenuItemAction } from '../../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { WorkbenchCompressibleObjectTree } from '../../../../../platform/list/browser/listService.js';
import { IProgressService } from '../../../../../platform/progress/common/progress.js';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
import { widgetClose } from '../../../../../platform/theme/common/iconRegistry.js';
import { getTestItemContextOverlay } from '../explorerProjections/testItemContextOverlay.js';
import * as icons from '../icons.js';
import { renderTestMessageAsText } from '../testMessageColorizer.js';
import { MessageSubject, TaskSubject, TestOutputSubject, getMessageArgs, mapFindTestMessage } from './testResultsSubject.js';
import { ITestCoverageService } from '../../common/testCoverageService.js';
import { ITestExplorerFilterState } from '../../common/testExplorerFilterState.js';
import { ITestProfileService } from '../../common/testProfileService.js';
import { LiveTestResult, maxCountPriority } from '../../common/testResult.js';
import { ITestResultService } from '../../common/testResultService.js';
import { InternalTestItem, testResultStateToContextValues } from '../../common/testTypes.js';
import { TestingContextKeys } from '../../common/testingContextKeys.js';
import { cmpPriority } from '../../common/testingStates.js';
import { buildTestUri } from '../../common/testingUri.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
class TestResultElement {
    get icon() {
        return icons.testingStatesToIcons.get(this.value.completedAt === undefined
            ? 2
            : maxCountPriority(this.value.counts));
    }
    constructor(value) {
        this.value = value;
        this.changeEmitter = new Emitter();
        this.onDidChange = this.changeEmitter.event;
        this.type = 'result';
        this.context = this.value.id;
        this.id = this.value.id;
        this.label = this.value.name;
    }
}
const openCoverageLabel = localize('openTestCoverage', 'View Test Coverage');
const closeCoverageLabel = localize('closeTestCoverage', 'Close Test Coverage');
class CoverageElement {
    get label() {
        return this.isOpen ? closeCoverageLabel : openCoverageLabel;
    }
    get icon() {
        return this.isOpen ? widgetClose : icons.testingCoverageReport;
    }
    get isOpen() {
        return this.coverageService.selected.get()?.fromTaskId === this.task.id;
    }
    constructor(results, task, coverageService) {
        this.results = results;
        this.task = task;
        this.coverageService = coverageService;
        this.type = 'coverage';
        this.id = `coverage-${this.results.id}/${this.task.id}`;
        this.onDidChange = Event.fromObservableLight(coverageService.selected);
    }
}
class OlderResultsElement {
    constructor(n) {
        this.n = n;
        this.type = 'older';
        this.id = `older-${this.n}`;
        this.onDidChange = Event.None;
        this.label = localize('nOlderResults', '{0} older results', n);
    }
}
class TestCaseElement {
    get onDidChange() {
        if (!(this.results instanceof LiveTestResult)) {
            return Event.None;
        }
        return Event.filter(this.results.onChange, e => e.item.item.extId === this.test.item.extId);
    }
    get state() {
        return this.test.tasks[this.taskIndex].state;
    }
    get label() {
        return this.test.item.label;
    }
    get labelWithIcons() {
        return renderLabelWithIcons(this.label);
    }
    get icon() {
        return icons.testingStatesToIcons.get(this.state);
    }
    get outputSubject() {
        return new TestOutputSubject(this.results, this.taskIndex, this.test);
    }
    constructor(results, test, taskIndex) {
        this.results = results;
        this.test = test;
        this.taskIndex = taskIndex;
        this.type = 'test';
        this.context = {
            $mid: 16,
            tests: [InternalTestItem.serialize(this.test)],
        };
        this.id = `${this.results.id}/${this.test.item.extId}`;
    }
}
class TaskElement {
    get icon() {
        return this.results.tasks[this.index].running ? icons.testingStatesToIcons.get(2) : undefined;
    }
    constructor(results, task, index) {
        this.results = results;
        this.task = task;
        this.index = index;
        this.changeEmitter = new Emitter();
        this.onDidChange = this.changeEmitter.event;
        this.type = 'task';
        this.itemsCache = new CreationCache();
        this.id = `${results.id}/${index}`;
        this.task = results.tasks[index];
        this.context = { resultId: results.id, taskId: this.task.id };
        this.label = this.task.name;
    }
}
class TestMessageElement {
    get onDidChange() {
        if (!(this.result instanceof LiveTestResult)) {
            return Event.None;
        }
        return Event.filter(this.result.onChange, e => e.item.item.extId === this.test.item.extId);
    }
    get context() {
        return getMessageArgs(this.test, this.message);
    }
    get outputSubject() {
        return new TestOutputSubject(this.result, this.taskIndex, this.test);
    }
    constructor(result, test, taskIndex, messageIndex) {
        this.result = result;
        this.test = test;
        this.taskIndex = taskIndex;
        this.messageIndex = messageIndex;
        this.type = 'message';
        const m = this.message = test.tasks[taskIndex].messages[messageIndex];
        this.location = m.location;
        this.contextValue = m.type === 0 ? m.contextValue : undefined;
        this.uri = buildTestUri({
            type: 2,
            messageIndex,
            resultId: result.id,
            taskIndex,
            testExtId: test.item.extId
        });
        this.id = this.uri.toString();
        const asPlaintext = renderTestMessageAsText(m.message);
        const lines = count(asPlaintext.trimEnd(), '\n');
        this.label = firstLine(asPlaintext);
        if (lines > 0) {
            this.description = lines > 1
                ? localize('messageMoreLinesN', '+ {0} more lines', lines)
                : localize('messageMoreLines1', '+ 1 more line');
        }
    }
}
let OutputPeekTree = class OutputPeekTree extends Disposable {
    constructor(container, onDidReveal, options, contextMenuService, results, instantiationService, explorerFilter, coverageService, progressService, telemetryService) {
        super();
        this.contextMenuService = contextMenuService;
        this.disposed = false;
        this.requestReveal = this._register(new Emitter());
        this.onDidRequestReview = this.requestReveal.event;
        this.treeActions = instantiationService.createInstance(TreeActionsProvider, options.showRevealLocationOnMessages, this.requestReveal);
        const diffIdentityProvider = {
            getId(e) {
                return e.id;
            }
        };
        this.tree = this._register(instantiationService.createInstance(WorkbenchCompressibleObjectTree, 'Test Output Peek', container, {
            getHeight: () => 22,
            getTemplateId: () => TestRunElementRenderer.ID,
        }, [instantiationService.createInstance(TestRunElementRenderer, this.treeActions)], {
            compressionEnabled: true,
            hideTwistiesOfChildlessElements: true,
            identityProvider: diffIdentityProvider,
            sorter: {
                compare(a, b) {
                    if (a instanceof TestCaseElement && b instanceof TestCaseElement) {
                        return cmpPriority(a.state, b.state);
                    }
                    return 0;
                },
            },
            accessibilityProvider: {
                getAriaLabel(element) {
                    return element.ariaLabel || element.label;
                },
                getWidgetAriaLabel() {
                    return localize('testingPeekLabel', 'Test Result Messages');
                }
            }
        }));
        const cc = new CreationCache();
        const getTaskChildren = (taskElem) => {
            const { results, index, itemsCache, task } = taskElem;
            const tests = Iterable.filter(results.tests, test => test.tasks[index].state >= 2 || test.tasks[index].messages.length > 0);
            let result = Iterable.map(tests, test => ({
                element: itemsCache.getOrCreate(test, () => new TestCaseElement(results, test, index)),
                incompressible: true,
                children: getTestChildren(results, test, index),
            }));
            if (task.coverage.get()) {
                result = Iterable.concat(Iterable.single({
                    element: new CoverageElement(results, task, coverageService),
                    collapsible: true,
                    incompressible: true,
                }), result);
            }
            return result;
        };
        const getTestChildren = (result, test, taskIndex) => {
            return test.tasks[taskIndex].messages
                .map((m, messageIndex) => m.type === 0
                ? { element: cc.getOrCreate(m, () => new TestMessageElement(result, test, taskIndex, messageIndex)), incompressible: false }
                : undefined)
                .filter(isDefined);
        };
        const getResultChildren = (result) => {
            return result.tasks.map((task, taskIndex) => {
                const taskElem = cc.getOrCreate(task, () => new TaskElement(result, task, taskIndex));
                return ({
                    element: taskElem,
                    incompressible: false,
                    collapsible: true,
                    children: getTaskChildren(taskElem),
                });
            });
        };
        const getRootChildren = () => {
            let children = [];
            const older = [];
            for (const result of results.results) {
                if (!children.length && result.tasks.length) {
                    children = getResultChildren(result);
                }
                else if (children) {
                    const element = cc.getOrCreate(result, () => new TestResultElement(result));
                    older.push({
                        element,
                        incompressible: true,
                        collapsible: true,
                        collapsed: this.tree.hasElement(element) ? this.tree.isCollapsed(element) : true,
                        children: getResultChildren(result)
                    });
                }
            }
            if (!children.length) {
                return older;
            }
            if (older.length) {
                children.push({
                    element: new OlderResultsElement(older.length),
                    incompressible: true,
                    collapsible: true,
                    collapsed: true,
                    children: older,
                });
            }
            return children;
        };
        const taskChildrenToUpdate = new Set();
        const taskChildrenUpdate = this._register(new RunOnceScheduler(() => {
            for (const taskNode of taskChildrenToUpdate) {
                if (this.tree.hasElement(taskNode)) {
                    this.tree.setChildren(taskNode, getTaskChildren(taskNode), { diffIdentityProvider });
                }
            }
            taskChildrenToUpdate.clear();
        }, 300));
        const queueTaskChildrenUpdate = (taskNode) => {
            taskChildrenToUpdate.add(taskNode);
            if (!taskChildrenUpdate.isScheduled()) {
                taskChildrenUpdate.schedule();
            }
        };
        const attachToResults = (result) => {
            const disposable = new DisposableStore();
            disposable.add(result.onNewTask(i => {
                this.tree.setChildren(null, getRootChildren(), { diffIdentityProvider });
                if (result.tasks.length === 1) {
                    this.requestReveal.fire(new TaskSubject(result, 0));
                }
                const task = result.tasks[i];
                disposable.add(autorun(reader => {
                    task.coverage.read(reader);
                    queueTaskChildrenUpdate(cc.get(task));
                }));
            }));
            disposable.add(result.onEndTask(index => {
                cc.get(result.tasks[index])?.changeEmitter.fire();
            }));
            disposable.add(result.onChange(e => {
                for (const [index, task] of result.tasks.entries()) {
                    const taskNode = cc.get(task);
                    if (!this.tree.hasElement(taskNode)) {
                        continue;
                    }
                    const itemNode = taskNode.itemsCache.get(e.item);
                    if (itemNode && this.tree.hasElement(itemNode)) {
                        if (e.reason === 2 && e.message.type === 0) {
                            this.tree.setChildren(itemNode, getTestChildren(result, e.item, index), { diffIdentityProvider });
                        }
                        return;
                    }
                    queueTaskChildrenUpdate(taskNode);
                }
            }));
            disposable.add(result.onComplete(() => {
                cc.get(result)?.changeEmitter.fire();
                disposable.dispose();
            }));
        };
        this._register(results.onResultsChanged(e => {
            if (this.disposed) {
                return;
            }
            if ('completed' in e) {
                cc.get(e.completed)?.changeEmitter.fire();
            }
            else if ('started' in e) {
                attachToResults(e.started);
            }
            else {
                this.tree.setChildren(null, getRootChildren(), { diffIdentityProvider });
            }
        }));
        const revealItem = (element, preserveFocus) => {
            this.tree.setFocus([element]);
            this.tree.setSelection([element]);
            if (!preserveFocus) {
                this.tree.domFocus();
            }
        };
        this._register(onDidReveal(async ({ subject, preserveFocus = false }) => {
            if (subject instanceof TaskSubject) {
                const resultItem = this.tree.getNode(null).children.find(c => {
                    if (c.element instanceof TaskElement) {
                        return c.element.results.id === subject.result.id && c.element.index === subject.taskIndex;
                    }
                    if (c.element instanceof TestResultElement) {
                        return c.element.id === subject.result.id;
                    }
                    return false;
                });
                if (resultItem) {
                    revealItem(resultItem.element, preserveFocus);
                }
                return;
            }
            const revealElement = subject instanceof TestOutputSubject
                ? cc.get(subject.task)?.itemsCache.get(subject.test)
                : cc.get(subject.message);
            if (!revealElement || !this.tree.hasElement(revealElement)) {
                return;
            }
            const parents = [];
            for (let parent = this.tree.getParentElement(revealElement); parent; parent = this.tree.getParentElement(parent)) {
                parents.unshift(parent);
            }
            for (const parent of parents) {
                this.tree.expand(parent);
            }
            if (this.tree.getRelativeTop(revealElement) === null) {
                this.tree.reveal(revealElement, 0.5);
            }
            revealItem(revealElement, preserveFocus);
        }));
        this._register(this.tree.onDidOpen(async (e) => {
            if (e.element instanceof TestMessageElement) {
                this.requestReveal.fire(new MessageSubject(e.element.result, e.element.test, e.element.taskIndex, e.element.messageIndex));
            }
            else if (e.element instanceof TestCaseElement) {
                const t = e.element;
                const message = mapFindTestMessage(e.element.test, (_t, _m, mesasgeIndex, taskIndex) => new MessageSubject(t.results, t.test, taskIndex, mesasgeIndex));
                this.requestReveal.fire(message || new TestOutputSubject(t.results, 0, t.test));
            }
            else if (e.element instanceof CoverageElement) {
                const task = e.element.task;
                if (e.element.isOpen) {
                    return coverageService.closeCoverage();
                }
                progressService.withProgress({ location: options.locationForProgress }, () => coverageService.openCoverage(task, true));
            }
        }));
        this._register(this.tree.onDidChangeSelection(evt => {
            for (const element of evt.elements) {
                if (element && 'test' in element) {
                    explorerFilter.reveal.value = element.test.item.extId;
                    break;
                }
            }
        }));
        this._register(this.tree.onContextMenu(e => this.onContextMenu(e)));
        this._register(this.tree.onDidChangeCollapseState(e => {
            if (e.node.element instanceof OlderResultsElement && !e.node.collapsed) {
                telemetryService.publicLog2('testing.expandOlderResults');
            }
        }));
        this.tree.setChildren(null, getRootChildren());
        for (const result of results.results) {
            if (!result.completedAt && result instanceof LiveTestResult) {
                attachToResults(result);
            }
        }
    }
    layout(height, width) {
        this.tree.layout(height, width);
    }
    onContextMenu(evt) {
        if (!evt.element) {
            return;
        }
        const actions = this.treeActions.provideActionBar(evt.element);
        this.contextMenuService.showContextMenu({
            getAnchor: () => evt.anchor,
            getActions: () => actions.secondary.length
                ? [...actions.primary, new Separator(), ...actions.secondary]
                : actions.primary,
            getActionsContext: () => evt.element?.context
        });
    }
    dispose() {
        super.dispose();
        this.disposed = true;
    }
};
OutputPeekTree = __decorate([
    __param(3, IContextMenuService),
    __param(4, ITestResultService),
    __param(5, IInstantiationService),
    __param(6, ITestExplorerFilterState),
    __param(7, ITestCoverageService),
    __param(8, IProgressService),
    __param(9, ITelemetryService),
    __metadata("design:paramtypes", [HTMLElement, Function, Object, Object, Object, Object, Object, Object, Object, Object])
], OutputPeekTree);
export { OutputPeekTree };
let TestRunElementRenderer = class TestRunElementRenderer {
    static { TestRunElementRenderer_1 = this; }
    static { this.ID = 'testRunElementRenderer'; }
    constructor(treeActions, instantiationService) {
        this.treeActions = treeActions;
        this.instantiationService = instantiationService;
        this.templateId = TestRunElementRenderer_1.ID;
    }
    renderCompressedElements(node, _index, templateData) {
        const chain = node.element.elements;
        const lastElement = chain[chain.length - 1];
        if ((lastElement instanceof TaskElement || lastElement instanceof TestMessageElement) && chain.length >= 2) {
            this.doRender(chain[chain.length - 2], templateData, lastElement);
        }
        else {
            this.doRender(lastElement, templateData);
        }
    }
    renderTemplate(container) {
        const templateDisposable = new DisposableStore();
        const wrapper = dom.append(container, dom.$('.test-peek-item'));
        const icon = dom.append(wrapper, dom.$('.state'));
        const label = dom.append(wrapper, dom.$('.name'));
        const actionBar = new ActionBar(wrapper, {
            actionViewItemProvider: (action, options) => action instanceof MenuItemAction
                ? this.instantiationService.createInstance(MenuEntryActionViewItem, action, { hoverDelegate: options.hoverDelegate })
                : undefined
        });
        const elementDisposable = new DisposableStore();
        templateDisposable.add(elementDisposable);
        templateDisposable.add(actionBar);
        return {
            icon,
            label,
            actionBar,
            elementDisposable,
            templateDisposable,
        };
    }
    renderElement(element, _index, templateData) {
        this.doRender(element.element, templateData);
    }
    disposeTemplate(templateData) {
        templateData.templateDisposable.dispose();
    }
    doRender(element, templateData, subjectElement) {
        templateData.elementDisposable.clear();
        templateData.elementDisposable.add(element.onDidChange(() => this.doRender(element, templateData, subjectElement)));
        this.doRenderInner(element, templateData, subjectElement);
    }
    doRenderInner(element, templateData, subjectElement) {
        let { label, labelWithIcons, description } = element;
        if (subjectElement instanceof TestMessageElement) {
            description = subjectElement.label;
        }
        const descriptionElement = description ? dom.$('span.test-label-description', {}, description) : '';
        if (labelWithIcons) {
            dom.reset(templateData.label, ...labelWithIcons, descriptionElement);
        }
        else {
            dom.reset(templateData.label, label, descriptionElement);
        }
        const icon = element.icon;
        templateData.icon.className = `computed-state ${icon ? ThemeIcon.asClassName(icon) : ''}`;
        const actions = this.treeActions.provideActionBar(element);
        templateData.actionBar.clear();
        templateData.actionBar.context = element.context;
        templateData.actionBar.push(actions.primary, { icon: true, label: false });
    }
};
TestRunElementRenderer = TestRunElementRenderer_1 = __decorate([
    __param(1, IInstantiationService),
    __metadata("design:paramtypes", [TreeActionsProvider, Object])
], TestRunElementRenderer);
let TreeActionsProvider = class TreeActionsProvider {
    constructor(showRevealLocationOnMessages, requestReveal, contextKeyService, menuService, commandService, testProfileService, editorService) {
        this.showRevealLocationOnMessages = showRevealLocationOnMessages;
        this.requestReveal = requestReveal;
        this.contextKeyService = contextKeyService;
        this.menuService = menuService;
        this.commandService = commandService;
        this.testProfileService = testProfileService;
        this.editorService = editorService;
    }
    provideActionBar(element) {
        const test = element instanceof TestCaseElement ? element.test : undefined;
        const capabilities = test ? this.testProfileService.capabilitiesForTest(test.item) : 0;
        const contextKeys = [
            ['peek', "editor.contrib.testingOutputPeek"],
            [TestingContextKeys.peekItemType.key, element.type],
        ];
        let id = MenuId.TestPeekElement;
        const primary = [];
        const secondary = [];
        if (element instanceof TaskElement) {
            primary.push(new Action('testing.outputPeek.showResultOutput', localize('testing.showResultOutput', "Show Result Output"), ThemeIcon.asClassName(Codicon.terminal), undefined, () => this.requestReveal.fire(new TaskSubject(element.results, element.index))));
            if (element.task.running) {
                primary.push(new Action('testing.outputPeek.cancel', localize('testing.cancelRun', 'Cancel Test Run'), ThemeIcon.asClassName(icons.testingCancelIcon), undefined, () => this.commandService.executeCommand("testing.cancelRun", element.results.id, element.task.id)));
            }
        }
        if (element instanceof TestResultElement) {
            if (element.value.tasks.length === 1) {
                primary.push(new Action('testing.outputPeek.showResultOutput', localize('testing.showResultOutput', "Show Result Output"), ThemeIcon.asClassName(Codicon.terminal), undefined, () => this.requestReveal.fire(new TaskSubject(element.value, 0))));
            }
            primary.push(new Action('testing.outputPeek.reRunLastRun', localize('testing.reRunLastRun', "Rerun Test Run"), ThemeIcon.asClassName(icons.testingRunIcon), undefined, () => this.commandService.executeCommand('testing.reRunLastRun', element.value.id)));
            if (capabilities & 4) {
                primary.push(new Action('testing.outputPeek.debugLastRun', localize('testing.debugLastRun', "Debug Test Run"), ThemeIcon.asClassName(icons.testingDebugIcon), undefined, () => this.commandService.executeCommand('testing.debugLastRun', element.value.id)));
            }
        }
        if (element instanceof TestCaseElement || element instanceof TestMessageElement) {
            contextKeys.push([TestingContextKeys.testResultOutdated.key, element.test.retired], [TestingContextKeys.testResultState.key, testResultStateToContextValues[element.test.ownComputedState]], ...getTestItemContextOverlay(element.test, capabilities));
            const extId = element.test.item.extId;
            if (element.test.tasks[element.taskIndex].messages.some(m => m.type === 1)) {
                primary.push(new Action('testing.outputPeek.showResultOutput', localize('testing.showResultOutput', "Show Result Output"), ThemeIcon.asClassName(Codicon.terminal), undefined, () => this.requestReveal.fire(element.outputSubject)));
            }
            secondary.push(new Action('testing.outputPeek.revealInExplorer', localize('testing.revealInExplorer', "Reveal in Test Explorer"), ThemeIcon.asClassName(Codicon.listTree), undefined, () => this.commandService.executeCommand('_revealTestInExplorer', extId)));
            if (capabilities & 2) {
                primary.push(new Action('testing.outputPeek.runTest', localize('run test', 'Run Test'), ThemeIcon.asClassName(icons.testingRunIcon), undefined, () => this.commandService.executeCommand('vscode.runTestsById', 2, extId)));
            }
            if (capabilities & 4) {
                primary.push(new Action('testing.outputPeek.debugTest', localize('debug test', 'Debug Test'), ThemeIcon.asClassName(icons.testingDebugIcon), undefined, () => this.commandService.executeCommand('vscode.runTestsById', 4, extId)));
            }
        }
        if (element instanceof TestMessageElement) {
            id = MenuId.TestMessageContext;
            contextKeys.push([TestingContextKeys.testMessageContext.key, element.contextValue]);
            primary.push(new Action('testing.outputPeek.goToTest', localize('testing.goToTest', "Go to Test"), ThemeIcon.asClassName(Codicon.goToFile), undefined, () => this.commandService.executeCommand('vscode.revealTest', element.test.item.extId)));
            if (this.showRevealLocationOnMessages && element.location) {
                primary.push(new Action('testing.outputPeek.goToError', localize('testing.goToError', "Go to Error"), ThemeIcon.asClassName(Codicon.goToFile), undefined, () => this.editorService.openEditor({
                    resource: element.location.uri,
                    options: {
                        selection: element.location.range,
                        preserveFocus: true,
                    }
                })));
            }
        }
        const contextOverlay = this.contextKeyService.createOverlay(contextKeys);
        const result = { primary, secondary };
        const menu = this.menuService.getMenuActions(id, contextOverlay, { arg: element.context });
        createAndFillInActionBarActions(menu, result, 'inline');
        return result;
    }
};
TreeActionsProvider = __decorate([
    __param(2, IContextKeyService),
    __param(3, IMenuService),
    __param(4, ICommandService),
    __param(5, ITestProfileService),
    __param(6, IEditorService),
    __metadata("design:paramtypes", [Boolean, Emitter, Object, Object, Object, Object, Object])
], TreeActionsProvider);
class CreationCache {
    constructor() {
        this.v = new WeakMap();
    }
    get(key) {
        return this.v.get(key);
    }
    getOrCreate(ref, factory) {
        const existing = this.v.get(ref);
        if (existing) {
            return existing;
        }
        const fresh = factory();
        this.v.set(ref, fresh);
        return fresh;
    }
}
const firstLine = (str) => {
    const index = str.indexOf('\n');
    return index === -1 ? str : str.slice(0, index);
};
