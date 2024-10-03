import { Disposable } from '../../../../base/common/lifecycle.js';
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
export declare class DiffEditorActiveAnnouncementContribution extends Disposable implements IWorkbenchContribution {
    private readonly _editorService;
    private readonly _accessibilityService;
    private readonly _configurationService;
    static readonly ID = "workbench.contrib.diffEditorActiveAnnouncement";
    private _onDidActiveEditorChangeListener?;
    constructor(_editorService: IEditorService, _accessibilityService: IAccessibilityService, _configurationService: IConfigurationService);
    private _updateListener;
}
