import { IAction } from '../../../../../../base/common/actions.js';
import { IMenu, IMenuService, MenuId } from '../../../../../../platform/actions/common/actions.js';
import { IContextKeyService, IScopedContextKeyService } from '../../../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../../../platform/keybinding/common/keybinding.js';
import { ICellViewModel, INotebookEditorDelegate } from '../../notebookBrowser.js';
import { CellContentPart } from '../cellPart.js';
export declare class RunToolbar extends CellContentPart {
    readonly notebookEditor: INotebookEditorDelegate;
    readonly contextKeyService: IContextKeyService;
    readonly cellContainer: HTMLElement;
    readonly runButtonContainer: HTMLElement;
    private readonly keybindingService;
    private readonly contextMenuService;
    private readonly instantiationService;
    private toolbar;
    private primaryMenu;
    private secondaryMenu;
    constructor(notebookEditor: INotebookEditorDelegate, contextKeyService: IContextKeyService, cellContainer: HTMLElement, runButtonContainer: HTMLElement, primaryMenuId: MenuId, secondaryMenuId: MenuId, menuService: IMenuService, keybindingService: IKeybindingService, contextMenuService: IContextMenuService, instantiationService: IInstantiationService);
    didRenderCell(element: ICellViewModel): void;
    getCellToolbarActions(menu: IMenu): {
        primary: IAction[];
        secondary: IAction[];
    };
    private createRunCellToolbar;
}
export declare function getCodeCellExecutionContextKeyService(contextKeyService: IContextKeyService): IScopedContextKeyService;
