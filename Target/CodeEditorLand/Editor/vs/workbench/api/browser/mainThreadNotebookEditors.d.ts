import { UriComponents } from '../../../base/common/uri.js';
import { IConfigurationService } from '../../../platform/configuration/common/configuration.js';
import { INotebookEditor } from '../../contrib/notebook/browser/notebookBrowser.js';
import { INotebookEditorService } from '../../contrib/notebook/browser/services/notebookEditorService.js';
import { ICellRange } from '../../contrib/notebook/common/notebookRange.js';
import { IEditorGroupsService } from '../../services/editor/common/editorGroupsService.js';
import { IEditorService } from '../../services/editor/common/editorService.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { INotebookDocumentShowOptions, MainThreadNotebookEditorsShape, NotebookEditorRevealType } from '../common/extHost.protocol.js';
export declare class MainThreadNotebookEditors implements MainThreadNotebookEditorsShape {
    private readonly _editorService;
    private readonly _notebookEditorService;
    private readonly _editorGroupService;
    private readonly _configurationService;
    private readonly _disposables;
    private readonly _proxy;
    private readonly _mainThreadEditors;
    private _currentViewColumnInfo?;
    constructor(extHostContext: IExtHostContext, _editorService: IEditorService, _notebookEditorService: INotebookEditorService, _editorGroupService: IEditorGroupsService, _configurationService: IConfigurationService);
    dispose(): void;
    handleEditorsAdded(editors: readonly INotebookEditor[]): void;
    handleEditorsRemoved(editorIds: readonly string[]): void;
    private _updateEditorViewColumns;
    $tryShowNotebookDocument(resource: UriComponents, viewType: string, options: INotebookDocumentShowOptions): Promise<string>;
    $tryRevealRange(id: string, range: ICellRange, revealType: NotebookEditorRevealType): Promise<void>;
    $trySetSelections(id: string, ranges: ICellRange[]): void;
}
