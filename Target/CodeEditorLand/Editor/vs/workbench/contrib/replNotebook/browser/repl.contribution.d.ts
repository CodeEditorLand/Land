import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { INotebookService } from '../../notebook/common/notebookService.js';
import { IEditorResolverService } from '../../../services/editor/common/editorResolverService.js';
import { INotebookEditorModelResolverService } from '../../notebook/common/notebookEditorModelResolverService.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
export declare class ReplDocumentContribution extends Disposable implements IWorkbenchContribution {
    private readonly notebookEditorModelResolverService;
    private readonly instantiationService;
    private readonly configurationService;
    static readonly ID = "workbench.contrib.replDocument";
    constructor(notebookService: INotebookService, editorResolverService: IEditorResolverService, notebookEditorModelResolverService: INotebookEditorModelResolverService, instantiationService: IInstantiationService, configurationService: IConfigurationService);
}
