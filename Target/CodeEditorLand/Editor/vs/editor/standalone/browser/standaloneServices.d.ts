import './standaloneCodeEditorService.js';
import './standaloneLayoutService.js';
import '../../../platform/undoRedo/common/undoRedoService.js';
import '../../common/services/languageFeatureDebounce.js';
import '../../common/services/semanticTokensStylingService.js';
import '../../common/services/languageFeaturesService.js';
import '../../browser/services/hoverService/hoverService.js';
import { Event } from '../../../base/common/event.js';
import { ResolvedKeybinding, Keybinding } from '../../../base/common/keybindings.js';
import { IDisposable } from '../../../base/common/lifecycle.js';
import Severity from '../../../base/common/severity.js';
import { ICommandEvent, ICommandHandler, ICommandService } from '../../../platform/commands/common/commands.js';
import { IConfigurationChangeEvent, IConfigurationData, IConfigurationOverrides, IConfigurationService, IConfigurationValue } from '../../../platform/configuration/common/configuration.js';
import { IContextKeyService, ContextKeyExpression } from '../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService, ServiceIdentifier } from '../../../platform/instantiation/common/instantiation.js';
import { AbstractKeybindingService } from '../../../platform/keybinding/common/abstractKeybindingService.js';
import { IKeyboardEvent, KeybindingsSchemaContribution } from '../../../platform/keybinding/common/keybinding.js';
import { KeybindingResolver } from '../../../platform/keybinding/common/keybindingResolver.js';
import { INotification, INotificationHandle, INotificationService, IPromptChoice, IPromptOptions, IStatusMessageOptions, INotificationSource, INotificationSourceFilter, NotificationsFilter } from '../../../platform/notification/common/notification.js';
import { ITelemetryService } from '../../../platform/telemetry/common/telemetry.js';
import { ICodeEditorService } from '../../browser/services/codeEditorService.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { IWorkerDescriptor } from '../../../base/common/worker/simpleWorker.js';
export declare class StandaloneNotificationService implements INotificationService {
    readonly onDidAddNotification: Event<INotification>;
    readonly onDidRemoveNotification: Event<INotification>;
    readonly onDidChangeFilter: Event<void>;
    _serviceBrand: undefined;
    private static readonly NO_OP;
    info(message: string): INotificationHandle;
    warn(message: string): INotificationHandle;
    error(error: string | Error): INotificationHandle;
    notify(notification: INotification): INotificationHandle;
    prompt(severity: Severity, message: string, choices: IPromptChoice[], options?: IPromptOptions): INotificationHandle;
    status(message: string | Error, options?: IStatusMessageOptions): IDisposable;
    setFilter(filter: NotificationsFilter | INotificationSourceFilter): void;
    getFilter(source?: INotificationSource): NotificationsFilter;
    getFilters(): INotificationSourceFilter[];
    removeFilter(sourceId: string): void;
}
export declare class StandaloneCommandService implements ICommandService {
    readonly _serviceBrand: undefined;
    private readonly _instantiationService;
    private readonly _onWillExecuteCommand;
    private readonly _onDidExecuteCommand;
    readonly onWillExecuteCommand: Event<ICommandEvent>;
    readonly onDidExecuteCommand: Event<ICommandEvent>;
    constructor(instantiationService: IInstantiationService);
    executeCommand<T>(id: string, ...args: any[]): Promise<T>;
}
export interface IKeybindingRule {
    keybinding: number;
    command?: string | null;
    commandArgs?: any;
    when?: ContextKeyExpression | null;
}
export declare class StandaloneKeybindingService extends AbstractKeybindingService {
    private _cachedResolver;
    private _dynamicKeybindings;
    private readonly _domNodeListeners;
    constructor(contextKeyService: IContextKeyService, commandService: ICommandService, telemetryService: ITelemetryService, notificationService: INotificationService, logService: ILogService, codeEditorService: ICodeEditorService);
    addDynamicKeybinding(command: string, keybinding: number, handler: ICommandHandler, when: ContextKeyExpression | undefined): IDisposable;
    addDynamicKeybindings(rules: IKeybindingRule[]): IDisposable;
    private updateResolver;
    protected _getResolver(): KeybindingResolver;
    protected _documentHasFocus(): boolean;
    private _toNormalizedKeybindingItems;
    resolveKeybinding(keybinding: Keybinding): ResolvedKeybinding[];
    resolveKeyboardEvent(keyboardEvent: IKeyboardEvent): ResolvedKeybinding;
    resolveUserBinding(userBinding: string): ResolvedKeybinding[];
    _dumpDebugInfo(): string;
    _dumpDebugInfoJSON(): string;
    registerSchemaContribution(contribution: KeybindingsSchemaContribution): void;
    /**
     * not yet supported
     */
    enableKeybindingHoldMode(commandId: string): Promise<void> | undefined;
}
export declare class StandaloneConfigurationService implements IConfigurationService {
    private readonly logService;
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeConfiguration;
    readonly onDidChangeConfiguration: Event<IConfigurationChangeEvent>;
    private readonly _configuration;
    constructor(logService: ILogService);
    getValue<T>(): T;
    getValue<T>(section: string): T;
    getValue<T>(overrides: IConfigurationOverrides): T;
    getValue<T>(section: string, overrides: IConfigurationOverrides): T;
    updateValues(values: [string, any][]): Promise<void>;
    updateValue(key: string, value: any, arg3?: any, arg4?: any): Promise<void>;
    inspect<C>(key: string, options?: IConfigurationOverrides): IConfigurationValue<C>;
    keys(): {
        default: string[];
        user: string[];
        workspace: string[];
        workspaceFolder: string[];
    };
    reloadConfiguration(): Promise<void>;
    getConfigurationData(): IConfigurationData | null;
}
export declare function updateConfigurationService(configurationService: IConfigurationService, source: any, isDiffEditor: boolean): void;
export declare const standaloneEditorWorkerDescriptor: IWorkerDescriptor;
export interface IEditorOverrideServices {
    [index: string]: any;
}
/**
 * We don't want to eagerly instantiate services because embedders get a one time chance
 * to override services when they create the first editor.
 */
export declare namespace StandaloneServices {
    function get<T>(serviceId: ServiceIdentifier<T>): T;
    function initialize(overrides: IEditorOverrideServices): IInstantiationService;
    /**
     * Executes callback once services are initialized.
     */
    function withServices(callback: () => IDisposable): IDisposable;
}
