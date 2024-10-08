import { IEditor } from '../../../common/editorCommon.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { AbstractCommandsQuickAccessProvider, ICommandQuickPick, ICommandsQuickAccessOptions } from '../../../../platform/quickinput/browser/commandsQuickAccess.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
export declare abstract class AbstractEditorCommandsQuickAccessProvider extends AbstractCommandsQuickAccessProvider {
    constructor(options: ICommandsQuickAccessOptions, instantiationService: IInstantiationService, keybindingService: IKeybindingService, commandService: ICommandService, telemetryService: ITelemetryService, dialogService: IDialogService);
    /**
     * Subclasses to provide the current active editor control.
     */
    protected abstract activeTextEditorControl: IEditor | undefined;
    protected getCodeEditorCommandPicks(): ICommandQuickPick[];
}
