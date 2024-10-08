import { IQuickPickSeparator } from '../../../../../platform/quickinput/common/quickInput.js';
import { IPickerQuickAccessItem, PickerQuickAccessProvider } from '../../../../../platform/quickinput/browser/pickerQuickAccess.js';
import { ITerminalEditorService, ITerminalGroupService, ITerminalService } from '../../../terminal/browser/terminal.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
export declare class TerminalQuickAccessProvider extends PickerQuickAccessProvider<IPickerQuickAccessItem> {
    private readonly _commandService;
    private readonly _editorService;
    private readonly _instantiationService;
    private readonly _terminalEditorService;
    private readonly _terminalGroupService;
    private readonly _terminalService;
    private readonly _themeService;
    static PREFIX: string;
    constructor(_commandService: ICommandService, _editorService: IEditorService, _instantiationService: IInstantiationService, _terminalEditorService: ITerminalEditorService, _terminalGroupService: ITerminalGroupService, _terminalService: ITerminalService, _themeService: IThemeService);
    protected _getPicks(filter: string): Array<IPickerQuickAccessItem | IQuickPickSeparator>;
    private _createPick;
}
