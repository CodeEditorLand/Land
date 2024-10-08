import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Event } from '../../../../base/common/event.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { URI as uri } from '../../../../base/common/uri.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { DebugConfigurationProviderTriggerKind, IAdapterManager, IConfig, IConfigPresentation, IConfigurationManager, IDebugConfigurationProvider, ILaunch } from '../common/debug.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { IHistoryService } from '../../../services/history/common/history.js';
export declare class ConfigurationManager implements IConfigurationManager {
    private readonly adapterManager;
    private readonly contextService;
    private readonly configurationService;
    private readonly quickInputService;
    private readonly instantiationService;
    private readonly storageService;
    private readonly extensionService;
    private readonly historyService;
    private readonly uriIdentityService;
    private readonly logService;
    private launches;
    private selectedName;
    private selectedLaunch;
    private getSelectedConfig;
    private selectedType;
    private selectedDynamic;
    private toDispose;
    private readonly _onDidSelectConfigurationName;
    private configProviders;
    private debugConfigurationTypeContext;
    private readonly _onDidChangeConfigurationProviders;
    readonly onDidChangeConfigurationProviders: Event<void>;
    constructor(adapterManager: IAdapterManager, contextService: IWorkspaceContextService, configurationService: IConfigurationService, quickInputService: IQuickInputService, instantiationService: IInstantiationService, storageService: IStorageService, extensionService: IExtensionService, historyService: IHistoryService, uriIdentityService: IUriIdentityService, contextKeyService: IContextKeyService, logService: ILogService);
    registerDebugConfigurationProvider(debugConfigurationProvider: IDebugConfigurationProvider): IDisposable;
    unregisterDebugConfigurationProvider(debugConfigurationProvider: IDebugConfigurationProvider): void;
    /**
     * if scope is not specified,a value of DebugConfigurationProvideTrigger.Initial is assumed.
     */
    hasDebugConfigurationProvider(debugType: string, triggerKind?: DebugConfigurationProviderTriggerKind): boolean;
    resolveConfigurationByProviders(folderUri: uri | undefined, type: string | undefined, config: IConfig, token: CancellationToken): Promise<IConfig | null | undefined>;
    resolveDebugConfigurationWithSubstitutedVariables(folderUri: uri | undefined, type: string | undefined, config: IConfig, token: CancellationToken): Promise<IConfig | null | undefined>;
    provideDebugConfigurations(folderUri: uri | undefined, type: string, token: CancellationToken): Promise<any[]>;
    getDynamicProviders(): Promise<{
        label: string;
        type: string;
        getProvider: () => Promise<IDebugConfigurationProvider | undefined>;
        pick: () => Promise<{
            launch: ILaunch;
            config: IConfig;
        } | undefined>;
    }[]>;
    getAllConfigurations(): {
        launch: ILaunch;
        name: string;
        presentation?: IConfigPresentation;
    }[];
    removeRecentDynamicConfigurations(name: string, type: string): void;
    getRecentDynamicConfigurations(): {
        name: string;
        type: string;
    }[];
    private registerListeners;
    private initLaunches;
    private setCompoundSchemaValues;
    getLaunches(): ILaunch[];
    getLaunch(workspaceUri: uri | undefined): ILaunch | undefined;
    get selectedConfiguration(): {
        launch: ILaunch | undefined;
        name: string | undefined;
        getConfig: () => Promise<IConfig | undefined>;
        type: string | undefined;
    };
    get onDidSelectConfiguration(): Event<void>;
    getWorkspaceLaunch(): ILaunch | undefined;
    selectConfiguration(launch: ILaunch | undefined, name?: string, config?: IConfig, dynamicConfig?: {
        type?: string;
    }): Promise<void>;
    private setSelectedLaunchName;
    dispose(): void;
}
