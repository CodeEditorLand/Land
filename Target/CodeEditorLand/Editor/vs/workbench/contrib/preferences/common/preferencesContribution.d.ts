import { Disposable } from '../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IEditorResolverService } from '../../../services/editor/common/editorResolverService.js';
import { ITextEditorService } from '../../../services/textfile/common/textEditorService.js';
import { IPreferencesService } from '../../../services/preferences/common/preferences.js';
import { IUserDataProfileService } from '../../../services/userDataProfile/common/userDataProfile.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
export declare class PreferencesContribution extends Disposable implements IWorkbenchContribution {
    private readonly instantiationService;
    private readonly preferencesService;
    private readonly userDataProfileService;
    private readonly workspaceService;
    private readonly configurationService;
    private readonly editorResolverService;
    private readonly textEditorService;
    static readonly ID = "workbench.contrib.preferences";
    private editorOpeningListener;
    constructor(fileService: IFileService, instantiationService: IInstantiationService, preferencesService: IPreferencesService, userDataProfileService: IUserDataProfileService, workspaceService: IWorkspaceContextService, configurationService: IConfigurationService, editorResolverService: IEditorResolverService, textEditorService: ITextEditorService);
    private handleSettingsEditorRegistration;
    dispose(): void;
}
