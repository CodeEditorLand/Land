/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
var ExplorerView_1;
import * as nls from '../../../../../nls.js';
import * as perf from '../../../../../base/common/performance.js';
import { memoize } from '../../../../../base/common/decorators.js';
import { ExplorerFolderContext, FilesExplorerFocusedContext, ExplorerFocusedContext, ExplorerRootContext, ExplorerResourceReadonlyContext, ExplorerResourceCut, ExplorerResourceMoveableToTrash, ExplorerCompressedFocusContext, ExplorerCompressedFirstFocusContext, ExplorerCompressedLastFocusContext, ExplorerResourceAvailableEditorIdsContext, VIEW_ID, ExplorerResourceNotReadonlyContext, ViewHasSomeCollapsibleRootItemContext, FoldersViewVisibleContext } from '../../common/files.js';
import { FileCopiedContext, NEW_FILE_COMMAND_ID, NEW_FOLDER_COMMAND_ID } from '../fileActions.js';
import * as DOM from '../../../../../base/browser/dom.js';
import { IWorkbenchLayoutService } from '../../../../services/layout/browser/layoutService.js';
import { ExplorerDecorationsProvider } from './explorerDecorationsProvider.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IKeybindingService } from '../../../../../platform/keybinding/common/keybinding.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IProgressService } from '../../../../../platform/progress/common/progress.js';
import { IContextMenuService } from '../../../../../platform/contextview/browser/contextView.js';
import { IContextKeyService, ContextKeyExpr } from '../../../../../platform/contextkey/common/contextkey.js';
import { ResourceContextKey } from '../../../../common/contextkeys.js';
import { IDecorationsService } from '../../../../services/decorations/common/decorations.js';
import { WorkbenchCompressibleAsyncDataTree } from '../../../../../platform/list/browser/listService.js';
import { DelayedDragHandler } from '../../../../../base/browser/dnd.js';
import { IEditorService, SIDE_GROUP, ACTIVE_GROUP } from '../../../../services/editor/common/editorService.js';
import { ViewPane } from '../../../../browser/parts/views/viewPane.js';
import { ILabelService } from '../../../../../platform/label/common/label.js';
import { ExplorerDelegate, ExplorerDataSource, FilesRenderer, FilesFilter, FileSorter, FileDragAndDrop, ExplorerCompressionDelegate, isCompressedFolderName } from './explorerViewer.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { IWorkbenchThemeService } from '../../../../services/themes/common/workbenchThemeService.js';
import { MenuId, Action2, registerAction2 } from '../../../../../platform/actions/common/actions.js';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
import { ExplorerItem, NewExplorerItem } from '../../common/explorerModel.js';
import { ResourceLabels } from '../../../../browser/labels.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { fuzzyScore } from '../../../../../base/common/filters.js';
import { IClipboardService } from '../../../../../platform/clipboard/common/clipboardService.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { Event } from '../../../../../base/common/event.js';
import { IViewDescriptorService } from '../../../../common/views.js';
import { IViewsService } from '../../../../services/views/common/viewsService.js';
import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { IUriIdentityService } from '../../../../../platform/uriIdentity/common/uriIdentity.js';
import { EditorResourceAccessor, SideBySideEditor } from '../../../../common/editor.js';
import { IExplorerService } from '../files.js';
import { Codicon } from '../../../../../base/common/codicons.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IEditorResolverService } from '../../../../services/editor/common/editorResolverService.js';
import { EditorOpenSource } from '../../../../../platform/editor/common/editor.js';
import { ResourceMap } from '../../../../../base/common/map.js';
import { contiguousFuzzyScore } from '../../../../../base/browser/ui/tree/abstractTree.js';
import { IHoverService } from '../../../../../platform/hover/browser/hover.js';
import { basename, relativePath } from '../../../../../base/common/resources.js';
import { IFilesConfigurationService } from '../../../../services/filesConfiguration/common/filesConfigurationService.js';
import { getExcludes, ISearchService } from '../../../../services/search/common/search.js';
function hasExpandedRootChild(tree, treeInput) {
    for (const folder of treeInput) {
        if (tree.hasNode(folder) && !tree.isCollapsed(folder)) {
            for (const [, child] of folder.children.entries()) {
                if (tree.hasNode(child) && tree.isCollapsible(child) && !tree.isCollapsed(child)) {
                    return true;
                }
            }
        }
    }
    return false;
}
/**
 * Whether or not any of the nodes in the tree are expanded
 */
function hasExpandedNode(tree, treeInput) {
    for (const folder of treeInput) {
        if (tree.hasNode(folder) && !tree.isCollapsed(folder)) {
            return true;
        }
    }
    return false;
}
const identityProvider = {
    getId: (stat) => {
        if (stat instanceof NewExplorerItem) {
            return `new:${stat.getId()}`;
        }
        return stat.getId();
    }
};
export function getContext(focus, selection, respectMultiSelection, compressedNavigationControllerProvider) {
    let focusedStat;
    focusedStat = focus.length ? focus[0] : undefined;
    // If we are respecting multi-select and we have a multi-selection we ignore focus as we want to act on the selection
    if (respectMultiSelection && selection.length > 1) {
        focusedStat = undefined;
    }
    const compressedNavigationControllers = focusedStat && compressedNavigationControllerProvider.getCompressedNavigationController(focusedStat);
    const compressedNavigationController = compressedNavigationControllers && compressedNavigationControllers.length ? compressedNavigationControllers[0] : undefined;
    focusedStat = compressedNavigationController ? compressedNavigationController.current : focusedStat;
    const selectedStats = [];
    for (const stat of selection) {
        const controllers = compressedNavigationControllerProvider.getCompressedNavigationController(stat);
        const controller = controllers && controllers.length ? controllers[0] : undefined;
        if (controller && focusedStat && controller === compressedNavigationController) {
            if (stat === focusedStat) {
                selectedStats.push(stat);
            }
            // Ignore stats which are selected but are part of the same compact node as the focused stat
            continue;
        }
        if (controller) {
            selectedStats.push(...controller.items);
        }
        else {
            selectedStats.push(stat);
        }
    }
    if (!focusedStat) {
        if (respectMultiSelection) {
            return selectedStats;
        }
        else {
            return [];
        }
    }
    if (respectMultiSelection && selectedStats.indexOf(focusedStat) >= 0) {
        return selectedStats;
    }
    return [focusedStat];
}
const explorerFuzzyMatch = {
    id: 'fuzzyMatch',
    title: 'Fuzzy Match',
    icon: Codicon.searchFuzzy,
    isChecked: false
};
let ExplorerFindProvider = class ExplorerFindProvider {
    constructor(workspaceContextService, searchService, fileService, configurationService, filesConfigService, progressService, explorerService) {
        this.workspaceContextService = workspaceContextService;
        this.searchService = searchService;
        this.fileService = fileService;
        this.configurationService = configurationService;
        this.filesConfigService = filesConfigService;
        this.progressService = progressService;
        this.explorerService = explorerService;
        this.toggles = [explorerFuzzyMatch];
        this.placeholder = nls.localize('type to search files', "Type to search files");
    }
    async *getFindResults(pattern, sessionId, token, toggleStates) {
        const isFuzzyMatch = toggleStates.find(t => t.id === explorerFuzzyMatch.id)?.isChecked;
        const workspaceFolders = this.workspaceContextService.getWorkspace().folders;
        const folderPromises = Promise.all(workspaceFolders.map(async (folder) => {
            // Get exclude settings used for search
            const searchExcludePattern = getExcludes(this.configurationService.getValue({ resource: folder.uri })) || {};
            const result = await this.searchService.fileSearch({
                folderQueries: [{ folder: folder.uri }],
                type: 1 /* QueryType.File */,
                shouldGlobMatchFilePattern: !isFuzzyMatch,
                filePattern: isFuzzyMatch ? pattern : `**/*${pattern}*`,
                maxResults: 512,
                sortByScore: true,
                cacheKey: `explorerfindprovider:${sessionId}`,
                excludePattern: searchExcludePattern,
            }, token);
            return { folder: folder.uri, result };
        }));
        const folderResults = await this.progressService.withProgress({
            location: 1 /* ProgressLocation.Explorer */,
            delay: 1000,
        }, _progress => folderPromises);
        if (token.isCancellationRequested) {
            return;
        }
        yield* this.createResultItems(folderResults, pattern, isFuzzyMatch);
    }
    async *createResultItems(folderResults, pattern, isFuzzyMatch) {
        const lowercasePattern = pattern.toLowerCase();
        for (const { folder, result } of folderResults) {
            const folderRoot = new ExplorerItem(folder, this.fileService, this.configurationService, this.filesConfigService, undefined);
            for (const file of result.results) {
                const baseName = basename(file.resource);
                let filterdata;
                if (isFuzzyMatch) {
                    filterdata = fuzzyScore(pattern, lowercasePattern, 0, baseName, baseName.toLowerCase(), 0, { firstMatchCanBeWeak: true, boostFullMatch: true });
                }
                else {
                    filterdata = contiguousFuzzyScore(lowercasePattern, baseName.toLowerCase());
                }
                if (!filterdata) {
                    continue;
                }
                const item = this.createItem(file.resource, folderRoot);
                if (item) {
                    yield { element: item, filterdata };
                }
            }
        }
    }
    createItem(resource, root) {
        const relativePathToRoot = relativePath(root.resource, resource);
        if (!relativePathToRoot) {
            return undefined;
        }
        let currentItem = root;
        let currentResource = root.resource;
        const pathSegments = relativePathToRoot.split('/');
        for (const stat of pathSegments) {
            currentResource = currentResource.with({ path: `${currentResource.path}/${stat}` });
            let child = currentItem.children.get(stat);
            if (!child) {
                const isDirectory = pathSegments[pathSegments.length - 1] !== stat;
                child = new ExplorerItem(currentResource, this.fileService, this.configurationService, this.filesConfigService, currentItem, isDirectory);
            }
            currentItem = child;
        }
        return currentItem;
    }
    revealResultInTree(findElement) {
        this.explorerService.select(findElement.resource, true);
    }
};
ExplorerFindProvider = __decorate([
    __param(0, IWorkspaceContextService),
    __param(1, ISearchService),
    __param(2, IFileService),
    __param(3, IConfigurationService),
    __param(4, IFilesConfigurationService),
    __param(5, IProgressService),
    __param(6, IExplorerService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object])
], ExplorerFindProvider);
let ExplorerView = class ExplorerView extends ViewPane {
    static { ExplorerView_1 = this; }
    static { this.TREE_VIEW_STATE_STORAGE_KEY = 'workbench.explorer.treeViewState'; }
    constructor(options, contextMenuService, viewDescriptorService, instantiationService, contextService, progressService, editorService, editorResolverService, layoutService, keybindingService, contextKeyService, configurationService, decorationService, labelService, themeService, telemetryService, hoverService, explorerService, storageService, clipboardService, fileService, uriIdentityService, commandService, openerService) {
        super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, hoverService);
        this.contextService = contextService;
        this.progressService = progressService;
        this.editorService = editorService;
        this.editorResolverService = editorResolverService;
        this.layoutService = layoutService;
        this.decorationService = decorationService;
        this.labelService = labelService;
        this.explorerService = explorerService;
        this.storageService = storageService;
        this.clipboardService = clipboardService;
        this.fileService = fileService;
        this.uriIdentityService = uriIdentityService;
        this.commandService = commandService;
        this._autoReveal = false;
        this.delegate = options.delegate;
        this.resourceContext = instantiationService.createInstance(ResourceContextKey);
        this._register(this.resourceContext);
        this.folderContext = ExplorerFolderContext.bindTo(contextKeyService);
        this.readonlyContext = ExplorerResourceReadonlyContext.bindTo(contextKeyService);
        this.availableEditorIdsContext = ExplorerResourceAvailableEditorIdsContext.bindTo(contextKeyService);
        this.rootContext = ExplorerRootContext.bindTo(contextKeyService);
        this.resourceMoveableToTrash = ExplorerResourceMoveableToTrash.bindTo(contextKeyService);
        this.compressedFocusContext = ExplorerCompressedFocusContext.bindTo(contextKeyService);
        this.compressedFocusFirstContext = ExplorerCompressedFirstFocusContext.bindTo(contextKeyService);
        this.compressedFocusLastContext = ExplorerCompressedLastFocusContext.bindTo(contextKeyService);
        this.viewHasSomeCollapsibleRootItem = ViewHasSomeCollapsibleRootItemContext.bindTo(contextKeyService);
        this.viewVisibleContextKey = FoldersViewVisibleContext.bindTo(contextKeyService);
        this.explorerService.registerView(this);
    }
    get autoReveal() {
        return this._autoReveal;
    }
    set autoReveal(autoReveal) {
        this._autoReveal = autoReveal;
    }
    get name() {
        return this.labelService.getWorkspaceLabel(this.contextService.getWorkspace());
    }
    get title() {
        return this.name;
    }
    set title(_) {
        // noop
    }
    setVisible(visible) {
        this.viewVisibleContextKey.set(visible);
        super.setVisible(visible);
    }
    get fileCopiedContextKey() {
        return FileCopiedContext.bindTo(this.contextKeyService);
    }
    get resourceCutContextKey() {
        return ExplorerResourceCut.bindTo(this.contextKeyService);
    }
    // Split view methods
    renderHeader(container) {
        super.renderHeader(container);
        // Expand on drag over
        this.dragHandler = new DelayedDragHandler(container, () => this.setExpanded(true));
        const titleElement = container.querySelector('.title');
        const setHeader = () => {
            titleElement.textContent = this.name;
            this.updateTitle(this.name);
            this.ariaHeaderLabel = nls.localize('explorerSection', "Explorer Section: {0}", this.name);
            titleElement.setAttribute('aria-label', this.ariaHeaderLabel);
        };
        this._register(this.contextService.onDidChangeWorkspaceName(setHeader));
        this._register(this.labelService.onDidChangeFormatters(setHeader));
        setHeader();
    }
    layoutBody(height, width) {
        super.layoutBody(height, width);
        this.tree.layout(height, width);
    }
    renderBody(container) {
        super.renderBody(container);
        this.container = container;
        this.treeContainer = DOM.append(container, DOM.$('.explorer-folders-view'));
        this.createTree(this.treeContainer);
        this._register(this.labelService.onDidChangeFormatters(() => {
            this._onDidChangeTitleArea.fire();
        }));
        // Update configuration
        this.onConfigurationUpdated(undefined);
        // When the explorer viewer is loaded, listen to changes to the editor input
        this._register(this.editorService.onDidActiveEditorChange(() => {
            this.selectActiveFile();
        }));
        // Also handle configuration updates
        this._register(this.configurationService.onDidChangeConfiguration(e => this.onConfigurationUpdated(e)));
        this._register(this.onDidChangeBodyVisibility(async (visible) => {
            if (visible) {
                // Always refresh explorer when it becomes visible to compensate for missing file events #126817
                await this.setTreeInput();
                // Update the collapse / expand  button state
                this.updateAnyCollapsedContext();
                // Find resource to focus from active editor input if set
                this.selectActiveFile(true);
            }
        }));
        // Support for paste of files into explorer
        this._register(DOM.addDisposableListener(DOM.getWindow(this.container), DOM.EventType.PASTE, async (event) => {
            if (!this.hasFocus() || this.readonlyContext.get()) {
                return;
            }
            if (event.clipboardData?.files?.length) {
                await this.commandService.executeCommand('filesExplorer.paste', event.clipboardData?.files);
            }
        }));
    }
    focus() {
        super.focus();
        this.tree.domFocus();
        if (this.tree.getFocusedPart() === 0 /* AbstractTreePart.Tree */) {
            const focused = this.tree.getFocus();
            if (focused.length === 1 && this._autoReveal) {
                this.tree.reveal(focused[0], 0.5);
            }
        }
    }
    hasFocus() {
        return DOM.isAncestorOfActiveElement(this.container);
    }
    getFocus() {
        return this.tree.getFocus();
    }
    focusNext() {
        this.tree.focusNext();
    }
    focusLast() {
        this.tree.focusLast();
    }
    getContext(respectMultiSelection) {
        const focusedItems = this.tree.getFocusedPart() === 1 /* AbstractTreePart.StickyScroll */ ?
            this.tree.getStickyScrollFocus() :
            this.tree.getFocus();
        return getContext(focusedItems, this.tree.getSelection(), respectMultiSelection, this.renderer);
    }
    isItemVisible(item) {
        // If filter is undefined it means the tree hasn't been rendered yet, so nothing is visible
        if (!this.filter) {
            return false;
        }
        return this.filter.filter(item, 1 /* TreeVisibility.Visible */);
    }
    isItemCollapsed(item) {
        return this.tree.isCollapsed(item);
    }
    async setEditable(stat, isEditing) {
        if (isEditing) {
            this.horizontalScrolling = this.tree.options.horizontalScrolling;
            if (this.horizontalScrolling) {
                this.tree.updateOptions({ horizontalScrolling: false });
            }
            await this.tree.expand(stat.parent);
        }
        else {
            if (this.horizontalScrolling !== undefined) {
                this.tree.updateOptions({ horizontalScrolling: this.horizontalScrolling });
            }
            this.horizontalScrolling = undefined;
            this.treeContainer.classList.remove('highlight');
        }
        await this.refresh(false, stat.parent, false);
        if (isEditing) {
            this.treeContainer.classList.add('highlight');
            this.tree.reveal(stat);
        }
        else {
            this.tree.domFocus();
        }
    }
    async selectActiveFile(reveal = this._autoReveal) {
        if (this._autoReveal) {
            const activeFile = EditorResourceAccessor.getCanonicalUri(this.editorService.activeEditor, { supportSideBySide: SideBySideEditor.PRIMARY });
            if (activeFile) {
                const focus = this.tree.getFocus();
                const selection = this.tree.getSelection();
                if (focus.length === 1 && this.uriIdentityService.extUri.isEqual(focus[0].resource, activeFile) && selection.length === 1 && this.uriIdentityService.extUri.isEqual(selection[0].resource, activeFile)) {
                    // No action needed, active file is already focused and selected
                    return;
                }
                return this.explorerService.select(activeFile, reveal);
            }
        }
    }
    createTree(container) {
        this.filter = this.instantiationService.createInstance(FilesFilter);
        this._register(this.filter);
        this._register(this.filter.onDidChange(() => this.refresh(true)));
        const explorerLabels = this.instantiationService.createInstance(ResourceLabels, { onDidChangeVisibility: this.onDidChangeBodyVisibility });
        this._register(explorerLabels);
        const updateWidth = (stat) => this.tree.updateWidth(stat);
        this.renderer = this.instantiationService.createInstance(FilesRenderer, container, explorerLabels, updateWidth);
        this._register(this.renderer);
        this._register(createFileIconThemableTreeContainerScope(container, this.themeService));
        const isCompressionEnabled = () => this.configurationService.getValue('explorer.compactFolders');
        const getFileNestingSettings = (item) => this.configurationService.getValue({ resource: item?.root.resource }).explorer.fileNesting;
        this.tree = this.instantiationService.createInstance(WorkbenchCompressibleAsyncDataTree, 'FileExplorer', container, new ExplorerDelegate(), new ExplorerCompressionDelegate(), [this.renderer], this.instantiationService.createInstance(ExplorerDataSource, this.filter), {
            compressionEnabled: isCompressionEnabled(),
            accessibilityProvider: this.renderer,
            identityProvider,
            keyboardNavigationLabelProvider: {
                getKeyboardNavigationLabel: (stat) => {
                    if (this.explorerService.isEditable(stat)) {
                        return undefined;
                    }
                    return stat.name;
                },
                getCompressedNodeKeyboardNavigationLabel: (stats) => {
                    if (stats.some(stat => this.explorerService.isEditable(stat))) {
                        return undefined;
                    }
                    return stats.map(stat => stat.name).join('/');
                }
            },
            multipleSelectionSupport: true,
            filter: this.filter,
            sorter: this.instantiationService.createInstance(FileSorter),
            dnd: this.instantiationService.createInstance(FileDragAndDrop, (item) => this.isItemCollapsed(item)),
            collapseByDefault: (e) => {
                if (e instanceof ExplorerItem) {
                    if (e.hasNests && getFileNestingSettings(e).expand) {
                        return false;
                    }
                }
                return true;
            },
            autoExpandSingleChildren: true,
            expandOnlyOnTwistieClick: (e) => {
                if (e instanceof ExplorerItem) {
                    if (e.hasNests) {
                        return true;
                    }
                    else if (this.configurationService.getValue('workbench.tree.expandMode') === 'doubleClick') {
                        return true;
                    }
                }
                return false;
            },
            paddingBottom: ExplorerDelegate.ITEM_HEIGHT,
            overrideStyles: this.getLocationBasedColors().listOverrideStyles,
            findResultsProvider: this.instantiationService.createInstance(ExplorerFindProvider),
        });
        this._register(this.tree);
        this._register(this.themeService.onDidColorThemeChange(() => this.tree.rerender()));
        // Bind configuration
        const onDidChangeCompressionConfiguration = Event.filter(this.configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('explorer.compactFolders'));
        this._register(onDidChangeCompressionConfiguration(_ => this.tree.updateOptions({ compressionEnabled: isCompressionEnabled() })));
        // Bind context keys
        FilesExplorerFocusedContext.bindTo(this.tree.contextKeyService);
        ExplorerFocusedContext.bindTo(this.tree.contextKeyService);
        // Update resource context based on focused element
        this._register(this.tree.onDidChangeFocus(e => this.onFocusChanged(e.elements)));
        this.onFocusChanged([]);
        // Open when selecting via keyboard
        this._register(this.tree.onDidOpen(async (e) => {
            const element = e.element;
            if (!element) {
                return;
            }
            // Do not react if the user is expanding selection via keyboard.
            // Check if the item was previously also selected, if yes the user is simply expanding / collapsing current selection #66589.
            const shiftDown = DOM.isKeyboardEvent(e.browserEvent) && e.browserEvent.shiftKey;
            if (!shiftDown) {
                if (element.isDirectory || this.explorerService.isEditable(undefined)) {
                    // Do not react if user is clicking on explorer items while some are being edited #70276
                    // Do not react if clicking on directories
                    return;
                }
                this.telemetryService.publicLog2('workbenchActionExecuted', { id: 'workbench.files.openFile', from: 'explorer' });
                try {
                    this.delegate?.willOpenElement(e.browserEvent);
                    await this.editorService.openEditor({ resource: element.resource, options: { preserveFocus: e.editorOptions.preserveFocus, pinned: e.editorOptions.pinned, source: EditorOpenSource.USER } }, e.sideBySide ? SIDE_GROUP : ACTIVE_GROUP);
                }
                finally {
                    this.delegate?.didOpenElement();
                }
            }
        }));
        this._register(this.tree.onContextMenu(e => this.onContextMenu(e)));
        this._register(this.tree.onDidScroll(async (e) => {
            const editable = this.explorerService.getEditable();
            if (e.scrollTopChanged && editable && this.tree.getRelativeTop(editable.stat) === null) {
                await editable.data.onFinish('', false);
            }
        }));
        this._register(this.tree.onDidChangeCollapseState(e => {
            const element = e.node.element?.element;
            if (element) {
                const navigationControllers = this.renderer.getCompressedNavigationController(element instanceof Array ? element[0] : element);
                navigationControllers?.forEach(controller => controller.updateCollapsed(e.node.collapsed));
            }
            // Update showing expand / collapse button
            this.updateAnyCollapsedContext();
        }));
        this.updateAnyCollapsedContext();
        this._register(this.tree.onMouseDblClick(e => {
            // If empty space is clicked, and not scrolling by page enabled #173261
            const scrollingByPage = this.configurationService.getValue('workbench.list.scrollByPage');
            if (e.element === null && !scrollingByPage) {
                // click in empty area -> create a new file #116676
                this.commandService.executeCommand(NEW_FILE_COMMAND_ID);
            }
        }));
        // save view state
        this._register(this.storageService.onWillSaveState(() => {
            this.storeTreeViewState();
        }));
    }
    // React on events
    onConfigurationUpdated(event) {
        if (!event || event.affectsConfiguration('explorer.autoReveal')) {
            const configuration = this.configurationService.getValue();
            this._autoReveal = configuration?.explorer?.autoReveal;
        }
        // Push down config updates to components of viewer
        if (event && (event.affectsConfiguration('explorer.decorations.colors') || event.affectsConfiguration('explorer.decorations.badges'))) {
            this.refresh(true);
        }
    }
    storeTreeViewState() {
        this.storageService.store(ExplorerView_1.TREE_VIEW_STATE_STORAGE_KEY, JSON.stringify(this.tree.getViewState()), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
    }
    setContextKeys(stat) {
        const folders = this.contextService.getWorkspace().folders;
        const resource = stat ? stat.resource : folders[folders.length - 1].uri;
        stat = stat || this.explorerService.findClosest(resource);
        this.resourceContext.set(resource);
        this.folderContext.set(!!stat && stat.isDirectory);
        this.readonlyContext.set(!!stat && !!stat.isReadonly);
        this.rootContext.set(!!stat && stat.isRoot);
        if (resource) {
            const overrides = resource ? this.editorResolverService.getEditors(resource).map(editor => editor.id) : [];
            this.availableEditorIdsContext.set(overrides.join(','));
        }
        else {
            this.availableEditorIdsContext.reset();
        }
    }
    async onContextMenu(e) {
        if (DOM.isEditableElement(e.browserEvent.target)) {
            return;
        }
        const stat = e.element;
        let anchor = e.anchor;
        // Adjust for compressed folders (except when mouse is used)
        if (DOM.isHTMLElement(anchor)) {
            if (stat) {
                const controllers = this.renderer.getCompressedNavigationController(stat);
                if (controllers && controllers.length > 0) {
                    if (DOM.isKeyboardEvent(e.browserEvent) || isCompressedFolderName(e.browserEvent.target)) {
                        anchor = controllers[0].labels[controllers[0].index];
                    }
                    else {
                        controllers.forEach(controller => controller.last());
                    }
                }
            }
        }
        // update dynamic contexts
        this.fileCopiedContextKey.set(await this.clipboardService.hasResources());
        this.setContextKeys(stat);
        const selection = this.tree.getSelection();
        const roots = this.explorerService.roots; // If the click is outside of the elements pass the root resource if there is only one root. If there are multiple roots pass empty object.
        let arg;
        if (stat instanceof ExplorerItem) {
            const compressedControllers = this.renderer.getCompressedNavigationController(stat);
            arg = compressedControllers && compressedControllers.length ? compressedControllers[0].current.resource : stat.resource;
        }
        else {
            arg = roots.length === 1 ? roots[0].resource : {};
        }
        this.contextMenuService.showContextMenu({
            menuId: MenuId.ExplorerContext,
            menuActionOptions: { arg, shouldForwardArgs: true },
            contextKeyService: this.tree.contextKeyService,
            getAnchor: () => anchor,
            onHide: (wasCancelled) => {
                if (wasCancelled) {
                    this.tree.domFocus();
                }
            },
            getActionsContext: () => stat && selection && selection.indexOf(stat) >= 0
                ? selection.map((fs) => fs.resource)
                : stat instanceof ExplorerItem ? [stat.resource] : []
        });
    }
    onFocusChanged(elements) {
        const stat = elements && elements.length ? elements[0] : undefined;
        this.setContextKeys(stat);
        if (stat) {
            const enableTrash = Boolean(this.configurationService.getValue().files?.enableTrash);
            const hasCapability = this.fileService.hasCapability(stat.resource, 4096 /* FileSystemProviderCapabilities.Trash */);
            this.resourceMoveableToTrash.set(enableTrash && hasCapability);
        }
        else {
            this.resourceMoveableToTrash.reset();
        }
        const compressedNavigationControllers = stat && this.renderer.getCompressedNavigationController(stat);
        if (!compressedNavigationControllers) {
            this.compressedFocusContext.set(false);
            return;
        }
        this.compressedFocusContext.set(true);
        compressedNavigationControllers.forEach(controller => {
            this.updateCompressedNavigationContextKeys(controller);
        });
    }
    // General methods
    /**
     * Refresh the contents of the explorer to get up to date data from the disk about the file structure.
     * If the item is passed we refresh only that level of the tree, otherwise we do a full refresh.
     */
    refresh(recursive, item, cancelEditing = true) {
        if (!this.tree || !this.isBodyVisible() || (item && !this.tree.hasNode(item))) {
            // Tree node doesn't exist yet, when it becomes visible we will refresh
            return Promise.resolve(undefined);
        }
        if (cancelEditing && this.explorerService.isEditable(undefined)) {
            this.tree.domFocus();
        }
        const toRefresh = item || this.tree.getInput();
        return this.tree.updateChildren(toRefresh, recursive, !!item);
    }
    getOptimalWidth() {
        const parentNode = this.tree.getHTMLElement();
        const childNodes = [].slice.call(parentNode.querySelectorAll('.explorer-item .label-name')); // select all file labels
        return DOM.getLargestChildWidth(parentNode, childNodes);
    }
    async setTreeInput() {
        if (!this.isBodyVisible()) {
            return Promise.resolve(undefined);
        }
        // Wait for the last execution to complete before executing
        if (this.setTreeInputPromise) {
            await this.setTreeInputPromise;
        }
        const initialInputSetup = !this.tree.getInput();
        if (initialInputSetup) {
            perf.mark('code/willResolveExplorer');
        }
        const roots = this.explorerService.roots;
        let input = roots[0];
        if (this.contextService.getWorkbenchState() !== 2 /* WorkbenchState.FOLDER */ || roots[0].error) {
            // Display roots only when multi folder workspace
            input = roots;
        }
        let viewState;
        if (this.tree && this.tree.getInput()) {
            viewState = this.tree.getViewState();
        }
        else {
            const rawViewState = this.storageService.get(ExplorerView_1.TREE_VIEW_STATE_STORAGE_KEY, 1 /* StorageScope.WORKSPACE */);
            if (rawViewState) {
                viewState = JSON.parse(rawViewState);
            }
        }
        const previousInput = this.tree.getInput();
        const promise = this.setTreeInputPromise = this.tree.setInput(input, viewState).then(async () => {
            if (Array.isArray(input)) {
                if (!viewState || previousInput instanceof ExplorerItem) {
                    // There is no view state for this workspace (we transitioned from a folder workspace?), expand up to five roots.
                    // If there are many roots in a workspace, expanding them all would can cause performance issues #176226
                    for (let i = 0; i < Math.min(input.length, 5); i++) {
                        try {
                            await this.tree.expand(input[i]);
                        }
                        catch (e) { }
                    }
                }
                // Reloaded or transitioned from an empty workspace, but only have a single folder in the workspace.
                if (!previousInput && input.length === 1 && this.configurationService.getValue().explorer.expandSingleFolderWorkspaces) {
                    await this.tree.expand(input[0]).catch(() => { });
                }
                if (Array.isArray(previousInput)) {
                    const previousRoots = new ResourceMap();
                    previousInput.forEach(previousRoot => previousRoots.set(previousRoot.resource, true));
                    // Roots added to the explorer -> expand them.
                    await Promise.all(input.map(async (item) => {
                        if (!previousRoots.has(item.resource)) {
                            try {
                                await this.tree.expand(item);
                            }
                            catch (e) { }
                        }
                    }));
                }
            }
            if (initialInputSetup) {
                perf.mark('code/didResolveExplorer');
            }
        });
        this.progressService.withProgress({
            location: 1 /* ProgressLocation.Explorer */,
            delay: this.layoutService.isRestored() ? 800 : 1500 // reduce progress visibility when still restoring
        }, _progress => promise);
        await promise;
        if (!this.decorationsProvider) {
            this.decorationsProvider = new ExplorerDecorationsProvider(this.explorerService, this.contextService);
            this._register(this.decorationService.registerDecorationsProvider(this.decorationsProvider));
        }
    }
    async selectResource(resource, reveal = this._autoReveal, retry = 0) {
        // do no retry more than once to prevent infinite loops in cases of inconsistent model
        if (retry === 2) {
            return;
        }
        if (!resource || !this.isBodyVisible()) {
            return;
        }
        // If something is refreshing the explorer, we must await it or else a selection race condition can occur
        if (this.setTreeInputPromise) {
            await this.setTreeInputPromise;
        }
        // Expand all stats in the parent chain.
        let item = this.explorerService.findClosestRoot(resource);
        while (item && item.resource.toString() !== resource.toString()) {
            try {
                await this.tree.expand(item);
            }
            catch (e) {
                return this.selectResource(resource, reveal, retry + 1);
            }
            if (!item.children.size) {
                item = null;
            }
            else {
                for (const child of item.children.values()) {
                    if (this.uriIdentityService.extUri.isEqualOrParent(resource, child.resource)) {
                        item = child;
                        break;
                    }
                    item = null;
                }
            }
        }
        if (item) {
            if (item === this.tree.getInput()) {
                this.tree.setFocus([]);
                this.tree.setSelection([]);
                return;
            }
            try {
                // We must expand the nest to have it be populated in the tree
                if (item.nestedParent) {
                    await this.tree.expand(item.nestedParent);
                }
                if ((reveal === true || reveal === 'force') && this.tree.getRelativeTop(item) === null) {
                    // Don't scroll to the item if it's already visible, or if set not to.
                    this.tree.reveal(item, 0.5);
                }
                this.tree.setFocus([item]);
                this.tree.setSelection([item]);
            }
            catch (e) {
                // Element might not be in the tree, try again and silently fail
                return this.selectResource(resource, reveal, retry + 1);
            }
        }
    }
    itemsCopied(stats, cut, previousCut) {
        this.fileCopiedContextKey.set(stats.length > 0);
        this.resourceCutContextKey.set(cut && stats.length > 0);
        previousCut?.forEach(item => this.tree.rerender(item));
        if (cut) {
            stats.forEach(s => this.tree.rerender(s));
        }
    }
    expandAll() {
        if (this.explorerService.isEditable(undefined)) {
            this.tree.domFocus();
        }
        this.tree.expandAll();
    }
    collapseAll() {
        if (this.explorerService.isEditable(undefined)) {
            this.tree.domFocus();
        }
        const treeInput = this.tree.getInput();
        if (Array.isArray(treeInput)) {
            if (hasExpandedRootChild(this.tree, treeInput)) {
                treeInput.forEach(folder => {
                    folder.children.forEach(child => this.tree.hasNode(child) && this.tree.collapse(child, true));
                });
                return;
            }
        }
        this.tree.collapseAll();
    }
    previousCompressedStat() {
        const focused = this.tree.getFocus();
        if (!focused.length) {
            return;
        }
        const compressedNavigationControllers = this.renderer.getCompressedNavigationController(focused[0]);
        compressedNavigationControllers.forEach(controller => {
            controller.previous();
            this.updateCompressedNavigationContextKeys(controller);
        });
    }
    nextCompressedStat() {
        const focused = this.tree.getFocus();
        if (!focused.length) {
            return;
        }
        const compressedNavigationControllers = this.renderer.getCompressedNavigationController(focused[0]);
        compressedNavigationControllers.forEach(controller => {
            controller.next();
            this.updateCompressedNavigationContextKeys(controller);
        });
    }
    firstCompressedStat() {
        const focused = this.tree.getFocus();
        if (!focused.length) {
            return;
        }
        const compressedNavigationControllers = this.renderer.getCompressedNavigationController(focused[0]);
        compressedNavigationControllers.forEach(controller => {
            controller.first();
            this.updateCompressedNavigationContextKeys(controller);
        });
    }
    lastCompressedStat() {
        const focused = this.tree.getFocus();
        if (!focused.length) {
            return;
        }
        const compressedNavigationControllers = this.renderer.getCompressedNavigationController(focused[0]);
        compressedNavigationControllers.forEach(controller => {
            controller.last();
            this.updateCompressedNavigationContextKeys(controller);
        });
    }
    updateCompressedNavigationContextKeys(controller) {
        this.compressedFocusFirstContext.set(controller.index === 0);
        this.compressedFocusLastContext.set(controller.index === controller.count - 1);
    }
    updateAnyCollapsedContext() {
        const treeInput = this.tree.getInput();
        if (treeInput === undefined) {
            return;
        }
        const treeInputArray = Array.isArray(treeInput) ? treeInput : Array.from(treeInput.children.values());
        // Has collapsible root when anything is expanded
        this.viewHasSomeCollapsibleRootItem.set(hasExpandedNode(this.tree, treeInputArray));
        // synchronize state to cache
        this.storeTreeViewState();
    }
    dispose() {
        this.dragHandler?.dispose();
        super.dispose();
    }
};
__decorate([
    memoize,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ExplorerView.prototype, "fileCopiedContextKey", null);
__decorate([
    memoize,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ExplorerView.prototype, "resourceCutContextKey", null);
ExplorerView = ExplorerView_1 = __decorate([
    __param(1, IContextMenuService),
    __param(2, IViewDescriptorService),
    __param(3, IInstantiationService),
    __param(4, IWorkspaceContextService),
    __param(5, IProgressService),
    __param(6, IEditorService),
    __param(7, IEditorResolverService),
    __param(8, IWorkbenchLayoutService),
    __param(9, IKeybindingService),
    __param(10, IContextKeyService),
    __param(11, IConfigurationService),
    __param(12, IDecorationsService),
    __param(13, ILabelService),
    __param(14, IThemeService),
    __param(15, ITelemetryService),
    __param(16, IHoverService),
    __param(17, IExplorerService),
    __param(18, IStorageService),
    __param(19, IClipboardService),
    __param(20, IFileService),
    __param(21, IUriIdentityService),
    __param(22, ICommandService),
    __param(23, IOpenerService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], ExplorerView);
export { ExplorerView };
export function createFileIconThemableTreeContainerScope(container, themeService) {
    container.classList.add('file-icon-themable-tree');
    container.classList.add('show-file-icons');
    const onDidChangeFileIconTheme = (theme) => {
        container.classList.toggle('align-icons-and-twisties', theme.hasFileIcons && !theme.hasFolderIcons);
        container.classList.toggle('hide-arrows', theme.hidesExplorerArrows === true);
    };
    onDidChangeFileIconTheme(themeService.getFileIconTheme());
    return themeService.onDidFileIconThemeChange(onDidChangeFileIconTheme);
}
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'workbench.files.action.createFileFromExplorer',
            title: nls.localize('createNewFile', "New File..."),
            f1: false,
            icon: Codicon.newFile,
            precondition: ExplorerResourceNotReadonlyContext,
            menu: {
                id: MenuId.ViewTitle,
                group: 'navigation',
                when: ContextKeyExpr.equals('view', VIEW_ID),
                order: 10
            }
        });
    }
    run(accessor) {
        const commandService = accessor.get(ICommandService);
        commandService.executeCommand(NEW_FILE_COMMAND_ID);
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'workbench.files.action.createFolderFromExplorer',
            title: nls.localize('createNewFolder', "New Folder..."),
            f1: false,
            icon: Codicon.newFolder,
            precondition: ExplorerResourceNotReadonlyContext,
            menu: {
                id: MenuId.ViewTitle,
                group: 'navigation',
                when: ContextKeyExpr.equals('view', VIEW_ID),
                order: 20
            }
        });
    }
    run(accessor) {
        const commandService = accessor.get(ICommandService);
        commandService.executeCommand(NEW_FOLDER_COMMAND_ID);
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'workbench.files.action.refreshFilesExplorer',
            title: nls.localize2('refreshExplorer', "Refresh Explorer"),
            f1: true,
            icon: Codicon.refresh,
            menu: {
                id: MenuId.ViewTitle,
                group: 'navigation',
                when: ContextKeyExpr.equals('view', VIEW_ID),
                order: 30
            },
            metadata: {
                description: nls.localize2('refreshExplorerMetadata', "Forces a refresh of the Explorer.")
            }
        });
    }
    async run(accessor) {
        const viewsService = accessor.get(IViewsService);
        const explorerService = accessor.get(IExplorerService);
        await viewsService.openView(VIEW_ID);
        await explorerService.refresh();
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'workbench.files.action.collapseExplorerFolders',
            title: nls.localize2('collapseExplorerFolders', "Collapse Folders in Explorer"),
            f1: true,
            icon: Codicon.collapseAll,
            menu: {
                id: MenuId.ViewTitle,
                group: 'navigation',
                when: ContextKeyExpr.equals('view', VIEW_ID),
                order: 40
            },
            metadata: {
                description: nls.localize2('collapseExplorerFoldersMetadata', "Folds all folders in the Explorer.")
            }
        });
    }
    run(accessor) {
        const viewsService = accessor.get(IViewsService);
        const view = viewsService.getViewWithId(VIEW_ID);
        if (view !== null) {
            const explorerView = view;
            explorerView.collapseAll();
        }
    }
});
