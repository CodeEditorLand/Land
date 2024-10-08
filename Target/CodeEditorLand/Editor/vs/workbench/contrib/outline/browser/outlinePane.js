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
import './outlinePane.css';
import * as dom from '../../../../base/browser/dom.js';
import { ProgressBar } from '../../../../base/browser/ui/progressbar/progressbar.js';
import { TimeoutTimer, timeout } from '../../../../base/common/async.js';
import { toDisposable, DisposableStore, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { LRUCache } from '../../../../base/common/map.js';
import { localize } from '../../../../nls.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { WorkbenchDataTree } from '../../../../platform/list/browser/listService.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { ViewPane } from '../../../browser/parts/views/viewPane.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { basename } from '../../../../base/common/resources.js';
import { IViewDescriptorService } from '../../../common/views.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { OutlineViewState } from './outlineViewState.js';
import { IOutlineService } from '../../../services/outline/browser/outline.js';
import { EditorResourceAccessor } from '../../../common/editor.js';
import { CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { Event } from '../../../../base/common/event.js';
import { AbstractTreeViewState, TreeFindMode } from '../../../../base/browser/ui/tree/abstractTree.js';
import { ctxAllCollapsed, ctxFilterOnType, ctxFollowsCursor, ctxSortMode } from './outline.js';
import { defaultProgressBarStyles } from '../../../../platform/theme/browser/defaultStyles.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
class OutlineTreeSorter {
    constructor(_comparator, order) {
        this._comparator = _comparator;
        this.order = order;
    }
    compare(a, b) {
        if (this.order === 2 /* OutlineSortOrder.ByKind */) {
            return this._comparator.compareByType(a, b);
        }
        else if (this.order === 1 /* OutlineSortOrder.ByName */) {
            return this._comparator.compareByName(a, b);
        }
        else {
            return this._comparator.compareByPosition(a, b);
        }
    }
}
let OutlinePane = class OutlinePane extends ViewPane {
    static { this.Id = 'outline'; }
    constructor(options, _outlineService, _instantiationService, viewDescriptorService, _storageService, _editorService, configurationService, keybindingService, contextKeyService, contextMenuService, openerService, themeService, telemetryService, hoverService) {
        super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, _instantiationService, openerService, themeService, telemetryService, hoverService);
        this._outlineService = _outlineService;
        this._instantiationService = _instantiationService;
        this._storageService = _storageService;
        this._editorService = _editorService;
        this._disposables = new DisposableStore();
        this._editorControlDisposables = new DisposableStore();
        this._editorPaneDisposables = new DisposableStore();
        this._outlineViewState = new OutlineViewState();
        this._editorListener = new MutableDisposable();
        this._treeStates = new LRUCache(10);
        this._outlineViewState.restore(this._storageService);
        this._disposables.add(this._outlineViewState);
        contextKeyService.bufferChangeEvents(() => {
            this._ctxFollowsCursor = ctxFollowsCursor.bindTo(contextKeyService);
            this._ctxFilterOnType = ctxFilterOnType.bindTo(contextKeyService);
            this._ctxSortMode = ctxSortMode.bindTo(contextKeyService);
            this._ctxAllCollapsed = ctxAllCollapsed.bindTo(contextKeyService);
        });
        const updateContext = () => {
            this._ctxFollowsCursor.set(this._outlineViewState.followCursor);
            this._ctxFilterOnType.set(this._outlineViewState.filterOnType);
            this._ctxSortMode.set(this._outlineViewState.sortBy);
        };
        updateContext();
        this._disposables.add(this._outlineViewState.onDidChange(updateContext));
    }
    dispose() {
        this._disposables.dispose();
        this._editorPaneDisposables.dispose();
        this._editorControlDisposables.dispose();
        this._editorListener.dispose();
        super.dispose();
    }
    focus() {
        super.focus();
        this._tree?.domFocus();
    }
    renderBody(container) {
        super.renderBody(container);
        this._domNode = container;
        container.classList.add('outline-pane');
        const progressContainer = dom.$('.outline-progress');
        this._message = dom.$('.outline-message');
        this._progressBar = new ProgressBar(progressContainer, defaultProgressBarStyles);
        this._treeContainer = dom.$('.outline-tree');
        dom.append(container, progressContainer, this._message, this._treeContainer);
        this._disposables.add(this.onDidChangeBodyVisibility(visible => {
            if (!visible) {
                // stop everything when not visible
                this._editorListener.clear();
                this._editorPaneDisposables.clear();
                this._editorControlDisposables.clear();
            }
            else if (!this._editorListener.value) {
                const event = Event.any(this._editorService.onDidActiveEditorChange, this._outlineService.onDidChange);
                this._editorListener.value = event(() => this._handleEditorChanged(this._editorService.activeEditorPane));
                this._handleEditorChanged(this._editorService.activeEditorPane);
            }
        }));
    }
    layoutBody(height, width) {
        super.layoutBody(height, width);
        this._tree?.layout(height, width);
        this._treeDimensions = new dom.Dimension(width, height);
    }
    collapseAll() {
        this._tree?.collapseAll();
    }
    expandAll() {
        this._tree?.expandAll();
    }
    get outlineViewState() {
        return this._outlineViewState;
    }
    _showMessage(message) {
        this._domNode.classList.add('message');
        this._progressBar.stop().hide();
        this._message.innerText = message;
    }
    _captureViewState(uri) {
        if (this._tree) {
            const oldOutline = this._tree.getInput();
            if (!uri) {
                uri = oldOutline?.uri;
            }
            if (oldOutline && uri) {
                this._treeStates.set(`${oldOutline.outlineKind}/${uri}`, this._tree.getViewState());
                return true;
            }
        }
        return false;
    }
    _handleEditorChanged(pane) {
        this._editorPaneDisposables.clear();
        if (pane) {
            // react to control changes from within pane (https://github.com/microsoft/vscode/issues/134008)
            this._editorPaneDisposables.add(pane.onDidChangeControl(() => {
                this._handleEditorControlChanged(pane);
            }));
        }
        this._handleEditorControlChanged(pane);
    }
    async _handleEditorControlChanged(pane) {
        // persist state
        const resource = EditorResourceAccessor.getOriginalUri(pane?.input);
        const didCapture = this._captureViewState();
        this._editorControlDisposables.clear();
        if (!pane || !this._outlineService.canCreateOutline(pane) || !resource) {
            return this._showMessage(localize('no-editor', "The active editor cannot provide outline information."));
        }
        let loadingMessage;
        if (!didCapture) {
            loadingMessage = new TimeoutTimer(() => {
                this._showMessage(localize('loading', "Loading document symbols for '{0}'...", basename(resource)));
            }, 100);
        }
        this._progressBar.infinite().show(500);
        const cts = new CancellationTokenSource();
        this._editorControlDisposables.add(toDisposable(() => cts.dispose(true)));
        const newOutline = await this._outlineService.createOutline(pane, 1 /* OutlineTarget.OutlinePane */, cts.token);
        loadingMessage?.dispose();
        if (!newOutline) {
            return;
        }
        if (cts.token.isCancellationRequested) {
            newOutline?.dispose();
            return;
        }
        this._editorControlDisposables.add(newOutline);
        this._progressBar.stop().hide();
        const sorter = new OutlineTreeSorter(newOutline.config.comparator, this._outlineViewState.sortBy);
        const tree = this._instantiationService.createInstance(WorkbenchDataTree, 'OutlinePane', this._treeContainer, newOutline.config.delegate, newOutline.config.renderers, newOutline.config.treeDataSource, {
            ...newOutline.config.options,
            sorter,
            expandOnDoubleClick: false,
            expandOnlyOnTwistieClick: true,
            multipleSelectionSupport: false,
            hideTwistiesOfChildlessElements: true,
            defaultFindMode: this._outlineViewState.filterOnType ? TreeFindMode.Filter : TreeFindMode.Highlight,
            overrideStyles: this.getLocationBasedColors().listOverrideStyles
        });
        // update tree, listen to changes
        const updateTree = () => {
            if (newOutline.isEmpty) {
                // no more elements
                this._showMessage(localize('no-symbols', "No symbols found in document '{0}'", basename(resource)));
                this._captureViewState(resource);
                tree.setInput(undefined);
            }
            else if (!tree.getInput()) {
                // first: init tree
                this._domNode.classList.remove('message');
                const state = this._treeStates.get(`${newOutline.outlineKind}/${newOutline.uri}`);
                tree.setInput(newOutline, state && AbstractTreeViewState.lift(state));
            }
            else {
                // update: refresh tree
                this._domNode.classList.remove('message');
                tree.updateChildren();
            }
        };
        updateTree();
        this._editorControlDisposables.add(newOutline.onDidChange(updateTree));
        tree.findMode = this._outlineViewState.filterOnType ? TreeFindMode.Filter : TreeFindMode.Highlight;
        // feature: apply panel background to tree
        this._editorControlDisposables.add(this.viewDescriptorService.onDidChangeLocation(({ views }) => {
            if (views.some(v => v.id === this.id)) {
                tree.updateOptions({ overrideStyles: this.getLocationBasedColors().listOverrideStyles });
            }
        }));
        // feature: filter on type - keep tree and menu in sync
        this._editorControlDisposables.add(tree.onDidChangeFindMode(mode => this._outlineViewState.filterOnType = mode === TreeFindMode.Filter));
        // feature: reveal outline selection in editor
        // on change -> reveal/select defining range
        let idPool = 0;
        this._editorControlDisposables.add(tree.onDidOpen(async (e) => {
            const myId = ++idPool;
            const isDoubleClick = e.browserEvent?.type === 'dblclick';
            if (!isDoubleClick) {
                // workaround for https://github.com/microsoft/vscode/issues/206424
                await timeout(150);
                if (myId !== idPool) {
                    return;
                }
            }
            await newOutline.reveal(e.element, e.editorOptions, e.sideBySide, isDoubleClick);
        }));
        // feature: reveal editor selection in outline
        const revealActiveElement = () => {
            if (!this._outlineViewState.followCursor || !newOutline.activeElement) {
                return;
            }
            let item = newOutline.activeElement;
            while (item) {
                const top = tree.getRelativeTop(item);
                if (top === null) {
                    // not visible -> reveal
                    tree.reveal(item, 0.5);
                }
                if (tree.getRelativeTop(item) !== null) {
                    tree.setFocus([item]);
                    tree.setSelection([item]);
                    break;
                }
                // STILL not visible -> try parent
                item = tree.getParentElement(item);
            }
        };
        revealActiveElement();
        this._editorControlDisposables.add(newOutline.onDidChange(revealActiveElement));
        // feature: update view when user state changes
        this._editorControlDisposables.add(this._outlineViewState.onDidChange((e) => {
            this._outlineViewState.persist(this._storageService);
            if (e.filterOnType) {
                tree.findMode = this._outlineViewState.filterOnType ? TreeFindMode.Filter : TreeFindMode.Highlight;
            }
            if (e.followCursor) {
                revealActiveElement();
            }
            if (e.sortBy) {
                sorter.order = this._outlineViewState.sortBy;
                tree.resort();
            }
        }));
        // feature: expand all nodes when filtering (not when finding)
        let viewState;
        this._editorControlDisposables.add(tree.onDidChangeFindPattern(pattern => {
            if (tree.findMode === TreeFindMode.Highlight) {
                return;
            }
            if (!viewState && pattern) {
                viewState = tree.getViewState();
                tree.expandAll();
            }
            else if (!pattern && viewState) {
                tree.setInput(tree.getInput(), viewState);
                viewState = undefined;
            }
        }));
        // feature: update all-collapsed context key
        const updateAllCollapsedCtx = () => {
            this._ctxAllCollapsed.set(tree.getNode(null).children.every(node => !node.collapsible || node.collapsed));
        };
        this._editorControlDisposables.add(tree.onDidChangeCollapseState(updateAllCollapsedCtx));
        this._editorControlDisposables.add(tree.onDidChangeModel(updateAllCollapsedCtx));
        updateAllCollapsedCtx();
        // last: set tree property and wire it up to one of our context keys
        tree.layout(this._treeDimensions?.height, this._treeDimensions?.width);
        this._tree = tree;
        this._editorControlDisposables.add(toDisposable(() => {
            tree.dispose();
            this._tree = undefined;
        }));
    }
};
OutlinePane = __decorate([
    __param(1, IOutlineService),
    __param(2, IInstantiationService),
    __param(3, IViewDescriptorService),
    __param(4, IStorageService),
    __param(5, IEditorService),
    __param(6, IConfigurationService),
    __param(7, IKeybindingService),
    __param(8, IContextKeyService),
    __param(9, IContextMenuService),
    __param(10, IOpenerService),
    __param(11, IThemeService),
    __param(12, ITelemetryService),
    __param(13, IHoverService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], OutlinePane);
export { OutlinePane };
