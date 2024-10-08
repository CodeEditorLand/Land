import { IActionViewItemOptions } from '../../../../base/browser/ui/actionbar/actionViewItems.js';
import { IActionViewItem } from '../../../../base/browser/ui/actionbar/actionbar.js';
import { IAction } from '../../../../base/common/actions.js';
import { Event } from '../../../../base/common/event.js';
import { FuzzyScore } from '../../../../base/common/filters.js';
import { Disposable, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { IMenuService } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { ViewPane } from '../../../browser/parts/views/viewPane.js';
import { IViewletViewOptions } from '../../../browser/parts/views/viewsViewlet.js';
import { IViewDescriptorService } from '../../../common/views.js';
import { IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { TestExplorerViewMode, TestExplorerViewSorting } from '../common/constants.js';
import { TestExplorerFilterState } from '../common/testExplorerFilterState.js';
import { ITestProfileService } from '../common/testProfileService.js';
import { ITestResultService } from '../common/testResultService.js';
import { ITestService } from '../common/testService.js';
import { ITestRunProfile, InternalTestItem, TestRunProfileBitset } from '../common/testTypes.js';
import { ITestingContinuousRunService } from '../common/testingContinuousRunService.js';
import { ITestingPeekOpener } from '../common/testingPeekOpener.js';
import { ITestTreeProjection, TestExplorerTreeElement, TestItemTreeElement, TestTreeErrorMessage } from './explorerProjections/index.js';
import { TestingObjectTree } from './explorerProjections/testingObjectTree.js';
import './media/testing.css';
export declare class TestingExplorerView extends ViewPane {
    private readonly testService;
    private readonly testProfileService;
    private readonly commandService;
    private readonly menuService;
    viewModel: TestingExplorerViewModel;
    private readonly filterActionBar;
    private container;
    private treeHeader;
    private readonly discoveryProgress;
    private readonly filter;
    private readonly filterFocusListener;
    private readonly dimensions;
    private lastFocusState;
    get focusedTreeElements(): (TestItemTreeElement | TestTreeErrorMessage)[];
    constructor(options: IViewletViewOptions, contextMenuService: IContextMenuService, keybindingService: IKeybindingService, configurationService: IConfigurationService, instantiationService: IInstantiationService, viewDescriptorService: IViewDescriptorService, contextKeyService: IContextKeyService, openerService: IOpenerService, themeService: IThemeService, testService: ITestService, telemetryService: ITelemetryService, hoverService: IHoverService, testProfileService: ITestProfileService, commandService: ICommandService, menuService: IMenuService);
    shouldShowWelcome(): boolean;
    focus(): void;
    /**
     * Gets include/exclude items in the tree, based either on visible tests
     * or a use selection. If a profile is given, only tests in that profile
     * are collected. If a bitset is given, any test that can run in that
     * bitset is collected.
     */
    getTreeIncludeExclude(profileOrBitset: ITestRunProfile | TestRunProfileBitset, withinItems?: InternalTestItem[], filterToType?: 'visible' | 'selected'): {
        include: InternalTestItem[];
        exclude: InternalTestItem[];
    };
    render(): void;
    /**
     * @override
     */
    protected renderBody(container: HTMLElement): void;
    /** @override  */
    getActionViewItem(action: IAction, options: IActionViewItemOptions): IActionViewItem | undefined;
    /** @inheritdoc */
    private getTestConfigGroupActions;
    /**
     * @override
     */
    saveState(): void;
    private getRunGroupDropdown;
    private createFilterActionBar;
    private updateDiscoveryProgress;
    /**
     * @override
     */
    protected layoutBody(height?: number, width?: number): void;
}
declare const enum WelcomeExperience {
    None = 0,
    ForWorkspace = 1,
    ForDocument = 2
}
declare class TestingExplorerViewModel extends Disposable {
    private readonly menuService;
    private readonly contextMenuService;
    private readonly testService;
    private readonly filterState;
    private readonly instantiationService;
    private readonly storageService;
    private readonly contextKeyService;
    private readonly testResults;
    private readonly peekOpener;
    private readonly testProfileService;
    private readonly crService;
    tree: TestingObjectTree<FuzzyScore>;
    private filter;
    readonly projection: MutableDisposable<ITestTreeProjection>;
    private readonly revealTimeout;
    private readonly _viewMode;
    private readonly _viewSorting;
    private readonly welcomeVisibilityEmitter;
    private readonly actionRunner;
    private readonly lastViewState;
    private readonly noTestForDocumentWidget;
    /**
     * Whether there's a reveal request which has not yet been delivered. This
     * can happen if the user asks to reveal before the test tree is loaded.
     * We check to see if the reveal request is present on each tree update,
     * and do it then if so.
     */
    private hasPendingReveal;
    /**
     * Fires when the visibility of the placeholder state changes.
     */
    readonly onChangeWelcomeVisibility: Event<WelcomeExperience>;
    /**
     * Gets whether the welcome should be visible.
     */
    welcomeExperience: WelcomeExperience;
    get viewMode(): TestExplorerViewMode;
    set viewMode(newMode: TestExplorerViewMode);
    get viewSorting(): TestExplorerViewSorting;
    set viewSorting(newSorting: TestExplorerViewSorting);
    constructor(listContainer: HTMLElement, onDidChangeVisibility: Event<boolean>, configurationService: IConfigurationService, editorService: IEditorService, editorGroupsService: IEditorGroupsService, menuService: IMenuService, contextMenuService: IContextMenuService, testService: ITestService, filterState: TestExplorerFilterState, instantiationService: IInstantiationService, storageService: IStorageService, contextKeyService: IContextKeyService, testResults: ITestResultService, peekOpener: ITestingPeekOpener, testProfileService: ITestProfileService, crService: ITestingContinuousRunService, commandService: ICommandService);
    /**
     * Re-layout the tree.
     */
    layout(height?: number, width?: number): void;
    /**
     * Tries to reveal by extension ID. Queues the request if the extension
     * ID is not currently available.
     */
    private revealById;
    /**
     * Collapse all items in the tree.
     */
    collapseAll(): Promise<void>;
    /**
     * Tries to peek the first test error, if the item is in a failed state.
     */
    private tryPeekError;
    private onContextMenu;
    private handleExecuteKeypress;
    private reevaluateWelcomeState;
    private ensureProjection;
    private updatePreferredProjection;
    private applyProjectionChanges;
    /**
     * Gets the selected tests from the tree.
     */
    getSelectedTests(): (TestExplorerTreeElement | null)[];
}
export {};
