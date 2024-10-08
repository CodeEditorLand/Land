import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IMenuService } from '../../../../../platform/actions/common/actions.js';
import { IContextMenuService } from '../../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { INotebookEditorDelegate } from '../notebookBrowser.js';
import { NotebookOptions } from '../notebookOptions.js';
export declare class ListTopCellToolbar extends Disposable {
    protected readonly notebookEditor: INotebookEditorDelegate;
    private readonly notebookOptions;
    protected readonly instantiationService: IInstantiationService;
    protected readonly contextMenuService: IContextMenuService;
    protected readonly menuService: IMenuService;
    private readonly topCellToolbarContainer;
    private topCellToolbar;
    private readonly viewZone;
    private readonly _modelDisposables;
    constructor(notebookEditor: INotebookEditorDelegate, notebookOptions: NotebookOptions, instantiationService: IInstantiationService, contextMenuService: IContextMenuService, menuService: IMenuService);
    private updateTopToolbar;
    private updateClass;
}
