import { distinct } from '../../../../base/common/arrays.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { Iterable } from '../../../../base/common/iterator.js';
import { KeyChord } from '../../../../base/common/keyCodes.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { isDefined } from '../../../../base/common/types.js';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.js';
import { EmbeddedCodeEditorWidget } from '../../../../editor/browser/widget/codeEditor/embeddedCodeEditorWidget.js';
import { Position } from '../../../../editor/common/core/position.js';
import { Range } from '../../../../editor/common/core/range.js';
import { EditorContextKeys } from '../../../../editor/common/editorContextKeys.js';
import { SymbolNavigationAction } from '../../../../editor/contrib/gotoSymbol/browser/goToCommands.js';
import { ReferencesModel } from '../../../../editor/contrib/gotoSymbol/browser/referencesModel.js';
import { MessageController } from '../../../../editor/contrib/message/browser/messageController.js';
import { PeekContext } from '../../../../editor/contrib/peekView/browser/peekView.js';
import { localize, localize2 } from '../../../../nls.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { Action2, MenuId } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ContextKeyExpr, ContextKeyGreaterExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { INotificationService, Severity } from '../../../../platform/notification/common/notification.js';
import { IProgressService } from '../../../../platform/progress/common/progress.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { widgetClose } from '../../../../platform/theme/common/iconRegistry.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { ViewAction } from '../../../browser/parts/views/viewPane.js';
import { FocusedViewContext } from '../../../common/contextkeys.js';
import { IExtensionsWorkbenchService } from '../../extensions/common/extensions.js';
import { TestItemTreeElement } from './explorerProjections/index.js';
import * as icons from './icons.js';
import { getTestingConfiguration } from '../common/configuration.js';
import { testConfigurationGroupNames } from '../common/constants.js';
import { ITestCoverageService } from '../common/testCoverageService.js';
import { TestId } from '../common/testId.js';
import { ITestProfileService, canUseProfileWithTest } from '../common/testProfileService.js';
import { ITestResultService } from '../common/testResultService.js';
import { ITestService, expandAndGetTestById, testsInFile, testsUnderUri } from '../common/testService.js';
import { TestingContextKeys } from '../common/testingContextKeys.js';
import { ITestingContinuousRunService } from '../common/testingContinuousRunService.js';
import { ITestingPeekOpener } from '../common/testingPeekOpener.js';
import { isFailedState } from '../common/testingStates.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
const category = Categories.Test;
const hasAnyTestProvider = ContextKeyGreaterExpr.create(TestingContextKeys.providerCount.key, 0);
const LABEL_RUN_TESTS = localize2('runSelectedTests', "Run Tests");
const LABEL_DEBUG_TESTS = localize2('debugSelectedTests', "Debug Tests");
const LABEL_COVERAGE_TESTS = localize2('coverageSelectedTests', "Run Tests with Coverage");
export class HideTestAction extends Action2 {
    constructor() {
        super({
            id: "testing.hideTest",
            title: localize2('hideTest', 'Hide Test'),
            menu: {
                id: MenuId.TestItem,
                group: 'builtin@2',
                when: TestingContextKeys.testItemIsHidden.isEqualTo(false)
            },
        });
    }
    run(accessor, ...elements) {
        const service = accessor.get(ITestService);
        for (const element of elements) {
            service.excluded.toggle(element.test, true);
        }
        return Promise.resolve();
    }
}
export class UnhideTestAction extends Action2 {
    constructor() {
        super({
            id: "testing.unhideTest",
            title: localize2('unhideTest', 'Unhide Test'),
            menu: {
                id: MenuId.TestItem,
                order: 21,
                when: TestingContextKeys.testItemIsHidden.isEqualTo(true)
            },
        });
    }
    run(accessor, ...elements) {
        const service = accessor.get(ITestService);
        for (const element of elements) {
            if (element instanceof TestItemTreeElement) {
                service.excluded.toggle(element.test, false);
            }
        }
        return Promise.resolve();
    }
}
export class UnhideAllTestsAction extends Action2 {
    constructor() {
        super({
            id: "testing.unhideAllTests",
            title: localize2('unhideAllTests', 'Unhide All Tests'),
        });
    }
    run(accessor) {
        const service = accessor.get(ITestService);
        service.excluded.clear();
        return Promise.resolve();
    }
}
const testItemInlineAndInContext = (order, when) => [
    {
        id: MenuId.TestItem,
        group: 'inline',
        order,
        when,
    }, {
        id: MenuId.TestItem,
        group: 'builtin@1',
        order,
        when,
    }
];
class RunVisibleAction extends ViewAction {
    constructor(bitset, desc) {
        super({
            ...desc,
            viewId: "workbench.view.testing",
        });
        this.bitset = bitset;
    }
    runInView(accessor, view, ...elements) {
        const { include, exclude } = view.getTreeIncludeExclude(elements.map(e => e.test));
        return accessor.get(ITestService).runTests({
            tests: include,
            exclude,
            group: this.bitset,
        });
    }
}
export class DebugAction extends RunVisibleAction {
    constructor() {
        super(4, {
            id: "testing.debug",
            title: localize2('debug test', 'Debug Test'),
            icon: icons.testingDebugIcon,
            menu: testItemInlineAndInContext(12, TestingContextKeys.hasDebuggableTests.isEqualTo(true)),
        });
    }
}
export class CoverageAction extends RunVisibleAction {
    constructor() {
        super(8, {
            id: "testing.coverage",
            title: localize2('run with cover test', 'Run Test with Coverage'),
            icon: icons.testingCoverageIcon,
            menu: testItemInlineAndInContext(13, TestingContextKeys.hasCoverableTests.isEqualTo(true)),
        });
    }
}
export class RunUsingProfileAction extends Action2 {
    constructor() {
        super({
            id: "testing.runUsing",
            title: localize2('testing.runUsing', 'Execute Using Profile...'),
            icon: icons.testingDebugIcon,
            menu: {
                id: MenuId.TestItem,
                order: 15,
                group: 'builtin@2',
                when: TestingContextKeys.hasNonDefaultProfile.isEqualTo(true),
            },
        });
    }
    async run(acessor, ...elements) {
        const commandService = acessor.get(ICommandService);
        const testService = acessor.get(ITestService);
        const profile = await commandService.executeCommand('vscode.pickTestProfile', {
            onlyForTest: elements[0].test,
        });
        if (!profile) {
            return;
        }
        testService.runResolvedTests({
            group: profile.group,
            targets: [{
                    profileId: profile.profileId,
                    controllerId: profile.controllerId,
                    testIds: elements.filter(t => canUseProfileWithTest(profile, t.test)).map(t => t.test.item.extId)
                }]
        });
    }
}
export class RunAction extends RunVisibleAction {
    constructor() {
        super(2, {
            id: "testing.run",
            title: localize2('run test', 'Run Test'),
            icon: icons.testingRunIcon,
            menu: testItemInlineAndInContext(11, TestingContextKeys.hasRunnableTests.isEqualTo(true)),
        });
    }
}
export class SelectDefaultTestProfiles extends Action2 {
    constructor() {
        super({
            id: "testing.selectDefaultTestProfiles",
            title: localize2('testing.selectDefaultTestProfiles', 'Select Default Profile'),
            icon: icons.testingUpdateProfiles,
            category,
        });
    }
    async run(acessor, onlyGroup) {
        const commands = acessor.get(ICommandService);
        const testProfileService = acessor.get(ITestProfileService);
        const profiles = await commands.executeCommand('vscode.pickMultipleTestProfiles', {
            showConfigureButtons: false,
            selected: testProfileService.getGroupDefaultProfiles(onlyGroup),
            onlyGroup,
        });
        if (profiles?.length) {
            testProfileService.setGroupDefaultProfiles(onlyGroup, profiles);
        }
    }
}
export class ContinuousRunTestAction extends Action2 {
    constructor() {
        super({
            id: "testing.toggleContinuousRunForTest",
            title: localize2('testing.toggleContinuousRunOn', 'Turn on Continuous Run'),
            icon: icons.testingTurnContinuousRunOn,
            precondition: ContextKeyExpr.or(TestingContextKeys.isContinuousModeOn.isEqualTo(true), TestingContextKeys.isParentRunningContinuously.isEqualTo(false)),
            toggled: {
                condition: TestingContextKeys.isContinuousModeOn.isEqualTo(true),
                icon: icons.testingContinuousIsOn,
                title: localize('testing.toggleContinuousRunOff', 'Turn off Continuous Run'),
            },
            menu: testItemInlineAndInContext(2147483647, TestingContextKeys.supportsContinuousRun.isEqualTo(true)),
        });
    }
    async run(accessor, ...elements) {
        const crService = accessor.get(ITestingContinuousRunService);
        for (const element of elements) {
            const id = element.test.item.extId;
            if (crService.isSpecificallyEnabledFor(id)) {
                crService.stop(id);
                continue;
            }
            crService.start(2, id);
        }
    }
}
export class ContinuousRunUsingProfileTestAction extends Action2 {
    constructor() {
        super({
            id: "testing.continuousRunUsingForTest",
            title: localize2('testing.startContinuousRunUsing', 'Start Continous Run Using...'),
            icon: icons.testingDebugIcon,
            menu: [
                {
                    id: MenuId.TestItem,
                    order: 14,
                    group: 'builtin@2',
                    when: ContextKeyExpr.and(TestingContextKeys.supportsContinuousRun.isEqualTo(true), TestingContextKeys.isContinuousModeOn.isEqualTo(false))
                }
            ],
        });
    }
    async run(accessor, ...elements) {
        const crService = accessor.get(ITestingContinuousRunService);
        const profileService = accessor.get(ITestProfileService);
        const notificationService = accessor.get(INotificationService);
        const quickInputService = accessor.get(IQuickInputService);
        for (const element of elements) {
            const selected = await selectContinuousRunProfiles(crService, notificationService, quickInputService, [{ profiles: profileService.getControllerProfiles(element.test.controllerId) }]);
            if (selected.length) {
                crService.start(selected, element.test.item.extId);
            }
        }
    }
}
export class ConfigureTestProfilesAction extends Action2 {
    constructor() {
        super({
            id: "testing.configureProfile",
            title: localize2('testing.configureProfile', "Configure Test Profiles"),
            icon: icons.testingUpdateProfiles,
            f1: true,
            category,
            menu: {
                id: MenuId.CommandPalette,
                when: TestingContextKeys.hasConfigurableProfile.isEqualTo(true),
            },
        });
    }
    async run(acessor, onlyGroup) {
        const commands = acessor.get(ICommandService);
        const testProfileService = acessor.get(ITestProfileService);
        const profile = await commands.executeCommand('vscode.pickTestProfile', {
            placeholder: localize('configureProfile', 'Select a profile to update'),
            showConfigureButtons: false,
            onlyConfigurable: true,
            onlyGroup,
        });
        if (profile) {
            testProfileService.configure(profile.controllerId, profile.profileId);
        }
    }
}
const continuousMenus = (whenIsContinuousOn) => [
    {
        id: MenuId.ViewTitle,
        group: 'navigation',
        order: 15,
        when: ContextKeyExpr.and(ContextKeyExpr.equals('view', "workbench.view.testing"), TestingContextKeys.supportsContinuousRun.isEqualTo(true), TestingContextKeys.isContinuousModeOn.isEqualTo(whenIsContinuousOn)),
    },
    {
        id: MenuId.CommandPalette,
        when: TestingContextKeys.supportsContinuousRun.isEqualTo(true),
    },
];
class StopContinuousRunAction extends Action2 {
    constructor() {
        super({
            id: "testing.stopContinuousRun",
            title: localize2('testing.stopContinuous', 'Stop Continuous Run'),
            category,
            icon: icons.testingTurnContinuousRunOff,
            menu: continuousMenus(true),
        });
    }
    run(accessor) {
        accessor.get(ITestingContinuousRunService).stop();
    }
}
function selectContinuousRunProfiles(crs, notificationService, quickInputService, profilesToPickFrom) {
    const items = [];
    for (const { controller, profiles } of profilesToPickFrom) {
        for (const profile of profiles) {
            if (profile.supportsContinuousRun) {
                items.push({
                    label: profile.label || controller?.label.get() || '',
                    description: controller?.label.get(),
                    profile,
                });
            }
        }
    }
    if (items.length === 0) {
        notificationService.info(localize('testing.noProfiles', 'No test continuous run-enabled profiles were found'));
        return Promise.resolve([]);
    }
    if (items.length === 1) {
        return Promise.resolve([items[0].profile]);
    }
    const qpItems = [];
    const selectedItems = [];
    const lastRun = crs.lastRunProfileIds;
    items.sort((a, b) => a.profile.group - b.profile.group
        || a.profile.controllerId.localeCompare(b.profile.controllerId)
        || a.label.localeCompare(b.label));
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (i === 0 || items[i - 1].profile.group !== item.profile.group) {
            qpItems.push({ type: 'separator', label: testConfigurationGroupNames[item.profile.group] });
        }
        qpItems.push(item);
        if (lastRun.has(item.profile.profileId)) {
            selectedItems.push(item);
        }
    }
    const disposables = new DisposableStore();
    const quickpick = disposables.add(quickInputService.createQuickPick({ useSeparators: true }));
    quickpick.title = localize('testing.selectContinuousProfiles', 'Select profiles to run when files change:');
    quickpick.canSelectMany = true;
    quickpick.items = qpItems;
    quickpick.selectedItems = selectedItems;
    quickpick.show();
    return new Promise(resolve => {
        disposables.add(quickpick.onDidAccept(() => {
            resolve(quickpick.selectedItems.map(i => i.profile));
            disposables.dispose();
        }));
        disposables.add(quickpick.onDidHide(() => {
            resolve([]);
            disposables.dispose();
        }));
    });
}
class StartContinuousRunAction extends Action2 {
    constructor() {
        super({
            id: "testing.startContinuousRun",
            title: localize2('testing.startContinuous', "Start Continuous Run"),
            category,
            icon: icons.testingTurnContinuousRunOn,
            menu: continuousMenus(false),
        });
    }
    async run(accessor, ...args) {
        const crs = accessor.get(ITestingContinuousRunService);
        const selected = await selectContinuousRunProfiles(crs, accessor.get(INotificationService), accessor.get(IQuickInputService), accessor.get(ITestProfileService).all());
        if (selected.length) {
            crs.start(selected);
        }
    }
}
class ExecuteSelectedAction extends ViewAction {
    constructor(options, group) {
        super({
            ...options,
            menu: [{
                    id: MenuId.ViewTitle,
                    order: group === 2
                        ? 11
                        : group === 4
                            ? 12
                            : 13,
                    group: 'navigation',
                    when: ContextKeyExpr.and(ContextKeyExpr.equals('view', "workbench.view.testing"), TestingContextKeys.isRunning.isEqualTo(false), TestingContextKeys.capabilityToContextKey[group].isEqualTo(true))
                }],
            category,
            viewId: "workbench.view.testing",
        });
        this.group = group;
    }
    runInView(accessor, view) {
        const { include, exclude } = view.getTreeIncludeExclude();
        return accessor.get(ITestService).runTests({ tests: include, exclude, group: this.group });
    }
}
export class GetSelectedProfiles extends Action2 {
    constructor() {
        super({ id: "testing.getSelectedProfiles", title: localize2('getSelectedProfiles', 'Get Selected Profiles') });
    }
    run(accessor) {
        const profiles = accessor.get(ITestProfileService);
        return [
            ...profiles.getGroupDefaultProfiles(2),
            ...profiles.getGroupDefaultProfiles(4),
            ...profiles.getGroupDefaultProfiles(8),
        ].map(p => ({
            controllerId: p.controllerId,
            label: p.label,
            kind: p.group & 8
                ? 3
                : p.group & 4
                    ? 2
                    : 1,
        }));
    }
}
export class GetExplorerSelection extends ViewAction {
    constructor() {
        super({ id: "_testing.getExplorerSelection", title: localize2('getExplorerSelection', 'Get Explorer Selection'), viewId: "workbench.view.testing" });
    }
    runInView(_accessor, view) {
        const { include, exclude } = view.getTreeIncludeExclude(undefined, undefined, 'selected');
        const mapper = (i) => i.item.extId;
        return { include: include.map(mapper), exclude: exclude.map(mapper) };
    }
}
export class RunSelectedAction extends ExecuteSelectedAction {
    constructor() {
        super({
            id: "testing.runSelected",
            title: LABEL_RUN_TESTS,
            icon: icons.testingRunAllIcon,
        }, 2);
    }
}
export class DebugSelectedAction extends ExecuteSelectedAction {
    constructor() {
        super({
            id: "testing.debugSelected",
            title: LABEL_DEBUG_TESTS,
            icon: icons.testingDebugAllIcon,
        }, 4);
    }
}
export class CoverageSelectedAction extends ExecuteSelectedAction {
    constructor() {
        super({
            id: "testing.coverageSelected",
            title: LABEL_COVERAGE_TESTS,
            icon: icons.testingCoverageAllIcon,
        }, 8);
    }
}
const showDiscoveringWhile = (progress, task) => {
    return progress.withProgress({
        location: 10,
        title: localize('discoveringTests', 'Discovering Tests'),
    }, () => task);
};
class RunOrDebugAllTestsAction extends Action2 {
    constructor(options, group, noTestsFoundError) {
        super({
            ...options,
            category,
            menu: [{
                    id: MenuId.CommandPalette,
                    when: TestingContextKeys.capabilityToContextKey[group].isEqualTo(true),
                }]
        });
        this.group = group;
        this.noTestsFoundError = noTestsFoundError;
    }
    async run(accessor) {
        const testService = accessor.get(ITestService);
        const notifications = accessor.get(INotificationService);
        const roots = [...testService.collection.rootItems].filter(r => r.children.size
            || r.expand === 1 || r.expand === 2);
        if (!roots.length) {
            notifications.info(this.noTestsFoundError);
            return;
        }
        await testService.runTests({ tests: roots, group: this.group });
    }
}
export class RunAllAction extends RunOrDebugAllTestsAction {
    constructor() {
        super({
            id: "testing.runAll",
            title: localize2('runAllTests', 'Run All Tests'),
            icon: icons.testingRunAllIcon,
            keybinding: {
                weight: 200,
                primary: KeyChord(2048 | 85, 31),
            },
        }, 2, localize('noTestProvider', 'No tests found in this workspace. You may need to install a test provider extension'));
    }
}
export class DebugAllAction extends RunOrDebugAllTestsAction {
    constructor() {
        super({
            id: "testing.debugAll",
            title: localize2('debugAllTests', 'Debug All Tests'),
            icon: icons.testingDebugIcon,
            keybinding: {
                weight: 200,
                primary: KeyChord(2048 | 85, 2048 | 31),
            },
        }, 4, localize('noDebugTestProvider', 'No debuggable tests found in this workspace. You may need to install a test provider extension'));
    }
}
export class CoverageAllAction extends RunOrDebugAllTestsAction {
    constructor() {
        super({
            id: "testing.coverageAll",
            title: localize2('runAllWithCoverage', 'Run All Tests with Coverage'),
            icon: icons.testingCoverageIcon,
            keybinding: {
                weight: 200,
                primary: KeyChord(2048 | 85, 2048 | 1024 | 31),
            },
        }, 8, localize('noCoverageTestProvider', 'No tests with coverage runners found in this workspace. You may need to install a test provider extension'));
    }
}
export class CancelTestRunAction extends Action2 {
    constructor() {
        super({
            id: "testing.cancelRun",
            title: localize2('testing.cancelRun', 'Cancel Test Run'),
            icon: icons.testingCancelIcon,
            keybinding: {
                weight: 200,
                primary: KeyChord(2048 | 85, 2048 | 54),
            },
            menu: [{
                    id: MenuId.ViewTitle,
                    order: 11,
                    group: 'navigation',
                    when: ContextKeyExpr.and(ContextKeyExpr.equals('view', "workbench.view.testing"), ContextKeyExpr.equals(TestingContextKeys.isRunning.serialize(), true))
                }]
        });
    }
    async run(accessor, resultId, taskId) {
        const resultService = accessor.get(ITestResultService);
        const testService = accessor.get(ITestService);
        if (resultId) {
            testService.cancelTestRun(resultId, taskId);
        }
        else {
            for (const run of resultService.results) {
                if (!run.completedAt) {
                    testService.cancelTestRun(run.id);
                }
            }
        }
    }
}
export class TestingViewAsListAction extends ViewAction {
    constructor() {
        super({
            id: "testing.viewAsList",
            viewId: "workbench.view.testing",
            title: localize2('testing.viewAsList', 'View as List'),
            toggled: TestingContextKeys.viewMode.isEqualTo("list"),
            menu: {
                id: MenuId.ViewTitle,
                order: 18,
                group: 'viewAs',
                when: ContextKeyExpr.equals('view', "workbench.view.testing")
            }
        });
    }
    runInView(_accessor, view) {
        view.viewModel.viewMode = "list";
    }
}
export class TestingViewAsTreeAction extends ViewAction {
    constructor() {
        super({
            id: "testing.viewAsTree",
            viewId: "workbench.view.testing",
            title: localize2('testing.viewAsTree', 'View as Tree'),
            toggled: TestingContextKeys.viewMode.isEqualTo("true"),
            menu: {
                id: MenuId.ViewTitle,
                order: 18,
                group: 'viewAs',
                when: ContextKeyExpr.equals('view', "workbench.view.testing")
            }
        });
    }
    runInView(_accessor, view) {
        view.viewModel.viewMode = "true";
    }
}
export class TestingSortByStatusAction extends ViewAction {
    constructor() {
        super({
            id: "testing.sortByStatus",
            viewId: "workbench.view.testing",
            title: localize2('testing.sortByStatus', 'Sort by Status'),
            toggled: TestingContextKeys.viewSorting.isEqualTo("status"),
            menu: {
                id: MenuId.ViewTitle,
                order: 19,
                group: 'sortBy',
                when: ContextKeyExpr.equals('view', "workbench.view.testing")
            }
        });
    }
    runInView(_accessor, view) {
        view.viewModel.viewSorting = "status";
    }
}
export class TestingSortByLocationAction extends ViewAction {
    constructor() {
        super({
            id: "testing.sortByLocation",
            viewId: "workbench.view.testing",
            title: localize2('testing.sortByLocation', 'Sort by Location'),
            toggled: TestingContextKeys.viewSorting.isEqualTo("location"),
            menu: {
                id: MenuId.ViewTitle,
                order: 19,
                group: 'sortBy',
                when: ContextKeyExpr.equals('view', "workbench.view.testing")
            }
        });
    }
    runInView(_accessor, view) {
        view.viewModel.viewSorting = "location";
    }
}
export class TestingSortByDurationAction extends ViewAction {
    constructor() {
        super({
            id: "testing.sortByDuration",
            viewId: "workbench.view.testing",
            title: localize2('testing.sortByDuration', 'Sort by Duration'),
            toggled: TestingContextKeys.viewSorting.isEqualTo("duration"),
            menu: {
                id: MenuId.ViewTitle,
                order: 19,
                group: 'sortBy',
                when: ContextKeyExpr.equals('view', "workbench.view.testing")
            }
        });
    }
    runInView(_accessor, view) {
        view.viewModel.viewSorting = "duration";
    }
}
export class ShowMostRecentOutputAction extends Action2 {
    constructor() {
        super({
            id: "testing.showMostRecentOutput",
            title: localize2('testing.showMostRecentOutput', 'Show Output'),
            category,
            icon: Codicon.terminal,
            keybinding: {
                weight: 200,
                primary: KeyChord(2048 | 85, 2048 | 45),
            },
            precondition: TestingContextKeys.hasAnyResults.isEqualTo(true),
            menu: [{
                    id: MenuId.ViewTitle,
                    order: 16,
                    group: 'navigation',
                    when: ContextKeyExpr.equals('view', "workbench.view.testing"),
                }, {
                    id: MenuId.CommandPalette,
                    when: TestingContextKeys.hasAnyResults.isEqualTo(true)
                }]
        });
    }
    async run(accessor) {
        const viewService = accessor.get(IViewsService);
        const testView = await viewService.openView("workbench.panel.testResults.view", true);
        testView?.showLatestRun();
    }
}
export class CollapseAllAction extends ViewAction {
    constructor() {
        super({
            id: "testing.collapseAll",
            viewId: "workbench.view.testing",
            title: localize2('testing.collapseAll', 'Collapse All Tests'),
            icon: Codicon.collapseAll,
            menu: {
                id: MenuId.ViewTitle,
                order: 16,
                group: 'displayAction',
                when: ContextKeyExpr.equals('view', "workbench.view.testing")
            }
        });
    }
    runInView(_accessor, view) {
        view.viewModel.collapseAll();
    }
}
export class ClearTestResultsAction extends Action2 {
    constructor() {
        super({
            id: "testing.clearTestResults",
            title: localize2('testing.clearResults', 'Clear All Results'),
            category,
            icon: Codicon.clearAll,
            menu: [{
                    id: MenuId.TestPeekTitle,
                }, {
                    id: MenuId.CommandPalette,
                    when: TestingContextKeys.hasAnyResults.isEqualTo(true),
                }, {
                    id: MenuId.ViewTitle,
                    order: 17,
                    group: 'displayAction',
                    when: ContextKeyExpr.equals('view', "workbench.view.testing")
                }, {
                    id: MenuId.ViewTitle,
                    order: 17,
                    group: 'navigation',
                    when: ContextKeyExpr.equals('view', "workbench.panel.testResults.view")
                }],
        });
    }
    run(accessor) {
        accessor.get(ITestResultService).clear();
    }
}
export class GoToTest extends Action2 {
    constructor() {
        super({
            id: "testing.editFocusedTest",
            title: localize2('testing.editFocusedTest', 'Go to Test'),
            icon: Codicon.goToFile,
            menu: testItemInlineAndInContext(20, TestingContextKeys.testItemHasUri.isEqualTo(true)),
            keybinding: {
                weight: 100 - 10,
                when: FocusedViewContext.isEqualTo("workbench.view.testing"),
                primary: 3 | 512,
            },
        });
    }
    async run(accessor, element, preserveFocus) {
        if (!element) {
            const view = accessor.get(IViewsService).getActiveViewWithId("workbench.view.testing");
            element = view?.focusedTreeElements[0];
        }
        if (element && element instanceof TestItemTreeElement) {
            accessor.get(ICommandService).executeCommand('vscode.revealTest', element.test.item.extId, preserveFocus);
        }
    }
}
async function getTestsAtCursor(testService, uriIdentityService, uri, position, filter) {
    let bestNodes = [];
    let bestRange;
    let bestNodesBefore = [];
    let bestRangeBefore;
    for await (const test of testsInFile(testService, uriIdentityService, uri)) {
        if (!test.item.range || filter?.(test) === false) {
            continue;
        }
        const irange = Range.lift(test.item.range);
        if (irange.containsPosition(position)) {
            if (bestRange && Range.equalsRange(test.item.range, bestRange)) {
                if (!bestNodes.some(b => TestId.isChild(b.item.extId, test.item.extId))) {
                    bestNodes.push(test);
                }
            }
            else {
                bestRange = irange;
                bestNodes = [test];
            }
        }
        else if (Position.isBefore(irange.getStartPosition(), position)) {
            if (!bestRangeBefore || bestRangeBefore.getStartPosition().isBefore(irange.getStartPosition())) {
                bestRangeBefore = irange;
                bestNodesBefore = [test];
            }
            else if (irange.equalsRange(bestRangeBefore) && !bestNodesBefore.some(b => TestId.isChild(b.item.extId, test.item.extId))) {
                bestNodesBefore.push(test);
            }
        }
    }
    return bestNodes.length ? bestNodes : bestNodesBefore;
}
class ExecuteTestAtCursor extends Action2 {
    constructor(options, group) {
        super({
            ...options,
            menu: [{
                    id: MenuId.CommandPalette,
                    when: hasAnyTestProvider,
                }, {
                    id: MenuId.EditorContext,
                    group: 'testing',
                    order: group === 2 ? 0 : 1,
                    when: ContextKeyExpr.and(TestingContextKeys.activeEditorHasTests, TestingContextKeys.capabilityToContextKey[group]),
                }]
        });
        this.group = group;
    }
    async run(accessor) {
        const codeEditorService = accessor.get(ICodeEditorService);
        const editorService = accessor.get(IEditorService);
        const activeEditorPane = editorService.activeEditorPane;
        let editor = codeEditorService.getActiveCodeEditor();
        if (!activeEditorPane || !editor) {
            return;
        }
        if (editor instanceof EmbeddedCodeEditorWidget) {
            editor = editor.getParentEditor();
        }
        const position = editor?.getPosition();
        const model = editor?.getModel();
        if (!position || !model || !('uri' in model)) {
            return;
        }
        const testService = accessor.get(ITestService);
        const profileService = accessor.get(ITestProfileService);
        const uriIdentityService = accessor.get(IUriIdentityService);
        const progressService = accessor.get(IProgressService);
        const configurationService = accessor.get(IConfigurationService);
        const saveBeforeTest = getTestingConfiguration(configurationService, "testing.saveBeforeTest");
        if (saveBeforeTest) {
            await editorService.save({ editor: activeEditorPane.input, groupId: activeEditorPane.group.id });
            await testService.syncTests();
        }
        const testsToRun = await showDiscoveringWhile(progressService, getTestsAtCursor(testService, uriIdentityService, model.uri, position, test => !!(profileService.capabilitiesForTest(test.item) & this.group)));
        if (testsToRun.length) {
            await testService.runTests({ group: this.group, tests: testsToRun });
            return;
        }
        const relatedTests = await testService.getTestsRelatedToCode(model.uri, position);
        if (relatedTests.length) {
            await testService.runTests({ group: this.group, tests: relatedTests });
            return;
        }
        if (editor) {
            MessageController.get(editor)?.showMessage(localize('noTestsAtCursor', "No tests found here"), position);
        }
    }
}
export class RunAtCursor extends ExecuteTestAtCursor {
    constructor() {
        super({
            id: "testing.runAtCursor",
            title: localize2('testing.runAtCursor', 'Run Test at Cursor'),
            category,
            keybinding: {
                weight: 200,
                when: EditorContextKeys.editorTextFocus,
                primary: KeyChord(2048 | 85, 33),
            },
        }, 2);
    }
}
export class DebugAtCursor extends ExecuteTestAtCursor {
    constructor() {
        super({
            id: "testing.debugAtCursor",
            title: localize2('testing.debugAtCursor', 'Debug Test at Cursor'),
            category,
            keybinding: {
                weight: 200,
                when: EditorContextKeys.editorTextFocus,
                primary: KeyChord(2048 | 85, 2048 | 33),
            },
        }, 4);
    }
}
export class CoverageAtCursor extends ExecuteTestAtCursor {
    constructor() {
        super({
            id: "testing.coverageAtCursor",
            title: localize2('testing.coverageAtCursor', 'Run Test at Cursor with Coverage'),
            category,
            keybinding: {
                weight: 200,
                when: EditorContextKeys.editorTextFocus,
                primary: KeyChord(2048 | 85, 2048 | 1024 | 33),
            },
        }, 8);
    }
}
class ExecuteTestsUnderUriAction extends Action2 {
    constructor(options, group) {
        super({
            ...options,
            menu: [{
                    id: MenuId.ExplorerContext,
                    when: TestingContextKeys.capabilityToContextKey[group].isEqualTo(true),
                    group: '6.5_testing',
                    order: (group === 2 ? 11 : 12) + 0.1,
                }],
        });
        this.group = group;
    }
    async run(accessor, uri) {
        const testService = accessor.get(ITestService);
        const notificationService = accessor.get(INotificationService);
        const tests = await Iterable.asyncToArray(testsUnderUri(testService, accessor.get(IUriIdentityService), uri));
        if (!tests.length) {
            notificationService.notify({ message: localize('noTests', 'No tests found in the selected file or folder'), severity: Severity.Info });
            return;
        }
        return testService.runTests({ tests, group: this.group });
    }
}
class RunTestsUnderUri extends ExecuteTestsUnderUriAction {
    constructor() {
        super({
            id: "testing.run.uri",
            title: LABEL_RUN_TESTS,
            category,
        }, 2);
    }
}
class DebugTestsUnderUri extends ExecuteTestsUnderUriAction {
    constructor() {
        super({
            id: "testing.debug.uri",
            title: LABEL_DEBUG_TESTS,
            category,
        }, 4);
    }
}
class CoverageTestsUnderUri extends ExecuteTestsUnderUriAction {
    constructor() {
        super({
            id: "testing.coverage.uri",
            title: LABEL_COVERAGE_TESTS,
            category,
        }, 8);
    }
}
class ExecuteTestsInCurrentFile extends Action2 {
    constructor(options, group) {
        super({
            ...options,
            menu: [{
                    id: MenuId.CommandPalette,
                    when: TestingContextKeys.capabilityToContextKey[group].isEqualTo(true),
                }, {
                    id: MenuId.EditorContext,
                    group: 'testing',
                    order: group === 2 ? 2 : 3,
                    when: ContextKeyExpr.and(TestingContextKeys.activeEditorHasTests, TestingContextKeys.capabilityToContextKey[group]),
                }],
        });
        this.group = group;
    }
    run(accessor) {
        let editor = accessor.get(ICodeEditorService).getActiveCodeEditor();
        if (!editor) {
            return;
        }
        if (editor instanceof EmbeddedCodeEditorWidget) {
            editor = editor.getParentEditor();
        }
        const position = editor?.getPosition();
        const model = editor?.getModel();
        if (!position || !model || !('uri' in model)) {
            return;
        }
        const testService = accessor.get(ITestService);
        const demandedUri = model.uri.toString();
        const queue = [testService.collection.rootIds];
        const discovered = [];
        while (queue.length) {
            for (const id of queue.pop()) {
                const node = testService.collection.getNodeById(id);
                if (node.item.uri?.toString() === demandedUri) {
                    discovered.push(node);
                }
                else {
                    queue.push(node.children);
                }
            }
        }
        if (discovered.length) {
            return testService.runTests({
                tests: discovered,
                group: this.group,
            });
        }
        if (editor) {
            MessageController.get(editor)?.showMessage(localize('noTestsInFile', "No tests found in this file"), position);
        }
        return undefined;
    }
}
export class RunCurrentFile extends ExecuteTestsInCurrentFile {
    constructor() {
        super({
            id: "testing.runCurrentFile",
            title: localize2('testing.runCurrentFile', 'Run Tests in Current File'),
            category,
            keybinding: {
                weight: 200,
                when: EditorContextKeys.editorTextFocus,
                primary: KeyChord(2048 | 85, 36),
            },
        }, 2);
    }
}
export class DebugCurrentFile extends ExecuteTestsInCurrentFile {
    constructor() {
        super({
            id: "testing.debugCurrentFile",
            title: localize2('testing.debugCurrentFile', 'Debug Tests in Current File'),
            category,
            keybinding: {
                weight: 200,
                when: EditorContextKeys.editorTextFocus,
                primary: KeyChord(2048 | 85, 2048 | 36),
            },
        }, 4);
    }
}
export class CoverageCurrentFile extends ExecuteTestsInCurrentFile {
    constructor() {
        super({
            id: "testing.coverageCurrentFile",
            title: localize2('testing.coverageCurrentFile', 'Run Tests with Coverage in Current File'),
            category,
            keybinding: {
                weight: 200,
                when: EditorContextKeys.editorTextFocus,
                primary: KeyChord(2048 | 85, 2048 | 1024 | 36),
            },
        }, 8);
    }
}
export const discoverAndRunTests = async (collection, progress, ids, runTests) => {
    const todo = Promise.all(ids.map(p => expandAndGetTestById(collection, p)));
    const tests = (await showDiscoveringWhile(progress, todo)).filter(isDefined);
    return tests.length ? await runTests(tests) : undefined;
};
class RunOrDebugExtsByPath extends Action2 {
    async run(accessor, ...args) {
        const testService = accessor.get(ITestService);
        await discoverAndRunTests(accessor.get(ITestService).collection, accessor.get(IProgressService), [...this.getTestExtIdsToRun(accessor, ...args)], tests => this.runTest(testService, tests));
    }
}
class RunOrDebugFailedTests extends RunOrDebugExtsByPath {
    constructor(options) {
        super({
            ...options,
            menu: {
                id: MenuId.CommandPalette,
                when: hasAnyTestProvider,
            },
        });
    }
    getTestExtIdsToRun(accessor) {
        const { results } = accessor.get(ITestResultService);
        const ids = new Set();
        for (let i = results.length - 1; i >= 0; i--) {
            const resultSet = results[i];
            for (const test of resultSet.tests) {
                if (isFailedState(test.ownComputedState)) {
                    ids.add(test.item.extId);
                }
                else {
                    ids.delete(test.item.extId);
                }
            }
        }
        return ids;
    }
}
class RunOrDebugLastRun extends Action2 {
    constructor(options) {
        super({
            ...options,
            menu: {
                id: MenuId.CommandPalette,
                when: ContextKeyExpr.and(hasAnyTestProvider, TestingContextKeys.hasAnyResults.isEqualTo(true)),
            },
        });
    }
    getLastTestRunRequest(accessor, runId) {
        const resultService = accessor.get(ITestResultService);
        const lastResult = runId ? resultService.results.find(r => r.id === runId) : resultService.results[0];
        return lastResult?.request;
    }
    async run(accessor, runId) {
        const resultService = accessor.get(ITestResultService);
        const lastResult = runId ? resultService.results.find(r => r.id === runId) : resultService.results[0];
        if (!lastResult) {
            return;
        }
        const req = lastResult.request;
        const testService = accessor.get(ITestService);
        const profileService = accessor.get(ITestProfileService);
        const profileExists = (t) => profileService.getControllerProfiles(t.controllerId).some(p => p.profileId === t.profileId);
        await discoverAndRunTests(testService.collection, accessor.get(IProgressService), req.targets.flatMap(t => t.testIds), tests => {
            if (this.getGroup() & req.group && req.targets.every(profileExists)) {
                return testService.runResolvedTests({
                    targets: req.targets,
                    group: req.group,
                    exclude: req.exclude,
                });
            }
            else {
                return testService.runTests({ tests, group: this.getGroup() });
            }
        });
    }
}
export class ReRunFailedTests extends RunOrDebugFailedTests {
    constructor() {
        super({
            id: "testing.reRunFailTests",
            title: localize2('testing.reRunFailTests', 'Rerun Failed Tests'),
            category,
            keybinding: {
                weight: 200,
                primary: KeyChord(2048 | 85, 35),
            },
        });
    }
    runTest(service, internalTests) {
        return service.runTests({
            group: 2,
            tests: internalTests,
        });
    }
}
export class DebugFailedTests extends RunOrDebugFailedTests {
    constructor() {
        super({
            id: "testing.debugFailTests",
            title: localize2('testing.debugFailTests', 'Debug Failed Tests'),
            category,
            keybinding: {
                weight: 200,
                primary: KeyChord(2048 | 85, 2048 | 35),
            },
        });
    }
    runTest(service, internalTests) {
        return service.runTests({
            group: 4,
            tests: internalTests,
        });
    }
}
export class ReRunLastRun extends RunOrDebugLastRun {
    constructor() {
        super({
            id: "testing.reRunLastRun",
            title: localize2('testing.reRunLastRun', 'Rerun Last Run'),
            category,
            keybinding: {
                weight: 200,
                primary: KeyChord(2048 | 85, 42),
            },
        });
    }
    getGroup() {
        return 2;
    }
}
export class DebugLastRun extends RunOrDebugLastRun {
    constructor() {
        super({
            id: "testing.debugLastRun",
            title: localize2('testing.debugLastRun', 'Debug Last Run'),
            category,
            keybinding: {
                weight: 200,
                primary: KeyChord(2048 | 85, 2048 | 42),
            },
        });
    }
    getGroup() {
        return 4;
    }
}
export class CoverageLastRun extends RunOrDebugLastRun {
    constructor() {
        super({
            id: "testing.coverageLastRun",
            title: localize2('testing.coverageLastRun', 'Rerun Last Run with Coverage'),
            category,
            keybinding: {
                weight: 200,
                primary: KeyChord(2048 | 85, 2048 | 1024 | 42),
            },
        });
    }
    getGroup() {
        return 8;
    }
}
export class SearchForTestExtension extends Action2 {
    constructor() {
        super({
            id: "testing.searchForTestExtension",
            title: localize2('testing.searchForTestExtension', 'Search for Test Extension'),
        });
    }
    async run(accessor) {
        accessor.get(IExtensionsWorkbenchService).openSearch('@category:"testing"');
    }
}
export class OpenOutputPeek extends Action2 {
    constructor() {
        super({
            id: "testing.openOutputPeek",
            title: localize2('testing.openOutputPeek', 'Peek Output'),
            category,
            keybinding: {
                weight: 200,
                primary: KeyChord(2048 | 85, 2048 | 43),
            },
            menu: {
                id: MenuId.CommandPalette,
                when: TestingContextKeys.hasAnyResults.isEqualTo(true),
            },
        });
    }
    async run(accessor) {
        accessor.get(ITestingPeekOpener).open();
    }
}
export class ToggleInlineTestOutput extends Action2 {
    constructor() {
        super({
            id: "testing.toggleInlineTestOutput",
            title: localize2('testing.toggleInlineTestOutput', 'Toggle Inline Test Output'),
            category,
            keybinding: {
                weight: 200,
                primary: KeyChord(2048 | 85, 2048 | 39),
            },
            menu: {
                id: MenuId.CommandPalette,
                when: TestingContextKeys.hasAnyResults.isEqualTo(true),
            },
        });
    }
    async run(accessor) {
        const testService = accessor.get(ITestService);
        testService.showInlineOutput.value = !testService.showInlineOutput.value;
    }
}
const refreshMenus = (whenIsRefreshing) => [
    {
        id: MenuId.TestItem,
        group: 'inline',
        order: 10,
        when: ContextKeyExpr.and(TestingContextKeys.canRefreshTests.isEqualTo(true), TestingContextKeys.isRefreshingTests.isEqualTo(whenIsRefreshing)),
    },
    {
        id: MenuId.ViewTitle,
        group: 'navigation',
        order: 10,
        when: ContextKeyExpr.and(ContextKeyExpr.equals('view', "workbench.view.testing"), TestingContextKeys.canRefreshTests.isEqualTo(true), TestingContextKeys.isRefreshingTests.isEqualTo(whenIsRefreshing)),
    },
    {
        id: MenuId.CommandPalette,
        when: TestingContextKeys.canRefreshTests.isEqualTo(true),
    },
];
export class RefreshTestsAction extends Action2 {
    constructor() {
        super({
            id: "testing.refreshTests",
            title: localize2('testing.refreshTests', 'Refresh Tests'),
            category,
            icon: icons.testingRefreshTests,
            keybinding: {
                weight: 200,
                primary: KeyChord(2048 | 85, 2048 | 48),
                when: TestingContextKeys.canRefreshTests.isEqualTo(true),
            },
            menu: refreshMenus(false),
        });
    }
    async run(accessor, ...elements) {
        const testService = accessor.get(ITestService);
        const progressService = accessor.get(IProgressService);
        const controllerIds = distinct(elements.filter(isDefined).map(e => e.test.controllerId));
        return progressService.withProgress({ location: "workbench.view.extension.test" }, async () => {
            if (controllerIds.length) {
                await Promise.all(controllerIds.map(id => testService.refreshTests(id)));
            }
            else {
                await testService.refreshTests();
            }
        });
    }
}
export class CancelTestRefreshAction extends Action2 {
    constructor() {
        super({
            id: "testing.cancelTestRefresh",
            title: localize2('testing.cancelTestRefresh', 'Cancel Test Refresh'),
            category,
            icon: icons.testingCancelRefreshTests,
            menu: refreshMenus(true),
        });
    }
    async run(accessor) {
        accessor.get(ITestService).cancelRefreshTests();
    }
}
export class CleareCoverage extends Action2 {
    constructor() {
        super({
            id: "testing.coverage.close",
            title: localize2('testing.clearCoverage', 'Clear Coverage'),
            icon: widgetClose,
            category,
            menu: [{
                    id: MenuId.ViewTitle,
                    group: 'navigation',
                    order: 10,
                    when: ContextKeyExpr.equals('view', "workbench.view.testCoverage")
                }, {
                    id: MenuId.CommandPalette,
                    when: TestingContextKeys.isTestCoverageOpen.isEqualTo(true),
                }]
        });
    }
    run(accessor) {
        accessor.get(ITestCoverageService).closeCoverage();
    }
}
export class OpenCoverage extends Action2 {
    constructor() {
        super({
            id: "testing.openCoverage",
            title: localize2('testing.openCoverage', 'Open Coverage'),
            category,
            menu: [{
                    id: MenuId.CommandPalette,
                    when: TestingContextKeys.hasAnyResults.isEqualTo(true),
                }]
        });
    }
    run(accessor) {
        const results = accessor.get(ITestResultService).results;
        const task = results.length && results[0].tasks.find(r => r.coverage);
        if (!task) {
            const notificationService = accessor.get(INotificationService);
            notificationService.info(localize('testing.noCoverage', 'No coverage information available on the last test run.'));
            return;
        }
        accessor.get(ITestCoverageService).openCoverage(task, true);
    }
}
class TestNavigationAction extends SymbolNavigationAction {
    runEditorCommand(accessor, editor, ...args) {
        this.testService = accessor.get(ITestService);
        this.uriIdentityService = accessor.get(IUriIdentityService);
        return super.runEditorCommand(accessor, editor, ...args);
    }
    _getAlternativeCommand(editor) {
        return editor.getOption(60).alternativeTestsCommand;
    }
    _getGoToPreference(editor) {
        return editor.getOption(60).multipleTests || 'peek';
    }
}
class GoToRelatedTestAction extends TestNavigationAction {
    async _getLocationModel(_languageFeaturesService, model, position, token) {
        const tests = await this.testService.getTestsRelatedToCode(model.uri, position, token);
        return new ReferencesModel(tests.map(t => t.item.uri && ({ uri: t.item.uri, range: t.item.range || new Range(1, 1, 1, 1) })).filter(isDefined), localize('relatedTests', 'Related Tests'));
    }
    _getNoResultFoundMessage() {
        return localize('noTestFound', 'No related tests found.');
    }
}
class GoToRelatedTest extends GoToRelatedTestAction {
    constructor() {
        super({
            openToSide: false,
            openInPeek: false,
            muteMessage: false
        }, {
            id: "testing.goToRelatedTest",
            title: localize2('testing.goToRelatedTest', 'Go to Related Test'),
            category,
            precondition: ContextKeyExpr.and(ContextKeyExpr.not(TestingContextKeys.activeEditorHasTests.key), TestingContextKeys.canGoToRelatedTest),
            menu: [{
                    id: MenuId.EditorContext,
                    group: 'testing',
                    order: 4,
                }]
        });
    }
}
class PeekRelatedTest extends GoToRelatedTestAction {
    constructor() {
        super({
            openToSide: false,
            openInPeek: true,
            muteMessage: false
        }, {
            id: "testing.peekRelatedTest",
            title: localize2('testing.peekToRelatedTest', 'Peek Related Test'),
            category,
            precondition: ContextKeyExpr.and(TestingContextKeys.canGoToRelatedTest, ContextKeyExpr.not(TestingContextKeys.activeEditorHasTests.key), PeekContext.notInPeekEditor, EditorContextKeys.isInEmbeddedEditor.toNegated()),
            menu: [{
                    id: MenuId.EditorContext,
                    group: 'testing',
                    order: 5,
                }]
        });
    }
}
class GoToRelatedCodeAction extends TestNavigationAction {
    async _getLocationModel(_languageFeaturesService, model, position, token) {
        const testsAtCursor = await getTestsAtCursor(this.testService, this.uriIdentityService, model.uri, position);
        const code = await Promise.all(testsAtCursor.map(t => this.testService.getCodeRelatedToTest(t)));
        return new ReferencesModel(code.flat(), localize('relatedCode', 'Related Code'));
    }
    _getNoResultFoundMessage() {
        return localize('noRelatedCode', 'No related code found.');
    }
}
class GoToRelatedCode extends GoToRelatedCodeAction {
    constructor() {
        super({
            openToSide: false,
            openInPeek: false,
            muteMessage: false
        }, {
            id: "testing.goToRelatedCode",
            title: localize2('testing.goToRelatedCode', 'Go to Related Code'),
            category,
            precondition: ContextKeyExpr.and(TestingContextKeys.activeEditorHasTests, TestingContextKeys.canGoToRelatedCode),
            menu: [{
                    id: MenuId.EditorContext,
                    group: 'testing',
                    order: 4,
                }]
        });
    }
}
class PeekRelatedCode extends GoToRelatedCodeAction {
    constructor() {
        super({
            openToSide: false,
            openInPeek: true,
            muteMessage: false
        }, {
            id: "testing.peekRelatedCode",
            title: localize2('testing.peekToRelatedCode', 'Peek Related Code'),
            category,
            precondition: ContextKeyExpr.and(TestingContextKeys.activeEditorHasTests, TestingContextKeys.canGoToRelatedCode, PeekContext.notInPeekEditor, EditorContextKeys.isInEmbeddedEditor.toNegated()),
            menu: [{
                    id: MenuId.EditorContext,
                    group: 'testing',
                    order: 5,
                }]
        });
    }
}
export const allTestActions = [
    CancelTestRefreshAction,
    CancelTestRunAction,
    CleareCoverage,
    ClearTestResultsAction,
    CollapseAllAction,
    ConfigureTestProfilesAction,
    ContinuousRunTestAction,
    ContinuousRunUsingProfileTestAction,
    CoverageAction,
    CoverageAllAction,
    CoverageAtCursor,
    CoverageCurrentFile,
    CoverageLastRun,
    CoverageSelectedAction,
    CoverageTestsUnderUri,
    DebugAction,
    DebugAllAction,
    DebugAtCursor,
    DebugCurrentFile,
    DebugFailedTests,
    DebugLastRun,
    DebugSelectedAction,
    DebugTestsUnderUri,
    GetExplorerSelection,
    GetSelectedProfiles,
    GoToRelatedCode,
    GoToRelatedTest,
    GoToTest,
    HideTestAction,
    OpenCoverage,
    OpenOutputPeek,
    PeekRelatedCode,
    PeekRelatedTest,
    RefreshTestsAction,
    ReRunFailedTests,
    ReRunLastRun,
    RunAction,
    RunAllAction,
    RunAtCursor,
    RunCurrentFile,
    RunSelectedAction,
    RunTestsUnderUri,
    RunUsingProfileAction,
    SearchForTestExtension,
    SelectDefaultTestProfiles,
    ShowMostRecentOutputAction,
    StartContinuousRunAction,
    StopContinuousRunAction,
    TestingSortByDurationAction,
    TestingSortByLocationAction,
    TestingSortByStatusAction,
    TestingViewAsListAction,
    TestingViewAsTreeAction,
    ToggleInlineTestOutput,
    UnhideAllTestsAction,
    UnhideTestAction,
];
