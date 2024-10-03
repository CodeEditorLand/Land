import { ICommandQuickPick } from '../../../../platform/quickinput/browser/commandsQuickAccess.js';
import { ICodeEditorService } from '../../../browser/services/codeEditorService.js';
import { AbstractEditorCommandsQuickAccessProvider } from '../../../contrib/quickAccess/browser/commandsQuickAccess.js';
import { IEditor } from '../../../common/editorCommon.js';
import { IInstantiationService, ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { EditorAction } from '../../../browser/editorExtensions.js';
export declare class StandaloneCommandsQuickAccessProvider extends AbstractEditorCommandsQuickAccessProvider {
    private readonly codeEditorService;
    protected get activeTextEditorControl(): IEditor | undefined;
    constructor(instantiationService: IInstantiationService, codeEditorService: ICodeEditorService, keybindingService: IKeybindingService, commandService: ICommandService, telemetryService: ITelemetryService, dialogService: IDialogService);
    protected getCommandPicks(): Promise<Array<ICommandQuickPick>>;
    protected hasAdditionalCommandPicks(): boolean;
    protected getAdditionalCommandPicks(): Promise<ICommandQuickPick[]>;
}
export declare class GotoLineAction extends EditorAction {
    static readonly ID = "editor.action.quickCommand";
    constructor();
    run(accessor: ServicesAccessor): void;
}
