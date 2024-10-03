import { Disposable } from '../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { ISCMService } from '../common/scm.js';
import { IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.js';
export declare class SCMWorkingSetController extends Disposable implements IWorkbenchContribution {
    private readonly configurationService;
    private readonly editorGroupsService;
    private readonly scmService;
    private readonly storageService;
    private readonly layoutService;
    static readonly ID = "workbench.contrib.scmWorkingSets";
    private _workingSets;
    private _enabledConfig;
    private readonly _repositoryDisposables;
    constructor(configurationService: IConfigurationService, editorGroupsService: IEditorGroupsService, scmService: ISCMService, storageService: IStorageService, layoutService: IWorkbenchLayoutService);
    private _onDidAddRepository;
    private _onDidRemoveRepository;
    private _loadWorkingSets;
    private _saveWorkingSet;
    private _restoreWorkingSet;
    dispose(): void;
}
