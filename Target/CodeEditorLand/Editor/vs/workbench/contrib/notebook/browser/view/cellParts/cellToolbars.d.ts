import { Event } from '../../../../../../base/common/event.js';
import { IMenuService, MenuId } from '../../../../../../platform/actions/common/actions.js';
import { IContextKeyService } from '../../../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { ICellViewModel, INotebookEditorDelegate } from '../../notebookBrowser.js';
import { CellOverlayPart } from '../cellPart.js';
export declare class BetweenCellToolbar extends CellOverlayPart {
    private readonly _notebookEditor;
    private readonly _bottomCellToolbarContainer;
    private readonly instantiationService;
    private readonly contextMenuService;
    private readonly contextKeyService;
    private readonly menuService;
    private _betweenCellToolbar;
    constructor(_notebookEditor: INotebookEditorDelegate, _titleToolbarContainer: HTMLElement, _bottomCellToolbarContainer: HTMLElement, instantiationService: IInstantiationService, contextMenuService: IContextMenuService, contextKeyService: IContextKeyService, menuService: IMenuService);
    private _initialize;
    didRenderCell(element: ICellViewModel): void;
    updateInternalLayoutNow(element: ICellViewModel): void;
}
export interface ICssClassDelegate {
    toggle: (className: string, force?: boolean) => void;
}
export declare class CellTitleToolbarPart extends CellOverlayPart {
    private readonly toolbarContainer;
    private readonly _rootClassDelegate;
    private readonly toolbarId;
    private readonly deleteToolbarId;
    private readonly _notebookEditor;
    private readonly contextKeyService;
    private readonly menuService;
    private readonly instantiationService;
    private _model;
    private _view;
    private readonly _onDidUpdateActions;
    readonly onDidUpdateActions: Event<void>;
    get hasActions(): boolean;
    constructor(toolbarContainer: HTMLElement, _rootClassDelegate: ICssClassDelegate, toolbarId: MenuId, deleteToolbarId: MenuId, _notebookEditor: INotebookEditorDelegate, contextKeyService: IContextKeyService, menuService: IMenuService, instantiationService: IInstantiationService);
    private _initializeModel;
    private _initialize;
    prepareRenderCell(element: ICellViewModel): void;
    didRenderCell(element: ICellViewModel): void;
    private updateContext;
    private setupChangeListeners;
    private updateActions;
}
