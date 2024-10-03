import { IWorkbenchContribution } from '../../../common/contributions.js';
import { ILifecycleService } from '../../../services/lifecycle/common/lifecycle.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IWorkbenchThemeService } from '../../../services/themes/common/workbenchThemeService.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ITextFileService } from '../../../services/textfile/common/textfiles.js';
import { IPaneCompositePartService } from '../../../services/panecomposite/browser/panecomposite.js';
import { IUserDataProfileService } from '../../../services/userDataProfile/common/userDataProfile.js';
export declare class TelemetryContribution extends Disposable implements IWorkbenchContribution {
    private readonly telemetryService;
    private readonly contextService;
    private readonly userDataProfileService;
    private static ALLOWLIST_JSON;
    private static ALLOWLIST_WORKSPACE_JSON;
    constructor(telemetryService: ITelemetryService, contextService: IWorkspaceContextService, lifecycleService: ILifecycleService, editorService: IEditorService, keybindingsService: IKeybindingService, themeService: IWorkbenchThemeService, environmentService: IWorkbenchEnvironmentService, userDataProfileService: IUserDataProfileService, paneCompositeService: IPaneCompositePartService, textFileService: ITextFileService);
    private onTextFileModelResolved;
    private onTextFileModelSaved;
    private getTypeIfSettings;
    private getTelemetryData;
}
