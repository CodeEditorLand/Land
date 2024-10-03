import { IDisposable } from '../../../../base/common/lifecycle.js';
import { IBulkEditOptions, IBulkEditPreviewHandler, IBulkEditResult, IBulkEditService, ResourceEdit } from '../../../../editor/browser/services/bulkEditService.js';
import { WorkspaceEdit } from '../../../../editor/common/languages.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { ILifecycleService } from '../../../services/lifecycle/common/lifecycle.js';
import { IWorkingCopyService } from '../../../services/workingCopy/common/workingCopyService.js';
export declare class BulkEditService implements IBulkEditService {
    private readonly _instaService;
    private readonly _logService;
    private readonly _editorService;
    private readonly _lifecycleService;
    private readonly _dialogService;
    private readonly _workingCopyService;
    private readonly _configService;
    readonly _serviceBrand: undefined;
    private readonly _activeUndoRedoGroups;
    private _previewHandler?;
    constructor(_instaService: IInstantiationService, _logService: ILogService, _editorService: IEditorService, _lifecycleService: ILifecycleService, _dialogService: IDialogService, _workingCopyService: IWorkingCopyService, _configService: IConfigurationService);
    setPreviewHandler(handler: IBulkEditPreviewHandler): IDisposable;
    hasPreviewHandler(): boolean;
    apply(editsIn: ResourceEdit[] | WorkspaceEdit, options?: IBulkEditOptions): Promise<IBulkEditResult>;
    private _saveAll;
    private _shouldVeto;
}
