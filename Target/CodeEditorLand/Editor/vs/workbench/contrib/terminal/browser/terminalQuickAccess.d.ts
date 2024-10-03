import { IQuickPickSeparator } from '../../../../platform/quickinput/common/quickInput.js';
import { IPickerQuickAccessItem, PickerQuickAccessProvider } from '../../../../platform/quickinput/browser/pickerQuickAccess.js';
import { ITerminalEditorService, ITerminalGroupService, ITerminalService } from './terminal.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
export declare class TerminalQuickAccessProvider extends PickerQuickAccessProvider<IPickerQuickAccessItem> {
    private readonly _editorService;
    private readonly _terminalService;
    private readonly _terminalEditorService;
    private readonly _terminalGroupService;
    private readonly _commandService;
    private readonly _themeService;
    private readonly _instantiationService;
    static PREFIX: string;
    constructor(_editorService: IEditorService, _terminalService: ITerminalService, _terminalEditorService: ITerminalEditorService, _terminalGroupService: ITerminalGroupService, _commandService: ICommandService, _themeService: IThemeService, _instantiationService: IInstantiationService);
    protected _getPicks(filter: string): Array<IPickerQuickAccessItem | IQuickPickSeparator>;
    private _createPick;
}
