import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../../../platform/contextkey/common/contextkey.js';
import { IWorkbenchContribution } from '../../../../../common/contributions.js';
import { IViewDescriptorService } from '../../../../../common/views.js';
import { INotebookExecutionStateService } from '../../../common/notebookExecutionStateService.js';
import { INotebookKernelService } from '../../../common/notebookKernelService.js';
import { INotebookService } from '../../../common/notebookService.js';
import { IEditorService } from '../../../../../services/editor/common/editorService.js';
export declare class NotebookVariables extends Disposable implements IWorkbenchContribution {
    private readonly configurationService;
    private readonly editorService;
    private readonly notebookExecutionStateService;
    private readonly notebookKernelService;
    private readonly notebookDocumentService;
    private readonly viewDescriptorService;
    private listeners;
    private configListener;
    private initialized;
    private viewEnabled;
    constructor(contextKeyService: IContextKeyService, configurationService: IConfigurationService, editorService: IEditorService, notebookExecutionStateService: INotebookExecutionStateService, notebookKernelService: INotebookKernelService, notebookDocumentService: INotebookService, viewDescriptorService: IViewDescriptorService);
    private handleConfigChange;
    private handleInitEvent;
    private hasVariableProvider;
    private initializeView;
    dispose(): void;
}
