import { CancellationToken } from '../../../base/common/cancellation.js';
import { Disposable, DisposableStore, IDisposable } from '../../../base/common/lifecycle.js';
import { ILocalizedString } from '../../action/common/action.js';
import { ICommandService } from '../../commands/common/commands.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IDialogService } from '../../dialogs/common/dialogs.js';
import { IInstantiationService } from '../../instantiation/common/instantiation.js';
import { IKeybindingService } from '../../keybinding/common/keybinding.js';
import { ILogService } from '../../log/common/log.js';
import { FastAndSlowPicks, IPickerQuickAccessItem, IPickerQuickAccessProviderOptions, PickerQuickAccessProvider, Picks } from './pickerQuickAccess.js';
import { IQuickAccessProviderRunOptions } from '../common/quickAccess.js';
import { IQuickPickSeparator } from '../common/quickInput.js';
import { IStorageService } from '../../storage/common/storage.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
export interface ICommandQuickPick extends IPickerQuickAccessItem {
    readonly commandId: string;
    readonly commandWhen?: string;
    readonly commandAlias?: string;
    readonly commandDescription?: ILocalizedString;
    tfIdfScore?: number;
    readonly args?: any[];
}
export interface ICommandsQuickAccessOptions extends IPickerQuickAccessProviderOptions<ICommandQuickPick> {
    readonly showAlias: boolean;
    suggestedCommandIds?: Set<string>;
}
export declare abstract class AbstractCommandsQuickAccessProvider extends PickerQuickAccessProvider<ICommandQuickPick> implements IDisposable {
    private readonly instantiationService;
    protected readonly keybindingService: IKeybindingService;
    private readonly commandService;
    private readonly telemetryService;
    private readonly dialogService;
    static PREFIX: string;
    private static readonly TFIDF_THRESHOLD;
    private static readonly TFIDF_MAX_RESULTS;
    private static WORD_FILTER;
    private readonly commandsHistory;
    protected readonly options: ICommandsQuickAccessOptions;
    constructor(options: ICommandsQuickAccessOptions, instantiationService: IInstantiationService, keybindingService: IKeybindingService, commandService: ICommandService, telemetryService: ITelemetryService, dialogService: IDialogService);
    protected _getPicks(filter: string, _disposables: DisposableStore, token: CancellationToken, runOptions?: IQuickAccessProviderRunOptions): Promise<Picks<ICommandQuickPick> | FastAndSlowPicks<ICommandQuickPick>>;
    private toCommandPick;
    private getTfIdfChunk;
    protected abstract getCommandPicks(token: CancellationToken): Promise<Array<ICommandQuickPick>>;
    protected abstract hasAdditionalCommandPicks(filter: string, token: CancellationToken): boolean;
    protected abstract getAdditionalCommandPicks(allPicks: ICommandQuickPick[], picksSoFar: ICommandQuickPick[], filter: string, token: CancellationToken): Promise<Array<ICommandQuickPick | IQuickPickSeparator>>;
}
export declare class CommandsHistory extends Disposable {
    private readonly storageService;
    private readonly configurationService;
    private readonly logService;
    static readonly DEFAULT_COMMANDS_HISTORY_LENGTH = 50;
    private static readonly PREF_KEY_CACHE;
    private static readonly PREF_KEY_COUNTER;
    private static cache;
    private static counter;
    private static hasChanges;
    private configuredCommandsHistoryLength;
    constructor(storageService: IStorageService, configurationService: IConfigurationService, logService: ILogService);
    private registerListeners;
    private updateConfiguration;
    private load;
    push(commandId: string): void;
    peek(commandId: string): number | undefined;
    private saveState;
    static getConfiguredCommandHistoryLength(configurationService: IConfigurationService): number;
    static clearHistory(configurationService: IConfigurationService, storageService: IStorageService): void;
}
