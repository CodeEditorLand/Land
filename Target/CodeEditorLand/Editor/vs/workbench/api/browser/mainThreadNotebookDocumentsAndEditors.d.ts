import { IInstantiationService } from '../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { INotebookEditorService } from '../../contrib/notebook/browser/services/notebookEditorService.js';
import { INotebookService } from '../../contrib/notebook/common/notebookService.js';
import { IEditorGroupsService } from '../../services/editor/common/editorGroupsService.js';
import { IEditorService } from '../../services/editor/common/editorService.js';
export declare class MainThreadNotebooksAndEditors {
    private readonly _notebookService;
    private readonly _notebookEditorService;
    private readonly _editorService;
    private readonly _editorGroupService;
    private readonly _logService;
    private readonly _proxy;
    private readonly _disposables;
    private readonly _editorListeners;
    private _currentState?;
    private readonly _mainThreadNotebooks;
    private readonly _mainThreadEditors;
    constructor(extHostContext: IExtHostContext, instantiationService: IInstantiationService, _notebookService: INotebookService, _notebookEditorService: INotebookEditorService, _editorService: IEditorService, _editorGroupService: IEditorGroupsService, _logService: ILogService);
    dispose(): void;
    private _handleEditorAdd;
    private _handleEditorRemove;
    private _updateState;
    private _onDelta;
    private static _isDeltaEmpty;
    private static _asModelAddData;
    private _asEditorAddData;
}
