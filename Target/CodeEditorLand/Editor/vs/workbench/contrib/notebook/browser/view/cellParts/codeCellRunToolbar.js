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
import { ToolBar } from '../../../../../../base/browser/ui/toolbar/toolbar.js';
import { Action } from '../../../../../../base/common/actions.js';
import { DisposableStore } from '../../../../../../base/common/lifecycle.js';
import { EditorContextKeys } from '../../../../../../editor/common/editorContextKeys.js';
import { localize } from '../../../../../../nls.js';
import { DropdownWithPrimaryActionViewItem } from '../../../../../../platform/actions/browser/dropdownWithPrimaryActionViewItem.js';
import { createAndFillInActionBarActions } from '../../../../../../platform/actions/browser/menuEntryActionViewItem.js';
import { IMenuService, MenuId, MenuItemAction } from '../../../../../../platform/actions/common/actions.js';
import { IContextKeyService } from '../../../../../../platform/contextkey/common/contextkey.js';
import { InputFocusedContext } from '../../../../../../platform/contextkey/common/contextkeys.js';
import { IContextMenuService } from '../../../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../../../platform/keybinding/common/keybinding.js';
import { CellContentPart } from '../cellPart.js';
import { registerCellToolbarStickyScroll } from './cellToolbarStickyScroll.js';
import { NOTEBOOK_CELL_EXECUTION_STATE, NOTEBOOK_CELL_LIST_FOCUSED, NOTEBOOK_CELL_TYPE, NOTEBOOK_EDITOR_FOCUSED } from '../../../common/notebookContextKeys.js';
let RunToolbar = class RunToolbar extends CellContentPart {
    constructor(notebookEditor, contextKeyService, cellContainer, runButtonContainer, primaryMenuId, secondaryMenuId, menuService, keybindingService, contextMenuService, instantiationService) {
        super();
        this.notebookEditor = notebookEditor;
        this.contextKeyService = contextKeyService;
        this.cellContainer = cellContainer;
        this.runButtonContainer = runButtonContainer;
        this.keybindingService = keybindingService;
        this.contextMenuService = contextMenuService;
        this.instantiationService = instantiationService;
        this.primaryMenu = this._register(menuService.createMenu(primaryMenuId, contextKeyService));
        this.secondaryMenu = this._register(menuService.createMenu(secondaryMenuId, contextKeyService));
        this.createRunCellToolbar(runButtonContainer, cellContainer, contextKeyService);
        const updateActions = () => {
            const actions = this.getCellToolbarActions(this.primaryMenu);
            const primary = actions.primary[0];
            this.toolbar.setActions(primary ? [primary] : []);
        };
        updateActions();
        this._register(this.primaryMenu.onDidChange(updateActions));
        this._register(this.secondaryMenu.onDidChange(updateActions));
        this._register(this.notebookEditor.notebookOptions.onDidChangeOptions(updateActions));
    }
    didRenderCell(element) {
        this.cellDisposables.add(registerCellToolbarStickyScroll(this.notebookEditor, element, this.runButtonContainer));
        if (this.notebookEditor.hasModel()) {
            const context = {
                ui: true,
                cell: element,
                notebookEditor: this.notebookEditor,
                $mid: 13
            };
            this.toolbar.context = context;
        }
    }
    getCellToolbarActions(menu) {
        const primary = [];
        const secondary = [];
        const result = { primary, secondary };
        createAndFillInActionBarActions(menu, { shouldForwardArgs: true }, result, g => /^inline/.test(g));
        return result;
    }
    createRunCellToolbar(container, cellContainer, contextKeyService) {
        const actionViewItemDisposables = this._register(new DisposableStore());
        const dropdownAction = this._register(new Action('notebook.moreRunActions', localize('notebook.moreRunActionsLabel', "More..."), 'codicon-chevron-down', true));
        const keybindingProvider = (action) => this.keybindingService.lookupKeybinding(action.id, executionContextKeyService);
        const executionContextKeyService = this._register(getCodeCellExecutionContextKeyService(contextKeyService));
        this.toolbar = this._register(new ToolBar(container, this.contextMenuService, {
            getKeyBinding: keybindingProvider,
            actionViewItemProvider: (_action, _options) => {
                actionViewItemDisposables.clear();
                const primary = this.getCellToolbarActions(this.primaryMenu).primary[0];
                if (!(primary instanceof MenuItemAction)) {
                    return undefined;
                }
                const secondary = this.getCellToolbarActions(this.secondaryMenu).secondary;
                if (!secondary.length) {
                    return undefined;
                }
                const item = this.instantiationService.createInstance(DropdownWithPrimaryActionViewItem, primary, dropdownAction, secondary, 'notebook-cell-run-toolbar', {
                    ..._options,
                    getKeyBinding: keybindingProvider
                });
                actionViewItemDisposables.add(item.onDidChangeDropdownVisibility(visible => {
                    cellContainer.classList.toggle('cell-run-toolbar-dropdown-active', visible);
                }));
                return item;
            },
            renderDropdownAsChildElement: true
        }));
    }
};
RunToolbar = __decorate([
    __param(6, IMenuService),
    __param(7, IKeybindingService),
    __param(8, IContextMenuService),
    __param(9, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object, HTMLElement,
        HTMLElement,
        MenuId,
        MenuId, Object, Object, Object, Object])
], RunToolbar);
export { RunToolbar };
export function getCodeCellExecutionContextKeyService(contextKeyService) {
    const executionContextKeyService = contextKeyService.createScoped(document.createElement('div'));
    InputFocusedContext.bindTo(executionContextKeyService).set(true);
    EditorContextKeys.editorTextFocus.bindTo(executionContextKeyService).set(true);
    EditorContextKeys.focus.bindTo(executionContextKeyService).set(true);
    EditorContextKeys.textInputFocus.bindTo(executionContextKeyService).set(true);
    NOTEBOOK_CELL_EXECUTION_STATE.bindTo(executionContextKeyService).set('idle');
    NOTEBOOK_CELL_LIST_FOCUSED.bindTo(executionContextKeyService).set(true);
    NOTEBOOK_EDITOR_FOCUSED.bindTo(executionContextKeyService).set(true);
    NOTEBOOK_CELL_TYPE.bindTo(executionContextKeyService).set('code');
    return executionContextKeyService;
}
