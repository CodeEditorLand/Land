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
import * as DOM from '../../../../../../base/browser/dom.js';
import { ToolBar } from '../../../../../../base/browser/ui/toolbar/toolbar.js';
import { disposableTimeout } from '../../../../../../base/common/async.js';
import { Emitter } from '../../../../../../base/common/event.js';
import { createActionViewItem, createAndFillInActionBarActions, MenuEntryActionViewItem } from '../../../../../../platform/actions/browser/menuEntryActionViewItem.js';
import { IMenuService, MenuId, MenuItemAction } from '../../../../../../platform/actions/common/actions.js';
import { IContextKeyService } from '../../../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../../../platform/keybinding/common/keybinding.js';
import { CodiconActionViewItem } from './cellActionView.js';
import { CellOverlayPart } from '../cellPart.js';
import { registerCellToolbarStickyScroll } from './cellToolbarStickyScroll.js';
import { WorkbenchToolBar } from '../../../../../../platform/actions/browser/toolbar.js';
import { createInstantHoverDelegate } from '../../../../../../base/browser/ui/hover/hoverDelegateFactory.js';
let BetweenCellToolbar = class BetweenCellToolbar extends CellOverlayPart {
    constructor(_notebookEditor, _titleToolbarContainer, _bottomCellToolbarContainer, instantiationService, contextMenuService, contextKeyService, menuService) {
        super();
        this._notebookEditor = _notebookEditor;
        this._bottomCellToolbarContainer = _bottomCellToolbarContainer;
        this.instantiationService = instantiationService;
        this.contextMenuService = contextMenuService;
        this.contextKeyService = contextKeyService;
        this.menuService = menuService;
    }
    _initialize() {
        if (this._betweenCellToolbar) {
            return this._betweenCellToolbar;
        }
        const betweenCellToolbar = this._register(new ToolBar(this._bottomCellToolbarContainer, this.contextMenuService, {
            actionViewItemProvider: (action, options) => {
                if (action instanceof MenuItemAction) {
                    if (this._notebookEditor.notebookOptions.getDisplayOptions().insertToolbarAlignment === 'center') {
                        return this.instantiationService.createInstance(CodiconActionViewItem, action, { hoverDelegate: options.hoverDelegate });
                    }
                    else {
                        return this.instantiationService.createInstance(MenuEntryActionViewItem, action, { hoverDelegate: options.hoverDelegate });
                    }
                }
                return undefined;
            }
        }));
        this._betweenCellToolbar = betweenCellToolbar;
        const menu = this._register(this.menuService.createMenu(this._notebookEditor.creationOptions.menuIds.cellInsertToolbar, this.contextKeyService));
        const updateActions = () => {
            const actions = getCellToolbarActions(menu);
            betweenCellToolbar.setActions(actions.primary, actions.secondary);
        };
        this._register(menu.onDidChange(() => updateActions()));
        this._register(this._notebookEditor.notebookOptions.onDidChangeOptions((e) => {
            if (e.insertToolbarAlignment) {
                updateActions();
            }
        }));
        updateActions();
        return betweenCellToolbar;
    }
    didRenderCell(element) {
        const betweenCellToolbar = this._initialize();
        if (this._notebookEditor.hasModel()) {
            betweenCellToolbar.context = {
                ui: true,
                cell: element,
                notebookEditor: this._notebookEditor,
                source: 'insertToolbar',
                $mid: 13 /* MarshalledId.NotebookCellActionContext */
            };
        }
        this.updateInternalLayoutNow(element);
    }
    updateInternalLayoutNow(element) {
        const bottomToolbarOffset = element.layoutInfo.bottomToolbarOffset;
        this._bottomCellToolbarContainer.style.transform = `translateY(${bottomToolbarOffset}px)`;
    }
};
BetweenCellToolbar = __decorate([
    __param(3, IInstantiationService),
    __param(4, IContextMenuService),
    __param(5, IContextKeyService),
    __param(6, IMenuService),
    __metadata("design:paramtypes", [Object, HTMLElement,
        HTMLElement, Object, Object, Object, Object])
], BetweenCellToolbar);
export { BetweenCellToolbar };
let CellTitleToolbarPart = class CellTitleToolbarPart extends CellOverlayPart {
    get hasActions() {
        if (!this._model) {
            return false;
        }
        return this._model.actions.primary.length
            + this._model.actions.secondary.length
            + this._model.deleteActions.primary.length
            + this._model.deleteActions.secondary.length
            > 0;
    }
    constructor(toolbarContainer, _rootClassDelegate, toolbarId, deleteToolbarId, _notebookEditor, contextKeyService, menuService, instantiationService) {
        super();
        this.toolbarContainer = toolbarContainer;
        this._rootClassDelegate = _rootClassDelegate;
        this.toolbarId = toolbarId;
        this.deleteToolbarId = deleteToolbarId;
        this._notebookEditor = _notebookEditor;
        this.contextKeyService = contextKeyService;
        this.menuService = menuService;
        this.instantiationService = instantiationService;
        this._onDidUpdateActions = this._register(new Emitter());
        this.onDidUpdateActions = this._onDidUpdateActions.event;
    }
    _initializeModel() {
        if (this._model) {
            return this._model;
        }
        const titleMenu = this._register(this.menuService.createMenu(this.toolbarId, this.contextKeyService));
        const deleteMenu = this._register(this.menuService.createMenu(this.deleteToolbarId, this.contextKeyService));
        const actions = getCellToolbarActions(titleMenu);
        const deleteActions = getCellToolbarActions(deleteMenu);
        this._model = {
            titleMenu,
            actions,
            deleteMenu,
            deleteActions
        };
        return this._model;
    }
    _initialize(model, element) {
        if (this._view) {
            return this._view;
        }
        const hoverDelegate = this._register(createInstantHoverDelegate());
        const toolbar = this._register(this.instantiationService.createInstance(WorkbenchToolBar, this.toolbarContainer, {
            actionViewItemProvider: (action, options) => {
                return createActionViewItem(this.instantiationService, action, options);
            },
            renderDropdownAsChildElement: true,
            hoverDelegate
        }));
        const deleteToolbar = this._register(this.instantiationService.invokeFunction(accessor => createDeleteToolbar(accessor, this.toolbarContainer, hoverDelegate, 'cell-delete-toolbar')));
        if (model.deleteActions.primary.length !== 0 || model.deleteActions.secondary.length !== 0) {
            deleteToolbar.setActions(model.deleteActions.primary, model.deleteActions.secondary);
        }
        this.setupChangeListeners(toolbar, model.titleMenu, model.actions);
        this.setupChangeListeners(deleteToolbar, model.deleteMenu, model.deleteActions);
        this._view = {
            toolbar,
            deleteToolbar
        };
        return this._view;
    }
    prepareRenderCell(element) {
        this._initializeModel();
    }
    didRenderCell(element) {
        const model = this._initializeModel();
        const view = this._initialize(model, element);
        this.cellDisposables.add(registerCellToolbarStickyScroll(this._notebookEditor, element, this.toolbarContainer, { extraOffset: 4, min: -14 }));
        if (this._notebookEditor.hasModel()) {
            const toolbarContext = {
                ui: true,
                cell: element,
                notebookEditor: this._notebookEditor,
                source: 'cellToolbar',
                $mid: 13 /* MarshalledId.NotebookCellActionContext */
            };
            this.updateContext(view, toolbarContext);
        }
    }
    updateContext(view, toolbarContext) {
        view.toolbar.context = toolbarContext;
        view.deleteToolbar.context = toolbarContext;
    }
    setupChangeListeners(toolbar, menu, initActions) {
        // #103926
        let dropdownIsVisible = false;
        let deferredUpdate;
        this.updateActions(toolbar, initActions);
        this._register(menu.onDidChange(() => {
            if (dropdownIsVisible) {
                const actions = getCellToolbarActions(menu);
                deferredUpdate = () => this.updateActions(toolbar, actions);
                return;
            }
            const actions = getCellToolbarActions(menu);
            this.updateActions(toolbar, actions);
        }));
        this._rootClassDelegate.toggle('cell-toolbar-dropdown-active', false);
        this._register(toolbar.onDidChangeDropdownVisibility(visible => {
            dropdownIsVisible = visible;
            this._rootClassDelegate.toggle('cell-toolbar-dropdown-active', visible);
            if (deferredUpdate && !visible) {
                disposableTimeout(() => {
                    deferredUpdate?.();
                }, 0, this._store);
                deferredUpdate = undefined;
            }
        }));
    }
    updateActions(toolbar, actions) {
        const hadFocus = DOM.isAncestorOfActiveElement(toolbar.getElement());
        toolbar.setActions(actions.primary, actions.secondary);
        if (hadFocus) {
            this._notebookEditor.focus();
        }
        if (actions.primary.length || actions.secondary.length) {
            this._rootClassDelegate.toggle('cell-has-toolbar-actions', true);
            this._onDidUpdateActions.fire();
        }
        else {
            this._rootClassDelegate.toggle('cell-has-toolbar-actions', false);
            this._onDidUpdateActions.fire();
        }
    }
};
CellTitleToolbarPart = __decorate([
    __param(5, IContextKeyService),
    __param(6, IMenuService),
    __param(7, IInstantiationService),
    __metadata("design:paramtypes", [HTMLElement, Object, MenuId,
        MenuId, Object, Object, Object, Object])
], CellTitleToolbarPart);
export { CellTitleToolbarPart };
function getCellToolbarActions(menu) {
    const primary = [];
    const secondary = [];
    const result = { primary, secondary };
    createAndFillInActionBarActions(menu, { shouldForwardArgs: true }, result, g => /^inline/.test(g));
    return result;
}
function createDeleteToolbar(accessor, container, hoverDelegate, elementClass) {
    const contextMenuService = accessor.get(IContextMenuService);
    const keybindingService = accessor.get(IKeybindingService);
    const instantiationService = accessor.get(IInstantiationService);
    const toolbar = new ToolBar(container, contextMenuService, {
        getKeyBinding: action => keybindingService.lookupKeybinding(action.id),
        actionViewItemProvider: (action, options) => {
            return createActionViewItem(instantiationService, action, options);
        },
        renderDropdownAsChildElement: true,
        hoverDelegate
    });
    if (elementClass) {
        toolbar.getElement().classList.add(elementClass);
    }
    return toolbar;
}
