import { IWorkspaceContextService } from '../../../platform/workspace/common/workspace.js';
import { MainThreadConfigurationShape } from '../common/extHost.protocol.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { ConfigurationTarget, IConfigurationService, IConfigurationOverrides } from '../../../platform/configuration/common/configuration.js';
import { IEnvironmentService } from '../../../platform/environment/common/environment.js';
export declare class MainThreadConfiguration implements MainThreadConfigurationShape {
    private readonly _workspaceContextService;
    private readonly configurationService;
    private readonly _environmentService;
    private readonly _configurationListener;
    constructor(extHostContext: IExtHostContext, _workspaceContextService: IWorkspaceContextService, configurationService: IConfigurationService, _environmentService: IEnvironmentService);
    private _getConfigurationData;
    dispose(): void;
    $updateConfigurationOption(target: ConfigurationTarget | null, key: string, value: any, overrides: IConfigurationOverrides | undefined, scopeToLanguage: boolean | undefined): Promise<void>;
    $removeConfigurationOption(target: ConfigurationTarget | null, key: string, overrides: IConfigurationOverrides | undefined, scopeToLanguage: boolean | undefined): Promise<void>;
    private writeConfiguration;
    private _updateValue;
    private deriveConfigurationTarget;
}
