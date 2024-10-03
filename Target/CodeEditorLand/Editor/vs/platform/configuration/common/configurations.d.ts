import { IStringDictionary } from '../../../base/common/collections.js';
import { Event } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { ConfigurationModel } from './configurationModels.js';
import { ILogService } from '../../log/common/log.js';
import { IPolicyService } from '../../policy/common/policy.js';
export declare class DefaultConfiguration extends Disposable {
    private readonly logService;
    private readonly _onDidChangeConfiguration;
    readonly onDidChangeConfiguration: Event<{
        defaults: ConfigurationModel;
        properties: string[];
    }>;
    private _configurationModel;
    get configurationModel(): ConfigurationModel;
    constructor(logService: ILogService);
    initialize(): Promise<ConfigurationModel>;
    reload(): ConfigurationModel;
    protected onDidUpdateConfiguration(properties: string[], defaultsOverrides?: boolean): void;
    protected getConfigurationDefaultOverrides(): IStringDictionary<any>;
    private resetConfigurationModel;
    private updateConfigurationModel;
}
export interface IPolicyConfiguration {
    readonly onDidChangeConfiguration: Event<ConfigurationModel>;
    readonly configurationModel: ConfigurationModel;
    initialize(): Promise<ConfigurationModel>;
}
export declare class NullPolicyConfiguration implements IPolicyConfiguration {
    readonly onDidChangeConfiguration: Event<any>;
    readonly configurationModel: ConfigurationModel;
    initialize(): Promise<ConfigurationModel>;
}
export declare class PolicyConfiguration extends Disposable implements IPolicyConfiguration {
    private readonly defaultConfiguration;
    private readonly policyService;
    private readonly logService;
    private readonly _onDidChangeConfiguration;
    readonly onDidChangeConfiguration: Event<ConfigurationModel>;
    private _configurationModel;
    get configurationModel(): ConfigurationModel;
    constructor(defaultConfiguration: DefaultConfiguration, policyService: IPolicyService, logService: ILogService);
    initialize(): Promise<ConfigurationModel>;
    private updatePolicyDefinitions;
    private onDidChangePolicies;
    private update;
}
