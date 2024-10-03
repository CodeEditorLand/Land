import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { IWorkbenchContribution } from '../../../../../common/contributions.js';
import { INotebookKernelService } from '../../../common/notebookKernelService.js';
import { IEditorService } from '../../../../../services/editor/common/editorService.js';
import { IStatusbarService } from '../../../../../services/statusbar/browser/statusbar.js';
import { IEditorGroupsService } from '../../../../../services/editor/common/editorGroupsService.js';
export declare class KernelStatus extends Disposable implements IWorkbenchContribution {
    private readonly _editorService;
    private readonly _statusbarService;
    private readonly _notebookKernelService;
    private readonly _instantiationService;
    private readonly _editorDisposables;
    private readonly _kernelInfoElement;
    constructor(_editorService: IEditorService, _statusbarService: IStatusbarService, _notebookKernelService: INotebookKernelService, _instantiationService: IInstantiationService);
    private _updateStatusbar;
    private _showKernelStatus;
}
export declare class ActiveCellStatus extends Disposable implements IWorkbenchContribution {
    private readonly _editorService;
    private readonly _statusbarService;
    private readonly _itemDisposables;
    private readonly _accessor;
    constructor(_editorService: IEditorService, _statusbarService: IStatusbarService);
    private _update;
    private _show;
    private _getSelectionsText;
}
export declare class NotebookIndentationStatus extends Disposable {
    private readonly _editorService;
    private readonly _statusbarService;
    private readonly _configurationService;
    private readonly _itemDisposables;
    private readonly _accessor;
    static readonly ID = "selectNotebookIndentation";
    constructor(_editorService: IEditorService, _statusbarService: IStatusbarService, _configurationService: IConfigurationService);
    private _update;
    private _show;
}
export declare class NotebookEditorStatusContribution extends Disposable implements IWorkbenchContribution {
    private readonly editorGroupService;
    static readonly ID = "notebook.contrib.editorStatus";
    constructor(editorGroupService: IEditorGroupsService);
    private createNotebookStatus;
}
