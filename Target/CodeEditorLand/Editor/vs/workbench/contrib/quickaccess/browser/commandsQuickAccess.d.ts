import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IEditor } from '../../../../editor/common/editorCommon.js';
import { AbstractEditorCommandsQuickAccessProvider } from '../../../../editor/contrib/quickAccess/browser/commandsQuickAccess.js';
import { Action2, IMenuService } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IInstantiationService, ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { ICommandQuickPick } from '../../../../platform/quickinput/browser/commandsQuickAccess.js';
import { DefaultQuickAccessFilterValue } from '../../../../platform/quickinput/common/quickAccess.js';
import { IQuickPickSeparator } from '../../../../platform/quickinput/common/quickInput.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IChatAgentService } from '../../chat/common/chatAgents.js';
import { IAiRelatedInformationService } from '../../../services/aiRelatedInformation/common/aiRelatedInformation.js';
import { IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { IPreferencesService } from '../../../services/preferences/common/preferences.js';
export declare class CommandsQuickAccessProvider extends AbstractEditorCommandsQuickAccessProvider {
    private readonly editorService;
    private readonly menuService;
    private readonly extensionService;
    private readonly configurationService;
    private readonly editorGroupService;
    private readonly preferencesService;
    private readonly productService;
    private readonly aiRelatedInformationService;
    private readonly chatAgentService;
    private static AI_RELATED_INFORMATION_MAX_PICKS;
    private static AI_RELATED_INFORMATION_DEBOUNCE;
    private readonly extensionRegistrationRace;
    private useAiRelatedInfo;
    protected get activeTextEditorControl(): IEditor | undefined;
    get defaultFilterValue(): DefaultQuickAccessFilterValue | undefined;
    constructor(editorService: IEditorService, menuService: IMenuService, extensionService: IExtensionService, instantiationService: IInstantiationService, keybindingService: IKeybindingService, commandService: ICommandService, telemetryService: ITelemetryService, dialogService: IDialogService, configurationService: IConfigurationService, editorGroupService: IEditorGroupsService, preferencesService: IPreferencesService, productService: IProductService, aiRelatedInformationService: IAiRelatedInformationService, chatAgentService: IChatAgentService);
    private get configuration();
    private updateOptions;
    protected getCommandPicks(token: CancellationToken): Promise<Array<ICommandQuickPick>>;
    protected hasAdditionalCommandPicks(filter: string, token: CancellationToken): boolean;
    protected getAdditionalCommandPicks(allPicks: ICommandQuickPick[], picksSoFar: ICommandQuickPick[], filter: string, token: CancellationToken): Promise<Array<ICommandQuickPick | IQuickPickSeparator>>;
    private getRelatedInformationPicks;
    private getGlobalCommandPicks;
}
export declare class ShowAllCommandsAction extends Action2 {
    static readonly ID = "workbench.action.showCommands";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class ClearCommandHistoryAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
