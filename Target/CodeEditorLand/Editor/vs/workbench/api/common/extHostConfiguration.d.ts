import { Event } from '../../../base/common/event.js';
import type * as vscode from 'vscode';
import { ExtHostWorkspace, IExtHostWorkspace } from './extHostWorkspace.js';
import { ExtHostConfigurationShape, MainThreadConfigurationShape, IConfigurationInitData } from './extHost.protocol.js';
import { IConfigurationChange } from '../../../platform/configuration/common/configuration.js';
import { IExtensionDescription } from '../../../platform/extensions/common/extensions.js';
import { IExtHostRpcService } from './extHostRpcService.js';
import { ILogService } from '../../../platform/log/common/log.js';
export declare class ExtHostConfiguration implements ExtHostConfigurationShape {
    readonly _serviceBrand: undefined;
    private readonly _proxy;
    private readonly _logService;
    private readonly _extHostWorkspace;
    private readonly _barrier;
    private _actual;
    constructor(extHostRpc: IExtHostRpcService, extHostWorkspace: IExtHostWorkspace, logService: ILogService);
    getConfigProvider(): Promise<ExtHostConfigProvider>;
    $initializeConfiguration(data: IConfigurationInitData): void;
    $acceptConfigurationChanged(data: IConfigurationInitData, change: IConfigurationChange): void;
}
export declare class ExtHostConfigProvider {
    private readonly _onDidChangeConfiguration;
    private readonly _proxy;
    private readonly _extHostWorkspace;
    private _configurationScopes;
    private _configuration;
    private _logService;
    constructor(proxy: MainThreadConfigurationShape, extHostWorkspace: ExtHostWorkspace, data: IConfigurationInitData, logService: ILogService);
    get onDidChangeConfiguration(): Event<vscode.ConfigurationChangeEvent>;
    $acceptConfigurationChanged(data: IConfigurationInitData, change: IConfigurationChange): void;
    getConfiguration(section?: string, scope?: vscode.ConfigurationScope | null, extensionDescription?: IExtensionDescription): vscode.WorkspaceConfiguration;
    private _toReadonlyValue;
    private _validateConfigurationAccess;
    private _toConfigurationChangeEvent;
    private _toMap;
}
export declare const IExtHostConfiguration: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtHostConfiguration>;
export interface IExtHostConfiguration extends ExtHostConfiguration {
}
