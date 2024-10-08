/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { ElementsDragAndDropData } from '../list/listView.js';
import { ComposedTreeDelegate, AbstractFindController } from './abstractTree.js';
import { getVisibleState, isFilterResult } from './indexTreeModel.js';
import { CompressibleObjectTree, ObjectTree } from './objectTree.js';
import { ObjectTreeElementCollapseState, TreeError, WeakMapper } from './tree.js';
import { createCancelablePromise, Promises, timeout, TimeoutTimer } from '../../../common/async.js';
import { Codicon } from '../../../common/codicons.js';
import { ThemeIcon } from '../../../common/themables.js';
import { isCancellationError, onUnexpectedError } from '../../../common/errors.js';
import { Emitter, Event } from '../../../common/event.js';
import { Iterable } from '../../../common/iterator.js';
import { DisposableStore, dispose } from '../../../common/lifecycle.js';
import { isIterable, isNumber } from '../../../common/types.js';
import { CancellationTokenSource } from '../../../common/cancellation.js';
import { FuzzyScore } from '../../../common/filters.js';
function createAsyncDataTreeNode(props) {
    return {
        ...props,
        children: [],
        refreshPromise: undefined,
        stale: true,
        slow: false,
        forceExpanded: false
    };
}
function isAncestor(ancestor, descendant) {
    if (!descendant.parent) {
        return false;
    }
    else if (descendant.parent === ancestor) {
        return true;
    }
    else {
        return isAncestor(ancestor, descendant.parent);
    }
}
function intersects(node, other) {
    return node === other || isAncestor(node, other) || isAncestor(other, node);
}
class AsyncDataTreeNodeWrapper {
    get element() { return this.node.element.element; }
    get children() { return this.node.children.map(node => new AsyncDataTreeNodeWrapper(node)); }
    get depth() { return this.node.depth; }
    get visibleChildrenCount() { return this.node.visibleChildrenCount; }
    get visibleChildIndex() { return this.node.visibleChildIndex; }
    get collapsible() { return this.node.collapsible; }
    get collapsed() { return this.node.collapsed; }
    get visible() { return this.node.visible; }
    get filterData() { return this.node.filterData; }
    constructor(node) {
        this.node = node;
    }
}
class AsyncDataTreeRenderer {
    constructor(renderer, nodeMapper, onDidChangeTwistieState) {
        this.renderer = renderer;
        this.nodeMapper = nodeMapper;
        this.onDidChangeTwistieState = onDidChangeTwistieState;
        this.renderedNodes = new Map();
        this.templateId = renderer.templateId;
    }
    renderTemplate(container) {
        const templateData = this.renderer.renderTemplate(container);
        return { templateData };
    }
    renderElement(node, index, templateData, height) {
        this.renderer.renderElement(this.nodeMapper.map(node), index, templateData.templateData, height);
    }
    renderTwistie(element, twistieElement) {
        if (element.slow) {
            twistieElement.classList.add(...ThemeIcon.asClassNameArray(Codicon.treeItemLoading));
            return true;
        }
        else {
            twistieElement.classList.remove(...ThemeIcon.asClassNameArray(Codicon.treeItemLoading));
            return false;
        }
    }
    disposeElement(node, index, templateData, height) {
        this.renderer.disposeElement?.(this.nodeMapper.map(node), index, templateData.templateData, height);
    }
    disposeTemplate(templateData) {
        this.renderer.disposeTemplate(templateData.templateData);
    }
    dispose() {
        this.renderedNodes.clear();
    }
}
function asTreeEvent(e) {
    return {
        browserEvent: e.browserEvent,
        elements: e.elements.map(e => e.element)
    };
}
function asTreeMouseEvent(e) {
    return {
        browserEvent: e.browserEvent,
        element: e.element && e.element.element,
        target: e.target
    };
}
function asTreeContextMenuEvent(e) {
    return {
        browserEvent: e.browserEvent,
        element: e.element && e.element.element,
        anchor: e.anchor,
        isStickyScroll: e.isStickyScroll
    };
}
class AsyncDataTreeElementsDragAndDropData extends ElementsDragAndDropData {
    set context(context) {
        this.data.context = context;
    }
    get context() {
        return this.data.context;
    }
    constructor(data) {
        super(data.elements.map(node => node.element));
        this.data = data;
    }
}
function asAsyncDataTreeDragAndDropData(data) {
    if (data instanceof ElementsDragAndDropData) {
        return new AsyncDataTreeElementsDragAndDropData(data);
    }
    return data;
}
class AsyncDataTreeNodeListDragAndDrop {
    constructor(dnd) {
        this.dnd = dnd;
    }
    getDragURI(node) {
        return this.dnd.getDragURI(node.element);
    }
    getDragLabel(nodes, originalEvent) {
        if (this.dnd.getDragLabel) {
            return this.dnd.getDragLabel(nodes.map(node => node.element), originalEvent);
        }
        return undefined;
    }
    onDragStart(data, originalEvent) {
        this.dnd.onDragStart?.(asAsyncDataTreeDragAndDropData(data), originalEvent);
    }
    onDragOver(data, targetNode, targetIndex, targetSector, originalEvent, raw = true) {
        return this.dnd.onDragOver(asAsyncDataTreeDragAndDropData(data), targetNode && targetNode.element, targetIndex, targetSector, originalEvent);
    }
    drop(data, targetNode, targetIndex, targetSector, originalEvent) {
        this.dnd.drop(asAsyncDataTreeDragAndDropData(data), targetNode && targetNode.element, targetIndex, targetSector, originalEvent);
    }
    onDragEnd(originalEvent) {
        this.dnd.onDragEnd?.(originalEvent);
    }
    dispose() {
        this.dnd.dispose();
    }
}
class AsyncFindTreeNode {
    get children() {
        return this._children.values();
    }
    constructor(element, id, sorter) {
        this.element = element;
        this.id = id;
        this.sorter = sorter;
        this._children = [];
    }
    addChild(child) {
        if (!this.sorter) {
            this._children.push(child);
            return;
        }
        const index = this._children.findIndex(existingChild => this.sorter.compare(child.element, existingChild.element) < 0);
        if (index !== -1) {
            this._children.splice(index, 0, child);
        }
        else {
            this._children.push(child);
        }
    }
}
class AsyncFindTree {
    get rootNodes() {
        return [...this.root.children];
    }
    get totalLeafs() {
        return this._totalLeafs;
    }
    get totalNodes() {
        return this.cachedNodes.size;
    }
    get results() {
        return [...this._results];
    }
    constructor(dataSource, identityProvider, sorter) {
        this.dataSource = dataSource;
        this.identityProvider = identityProvider;
        this.sorter = sorter;
        this.cachedNodes = new Map();
        this.root = new AsyncFindTreeNode(undefined, '_AsyncFindTreeRoot_', this.sorter);
        this._totalLeafs = 0;
        this._results = [];
        if (!dataSource.getParent) {
            throw new Error('Data source must implement `getParent`');
        }
    }
    add(result) {
        this._results.push(result);
        const element = result.element;
        const elementId = this.identityProvider.getId(element).toString();
        if (this.cachedNodes.has(elementId)) {
            return;
        }
        this._totalLeafs++;
        const node = new AsyncFindTreeNode(element, elementId, this.sorter);
        this.cachedNodes.set(elementId, node);
        // Set up parents up till root
        let currentNode = node;
        while (true) {
            let currentParentElement = this.dataSource.getParent(currentNode.element);
            // is root
            if (currentParentElement === currentNode.element) {
                this.root.addChild(currentNode);
                break;
            }
            currentParentElement = currentParentElement;
            // is already in the tree
            const parentId = this.identityProvider.getId(currentParentElement).toString();
            const parentNode = this.cachedNodes.get(parentId);
            if (parentNode) {
                parentNode.addChild(currentNode);
                break;
            }
            // create parent node
            const newParent = new AsyncFindTreeNode(currentParentElement, parentId, this.sorter);
            this.cachedNodes.set(parentId, newParent);
            newParent.addChild(currentNode);
            currentNode = newParent;
        }
    }
}
class AsyncFindFilter {
    constructor(_filter) {
        this._filter = _filter;
        this.pattern = '';
        this.findFilterData = new Map();
        this.disposables = new DisposableStore();
    }
    setFindResults(findResults) {
        this.findFilterData = new Map(findResults.
            filter(result => result.filterdata !== undefined).
            map(result => [result.element, result.filterdata]));
    }
    filter(element, parentVisibility) {
        let visibility = 1 /* TreeVisibility.Visible */;
        if (this._filter) {
            const result = this._filter.filter(element, parentVisibility);
            if (typeof result === 'boolean') {
                visibility = result ? 1 /* TreeVisibility.Visible */ : 0 /* TreeVisibility.Hidden */;
            }
            else if (isFilterResult(result)) {
                visibility = getVisibleState(result.visibility);
            }
            else {
                visibility = result;
            }
            if (visibility === 0 /* TreeVisibility.Hidden */) {
                return false;
            }
        }
        const filterData = this.findFilterData.get(element.element);
        if (filterData !== undefined) {
            return { data: filterData, visibility };
        }
        return { data: FuzzyScore.Default, visibility };
    }
    dispose() {
        dispose(this.disposables);
    }
}
class AsyncFindController extends AbstractFindController {
    constructor(user, tree, findProvider, filter, sorter, dataSource, identityProvider, contextViewProvider, options, asTreeElement) {
        super(tree, filter, contextViewProvider, { ...options, placeholder: findProvider.placeholder, toggles: findProvider.toggles });
        this.user = user;
        this.tree = tree;
        this.findProvider = findProvider;
        this.sorter = sorter;
        this.dataSource = dataSource;
        this.identityProvider = identityProvider;
        this.asTreeElement = asTreeElement;
        this.nodes = new Map();
        this.previousFocus = [];
        this.previousSelection = [];
        this.sessionId = 0;
        this.active = false;
        this.store = new DisposableStore();
        this.model = tree.getModel();
        this.scheduler = this.store.add(new TimeoutTimer());
    }
    setFindModeActive(active) {
        if (this.active === active) {
            return;
        }
        if (active) {
            this.activateFindMode();
        }
        else {
            this.deactivateFindMode();
        }
        this.active = active;
    }
    activateFindMode() {
        this.sessionId++;
        // store tree view state
        this.previousScrollTop = this.tree.scrollTop;
        this.previousFocus = this.tree.getFocus();
        this.previousSelection = this.tree.getSelection();
        this.tree.scrollTop = 0;
        const findModel = this.tree.createNewModel({ filter: this.filter });
        this.tree.setModel(findModel);
    }
    deactivateFindMode() {
        const focus = this.tree.getFocus()[0];
        this.tree.setModel(this.model);
        if (focus && focus.element && this.findProvider.revealResultInTree) {
            this.findProvider.revealResultInTree(focus.element);
        }
        else {
            this.tree.scrollTop = this.previousScrollTop ?? 0;
            this.tree.setFocus(this.previousFocus);
            this.tree.setSelection(this.previousSelection);
        }
        this.activeTokenSource = undefined;
        this.nodes.clear();
    }
    applyPattern(pattern) {
        this.renderMessage(false);
        this.scheduler.cancel();
        this.activeTokenSource?.cancel();
        if (!pattern) {
            this.setFindModeActive(false);
            return;
        }
        this.activeTokenSource = new CancellationTokenSource();
        const results = this.findProvider.getFindResults(pattern, this.sessionId, this.activeTokenSource.token, this.toggles.states());
        this.pocessFindResults(results, this.activeTokenSource.token);
    }
    async pocessFindResults(results, token) {
        if (!this.dataSource.getParent || !this.identityProvider) {
            return;
        }
        // Remove all nodes
        this.clearFindResults();
        const findTree = new AsyncFindTree(this.dataSource, this.identityProvider, this.sorter);
        for await (const result of results) {
            if (token.isCancellationRequested) {
                return;
            }
            findTree.add(result);
        }
        if (token.isCancellationRequested) {
            return;
        }
        // Redraw at the end
        this.setFindResults(findTree);
        this.activeTokenSource?.dispose();
        this.activeTokenSource = undefined;
    }
    clearFindResults() {
        this.schedule(() => {
            if (!this.active) {
                this.setFindModeActive(true);
                return;
            }
            else {
                this.filter.setFindResults([]);
                this.tree.setChildren(null, []);
            }
        }, 600);
    }
    setFindResults(findTree) {
        const rootChildren = [];
        for (const rootNodes of findTree.rootNodes) {
            rootChildren.push(this.asTreeElement(this.findNodeToAsyncNode(rootNodes, null)));
        }
        this.schedule(() => {
            this.setFindModeActive(true);
            this.filter.setFindResults(findTree.results);
            this.tree.setChildren(null, rootChildren);
            this.renderMessage(rootChildren.length === 0);
            this.alertResults(findTree.totalLeafs);
        }, 0);
    }
    findNodeToAsyncNode(node, parent) {
        const children = [];
        if (node.element === undefined) {
            throw new TreeError(this.user, 'Found node without an element');
        }
        const asyncNode = {
            element: node.element,
            parent,
            children,
            hasChildren: false,
            defaultCollapseState: ObjectTreeElementCollapseState.PreserveOrExpanded,
            stale: false,
            refreshPromise: undefined,
            slow: false,
            forceExpanded: false
        };
        for (const child of node.children) {
            children.push(this.findNodeToAsyncNode(child, asyncNode));
        }
        asyncNode.hasChildren = !!children.length;
        this.nodes.set(node.element, asyncNode);
        return asyncNode;
    }
    schedule(fn, delay) {
        if (delay === 0) {
            this.scheduler.cancel();
            fn();
            return;
        }
        this.scheduler.cancelAndSet(fn, delay);
    }
    onDidToggleChange(e) {
        super.onDidToggleChange(e);
        this.applyPattern(this.pattern);
    }
    getDataNode(element) {
        return this.nodes.get(element);
    }
    dispose() {
        super.dispose();
        this.store.dispose();
    }
}
function asObjectTreeOptions(options) {
    return options && {
        ...options,
        collapseByDefault: true,
        identityProvider: options.identityProvider && {
            getId(el) {
                return options.identityProvider.getId(el.element);
            }
        },
        dnd: options.dnd && new AsyncDataTreeNodeListDragAndDrop(options.dnd),
        multipleSelectionController: options.multipleSelectionController && {
            isSelectionSingleChangeEvent(e) {
                return options.multipleSelectionController.isSelectionSingleChangeEvent({ ...e, element: e.element });
            },
            isSelectionRangeChangeEvent(e) {
                return options.multipleSelectionController.isSelectionRangeChangeEvent({ ...e, element: e.element });
            }
        },
        accessibilityProvider: options.accessibilityProvider && {
            ...options.accessibilityProvider,
            getPosInSet: undefined,
            getSetSize: undefined,
            getRole: options.accessibilityProvider.getRole ? (el) => {
                return options.accessibilityProvider.getRole(el.element);
            } : () => 'treeitem',
            isChecked: options.accessibilityProvider.isChecked ? (e) => {
                return !!(options.accessibilityProvider?.isChecked(e.element));
            } : undefined,
            getAriaLabel(e) {
                return options.accessibilityProvider.getAriaLabel(e.element);
            },
            getWidgetAriaLabel() {
                return options.accessibilityProvider.getWidgetAriaLabel();
            },
            getWidgetRole: options.accessibilityProvider.getWidgetRole ? () => options.accessibilityProvider.getWidgetRole() : () => 'tree',
            getAriaLevel: options.accessibilityProvider.getAriaLevel && (node => {
                return options.accessibilityProvider.getAriaLevel(node.element);
            }),
            getActiveDescendantId: options.accessibilityProvider.getActiveDescendantId && (node => {
                return options.accessibilityProvider.getActiveDescendantId(node.element);
            })
        },
        filter: options.filter && {
            filter(e, parentVisibility) {
                return options.filter.filter(e.element, parentVisibility);
            }
        },
        keyboardNavigationLabelProvider: options.keyboardNavigationLabelProvider && {
            ...options.keyboardNavigationLabelProvider,
            getKeyboardNavigationLabel(e) {
                return options.keyboardNavigationLabelProvider.getKeyboardNavigationLabel(e.element);
            }
        },
        sorter: undefined,
        expandOnlyOnTwistieClick: typeof options.expandOnlyOnTwistieClick === 'undefined' ? undefined : (typeof options.expandOnlyOnTwistieClick !== 'function' ? options.expandOnlyOnTwistieClick : (e => options.expandOnlyOnTwistieClick(e.element))),
        defaultFindVisibility: e => {
            if (e.hasChildren && e.stale) {
                return 1 /* TreeVisibility.Visible */;
            }
            else if (typeof options.defaultFindVisibility === 'number') {
                return options.defaultFindVisibility;
            }
            else if (typeof options.defaultFindVisibility === 'undefined') {
                return 2 /* TreeVisibility.Recurse */;
            }
            else {
                return options.defaultFindVisibility(e.element);
            }
        }
    };
}
function dfs(node, fn) {
    fn(node);
    node.children.forEach(child => dfs(child, fn));
}
export class AsyncDataTree {
    get onDidScroll() { return this.tree.onDidScroll; }
    get onDidChangeFocus() { return Event.map(this.tree.onDidChangeFocus, asTreeEvent); }
    get onDidChangeSelection() { return Event.map(this.tree.onDidChangeSelection, asTreeEvent); }
    get onKeyDown() { return this.tree.onKeyDown; }
    get onMouseClick() { return Event.map(this.tree.onMouseClick, asTreeMouseEvent); }
    get onMouseDblClick() { return Event.map(this.tree.onMouseDblClick, asTreeMouseEvent); }
    get onContextMenu() { return Event.map(this.tree.onContextMenu, asTreeContextMenuEvent); }
    get onTap() { return Event.map(this.tree.onTap, asTreeMouseEvent); }
    get onPointer() { return Event.map(this.tree.onPointer, asTreeMouseEvent); }
    get onDidFocus() { return this.tree.onDidFocus; }
    get onDidBlur() { return this.tree.onDidBlur; }
    /**
     * To be used internally only!
     * @deprecated
     */
    get onDidChangeModel() { return this.tree.onDidChangeModel; }
    get onDidChangeCollapseState() { return this.tree.onDidChangeCollapseState; }
    get onDidUpdateOptions() { return this.tree.onDidUpdateOptions; }
    get onDidChangeStickyScrollFocused() { return this.tree.onDidChangeStickyScrollFocused; }
    get findMode() { return this.tree.findMode; }
    set findMode(mode) { this.tree.findMode = mode; }
    get findMatchType() { return this.tree.findMatchType; }
    set findMatchType(matchType) { this.tree.findMatchType = matchType; }
    get expandOnlyOnTwistieClick() {
        if (typeof this.tree.expandOnlyOnTwistieClick === 'boolean') {
            return this.tree.expandOnlyOnTwistieClick;
        }
        const fn = this.tree.expandOnlyOnTwistieClick;
        return element => fn(this.nodes.get((element === this.root.element ? null : element)) || null);
    }
    get onDidDispose() { return this.tree.onDidDispose; }
    constructor(user, container, delegate, renderers, dataSource, options = {}) {
        this.user = user;
        this.dataSource = dataSource;
        this.nodes = new Map();
        this.subTreeRefreshPromises = new Map();
        this.refreshPromises = new Map();
        this._onDidRender = new Emitter();
        this._onDidChangeNodeSlowState = new Emitter();
        this.nodeMapper = new WeakMapper(node => new AsyncDataTreeNodeWrapper(node));
        this.disposables = new DisposableStore();
        this.identityProvider = options.identityProvider;
        this.autoExpandSingleChildren = typeof options.autoExpandSingleChildren === 'undefined' ? false : options.autoExpandSingleChildren;
        this.sorter = options.sorter;
        this.getDefaultCollapseState = e => options.collapseByDefault ? (options.collapseByDefault(e) ? ObjectTreeElementCollapseState.PreserveOrCollapsed : ObjectTreeElementCollapseState.PreserveOrExpanded) : undefined;
        let asyncFindEnabled = false;
        if (options.findResultsProvider && (options.findWidgetEnabled ?? true) && options.keyboardNavigationLabelProvider && options.contextViewProvider) {
            if (!this.dataSource.getParent || !this.identityProvider) {
                throw new TreeError(this.user, 'Find Provider requires `getParent` and `identityProvider`');
            }
            asyncFindEnabled = true;
        }
        this.tree = this.createTree(user, container, delegate, renderers, { ...options, findWidgetEnabled: !asyncFindEnabled });
        this.model = this.tree.getModel();
        this.root = createAsyncDataTreeNode({
            element: undefined,
            parent: null,
            hasChildren: true,
            defaultCollapseState: undefined
        });
        if (this.identityProvider) {
            this.root = {
                ...this.root,
                id: null
            };
        }
        this.nodes.set(null, this.root);
        this.tree.onDidChangeCollapseState(this._onDidChangeCollapseState, this, this.disposables);
        if (asyncFindEnabled) {
            const findFilter = this.disposables.add(new AsyncFindFilter(this.tree.options.filter));
            const findOptions = { styles: options.findWidgetStyles, showNotFoundMessage: options.showNotFoundMessage };
            this.findController = this.disposables.add(new AsyncFindController(user, this.tree, options.findResultsProvider, findFilter, this.sorter, this.dataSource, this.identityProvider, options.contextViewProvider, findOptions, node => this.asTreeElement(node)));
            this.onDidChangeFindOpenState = this.findController.onDidChangeOpenState;
            this.onDidChangeFindMode = Event.None;
            this.onDidChangeFindMatchType = Event.None;
        }
        else {
            this.onDidChangeFindOpenState = this.tree.onDidChangeFindOpenState;
            this.onDidChangeFindMode = this.tree.onDidChangeFindMode;
            this.onDidChangeFindMatchType = this.tree.onDidChangeFindMatchType;
        }
    }
    createTree(user, container, delegate, renderers, options) {
        const objectTreeDelegate = new ComposedTreeDelegate(delegate);
        const objectTreeRenderers = renderers.map(r => new AsyncDataTreeRenderer(r, this.nodeMapper, this._onDidChangeNodeSlowState.event));
        const objectTreeOptions = asObjectTreeOptions(options) || {};
        return new ObjectTree(user, container, objectTreeDelegate, objectTreeRenderers, objectTreeOptions);
    }
    updateOptions(options = {}) {
        this.tree.updateOptions(options);
    }
    get options() {
        return this.tree.options;
    }
    // Widget
    getHTMLElement() {
        return this.tree.getHTMLElement();
    }
    get contentHeight() {
        return this.tree.contentHeight;
    }
    get contentWidth() {
        return this.tree.contentWidth;
    }
    get onDidChangeContentHeight() {
        return this.tree.onDidChangeContentHeight;
    }
    get onDidChangeContentWidth() {
        return this.tree.onDidChangeContentWidth;
    }
    get scrollTop() {
        return this.tree.scrollTop;
    }
    set scrollTop(scrollTop) {
        this.tree.scrollTop = scrollTop;
    }
    get scrollLeft() {
        return this.tree.scrollLeft;
    }
    set scrollLeft(scrollLeft) {
        this.tree.scrollLeft = scrollLeft;
    }
    get scrollHeight() {
        return this.tree.scrollHeight;
    }
    get renderHeight() {
        return this.tree.renderHeight;
    }
    get lastVisibleElement() {
        return this.tree.lastVisibleElement.element;
    }
    get ariaLabel() {
        return this.tree.ariaLabel;
    }
    set ariaLabel(value) {
        this.tree.ariaLabel = value;
    }
    domFocus() {
        this.tree.domFocus();
    }
    isDOMFocused() {
        return this.tree.isDOMFocused();
    }
    navigate(start) {
        let startNode;
        if (start) {
            startNode = this.getDataNode(start);
        }
        return new AsyncDataTreeNavigator(this.tree.navigate(startNode));
    }
    layout(height, width) {
        this.tree.layout(height, width);
        if (isNumber(width)) {
            this.findController?.layout(width);
        }
    }
    style(styles) {
        this.tree.style(styles);
    }
    // Model
    getInput() {
        return this.root.element;
    }
    async setInput(input, viewState) {
        this.refreshPromises.forEach(promise => promise.cancel());
        this.refreshPromises.clear();
        this.root.element = input;
        const viewStateContext = viewState && { viewState, focus: [], selection: [] };
        await this._updateChildren(input, true, false, viewStateContext);
        if (viewStateContext) {
            this.tree.setFocus(viewStateContext.focus);
            this.tree.setSelection(viewStateContext.selection);
        }
        if (viewState && typeof viewState.scrollTop === 'number') {
            this.scrollTop = viewState.scrollTop;
        }
    }
    async updateChildren(element = this.root.element, recursive = true, rerender = false, options) {
        await this._updateChildren(element, recursive, rerender, undefined, options);
    }
    async _updateChildren(element = this.root.element, recursive = true, rerender = false, viewStateContext, options) {
        if (typeof this.root.element === 'undefined') {
            throw new TreeError(this.user, 'Tree input not set');
        }
        if (this.root.refreshPromise) {
            await this.root.refreshPromise;
            await Event.toPromise(this._onDidRender.event);
        }
        const node = this.getDataNode(element);
        await this.refreshAndRenderNode(node, recursive, viewStateContext, options);
        if (rerender) {
            try {
                this.tree.rerender(node);
            }
            catch {
                // missing nodes are fine, this could've resulted from
                // parallel refresh calls, removing `node` altogether
            }
        }
    }
    resort(element = this.root.element, recursive = true) {
        this.model.resort(this.getDataNode(element), recursive);
    }
    hasNode(element) {
        return element === this.root.element || this.nodes.has(element);
    }
    // View
    rerender(element) {
        if (element === undefined || element === this.root.element) {
            this.tree.rerender();
            return;
        }
        const node = this.getDataNode(element);
        this.tree.rerender(node);
    }
    updateElementHeight(element, height) {
        const node = this.getDataNode(element);
        this.tree.updateElementHeight(node, height);
    }
    updateWidth(element) {
        const node = this.getDataNode(element);
        this.tree.updateWidth(node);
    }
    // Tree
    getNode(element = this.root.element) {
        const dataNode = this.getDataNode(element);
        const node = this.tree.getNode(dataNode === this.root ? null : dataNode);
        return this.nodeMapper.map(node);
    }
    collapse(element, recursive = false) {
        const node = this.getDataNode(element);
        return this.tree.collapse(node === this.root ? null : node, recursive);
    }
    async expand(element, recursive = false) {
        if (typeof this.root.element === 'undefined') {
            throw new TreeError(this.user, 'Tree input not set');
        }
        if (this.root.refreshPromise) {
            await this.root.refreshPromise;
            await Event.toPromise(this._onDidRender.event);
        }
        const node = this.getDataNode(element);
        if (this.tree.hasElement(node) && !this.tree.isCollapsible(node)) {
            return false;
        }
        if (node.refreshPromise) {
            await this.root.refreshPromise;
            await Event.toPromise(this._onDidRender.event);
        }
        if (node !== this.root && !node.refreshPromise && !this.tree.isCollapsed(node)) {
            return false;
        }
        const result = this.tree.expand(node === this.root ? null : node, recursive);
        if (node.refreshPromise) {
            await this.root.refreshPromise;
            await Event.toPromise(this._onDidRender.event);
        }
        return result;
    }
    toggleCollapsed(element, recursive = false) {
        return this.tree.toggleCollapsed(this.getDataNode(element), recursive);
    }
    expandAll() {
        this.tree.expandAll();
    }
    async expandTo(element) {
        if (!this.dataSource.getParent) {
            throw new Error('Can\'t expand to element without getParent method');
        }
        const elements = [];
        while (!this.hasNode(element)) {
            element = this.dataSource.getParent(element);
            if (element !== this.root.element) {
                elements.push(element);
            }
        }
        for (const element of Iterable.reverse(elements)) {
            await this.expand(element);
        }
        this.tree.expandTo(this.getDataNode(element));
    }
    collapseAll() {
        this.tree.collapseAll();
    }
    isCollapsible(element) {
        return this.tree.isCollapsible(this.getDataNode(element));
    }
    isCollapsed(element) {
        return this.tree.isCollapsed(this.getDataNode(element));
    }
    triggerTypeNavigation() {
        this.tree.triggerTypeNavigation();
    }
    openFind() {
        if (this.findController) {
            this.findController.open();
        }
        else {
            this.tree.openFind();
        }
    }
    closeFind() {
        if (this.findController) {
            this.findController.close();
        }
        else {
            this.tree.closeFind();
        }
    }
    refilter() {
        this.tree.refilter();
    }
    setAnchor(element) {
        this.tree.setAnchor(typeof element === 'undefined' ? undefined : this.getDataNode(element));
    }
    getAnchor() {
        const node = this.tree.getAnchor();
        return node?.element;
    }
    setSelection(elements, browserEvent) {
        const nodes = elements.map(e => this.getDataNode(e));
        this.tree.setSelection(nodes, browserEvent);
    }
    getSelection() {
        const nodes = this.tree.getSelection();
        return nodes.map(n => n.element);
    }
    setFocus(elements, browserEvent) {
        const nodes = elements.map(e => this.getDataNode(e));
        this.tree.setFocus(nodes, browserEvent);
    }
    focusNext(n = 1, loop = false, browserEvent) {
        this.tree.focusNext(n, loop, browserEvent);
    }
    focusPrevious(n = 1, loop = false, browserEvent) {
        this.tree.focusPrevious(n, loop, browserEvent);
    }
    focusNextPage(browserEvent) {
        return this.tree.focusNextPage(browserEvent);
    }
    focusPreviousPage(browserEvent) {
        return this.tree.focusPreviousPage(browserEvent);
    }
    focusLast(browserEvent) {
        this.tree.focusLast(browserEvent);
    }
    focusFirst(browserEvent) {
        this.tree.focusFirst(browserEvent);
    }
    getFocus() {
        const nodes = this.tree.getFocus();
        return nodes.map(n => n.element);
    }
    getStickyScrollFocus() {
        const nodes = this.tree.getStickyScrollFocus();
        return nodes.map(n => n.element);
    }
    getFocusedPart() {
        return this.tree.getFocusedPart();
    }
    reveal(element, relativeTop) {
        this.tree.reveal(this.getDataNode(element), relativeTop);
    }
    getRelativeTop(element) {
        return this.tree.getRelativeTop(this.getDataNode(element));
    }
    // Tree navigation
    getParentElement(element) {
        const node = this.tree.getParentElement(this.getDataNode(element));
        return (node && node.element);
    }
    getFirstElementChild(element = this.root.element) {
        const dataNode = this.getDataNode(element);
        const node = this.tree.getFirstElementChild(dataNode === this.root ? null : dataNode);
        return (node && node.element);
    }
    // Implementation
    getDataNode(element) {
        const asyncFindNode = this.findController?.getDataNode(element);
        if (asyncFindNode) {
            return asyncFindNode;
        }
        const node = this.nodes.get((element === this.root.element ? null : element));
        if (!node) {
            throw new TreeError(this.user, `Data tree node not found: ${element}`);
        }
        return node;
    }
    async refreshAndRenderNode(node, recursive, viewStateContext, options) {
        await this.refreshNode(node, recursive, viewStateContext);
        if (this.disposables.isDisposed) {
            return; // tree disposed during refresh (#199264)
        }
        this.render(node, viewStateContext, options);
    }
    async refreshNode(node, recursive, viewStateContext) {
        let result;
        this.subTreeRefreshPromises.forEach((refreshPromise, refreshNode) => {
            if (!result && intersects(refreshNode, node)) {
                result = refreshPromise.then(() => this.refreshNode(node, recursive, viewStateContext));
            }
        });
        if (result) {
            return result;
        }
        if (node !== this.root) {
            const treeNode = this.tree.getNode(node);
            if (treeNode.collapsed) {
                node.hasChildren = !!this.dataSource.hasChildren(node.element);
                node.stale = true;
                this.setChildren(node, [], recursive, viewStateContext);
                return;
            }
        }
        return this.doRefreshSubTree(node, recursive, viewStateContext);
    }
    async doRefreshSubTree(node, recursive, viewStateContext) {
        let done;
        node.refreshPromise = new Promise(c => done = c);
        this.subTreeRefreshPromises.set(node, node.refreshPromise);
        node.refreshPromise.finally(() => {
            node.refreshPromise = undefined;
            this.subTreeRefreshPromises.delete(node);
        });
        try {
            const childrenToRefresh = await this.doRefreshNode(node, recursive, viewStateContext);
            node.stale = false;
            await Promises.settled(childrenToRefresh.map(child => this.doRefreshSubTree(child, recursive, viewStateContext)));
        }
        finally {
            done();
        }
    }
    async doRefreshNode(node, recursive, viewStateContext) {
        node.hasChildren = !!this.dataSource.hasChildren(node.element);
        let childrenPromise;
        if (!node.hasChildren) {
            childrenPromise = Promise.resolve(Iterable.empty());
        }
        else {
            const children = this.doGetChildren(node);
            if (isIterable(children)) {
                childrenPromise = Promise.resolve(children);
            }
            else {
                const slowTimeout = timeout(800);
                slowTimeout.then(() => {
                    node.slow = true;
                    this._onDidChangeNodeSlowState.fire(node);
                }, _ => null);
                childrenPromise = children.finally(() => slowTimeout.cancel());
            }
        }
        try {
            const children = await childrenPromise;
            return this.setChildren(node, children, recursive, viewStateContext);
        }
        catch (err) {
            if (node !== this.root && this.model.has(node)) {
                this.model.setCollapsed(node);
            }
            if (isCancellationError(err)) {
                return [];
            }
            throw err;
        }
        finally {
            if (node.slow) {
                node.slow = false;
                this._onDidChangeNodeSlowState.fire(node);
            }
        }
    }
    doGetChildren(node) {
        let result = this.refreshPromises.get(node);
        if (result) {
            return result;
        }
        const children = this.dataSource.getChildren(node.element);
        if (isIterable(children)) {
            return this.processChildren(children);
        }
        else {
            result = createCancelablePromise(async () => this.processChildren(await children));
            this.refreshPromises.set(node, result);
            return result.finally(() => { this.refreshPromises.delete(node); });
        }
    }
    _onDidChangeCollapseState({ node, deep }) {
        if (node.element === null) {
            return;
        }
        if (!node.collapsed && node.element.stale) {
            if (deep) {
                this.collapse(node.element.element);
            }
            else {
                this.refreshAndRenderNode(node.element, false)
                    .catch(onUnexpectedError);
            }
        }
    }
    setChildren(node, childrenElementsIterable, recursive, viewStateContext) {
        const childrenElements = [...childrenElementsIterable];
        // perf: if the node was and still is a leaf, avoid all this hassle
        if (node.children.length === 0 && childrenElements.length === 0) {
            return [];
        }
        const nodesToForget = new Map();
        const childrenTreeNodesById = new Map();
        for (const child of node.children) {
            nodesToForget.set(child.element, child);
            if (this.identityProvider) {
                childrenTreeNodesById.set(child.id, { node: child, collapsed: this.model.has(child) && this.model.isCollapsed(child) });
            }
        }
        const childrenToRefresh = [];
        const children = childrenElements.map(element => {
            const hasChildren = !!this.dataSource.hasChildren(element);
            if (!this.identityProvider) {
                const asyncDataTreeNode = createAsyncDataTreeNode({ element, parent: node, hasChildren, defaultCollapseState: this.getDefaultCollapseState(element) });
                if (hasChildren && asyncDataTreeNode.defaultCollapseState === ObjectTreeElementCollapseState.PreserveOrExpanded) {
                    childrenToRefresh.push(asyncDataTreeNode);
                }
                return asyncDataTreeNode;
            }
            const id = this.identityProvider.getId(element).toString();
            const result = childrenTreeNodesById.get(id);
            if (result) {
                const asyncDataTreeNode = result.node;
                nodesToForget.delete(asyncDataTreeNode.element);
                this.nodes.delete(asyncDataTreeNode.element);
                this.nodes.set(element, asyncDataTreeNode);
                asyncDataTreeNode.element = element;
                asyncDataTreeNode.hasChildren = hasChildren;
                if (recursive) {
                    if (result.collapsed) {
                        asyncDataTreeNode.children.forEach(node => dfs(node, node => this.nodes.delete(node.element)));
                        asyncDataTreeNode.children.splice(0, asyncDataTreeNode.children.length);
                        asyncDataTreeNode.stale = true;
                    }
                    else {
                        childrenToRefresh.push(asyncDataTreeNode);
                    }
                }
                else if (hasChildren && !result.collapsed) {
                    childrenToRefresh.push(asyncDataTreeNode);
                }
                return asyncDataTreeNode;
            }
            const childAsyncDataTreeNode = createAsyncDataTreeNode({ element, parent: node, id, hasChildren, defaultCollapseState: this.getDefaultCollapseState(element) });
            if (viewStateContext && viewStateContext.viewState.focus && viewStateContext.viewState.focus.indexOf(id) > -1) {
                viewStateContext.focus.push(childAsyncDataTreeNode);
            }
            if (viewStateContext && viewStateContext.viewState.selection && viewStateContext.viewState.selection.indexOf(id) > -1) {
                viewStateContext.selection.push(childAsyncDataTreeNode);
            }
            if (viewStateContext && viewStateContext.viewState.expanded && viewStateContext.viewState.expanded.indexOf(id) > -1) {
                childrenToRefresh.push(childAsyncDataTreeNode);
            }
            else if (hasChildren && childAsyncDataTreeNode.defaultCollapseState === ObjectTreeElementCollapseState.PreserveOrExpanded) {
                childrenToRefresh.push(childAsyncDataTreeNode);
            }
            return childAsyncDataTreeNode;
        });
        for (const node of nodesToForget.values()) {
            dfs(node, node => this.nodes.delete(node.element));
        }
        for (const child of children) {
            this.nodes.set(child.element, child);
        }
        node.children.splice(0, node.children.length, ...children);
        // TODO@joao this doesn't take filter into account
        if (node !== this.root && this.autoExpandSingleChildren && children.length === 1 && childrenToRefresh.length === 0) {
            children[0].forceExpanded = true;
            childrenToRefresh.push(children[0]);
        }
        return childrenToRefresh;
    }
    render(node, viewStateContext, options) {
        const children = node.children.map(node => this.asTreeElement(node, viewStateContext));
        const objectTreeOptions = options && {
            ...options,
            diffIdentityProvider: options.diffIdentityProvider && {
                getId(node) {
                    return options.diffIdentityProvider.getId(node.element);
                }
            }
        };
        this.model.setChildren(node === this.root ? null : node, children, objectTreeOptions);
        if (node !== this.root) {
            this.model.setCollapsible(node, node.hasChildren);
        }
        this._onDidRender.fire();
    }
    asTreeElement(node, viewStateContext) {
        if (node.stale) {
            return {
                element: node,
                collapsible: node.hasChildren,
                collapsed: true
            };
        }
        let collapsed;
        if (viewStateContext && viewStateContext.viewState.expanded && node.id && viewStateContext.viewState.expanded.indexOf(node.id) > -1) {
            collapsed = false;
        }
        else if (node.forceExpanded) {
            collapsed = false;
            node.forceExpanded = false;
        }
        else {
            collapsed = node.defaultCollapseState;
        }
        return {
            element: node,
            children: node.hasChildren ? Iterable.map(node.children, child => this.asTreeElement(child, viewStateContext)) : [],
            collapsible: node.hasChildren,
            collapsed
        };
    }
    processChildren(children) {
        if (this.sorter) {
            children = [...children].sort(this.sorter.compare.bind(this.sorter));
        }
        return children;
    }
    // view state
    getViewState() {
        if (!this.identityProvider) {
            throw new TreeError(this.user, 'Can\'t get tree view state without an identity provider');
        }
        const getId = (element) => this.identityProvider.getId(element).toString();
        const focus = this.getFocus().map(getId);
        const selection = this.getSelection().map(getId);
        const expanded = [];
        const root = this.tree.getNode();
        const stack = [root];
        while (stack.length > 0) {
            const node = stack.pop();
            if (node !== root && node.collapsible && !node.collapsed) {
                expanded.push(getId(node.element.element));
            }
            stack.push(...node.children);
        }
        return { focus, selection, expanded, scrollTop: this.scrollTop };
    }
    dispose() {
        this.disposables.dispose();
        this.tree.dispose();
    }
}
class CompressibleAsyncDataTreeNodeWrapper {
    get element() {
        return {
            elements: this.node.element.elements.map(e => e.element),
            incompressible: this.node.element.incompressible
        };
    }
    get children() { return this.node.children.map(node => new CompressibleAsyncDataTreeNodeWrapper(node)); }
    get depth() { return this.node.depth; }
    get visibleChildrenCount() { return this.node.visibleChildrenCount; }
    get visibleChildIndex() { return this.node.visibleChildIndex; }
    get collapsible() { return this.node.collapsible; }
    get collapsed() { return this.node.collapsed; }
    get visible() { return this.node.visible; }
    get filterData() { return this.node.filterData; }
    constructor(node) {
        this.node = node;
    }
}
class CompressibleAsyncDataTreeRenderer {
    constructor(renderer, nodeMapper, compressibleNodeMapperProvider, onDidChangeTwistieState) {
        this.renderer = renderer;
        this.nodeMapper = nodeMapper;
        this.compressibleNodeMapperProvider = compressibleNodeMapperProvider;
        this.onDidChangeTwistieState = onDidChangeTwistieState;
        this.renderedNodes = new Map();
        this.disposables = [];
        this.templateId = renderer.templateId;
    }
    renderTemplate(container) {
        const templateData = this.renderer.renderTemplate(container);
        return { templateData };
    }
    renderElement(node, index, templateData, height) {
        this.renderer.renderElement(this.nodeMapper.map(node), index, templateData.templateData, height);
    }
    renderCompressedElements(node, index, templateData, height) {
        this.renderer.renderCompressedElements(this.compressibleNodeMapperProvider().map(node), index, templateData.templateData, height);
    }
    renderTwistie(element, twistieElement) {
        if (element.slow) {
            twistieElement.classList.add(...ThemeIcon.asClassNameArray(Codicon.treeItemLoading));
            return true;
        }
        else {
            twistieElement.classList.remove(...ThemeIcon.asClassNameArray(Codicon.treeItemLoading));
            return false;
        }
    }
    disposeElement(node, index, templateData, height) {
        this.renderer.disposeElement?.(this.nodeMapper.map(node), index, templateData.templateData, height);
    }
    disposeCompressedElements(node, index, templateData, height) {
        this.renderer.disposeCompressedElements?.(this.compressibleNodeMapperProvider().map(node), index, templateData.templateData, height);
    }
    disposeTemplate(templateData) {
        this.renderer.disposeTemplate(templateData.templateData);
    }
    dispose() {
        this.renderedNodes.clear();
        this.disposables = dispose(this.disposables);
    }
}
function asCompressibleObjectTreeOptions(options) {
    const objectTreeOptions = options && asObjectTreeOptions(options);
    return objectTreeOptions && {
        ...objectTreeOptions,
        keyboardNavigationLabelProvider: objectTreeOptions.keyboardNavigationLabelProvider && {
            ...objectTreeOptions.keyboardNavigationLabelProvider,
            getCompressedNodeKeyboardNavigationLabel(els) {
                return options.keyboardNavigationLabelProvider.getCompressedNodeKeyboardNavigationLabel(els.map(e => e.element));
            }
        }
    };
}
export class CompressibleAsyncDataTree extends AsyncDataTree {
    constructor(user, container, virtualDelegate, compressionDelegate, renderers, dataSource, options = {}) {
        super(user, container, virtualDelegate, renderers, dataSource, options);
        this.compressionDelegate = compressionDelegate;
        this.compressibleNodeMapper = new WeakMapper(node => new CompressibleAsyncDataTreeNodeWrapper(node));
        this.filter = options.filter;
    }
    getCompressedTreeNode(e) {
        const node = this.getDataNode(e);
        return this.tree.getCompressedTreeNode(node).element;
    }
    createTree(user, container, delegate, renderers, options) {
        const objectTreeDelegate = new ComposedTreeDelegate(delegate);
        const objectTreeRenderers = renderers.map(r => new CompressibleAsyncDataTreeRenderer(r, this.nodeMapper, () => this.compressibleNodeMapper, this._onDidChangeNodeSlowState.event));
        const objectTreeOptions = asCompressibleObjectTreeOptions(options) || {};
        return new CompressibleObjectTree(user, container, objectTreeDelegate, objectTreeRenderers, objectTreeOptions);
    }
    asTreeElement(node, viewStateContext) {
        return {
            incompressible: this.compressionDelegate.isIncompressible(node.element),
            ...super.asTreeElement(node, viewStateContext)
        };
    }
    updateOptions(options = {}) {
        this.tree.updateOptions(options);
    }
    getViewState() {
        if (!this.identityProvider) {
            throw new TreeError(this.user, 'Can\'t get tree view state without an identity provider');
        }
        const getId = (element) => this.identityProvider.getId(element).toString();
        const focus = this.getFocus().map(getId);
        const selection = this.getSelection().map(getId);
        const expanded = [];
        const root = this.tree.getCompressedTreeNode();
        const stack = [root];
        while (stack.length > 0) {
            const node = stack.pop();
            if (node !== root && node.collapsible && !node.collapsed) {
                for (const asyncNode of node.element.elements) {
                    expanded.push(getId(asyncNode.element));
                }
            }
            stack.push(...node.children);
        }
        return { focus, selection, expanded, scrollTop: this.scrollTop };
    }
    render(node, viewStateContext, options) {
        if (!this.identityProvider) {
            return super.render(node, viewStateContext);
        }
        // Preserve traits across compressions. Hacky but does the trick.
        // This is hard to fix properly since it requires rewriting the traits
        // across trees and lists. Let's just keep it this way for now.
        const getId = (element) => this.identityProvider.getId(element).toString();
        const getUncompressedIds = (nodes) => {
            const result = new Set();
            for (const node of nodes) {
                const compressedNode = this.tree.getCompressedTreeNode(node === this.root ? null : node);
                if (!compressedNode.element) {
                    continue;
                }
                for (const node of compressedNode.element.elements) {
                    result.add(getId(node.element));
                }
            }
            return result;
        };
        const oldSelection = getUncompressedIds(this.tree.getSelection());
        const oldFocus = getUncompressedIds(this.tree.getFocus());
        super.render(node, viewStateContext, options);
        const selection = this.getSelection();
        let didChangeSelection = false;
        const focus = this.getFocus();
        let didChangeFocus = false;
        const visit = (node) => {
            const compressedNode = node.element;
            if (compressedNode) {
                for (let i = 0; i < compressedNode.elements.length; i++) {
                    const id = getId(compressedNode.elements[i].element);
                    const element = compressedNode.elements[compressedNode.elements.length - 1].element;
                    // github.com/microsoft/vscode/issues/85938
                    if (oldSelection.has(id) && selection.indexOf(element) === -1) {
                        selection.push(element);
                        didChangeSelection = true;
                    }
                    if (oldFocus.has(id) && focus.indexOf(element) === -1) {
                        focus.push(element);
                        didChangeFocus = true;
                    }
                }
            }
            node.children.forEach(visit);
        };
        visit(this.tree.getCompressedTreeNode(node === this.root ? null : node));
        if (didChangeSelection) {
            this.setSelection(selection);
        }
        if (didChangeFocus) {
            this.setFocus(focus);
        }
    }
    // For compressed async data trees, `TreeVisibility.Recurse` doesn't currently work
    // and we have to filter everything beforehand
    // Related to #85193 and #85835
    processChildren(children) {
        if (this.filter) {
            children = Iterable.filter(children, e => {
                const result = this.filter.filter(e, 1 /* TreeVisibility.Visible */);
                const visibility = getVisibility(result);
                if (visibility === 2 /* TreeVisibility.Recurse */) {
                    throw new Error('Recursive tree visibility not supported in async data compressed trees');
                }
                return visibility === 1 /* TreeVisibility.Visible */;
            });
        }
        return super.processChildren(children);
    }
    navigate(start) {
        // Assumptions are made about how tree navigation works in compressed trees
        // These assumptions may be wrong and we should revisit this when needed
        // Example:	[a, b/ba, ba.txt]
        // - previous(ba) => a
        // - previous(b) => a
        // - next(a) => ba
        // - next(b) => ba
        // - next(ba) => ba.txt
        return super.navigate(start);
    }
}
function getVisibility(filterResult) {
    if (typeof filterResult === 'boolean') {
        return filterResult ? 1 /* TreeVisibility.Visible */ : 0 /* TreeVisibility.Hidden */;
    }
    else if (isFilterResult(filterResult)) {
        return getVisibleState(filterResult.visibility);
    }
    else {
        return getVisibleState(filterResult);
    }
}
class AsyncDataTreeNavigator {
    constructor(navigator) {
        this.navigator = navigator;
    }
    current() {
        const current = this.navigator.current();
        if (current === null) {
            return null;
        }
        return current.element;
    }
    previous() {
        this.navigator.previous();
        return this.current();
    }
    first() {
        this.navigator.first();
        return this.current();
    }
    last() {
        this.navigator.last();
        return this.current();
    }
    next() {
        this.navigator.next();
        return this.current();
    }
}
