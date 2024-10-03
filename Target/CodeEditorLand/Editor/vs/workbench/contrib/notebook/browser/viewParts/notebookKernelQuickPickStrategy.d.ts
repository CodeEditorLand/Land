import { IAction } from '../../../../../base/common/actions.js';
import { Command } from '../../../../../editor/common/languages.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { ILabelService } from '../../../../../platform/label/common/label.js';
import { ILogService } from '../../../../../platform/log/common/log.js';
import { IProductService } from '../../../../../platform/product/common/productService.js';
import { IQuickInputService, IQuickPickItem, QuickPickInput } from '../../../../../platform/quickinput/common/quickInput.js';
import { IExtensionsWorkbenchService } from '../../../extensions/common/extensions.js';
import { IActiveNotebookEditor } from '../notebookBrowser.js';
import { NotebookEditorWidget } from '../notebookEditorWidget.js';
import { NotebookTextModel } from '../../common/model/notebookTextModel.js';
import { INotebookKernel, INotebookKernelHistoryService, INotebookKernelMatchResult, INotebookKernelService, ISourceAction } from '../../common/notebookKernelService.js';
import { IExtensionService } from '../../../../services/extensions/common/extensions.js';
import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { INotebookTextModel } from '../../common/notebookCommon.js';
type KernelPick = IQuickPickItem & {
    kernel: INotebookKernel;
};
type GroupedKernelsPick = IQuickPickItem & {
    kernels: INotebookKernel[];
    source: string;
};
type SourcePick = IQuickPickItem & {
    action: ISourceAction;
};
type InstallExtensionPick = IQuickPickItem & {
    extensionIds: string[];
};
type SearchMarketplacePick = IQuickPickItem & {
    id: 'install';
};
type KernelSourceQuickPickItem = IQuickPickItem & {
    command: Command;
    documentation?: string;
};
type KernelQuickPickItem = (IQuickPickItem & {
    autoRun?: boolean;
}) | SearchMarketplacePick | InstallExtensionPick | KernelPick | GroupedKernelsPick | SourcePick | KernelSourceQuickPickItem;
export type KernelQuickPickContext = {
    id: string;
    extension: string;
} | {
    notebookEditorId: string;
} | {
    id: string;
    extension: string;
    notebookEditorId: string;
} | {
    ui?: boolean;
    notebookEditor?: NotebookEditorWidget;
};
export interface IKernelPickerStrategy {
    showQuickPick(editor: IActiveNotebookEditor, wantedKernelId?: string): Promise<boolean>;
}
declare abstract class KernelPickerStrategyBase implements IKernelPickerStrategy {
    protected readonly _notebookKernelService: INotebookKernelService;
    protected readonly _productService: IProductService;
    protected readonly _quickInputService: IQuickInputService;
    protected readonly _labelService: ILabelService;
    protected readonly _logService: ILogService;
    protected readonly _extensionWorkbenchService: IExtensionsWorkbenchService;
    protected readonly _extensionService: IExtensionService;
    protected readonly _commandService: ICommandService;
    constructor(_notebookKernelService: INotebookKernelService, _productService: IProductService, _quickInputService: IQuickInputService, _labelService: ILabelService, _logService: ILogService, _extensionWorkbenchService: IExtensionsWorkbenchService, _extensionService: IExtensionService, _commandService: ICommandService);
    showQuickPick(editor: IActiveNotebookEditor, wantedId?: string, skipAutoRun?: boolean): Promise<boolean>;
    protected _getMatchingResult(notebook: NotebookTextModel): INotebookKernelMatchResult;
    protected abstract _getKernelPickerQuickPickItems(notebookTextModel: NotebookTextModel, matchResult: INotebookKernelMatchResult, notebookKernelService: INotebookKernelService, scopedContextKeyService: IContextKeyService): QuickPickInput<KernelQuickPickItem>[];
    protected _handleQuickPick(editor: IActiveNotebookEditor, pick: KernelQuickPickItem, quickPickItems: KernelQuickPickItem[]): Promise<boolean>;
    protected _selecteKernel(notebook: NotebookTextModel, kernel: INotebookKernel): void;
    protected _showKernelExtension(extensionWorkbenchService: IExtensionsWorkbenchService, extensionService: IExtensionService, viewType: string, extIds: string[], isInsiders?: boolean): Promise<void>;
    private _showInstallKernelExtensionRecommendation;
    protected _getKernelRecommendationsQuickPickItems(notebookTextModel: NotebookTextModel, extensionWorkbenchService: IExtensionsWorkbenchService): Promise<QuickPickInput<SearchMarketplacePick | InstallExtensionPick>[] | undefined>;
    private getSuggestedLanguage;
    private getSuggestedKernelFromLanguage;
}
export declare class KernelPickerMRUStrategy extends KernelPickerStrategyBase {
    private readonly _notebookKernelHistoryService;
    private readonly _openerService;
    constructor(_notebookKernelService: INotebookKernelService, _productService: IProductService, _quickInputService: IQuickInputService, _labelService: ILabelService, _logService: ILogService, _extensionWorkbenchService: IExtensionsWorkbenchService, _extensionService: IExtensionService, _commandService: ICommandService, _notebookKernelHistoryService: INotebookKernelHistoryService, _openerService: IOpenerService);
    protected _getKernelPickerQuickPickItems(notebookTextModel: NotebookTextModel, matchResult: INotebookKernelMatchResult, notebookKernelService: INotebookKernelService, scopedContextKeyService: IContextKeyService): QuickPickInput<KernelQuickPickItem>[];
    protected _selecteKernel(notebook: NotebookTextModel, kernel: INotebookKernel): void;
    protected _getMatchingResult(notebook: NotebookTextModel): INotebookKernelMatchResult;
    protected _handleQuickPick(editor: IActiveNotebookEditor, pick: KernelQuickPickItem, items: KernelQuickPickItem[]): Promise<boolean>;
    private displaySelectAnotherQuickPick;
    private _calculdateKernelSources;
    private _selectOneKernel;
    private _executeCommand;
    static updateKernelStatusAction(notebook: NotebookTextModel, action: IAction, notebookKernelService: INotebookKernelService, notebookKernelHistoryService: INotebookKernelHistoryService): void;
    static resolveKernel(notebook: INotebookTextModel, notebookKernelService: INotebookKernelService, notebookKernelHistoryService: INotebookKernelHistoryService, commandService: ICommandService): Promise<INotebookKernel | undefined>;
}
export {};
