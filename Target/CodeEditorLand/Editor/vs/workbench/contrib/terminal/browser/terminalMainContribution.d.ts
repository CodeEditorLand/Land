import { Disposable } from '../../../../base/common/lifecycle.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { ITerminalEditorService, ITerminalGroupService, ITerminalInstanceService, ITerminalService } from './terminal.js';
import { IEditorResolverService } from '../../../services/editor/common/editorResolverService.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { ILifecycleService } from '../../../services/lifecycle/common/lifecycle.js';
import { IEmbedderTerminalService } from '../../../services/terminal/common/embedderTerminalService.js';
export declare class TerminalMainContribution extends Disposable implements IWorkbenchContribution {
    static ID: string;
    constructor(editorResolverService: IEditorResolverService, embedderTerminalService: IEmbedderTerminalService, workbenchEnvironmentService: IWorkbenchEnvironmentService, labelService: ILabelService, lifecycleService: ILifecycleService, terminalService: ITerminalService, terminalEditorService: ITerminalEditorService, terminalGroupService: ITerminalGroupService, terminalInstanceService: ITerminalInstanceService);
    private _init;
}
