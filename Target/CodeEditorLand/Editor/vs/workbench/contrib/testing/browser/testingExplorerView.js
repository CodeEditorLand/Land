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
var ErrorRenderer_1, TestItemRenderer_1;
import * as dom from '../../../../base/browser/dom.js';
import { ActionBar } from '../../../../base/browser/ui/actionbar/actionbar.js';
import { Button } from '../../../../base/browser/ui/button/button.js';
import { getDefaultHoverDelegate } from '../../../../base/browser/ui/hover/hoverDelegateFactory.js';
import { renderLabelWithIcons } from '../../../../base/browser/ui/iconLabel/iconLabels.js';
import { DefaultKeyboardNavigationDelegate } from '../../../../base/browser/ui/list/listWidget.js';
import { Action, ActionRunner, Separator } from '../../../../base/common/actions.js';
import { mapFindFirst } from '../../../../base/common/arraysFind.js';
import { RunOnceScheduler, disposableTimeout } from '../../../../base/common/async.js';
import { Color, RGBA } from '../../../../base/common/color.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { Disposable, DisposableStore, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { autorun, observableFromEvent } from '../../../../base/common/observable.js';
import { fuzzyContains } from '../../../../base/common/strings.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { isDefined } from '../../../../base/common/types.js';
import './media/testing.css';
import { MarkdownRenderer } from '../../../../editor/browser/widget/markdownRenderer/browser/markdownRenderer.js';
import { localize } from '../../../../nls.js';
import { DropdownWithPrimaryActionViewItem } from '../../../../platform/actions/browser/dropdownWithPrimaryActionViewItem.js';
import { MenuEntryActionViewItem, createActionViewItem, createAndFillInActionBarActions, createAndFillInContextMenuActions } from '../../../../platform/actions/browser/menuEntryActionViewItem.js';
import { IMenuService, MenuId, MenuItemAction } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { UnmanagedProgress } from '../../../../platform/progress/common/progress.js';
import { IStorageService, WillSaveStateReason } from '../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { defaultButtonStyles } from '../../../../platform/theme/browser/defaultStyles.js';
import { foreground } from '../../../../platform/theme/common/colorRegistry.js';
import { spinningLoading } from '../../../../platform/theme/common/iconRegistry.js';
import { IThemeService, registerThemingParticipant } from '../../../../platform/theme/common/themeService.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { registerNavigableContainer } from '../../../browser/actions/widgetNavigationCommands.js';
import { ViewPane } from '../../../browser/parts/views/viewPane.js';
import { DiffEditorInput } from '../../../common/editor/diffEditorInput.js';
import { IViewDescriptorService } from '../../../common/views.js';
import { TestItemTreeElement, TestTreeErrorMessage } from './explorerProjections/index.js';
import { ListProjection } from './explorerProjections/listProjection.js';
import { getTestItemContextOverlay } from './explorerProjections/testItemContextOverlay.js';
import { TestingObjectTree } from './explorerProjections/testingObjectTree.js';
import { TreeProjection } from './explorerProjections/treeProjection.js';
import * as icons from './icons.js';
import { DebugLastRun, ReRunLastRun } from './testExplorerActions.js';
import { TestingExplorerFilter } from './testingExplorerFilter.js';
import { collectTestStateCounts, getTestProgressText } from './testingProgressUiService.js';
import { getTestingConfiguration } from '../common/configuration.js';
import { labelForTestInState } from '../common/constants.js';
import { StoredValue } from '../common/storedValue.js';
import { ITestExplorerFilterState, TestExplorerFilterState } from '../common/testExplorerFilterState.js';
import { TestId } from '../common/testId.js';
import { ITestProfileService, canUseProfileWithTest } from '../common/testProfileService.js';
import { LiveTestResult } from '../common/testResult.js';
import { ITestResultService } from '../common/testResultService.js';
import { ITestService, testCollectionIsEmpty } from '../common/testService.js';
import { TestingContextKeys } from '../common/testingContextKeys.js';
import { ITestingContinuousRunService } from '../common/testingContinuousRunService.js';
import { ITestingPeekOpener } from '../common/testingPeekOpener.js';
import { cmpPriority, isFailedState, isStateWithResult, statesInOrder } from '../common/testingStates.js';
import { IActivityService, IconBadge, NumberBadge } from '../../../services/activity/common/activity.js';
import { IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
let TestingExplorerView = class TestingExplorerView extends ViewPane {
    get focusedTreeElements() {
        return this.viewModel.tree.getFocus().filter(isDefined);
    }
    constructor(options, contextMenuService, keybindingService, configurationService, instantiationService, viewDescriptorService, contextKeyService, openerService, themeService, testService, telemetryService, hoverService, testProfileService, commandService, menuService) {
        super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, hoverService);
        this.testService = testService;
        this.testProfileService = testProfileService;
        this.commandService = commandService;
        this.menuService = menuService;
        this.filterActionBar = this._register(new MutableDisposable());
        this.discoveryProgress = this._register(new MutableDisposable());
        this.filter = this._register(new MutableDisposable());
        this.filterFocusListener = this._register(new MutableDisposable());
        this.dimensions = { width: 0, height: 0 };
        this.lastFocusState = 0;
        const relayout = this._register(new RunOnceScheduler(() => this.layoutBody(), 1));
        this._register(this.onDidChangeViewWelcomeState(() => {
            if (!this.shouldShowWelcome()) {
                relayout.schedule();
            }
        }));
        this._register(testService.collection.onBusyProvidersChange(busy => {
            this.updateDiscoveryProgress(busy);
        }));
        this._register(testProfileService.onDidChange(() => this.updateActions()));
    }
    shouldShowWelcome() {
        return this.viewModel?.welcomeExperience === 1;
    }
    focus() {
        super.focus();
        if (this.lastFocusState === 1) {
            this.viewModel.tree.domFocus();
        }
        else {
            this.filter.value?.focus();
        }
    }
    getTreeIncludeExclude(withinItems, profile, filterToType = 'visible') {
        const projection = this.viewModel.projection.value;
        if (!projection) {
            return { include: [], exclude: [] };
        }
        const include = new Set();
        const exclude = [];
        const attempt = (element, alreadyIncluded) => {
            if (!(element instanceof TestItemTreeElement) || !this.viewModel.tree.hasElement(element)) {
                return;
            }
            const inTree = this.viewModel.tree.getNode(element);
            if (!inTree.visible) {
                if (alreadyIncluded) {
                    exclude.push(element.test);
                }
                return;
            }
            if (!alreadyIncluded
                && (!profile || canUseProfileWithTest(profile, element.test))
                && (inTree.children.length === 0 || inTree.visibleChildrenCount * 2 >= inTree.children.length)
                && inTree.visibleChildrenCount !== 1) {
                include.add(element.test);
                alreadyIncluded = true;
            }
            for (const child of element.children) {
                attempt(child, alreadyIncluded);
            }
        };
        if (filterToType === 'selected') {
            const sel = this.viewModel.tree.getSelection().filter(isDefined);
            if (sel.length) {
                L: for (const node of sel) {
                    if (node instanceof TestItemTreeElement) {
                        for (let i = node; i; i = i.parent) {
                            if (include.has(i.test)) {
                                continue L;
                            }
                        }
                        include.add(node.test);
                        node.children.forEach(c => attempt(c, true));
                    }
                }
                return { include: [...include], exclude };
            }
        }
        for (const root of withinItems || this.testService.collection.rootItems) {
            const element = projection.getElementByTestId(root.item.extId);
            if (!element) {
                continue;
            }
            if (profile && !canUseProfileWithTest(profile, root)) {
                continue;
            }
            if (!this.viewModel.tree.hasElement(element)) {
                const visibleChildren = [...element.children].reduce((acc, c) => this.viewModel.tree.hasElement(c) && this.viewModel.tree.getNode(c).visible ? acc + 1 : acc, 0);
                if (element.children.size > 0 && visibleChildren * 2 >= element.children.size) {
                    include.add(element.test);
                    element.children.forEach(c => attempt(c, true));
                }
                else {
                    element.children.forEach(c => attempt(c, false));
                }
            }
            else {
                attempt(element, false);
            }
        }
        return { include: [...include], exclude };
    }
    render() {
        super.render();
        this._register(registerNavigableContainer({
            name: 'testingExplorerView',
            focusNotifiers: [this],
            focusNextWidget: () => {
                if (!this.viewModel.tree.isDOMFocused()) {
                    this.viewModel.tree.domFocus();
                }
            },
            focusPreviousWidget: () => {
                if (this.viewModel.tree.isDOMFocused()) {
                    this.filter.value?.focus();
                }
            }
        }));
    }
    renderBody(container) {
        super.renderBody(container);
        this.container = dom.append(container, dom.$('.test-explorer'));
        this.treeHeader = dom.append(this.container, dom.$('.test-explorer-header'));
        this.filterActionBar.value = this.createFilterActionBar();
        const messagesContainer = dom.append(this.treeHeader, dom.$('.result-summary-container'));
        this._register(this.instantiationService.createInstance(ResultSummaryView, messagesContainer));
        const listContainer = dom.append(this.container, dom.$('.test-explorer-tree'));
        this.viewModel = this.instantiationService.createInstance(TestingExplorerViewModel, listContainer, this.onDidChangeBodyVisibility);
        this._register(this.viewModel.tree.onDidFocus(() => this.lastFocusState = 1));
        this._register(this.viewModel.onChangeWelcomeVisibility(() => this._onDidChangeViewWelcomeState.fire()));
        this._register(this.viewModel);
        this._onDidChangeViewWelcomeState.fire();
    }
    getActionViewItem(action, options) {
        switch (action.id) {
            case "workbench.actions.treeView.testExplorer.filter":
                this.filter.value = this.instantiationService.createInstance(TestingExplorerFilter, action, options);
                this.filterFocusListener.value = this.filter.value.onDidFocus(() => this.lastFocusState = 0);
                return this.filter.value;
            case "testing.runSelected":
                return this.getRunGroupDropdown(2, action, options);
            case "testing.debugSelected":
                return this.getRunGroupDropdown(4, action, options);
            default:
                return super.getActionViewItem(action, options);
        }
    }
    getTestConfigGroupActions(group) {
        const profileActions = [];
        let participatingGroups = 0;
        let hasConfigurable = false;
        const defaults = this.testProfileService.getGroupDefaultProfiles(group);
        for (const { profiles, controller } of this.testProfileService.all()) {
            let hasAdded = false;
            for (const profile of profiles) {
                if (profile.group !== group) {
                    continue;
                }
                if (!hasAdded) {
                    hasAdded = true;
                    participatingGroups++;
                    profileActions.push(new Action(`${controller.id}.$root`, controller.label.get(), undefined, false));
                }
                hasConfigurable = hasConfigurable || profile.hasConfigurationHandler;
                profileActions.push(new Action(`${controller.id}.${profile.profileId}`, defaults.includes(profile) ? localize('defaultTestProfile', '{0} (Default)', profile.label) : profile.label, undefined, undefined, () => {
                    const { include, exclude } = this.getTreeIncludeExclude(undefined, profile);
                    this.testService.runResolvedTests({
                        exclude: exclude.map(e => e.item.extId),
                        group: profile.group,
                        targets: [{
                                profileId: profile.profileId,
                                controllerId: profile.controllerId,
                                testIds: include.map(i => i.item.extId),
                            }]
                    });
                }));
            }
        }
        const menuActions = [];
        const contextKeys = [];
        if (group === 2) {
            contextKeys.push(['testing.profile.context.group', 'run']);
        }
        if (group === 4) {
            contextKeys.push(['testing.profile.context.group', 'debug']);
        }
        if (group === 8) {
            contextKeys.push(['testing.profile.context.group', 'coverage']);
        }
        const key = this.contextKeyService.createOverlay(contextKeys);
        const menu = this.menuService.getMenuActions(MenuId.TestProfilesContext, key);
        createAndFillInContextMenuActions(menu, menuActions);
        const postActions = [];
        if (profileActions.length > 1) {
            postActions.push(new Action('selectDefaultTestConfigurations', localize('selectDefaultConfigs', 'Select Default Profile'), undefined, undefined, () => this.commandService.executeCommand("testing.selectDefaultTestProfiles", group)));
        }
        if (hasConfigurable) {
            postActions.push(new Action('configureTestProfiles', localize('configureTestProfiles', 'Configure Test Profiles'), undefined, undefined, () => this.commandService.executeCommand("testing.configureProfile", group)));
        }
        return menuActions.length > 0
            ? Separator.join(profileActions, menuActions, postActions)
            : Separator.join(profileActions, postActions);
    }
    saveState() {
        this.filter.value?.saveState();
        super.saveState();
    }
    getRunGroupDropdown(group, defaultAction, options) {
        const dropdownActions = this.getTestConfigGroupActions(group);
        if (dropdownActions.length < 2) {
            return super.getActionViewItem(defaultAction, options);
        }
        const primaryAction = this.instantiationService.createInstance(MenuItemAction, {
            id: defaultAction.id,
            title: defaultAction.label,
            icon: group === 2
                ? icons.testingRunAllIcon
                : icons.testingDebugAllIcon,
        }, undefined, undefined, undefined, undefined);
        const dropdownAction = new Action('selectRunConfig', 'Select Configuration...', 'codicon-chevron-down', true);
        return this.instantiationService.createInstance(DropdownWithPrimaryActionViewItem, primaryAction, dropdownAction, dropdownActions, '', options);
    }
    createFilterActionBar() {
        const bar = new ActionBar(this.treeHeader, {
            actionViewItemProvider: (action, options) => this.getActionViewItem(action, options),
            triggerKeys: { keyDown: false, keys: [] },
        });
        bar.push(new Action("workbench.actions.treeView.testExplorer.filter"));
        bar.getContainer().classList.add('testing-filter-action-bar');
        return bar;
    }
    updateDiscoveryProgress(busy) {
        if (!busy && this.discoveryProgress) {
            this.discoveryProgress.clear();
        }
        else if (busy && !this.discoveryProgress.value) {
            this.discoveryProgress.value = this.instantiationService.createInstance(UnmanagedProgress, { location: this.getProgressLocation() });
        }
    }
    layoutBody(height = this.dimensions.height, width = this.dimensions.width) {
        super.layoutBody(height, width);
        this.dimensions.height = height;
        this.dimensions.width = width;
        this.container.style.height = `${height}px`;
        this.viewModel?.layout(height - this.treeHeader.clientHeight, width);
        this.filter.value?.layout(width);
    }
};
TestingExplorerView = __decorate([
    __param(1, IContextMenuService),
    __param(2, IKeybindingService),
    __param(3, IConfigurationService),
    __param(4, IInstantiationService),
    __param(5, IViewDescriptorService),
    __param(6, IContextKeyService),
    __param(7, IOpenerService),
    __param(8, IThemeService),
    __param(9, ITestService),
    __param(10, ITelemetryService),
    __param(11, IHoverService),
    __param(12, ITestProfileService),
    __param(13, ICommandService),
    __param(14, IMenuService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], TestingExplorerView);
export { TestingExplorerView };
const SUMMARY_RENDER_INTERVAL = 200;
let ResultSummaryView = class ResultSummaryView extends Disposable {
    constructor(container, resultService, activityService, crService, configurationService, instantiationService, hoverService) {
        super();
        this.container = container;
        this.resultService = resultService;
        this.activityService = activityService;
        this.crService = crService;
        this.elementsWereAttached = false;
        this.badgeDisposable = this._register(new MutableDisposable());
        this.renderLoop = this._register(new RunOnceScheduler(() => this.render(), SUMMARY_RENDER_INTERVAL));
        this.elements = dom.h('div.result-summary', [
            dom.h('div@status'),
            dom.h('div@count'),
            dom.h('div@count'),
            dom.h('span'),
            dom.h('duration@duration'),
            dom.h('a@rerun'),
        ]);
        this.badgeType = configurationService.getValue("testing.countBadge");
        this._register(resultService.onResultsChanged(this.render, this));
        this._register(configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration("testing.countBadge")) {
                this.badgeType = configurationService.getValue("testing.countBadge");
                this.render();
            }
        }));
        this.countHover = this._register(hoverService.setupManagedHover(getDefaultHoverDelegate('mouse'), this.elements.count, ''));
        const ab = this._register(new ActionBar(this.elements.rerun, {
            actionViewItemProvider: (action, options) => createActionViewItem(instantiationService, action, options),
        }));
        ab.push(instantiationService.createInstance(MenuItemAction, { ...new ReRunLastRun().desc, icon: icons.testingRerunIcon }, { ...new DebugLastRun().desc, icon: icons.testingDebugIcon }, {}, undefined, undefined), { icon: true, label: false });
        this.render();
    }
    render() {
        const { results } = this.resultService;
        const { count, root, status, duration, rerun } = this.elements;
        if (!results.length) {
            if (this.elementsWereAttached) {
                root.remove();
                this.elementsWereAttached = false;
            }
            this.container.innerText = localize('noResults', 'No test results yet.');
            this.badgeDisposable.clear();
            return;
        }
        const live = results.filter(r => !r.completedAt);
        let counts;
        if (live.length) {
            status.className = ThemeIcon.asClassName(spinningLoading);
            counts = collectTestStateCounts(true, live);
            this.renderLoop.schedule();
            const last = live[live.length - 1];
            duration.textContent = formatDuration(Date.now() - last.startedAt);
            rerun.style.display = 'none';
        }
        else {
            const last = results[0];
            const dominantState = mapFindFirst(statesInOrder, s => last.counts[s] > 0 ? s : undefined);
            status.className = ThemeIcon.asClassName(icons.testingStatesToIcons.get(dominantState ?? 0));
            counts = collectTestStateCounts(false, [last]);
            duration.textContent = last instanceof LiveTestResult ? formatDuration(last.completedAt - last.startedAt) : '';
            rerun.style.display = 'block';
        }
        count.textContent = `${counts.passed}/${counts.totalWillBeRun}`;
        this.countHover.update(getTestProgressText(counts));
        this.renderActivityBadge(counts);
        if (!this.elementsWereAttached) {
            dom.clearNode(this.container);
            this.container.appendChild(root);
            this.elementsWereAttached = true;
        }
    }
    renderActivityBadge(countSummary) {
        if (countSummary && this.badgeType !== "off" && countSummary[this.badgeType] !== 0) {
            if (this.lastBadge instanceof NumberBadge && this.lastBadge.number === countSummary[this.badgeType]) {
                return;
            }
            this.lastBadge = new NumberBadge(countSummary[this.badgeType], num => this.getLocalizedBadgeString(this.badgeType, num));
        }
        else if (this.crService.isEnabled()) {
            if (this.lastBadge instanceof IconBadge && this.lastBadge.icon === icons.testingContinuousIsOn) {
                return;
            }
            this.lastBadge = new IconBadge(icons.testingContinuousIsOn, () => localize('testingContinuousBadge', 'Tests are being watched for changes'));
        }
        else {
            if (!this.lastBadge) {
                return;
            }
            this.lastBadge = undefined;
        }
        this.badgeDisposable.value = this.lastBadge && this.activityService.showViewActivity("workbench.view.testing", { badge: this.lastBadge });
    }
    getLocalizedBadgeString(countBadgeType, count) {
        switch (countBadgeType) {
            case "passed":
                return localize('testingCountBadgePassed', '{0} passed tests', count);
            case "skipped":
                return localize('testingCountBadgeSkipped', '{0} skipped tests', count);
            default:
                return localize('testingCountBadgeFailed', '{0} failed tests', count);
        }
    }
};
ResultSummaryView = __decorate([
    __param(1, ITestResultService),
    __param(2, IActivityService),
    __param(3, ITestingContinuousRunService),
    __param(4, IConfigurationService),
    __param(5, IInstantiationService),
    __param(6, IHoverService),
    __metadata("design:paramtypes", [HTMLElement, Object, Object, Object, Object, Object, Object])
], ResultSummaryView);
let TestingExplorerViewModel = class TestingExplorerViewModel extends Disposable {
    get viewMode() {
        return this._viewMode.get() ?? "true";
    }
    set viewMode(newMode) {
        if (newMode === this._viewMode.get()) {
            return;
        }
        this._viewMode.set(newMode);
        this.updatePreferredProjection();
        this.storageService.store('testing.viewMode', newMode, 1, 1);
    }
    get viewSorting() {
        return this._viewSorting.get() ?? "status";
    }
    set viewSorting(newSorting) {
        if (newSorting === this._viewSorting.get()) {
            return;
        }
        this._viewSorting.set(newSorting);
        this.tree.resort(null);
        this.storageService.store('testing.viewSorting', newSorting, 1, 1);
    }
    constructor(listContainer, onDidChangeVisibility, configurationService, editorService, editorGroupsService, menuService, contextMenuService, testService, filterState, instantiationService, storageService, contextKeyService, testResults, peekOpener, testProfileService, crService, commandService) {
        super();
        this.menuService = menuService;
        this.contextMenuService = contextMenuService;
        this.testService = testService;
        this.filterState = filterState;
        this.instantiationService = instantiationService;
        this.storageService = storageService;
        this.contextKeyService = contextKeyService;
        this.testResults = testResults;
        this.peekOpener = peekOpener;
        this.testProfileService = testProfileService;
        this.crService = crService;
        this.projection = this._register(new MutableDisposable());
        this.revealTimeout = new MutableDisposable();
        this._viewMode = TestingContextKeys.viewMode.bindTo(this.contextKeyService);
        this._viewSorting = TestingContextKeys.viewSorting.bindTo(this.contextKeyService);
        this.welcomeVisibilityEmitter = new Emitter();
        this.actionRunner = new TestExplorerActionRunner(() => this.tree.getSelection().filter(isDefined));
        this.lastViewState = this._register(new StoredValue({
            key: 'testing.treeState',
            scope: 1,
            target: 1,
        }, this.storageService));
        this.hasPendingReveal = false;
        this.onChangeWelcomeVisibility = this.welcomeVisibilityEmitter.event;
        this.welcomeExperience = 0;
        this.hasPendingReveal = !!filterState.reveal.value;
        this.noTestForDocumentWidget = this._register(instantiationService.createInstance(NoTestsForDocumentWidget, listContainer));
        this._viewMode.set(this.storageService.get('testing.viewMode', 1, "true"));
        this._viewSorting.set(this.storageService.get('testing.viewSorting', 1, "location"));
        this.reevaluateWelcomeState();
        this.filter = this.instantiationService.createInstance(TestsFilter, testService.collection);
        this.tree = instantiationService.createInstance(TestingObjectTree, 'Test Explorer List', listContainer, new ListDelegate(), [
            instantiationService.createInstance(TestItemRenderer, this.actionRunner),
            instantiationService.createInstance(ErrorRenderer),
        ], {
            identityProvider: instantiationService.createInstance(IdentityProvider),
            hideTwistiesOfChildlessElements: false,
            sorter: instantiationService.createInstance(TreeSorter, this),
            keyboardNavigationLabelProvider: instantiationService.createInstance(TreeKeyboardNavigationLabelProvider),
            accessibilityProvider: instantiationService.createInstance(ListAccessibilityProvider),
            filter: this.filter,
            findWidgetEnabled: false,
            openOnSingleClick: false,
        });
        const collapseStateSaver = this._register(new RunOnceScheduler(() => {
            const state = this.tree.getOptimizedViewState(this.lastViewState.get({}));
            const projection = this.projection.value;
            if (projection) {
                projection.lastState = state;
            }
        }, 3000));
        this._register(this.tree.onDidChangeCollapseState(evt => {
            if (evt.node.element instanceof TestItemTreeElement) {
                if (!evt.node.collapsed) {
                    this.projection.value?.expandElement(evt.node.element, evt.deep ? Infinity : 0);
                }
                collapseStateSaver.schedule();
            }
        }));
        this._register(this.crService.onDidChange(testId => {
            if (testId) {
                const elem = this.projection.value?.getElementByTestId(testId);
                this.tree.resort(elem?.parent && this.tree.hasElement(elem.parent) ? elem.parent : null, false);
            }
        }));
        this._register(onDidChangeVisibility(visible => {
            if (visible) {
                this.ensureProjection();
            }
        }));
        this._register(this.tree.onContextMenu(e => this.onContextMenu(e)));
        this._register(Event.any(filterState.text.onDidChange, filterState.fuzzy.onDidChange, testService.excluded.onTestExclusionsChanged)(this.tree.refilter, this.tree));
        this._register(this.tree.onDidOpen(e => {
            if (e.element instanceof TestItemTreeElement && !e.element.children.size && e.element.test.item.uri) {
                commandService.executeCommand('vscode.revealTest', e.element.test.item.extId);
            }
        }));
        this._register(this.tree);
        this._register(this.onChangeWelcomeVisibility(e => {
            this.noTestForDocumentWidget.setVisible(e === 2);
        }));
        this._register(dom.addStandardDisposableListener(this.tree.getHTMLElement(), 'keydown', evt => {
            if (evt.equals(3)) {
                this.handleExecuteKeypress(evt);
            }
            else if (DefaultKeyboardNavigationDelegate.mightProducePrintableCharacter(evt)) {
                filterState.text.value = evt.browserEvent.key;
                filterState.focusInput();
            }
        }));
        this._register(filterState.reveal.onDidChange(id => this.revealById(id, undefined, false)));
        this._register(onDidChangeVisibility(visible => {
            if (visible) {
                filterState.focusInput();
            }
        }));
        this._register(this.tree.onDidChangeSelection(evt => {
            if (dom.isMouseEvent(evt.browserEvent) && (evt.browserEvent.altKey || evt.browserEvent.shiftKey)) {
                return;
            }
            const selected = evt.elements[0];
            if (selected && evt.browserEvent && selected instanceof TestItemTreeElement
                && selected.children.size === 0 && selected.test.expand === 0) {
                this.tryPeekError(selected);
            }
        }));
        let followRunningTests = getTestingConfiguration(configurationService, "testing.followRunningTest");
        this._register(configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration("testing.followRunningTest")) {
                followRunningTests = getTestingConfiguration(configurationService, "testing.followRunningTest");
            }
        }));
        let alwaysRevealTestAfterStateChange = getTestingConfiguration(configurationService, "testing.alwaysRevealTestOnStateChange");
        this._register(configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration("testing.alwaysRevealTestOnStateChange")) {
                alwaysRevealTestAfterStateChange = getTestingConfiguration(configurationService, "testing.alwaysRevealTestOnStateChange");
            }
        }));
        this._register(testResults.onTestChanged(evt => {
            if (!followRunningTests) {
                return;
            }
            if (evt.reason !== 1) {
                return;
            }
            if (this.tree.selectionSize > 1) {
                return;
            }
            if (evt.item.ownComputedState !== 2 && !(evt.previousState === 1 && isStateWithResult(evt.item.ownComputedState))) {
                return;
            }
            this.revealById(evt.item.item.extId, alwaysRevealTestAfterStateChange, false);
        }));
        this._register(testResults.onResultsChanged(() => {
            this.tree.resort(null);
        }));
        this._register(this.testProfileService.onDidChange(() => {
            this.tree.rerender();
        }));
        const allOpenEditorInputs = observableFromEvent(this, editorService.onDidEditorsChange, () => new Set(editorGroupsService.groups.flatMap(g => g.editors).map(e => e.resource).filter(isDefined)));
        const activeResource = observableFromEvent(this, editorService.onDidActiveEditorChange, () => {
            if (editorService.activeEditor instanceof DiffEditorInput) {
                return editorService.activeEditor.primary.resource;
            }
            else {
                return editorService.activeEditor?.resource;
            }
        });
        const filterText = observableFromEvent(this.filterState.text.onDidChange, () => this.filterState.text);
        this._register(autorun(reader => {
            filterText.read(reader);
            if (this.filterState.isFilteringFor("@openedFiles")) {
                this.filter.filterToDocumentUri([...allOpenEditorInputs.read(reader)]);
            }
            else {
                this.filter.filterToDocumentUri([activeResource.read(reader)].filter(isDefined));
            }
            if (this.filterState.isFilteringFor("@doc") || this.filterState.isFilteringFor("@openedFiles")) {
                this.tree.refilter();
            }
        }));
        this._register(this.storageService.onWillSaveState(({ reason, }) => {
            if (reason === WillSaveStateReason.SHUTDOWN) {
                this.lastViewState.store(this.tree.getOptimizedViewState());
            }
        }));
    }
    layout(height, width) {
        this.tree.layout(height, width);
    }
    revealById(id, expand = true, focus = true) {
        if (!id) {
            this.hasPendingReveal = false;
            return;
        }
        const projection = this.ensureProjection();
        let expandToLevel = 0;
        const idPath = [...TestId.fromString(id).idsFromRoot()];
        for (let i = idPath.length - 1; i >= expandToLevel; i--) {
            const element = projection.getElementByTestId(idPath[i].toString());
            if (!element || !this.tree.hasElement(element)) {
                continue;
            }
            if (i < idPath.length - 1) {
                if (expand) {
                    this.tree.expand(element);
                    expandToLevel = i + 1;
                    i = idPath.length - 1;
                    continue;
                }
            }
            let focusTarget = element;
            for (let n = element; n instanceof TestItemTreeElement; n = n.parent) {
                if (n.test && this.testService.excluded.contains(n.test)) {
                    this.filterState.toggleFilteringFor("@hidden", true);
                    break;
                }
                if (!expand && (this.tree.hasElement(n) && this.tree.isCollapsed(n))) {
                    focusTarget = n;
                }
            }
            this.filterState.reveal.value = undefined;
            this.hasPendingReveal = false;
            if (focus) {
                this.tree.domFocus();
            }
            if (this.tree.getRelativeTop(focusTarget) === null) {
                this.tree.reveal(focusTarget, 0.5);
            }
            this.revealTimeout.value = disposableTimeout(() => {
                this.tree.setFocus([focusTarget]);
                this.tree.setSelection([focusTarget]);
            }, 1);
            return;
        }
        this.hasPendingReveal = true;
    }
    async collapseAll() {
        this.tree.collapseAll();
    }
    tryPeekError(item) {
        const lookup = item.test && this.testResults.getStateById(item.test.item.extId);
        return lookup && lookup[1].tasks.some(s => isFailedState(s.state))
            ? this.peekOpener.tryPeekFirstError(lookup[0], lookup[1], { preserveFocus: true })
            : false;
    }
    onContextMenu(evt) {
        const element = evt.element;
        if (!(element instanceof TestItemTreeElement)) {
            return;
        }
        const { actions } = getActionableElementActions(this.contextKeyService, this.menuService, this.testService, this.crService, this.testProfileService, element);
        this.contextMenuService.showContextMenu({
            getAnchor: () => evt.anchor,
            getActions: () => actions.secondary,
            getActionsContext: () => element,
            actionRunner: this.actionRunner,
        });
    }
    handleExecuteKeypress(evt) {
        const focused = this.tree.getFocus();
        const selected = this.tree.getSelection();
        let targeted;
        if (focused.length === 1 && selected.includes(focused[0])) {
            evt.browserEvent?.preventDefault();
            targeted = selected;
        }
        else {
            targeted = focused;
        }
        const toRun = targeted
            .filter((e) => e instanceof TestItemTreeElement);
        if (toRun.length) {
            this.testService.runTests({
                group: 2,
                tests: toRun.map(t => t.test),
            });
        }
    }
    reevaluateWelcomeState() {
        const shouldShowWelcome = this.testService.collection.busyProviders === 0 && testCollectionIsEmpty(this.testService.collection);
        const welcomeExperience = shouldShowWelcome
            ? (this.filterState.isFilteringFor("@doc") ? 2 : 1)
            : 0;
        if (welcomeExperience !== this.welcomeExperience) {
            this.welcomeExperience = welcomeExperience;
            this.welcomeVisibilityEmitter.fire(welcomeExperience);
        }
    }
    ensureProjection() {
        return this.projection.value ?? this.updatePreferredProjection();
    }
    updatePreferredProjection() {
        this.projection.clear();
        const lastState = this.lastViewState.get({});
        if (this._viewMode.get() === "list") {
            this.projection.value = this.instantiationService.createInstance(ListProjection, lastState);
        }
        else {
            this.projection.value = this.instantiationService.createInstance(TreeProjection, lastState);
        }
        const scheduler = this._register(new RunOnceScheduler(() => this.applyProjectionChanges(), 200));
        this.projection.value.onUpdate(() => {
            if (!scheduler.isScheduled()) {
                scheduler.schedule();
            }
        });
        this.applyProjectionChanges();
        return this.projection.value;
    }
    applyProjectionChanges() {
        this.reevaluateWelcomeState();
        this.projection.value?.applyTo(this.tree);
        this.tree.refilter();
        if (this.hasPendingReveal) {
            this.revealById(this.filterState.reveal.value);
        }
    }
    getSelectedTests() {
        return this.tree.getSelection();
    }
};
TestingExplorerViewModel = __decorate([
    __param(2, IConfigurationService),
    __param(3, IEditorService),
    __param(4, IEditorGroupsService),
    __param(5, IMenuService),
    __param(6, IContextMenuService),
    __param(7, ITestService),
    __param(8, ITestExplorerFilterState),
    __param(9, IInstantiationService),
    __param(10, IStorageService),
    __param(11, IContextKeyService),
    __param(12, ITestResultService),
    __param(13, ITestingPeekOpener),
    __param(14, ITestProfileService),
    __param(15, ITestingContinuousRunService),
    __param(16, ICommandService),
    __metadata("design:paramtypes", [HTMLElement, Function, Object, Object, Object, Object, Object, Object, TestExplorerFilterState, Object, Object, Object, Object, Object, Object, Object, Object])
], TestingExplorerViewModel);
const hasNodeInOrParentOfUri = (collection, ident, testUri, fromNode) => {
    const queue = [fromNode ? [fromNode] : collection.rootIds];
    while (queue.length) {
        for (const id of queue.pop()) {
            const node = collection.getNodeById(id);
            if (!node) {
                continue;
            }
            if (!node.item.uri || !ident.extUri.isEqualOrParent(testUri, node.item.uri)) {
                continue;
            }
            if (node.item.range || node.expand === 1) {
                return true;
            }
            queue.push(node.children);
        }
    }
    return false;
};
let TestsFilter = class TestsFilter {
    constructor(collection, state, testService, uriIdentityService) {
        this.collection = collection;
        this.state = state;
        this.testService = testService;
        this.uriIdentityService = uriIdentityService;
        this.documentUris = [];
    }
    filter(element) {
        if (element instanceof TestTreeErrorMessage) {
            return 1;
        }
        if (element.test
            && !this.state.isFilteringFor("@hidden")
            && this.testService.excluded.contains(element.test)) {
            return 0;
        }
        switch (Math.min(this.testFilterText(element), this.testLocation(element), this.testState(element), this.testTags(element))) {
            case 0:
                return 0;
            case 2:
                return 1;
            default:
                return 2;
        }
    }
    filterToDocumentUri(uris) {
        this.documentUris = [...uris];
    }
    testTags(element) {
        if (!this.state.includeTags.size && !this.state.excludeTags.size) {
            return 2;
        }
        return (this.state.includeTags.size ?
            element.test.item.tags.some(t => this.state.includeTags.has(t)) :
            true) && element.test.item.tags.every(t => !this.state.excludeTags.has(t))
            ? 2
            : 1;
    }
    testState(element) {
        if (this.state.isFilteringFor("@failed")) {
            return isFailedState(element.state) ? 2 : 1;
        }
        if (this.state.isFilteringFor("@executed")) {
            return element.state !== 0 ? 2 : 1;
        }
        return 2;
    }
    testLocation(element) {
        if (this.documentUris.length === 0) {
            return 2;
        }
        if ((!this.state.isFilteringFor("@doc") && !this.state.isFilteringFor("@openedFiles")) || !(element instanceof TestItemTreeElement)) {
            return 2;
        }
        if (this.documentUris.some(uri => hasNodeInOrParentOfUri(this.collection, this.uriIdentityService, uri, element.test.item.extId))) {
            return 2;
        }
        return 1;
    }
    testFilterText(element) {
        if (this.state.globList.length === 0) {
            return 2;
        }
        const fuzzy = this.state.fuzzy.value;
        for (let e = element; e; e = e.parent) {
            let included = this.state.globList[0].include === false ? 2 : 1;
            const data = e.test.item.label.toLowerCase();
            for (const { include, text } of this.state.globList) {
                if (fuzzy ? fuzzyContains(data, text) : data.includes(text)) {
                    included = include ? 2 : 0;
                }
            }
            if (included !== 1) {
                return included;
            }
        }
        return 1;
    }
};
TestsFilter = __decorate([
    __param(1, ITestExplorerFilterState),
    __param(2, ITestService),
    __param(3, IUriIdentityService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], TestsFilter);
class TreeSorter {
    constructor(viewModel) {
        this.viewModel = viewModel;
    }
    compare(a, b) {
        if (a instanceof TestTreeErrorMessage || b instanceof TestTreeErrorMessage) {
            return (a instanceof TestTreeErrorMessage ? -1 : 0) + (b instanceof TestTreeErrorMessage ? 1 : 0);
        }
        const durationDelta = (b.duration || 0) - (a.duration || 0);
        if (this.viewModel.viewSorting === "duration" && durationDelta !== 0) {
            return durationDelta;
        }
        const stateDelta = cmpPriority(a.state, b.state);
        if (this.viewModel.viewSorting === "status" && stateDelta !== 0) {
            return stateDelta;
        }
        let inSameLocation = false;
        if (a instanceof TestItemTreeElement && b instanceof TestItemTreeElement && a.test.item.uri && b.test.item.uri && a.test.item.uri.toString() === b.test.item.uri.toString() && a.test.item.range && b.test.item.range) {
            inSameLocation = true;
            const delta = a.test.item.range.startLineNumber - b.test.item.range.startLineNumber;
            if (delta !== 0) {
                return delta;
            }
        }
        const sa = a.test.item.sortText;
        const sb = b.test.item.sortText;
        return inSameLocation && !sa && !sb ? 0 : (sa || a.test.item.label).localeCompare(sb || b.test.item.label);
    }
}
let NoTestsForDocumentWidget = class NoTestsForDocumentWidget extends Disposable {
    constructor(container, filterState) {
        super();
        const el = this.el = dom.append(container, dom.$('.testing-no-test-placeholder'));
        const emptyParagraph = dom.append(el, dom.$('p'));
        emptyParagraph.innerText = localize('testingNoTest', 'No tests were found in this file.');
        const buttonLabel = localize('testingFindExtension', 'Show Workspace Tests');
        const button = this._register(new Button(el, { title: buttonLabel, ...defaultButtonStyles }));
        button.label = buttonLabel;
        this._register(button.onDidClick(() => filterState.toggleFilteringFor("@doc", false)));
    }
    setVisible(isVisible) {
        this.el.classList.toggle('visible', isVisible);
    }
};
NoTestsForDocumentWidget = __decorate([
    __param(1, ITestExplorerFilterState),
    __metadata("design:paramtypes", [HTMLElement, Object])
], NoTestsForDocumentWidget);
class TestExplorerActionRunner extends ActionRunner {
    constructor(getSelectedTests) {
        super();
        this.getSelectedTests = getSelectedTests;
    }
    async runAction(action, context) {
        if (!(action instanceof MenuItemAction)) {
            return super.runAction(action, context);
        }
        const selection = this.getSelectedTests();
        const contextIsSelected = selection.some(s => s === context);
        const actualContext = contextIsSelected ? selection : [context];
        const actionable = actualContext.filter((t) => t instanceof TestItemTreeElement);
        await action.run(...actionable);
    }
}
const getLabelForTestTreeElement = (element) => {
    let label = labelForTestInState(element.description || element.test.item.label, element.state);
    if (element instanceof TestItemTreeElement) {
        if (element.duration !== undefined) {
            label = localize({
                key: 'testing.treeElementLabelDuration',
                comment: ['{0} is the original label in testing.treeElementLabel, {1} is a duration'],
            }, '{0}, in {1}', label, formatDuration(element.duration));
        }
        if (element.retired) {
            label = localize({
                key: 'testing.treeElementLabelOutdated',
                comment: ['{0} is the original label in testing.treeElementLabel'],
            }, '{0}, outdated result', label);
        }
    }
    return label;
};
class ListAccessibilityProvider {
    getWidgetAriaLabel() {
        return localize('testExplorer', "Test Explorer");
    }
    getAriaLabel(element) {
        return element instanceof TestTreeErrorMessage
            ? element.description
            : getLabelForTestTreeElement(element);
    }
}
class TreeKeyboardNavigationLabelProvider {
    getKeyboardNavigationLabel(element) {
        return element instanceof TestTreeErrorMessage ? element.message : element.test.item.label;
    }
}
class ListDelegate {
    getHeight(element) {
        return element instanceof TestTreeErrorMessage ? 17 + 10 : 22;
    }
    getTemplateId(element) {
        if (element instanceof TestTreeErrorMessage) {
            return ErrorRenderer.ID;
        }
        return TestItemRenderer.ID;
    }
}
class IdentityProvider {
    getId(element) {
        return element.treeId;
    }
}
let ErrorRenderer = class ErrorRenderer {
    static { ErrorRenderer_1 = this; }
    static { this.ID = 'error'; }
    constructor(hoverService, instantionService) {
        this.hoverService = hoverService;
        this.renderer = instantionService.createInstance(MarkdownRenderer, {});
    }
    get templateId() {
        return ErrorRenderer_1.ID;
    }
    renderTemplate(container) {
        const label = dom.append(container, dom.$('.error'));
        return { label, disposable: new DisposableStore() };
    }
    renderElement({ element }, _, data) {
        dom.clearNode(data.label);
        if (typeof element.message === 'string') {
            data.label.innerText = element.message;
        }
        else {
            const result = this.renderer.render(element.message, { inline: true });
            data.label.appendChild(result.element);
        }
        data.disposable.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate('mouse'), data.label, element.description));
    }
    disposeTemplate(data) {
        data.disposable.dispose();
    }
};
ErrorRenderer = ErrorRenderer_1 = __decorate([
    __param(0, IHoverService),
    __param(1, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object])
], ErrorRenderer);
let TestItemRenderer = class TestItemRenderer extends Disposable {
    static { TestItemRenderer_1 = this; }
    static { this.ID = 'testItem'; }
    constructor(actionRunner, menuService, testService, profiles, contextKeyService, instantiationService, crService, hoverService) {
        super();
        this.actionRunner = actionRunner;
        this.menuService = menuService;
        this.testService = testService;
        this.profiles = profiles;
        this.contextKeyService = contextKeyService;
        this.instantiationService = instantiationService;
        this.crService = crService;
        this.hoverService = hoverService;
        this.templateId = TestItemRenderer_1.ID;
    }
    renderTemplate(container) {
        const wrapper = dom.append(container, dom.$('.test-item'));
        const icon = dom.append(wrapper, dom.$('.computed-state'));
        const label = dom.append(wrapper, dom.$('.label'));
        const disposable = new DisposableStore();
        dom.append(wrapper, dom.$(ThemeIcon.asCSSSelector(icons.testingHiddenIcon)));
        const actionBar = disposable.add(new ActionBar(wrapper, {
            actionRunner: this.actionRunner,
            actionViewItemProvider: (action, options) => action instanceof MenuItemAction
                ? this.instantiationService.createInstance(MenuEntryActionViewItem, action, { hoverDelegate: options.hoverDelegate })
                : undefined
        }));
        disposable.add(this.crService.onDidChange(changed => {
            const id = templateData.current?.test.item.extId;
            if (id && (!changed || changed === id || TestId.isChild(id, changed))) {
                this.fillActionBar(templateData.current, templateData);
            }
        }));
        const templateData = { wrapper, label, actionBar, icon, elementDisposable: new DisposableStore(), templateDisposable: disposable };
        return templateData;
    }
    disposeTemplate(templateData) {
        templateData.templateDisposable.clear();
    }
    disposeElement(_element, _, templateData) {
        templateData.elementDisposable.clear();
    }
    fillActionBar(element, data) {
        const { actions, contextOverlay } = getActionableElementActions(this.contextKeyService, this.menuService, this.testService, this.crService, this.profiles, element);
        const crSelf = !!contextOverlay.getContextKeyValue(TestingContextKeys.isContinuousModeOn.key);
        const crChild = !crSelf && this.crService.isEnabledForAChildOf(element.test.item.extId);
        data.actionBar.domNode.classList.toggle('testing-is-continuous-run', crSelf || crChild);
        data.actionBar.clear();
        data.actionBar.context = element;
        data.actionBar.push(actions.primary, { icon: true, label: false });
    }
    renderElement(node, _depth, data) {
        data.elementDisposable.clear();
        data.current = node.element;
        this.fillActionBar(node.element, data);
        data.elementDisposable.add(node.element.onChange(() => this._renderElement(node, data)));
        this._renderElement(node, data);
    }
    _renderElement(node, data) {
        const testHidden = this.testService.excluded.contains(node.element.test);
        data.wrapper.classList.toggle('test-is-hidden', testHidden);
        const icon = icons.testingStatesToIcons.get(node.element.test.expand === 2 || node.element.test.item.busy
            ? 2
            : node.element.state);
        data.icon.className = 'computed-state ' + (icon ? ThemeIcon.asClassName(icon) : '');
        if (node.element.retired) {
            data.icon.className += ' retired';
        }
        data.elementDisposable.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate('mouse'), data.label, getLabelForTestTreeElement(node.element)));
        if (node.element.test.item.label.trim()) {
            dom.reset(data.label, ...renderLabelWithIcons(node.element.test.item.label));
        }
        else {
            data.label.textContent = String.fromCharCode(0xA0);
        }
        let description = node.element.description;
        if (node.element.duration !== undefined) {
            description = description
                ? `${description}: ${formatDuration(node.element.duration)}`
                : formatDuration(node.element.duration);
        }
        if (description) {
            dom.append(data.label, dom.$('span.test-label-description', {}, description));
        }
    }
};
TestItemRenderer = TestItemRenderer_1 = __decorate([
    __param(1, IMenuService),
    __param(2, ITestService),
    __param(3, ITestProfileService),
    __param(4, IContextKeyService),
    __param(5, IInstantiationService),
    __param(6, ITestingContinuousRunService),
    __param(7, IHoverService),
    __metadata("design:paramtypes", [TestExplorerActionRunner, Object, Object, Object, Object, Object, Object, Object])
], TestItemRenderer);
const formatDuration = (ms) => {
    if (ms < 10) {
        return `${ms.toFixed(1)}ms`;
    }
    if (ms < 1_000) {
        return `${ms.toFixed(0)}ms`;
    }
    return `${(ms / 1000).toFixed(1)}s`;
};
const getActionableElementActions = (contextKeyService, menuService, testService, crService, profiles, element) => {
    const test = element instanceof TestItemTreeElement ? element.test : undefined;
    const contextKeys = getTestItemContextOverlay(test, test ? profiles.capabilitiesForTest(test.item) : 0);
    contextKeys.push(['view', "workbench.view.testing"]);
    if (test) {
        const ctrl = testService.getTestController(test.controllerId);
        const supportsCr = !!ctrl && profiles.getControllerProfiles(ctrl.id).some(p => p.supportsContinuousRun);
        contextKeys.push([
            TestingContextKeys.canRefreshTests.key,
            ctrl && !!(ctrl.capabilities.get() & 2) && TestId.isRoot(test.item.extId),
        ], [
            TestingContextKeys.testItemIsHidden.key,
            testService.excluded.contains(test)
        ], [
            TestingContextKeys.isContinuousModeOn.key,
            supportsCr && crService.isSpecificallyEnabledFor(test.item.extId)
        ], [
            TestingContextKeys.isParentRunningContinuously.key,
            supportsCr && crService.isEnabledForAParentOf(test.item.extId)
        ], [
            TestingContextKeys.supportsContinuousRun.key,
            supportsCr,
        ]);
    }
    const contextOverlay = contextKeyService.createOverlay(contextKeys);
    const menu = menuService.getMenuActions(MenuId.TestItem, contextOverlay, {
        shouldForwardArgs: true,
    });
    const primary = [];
    const secondary = [];
    const result = { primary, secondary };
    createAndFillInActionBarActions(menu, result, 'inline');
    return { actions: result, contextOverlay };
};
registerThemingParticipant((theme, collector) => {
    if (theme.type === 'dark') {
        const foregroundColor = theme.getColor(foreground);
        if (foregroundColor) {
            const fgWithOpacity = new Color(new RGBA(foregroundColor.rgba.r, foregroundColor.rgba.g, foregroundColor.rgba.b, 0.65));
            collector.addRule(`.test-explorer .test-explorer-messages { color: ${fgWithOpacity}; }`);
        }
    }
});
