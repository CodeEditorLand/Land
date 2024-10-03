import './media/scm.css';
import { Event } from '../../../../base/common/event.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { ViewPane, IViewPaneOptions } from '../../../browser/parts/views/viewPane.js';
import { ISCMResourceGroup, ISCMResource, ISCMRepository, ISCMInput, ISCMViewService, ISCMService, ISCMActionButton, ISCMActionButtonDescriptor } from '../common/scm.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IMenuService } from '../../../../platform/actions/common/actions.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ITreeNode, ITreeSorter } from '../../../../base/browser/ui/tree/tree.js';
import { IResourceNode } from '../../../../base/common/resourceTree.js';
import { ICompressibleTreeRenderer, ICompressibleKeyboardNavigationLabelProvider } from '../../../../base/browser/ui/tree/objectTree.js';
import { FuzzyScore } from '../../../../base/common/filters.js';
import { IViewDescriptorService } from '../../../common/views.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IListAccessibilityProvider } from '../../../../base/browser/ui/list/listWidget.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
type TreeElement = ISCMRepository | ISCMInput | ISCMActionButton | ISCMResourceGroup | ISCMResource | IResourceNode<ISCMResource, ISCMResourceGroup>;
interface ActionButtonTemplate {
    readonly actionButton: SCMActionButton;
    disposable: IDisposable;
    readonly templateDisposable: IDisposable;
}
export declare class ActionButtonRenderer implements ICompressibleTreeRenderer<ISCMActionButton, FuzzyScore, ActionButtonTemplate> {
    private commandService;
    private contextMenuService;
    private notificationService;
    static readonly DEFAULT_HEIGHT = 30;
    static readonly TEMPLATE_ID = "actionButton";
    get templateId(): string;
    private actionButtons;
    constructor(commandService: ICommandService, contextMenuService: IContextMenuService, notificationService: INotificationService);
    renderTemplate(container: HTMLElement): ActionButtonTemplate;
    renderElement(node: ITreeNode<ISCMActionButton, FuzzyScore>, index: number, templateData: ActionButtonTemplate, height: number | undefined): void;
    renderCompressedElements(): void;
    focusActionButton(actionButton: ISCMActionButton): void;
    disposeElement(node: ITreeNode<ISCMActionButton, FuzzyScore>, index: number, template: ActionButtonTemplate): void;
    disposeTemplate(templateData: ActionButtonTemplate): void;
}
export declare class SCMTreeSorter implements ITreeSorter<TreeElement> {
    private readonly viewMode;
    private readonly viewSortKey;
    constructor(viewMode: () => ViewMode, viewSortKey: () => ViewSortKey);
    compare(one: TreeElement, other: TreeElement): number;
}
export declare class SCMTreeKeyboardNavigationLabelProvider implements ICompressibleKeyboardNavigationLabelProvider<TreeElement> {
    private viewMode;
    private readonly labelService;
    constructor(viewMode: () => ViewMode, labelService: ILabelService);
    getKeyboardNavigationLabel(element: TreeElement): {
        toString(): string;
    } | {
        toString(): string;
    }[] | undefined;
    getCompressedNodeKeyboardNavigationLabel(elements: TreeElement[]): {
        toString(): string | undefined;
    } | undefined;
}
export declare class SCMAccessibilityProvider implements IListAccessibilityProvider<TreeElement> {
    private readonly labelService;
    constructor(labelService: ILabelService);
    getWidgetAriaLabel(): string;
    getAriaLabel(element: TreeElement): string;
}
declare const enum ViewMode {
    List = "list",
    Tree = "tree"
}
declare const enum ViewSortKey {
    Path = "path",
    Name = "name",
    Status = "status"
}
export declare const ContextKeys: {
    SCMViewMode: RawContextKey<ViewMode>;
    SCMViewSortKey: RawContextKey<ViewSortKey>;
    SCMViewAreAllRepositoriesCollapsed: RawContextKey<boolean>;
    SCMViewIsAnyRepositoryCollapsible: RawContextKey<boolean>;
    SCMProvider: RawContextKey<string | undefined>;
    SCMProviderRootUri: RawContextKey<string | undefined>;
    SCMProviderHasRootUri: RawContextKey<boolean>;
    SCMHistoryItemCount: RawContextKey<number>;
    RepositoryCount: RawContextKey<number>;
    RepositoryVisibilityCount: RawContextKey<number>;
    RepositoryVisibility(repository: ISCMRepository): RawContextKey<boolean>;
};
export declare class SCMViewPane extends ViewPane {
    private readonly commandService;
    private readonly editorService;
    private readonly menuService;
    private readonly scmService;
    private readonly scmViewService;
    private readonly storageService;
    private readonly uriIdentityService;
    private _onDidLayout;
    private layoutCache;
    private treeScrollTop;
    private treeContainer;
    private tree;
    private listLabels;
    private inputRenderer;
    private actionButtonRenderer;
    private _viewMode;
    get viewMode(): ViewMode;
    set viewMode(mode: ViewMode);
    private readonly _onDidChangeViewMode;
    readonly onDidChangeViewMode: Event<ViewMode>;
    private _viewSortKey;
    get viewSortKey(): ViewSortKey;
    set viewSortKey(sortKey: ViewSortKey);
    private readonly _onDidChangeViewSortKey;
    readonly onDidChangeViewSortKey: Event<ViewSortKey>;
    private readonly items;
    private readonly visibilityDisposables;
    private readonly treeOperationSequencer;
    private readonly revealResourceThrottler;
    private readonly updateChildrenThrottler;
    private viewModeContextKey;
    private viewSortKeyContextKey;
    private areAllRepositoriesCollapsedContextKey;
    private isAnyRepositoryCollapsibleContextKey;
    private scmProviderContextKey;
    private scmProviderRootUriContextKey;
    private scmProviderHasRootUriContextKey;
    private readonly disposables;
    constructor(options: IViewPaneOptions, commandService: ICommandService, editorService: IEditorService, menuService: IMenuService, scmService: ISCMService, scmViewService: ISCMViewService, storageService: IStorageService, uriIdentityService: IUriIdentityService, keybindingService: IKeybindingService, themeService: IThemeService, contextMenuService: IContextMenuService, instantiationService: IInstantiationService, viewDescriptorService: IViewDescriptorService, configurationService: IConfigurationService, contextKeyService: IContextKeyService, openerService: IOpenerService, telemetryService: ITelemetryService, hoverService: IHoverService);
    protected layoutBody(height?: number | undefined, width?: number | undefined): void;
    protected renderBody(container: HTMLElement): void;
    private createTree;
    private open;
    private onDidActiveEditorChange;
    private onDidChangeVisibleRepositories;
    private onListContextMenu;
    private getSelectedRepositories;
    private getSelectedResources;
    private getViewMode;
    private getViewSortKey;
    private loadTreeViewState;
    private storeTreeViewState;
    private updateChildren;
    private updateIndentStyles;
    private updateScmProviderContextKeys;
    private updateRepositoryCollapseAllContextKeys;
    collapseAllRepositories(): void;
    expandAllRepositories(): void;
    focusPreviousInput(): void;
    focusNextInput(): void;
    private focusInput;
    focusPreviousResourceGroup(): void;
    focusNextResourceGroup(): void;
    private focusResourceGroup;
    shouldShowWelcome(): boolean;
    getActionsContext(): unknown;
    focus(): void;
    dispose(): void;
}
export declare class SCMActionButton implements IDisposable {
    private readonly container;
    private readonly contextMenuService;
    private readonly commandService;
    private readonly notificationService;
    private button;
    private readonly disposables;
    constructor(container: HTMLElement, contextMenuService: IContextMenuService, commandService: ICommandService, notificationService: INotificationService);
    dispose(): void;
    setButton(button: ISCMActionButtonDescriptor | undefined): void;
    focus(): void;
    private clear;
    private executeCommand;
}
export {};
