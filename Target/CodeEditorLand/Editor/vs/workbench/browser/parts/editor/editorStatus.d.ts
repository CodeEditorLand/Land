import './media/editorstatus.css';
import { Action } from '../../../../base/common/actions.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IExtensionGalleryService } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { Action2 } from '../../../../platform/actions/common/actions.js';
import { ServicesAccessor } from '../../../../editor/browser/editorExtensions.js';
import { IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
export declare class EditorStatusContribution extends Disposable implements IWorkbenchContribution {
    private readonly editorGroupService;
    static readonly ID = "workbench.contrib.editorStatus";
    constructor(editorGroupService: IEditorGroupsService);
    private createEditorStatus;
}
export declare class ShowLanguageExtensionsAction extends Action {
    private fileExtension;
    private readonly commandService;
    static readonly ID = "workbench.action.showLanguageExtensions";
    constructor(fileExtension: string, commandService: ICommandService, galleryService: IExtensionGalleryService);
    run(): Promise<void>;
}
export declare class ChangeLanguageAction extends Action2 {
    static readonly ID = "workbench.action.editor.changeLanguageMode";
    constructor();
    run(accessor: ServicesAccessor, languageMode?: string): Promise<void>;
    private configureFileAssociation;
}
export declare class ChangeEOLAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class ChangeEncodingAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
