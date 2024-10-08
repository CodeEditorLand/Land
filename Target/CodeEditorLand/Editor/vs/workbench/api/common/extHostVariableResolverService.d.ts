import { Disposable } from '../../../base/common/lifecycle.js';
import { IExtHostDocumentsAndEditors } from './extHostDocumentsAndEditors.js';
import { IExtHostEditorTabs } from './extHostEditorTabs.js';
import { IExtHostExtensionService } from './extHostExtensionService.js';
import { IExtHostWorkspace } from './extHostWorkspace.js';
import { IConfigurationResolverService } from '../../services/configurationResolver/common/configurationResolver.js';
import { IExtHostConfiguration } from './extHostConfiguration.js';
export interface IExtHostVariableResolverProvider {
    readonly _serviceBrand: undefined;
    getResolver(): Promise<IConfigurationResolverService>;
}
export declare const IExtHostVariableResolverProvider: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtHostVariableResolverProvider>;
export declare class ExtHostVariableResolverProviderService extends Disposable implements IExtHostVariableResolverProvider {
    private readonly extensionService;
    private readonly workspaceService;
    private readonly editorService;
    private readonly configurationService;
    private readonly editorTabs;
    readonly _serviceBrand: undefined;
    private _resolver;
    constructor(extensionService: IExtHostExtensionService, workspaceService: IExtHostWorkspace, editorService: IExtHostDocumentsAndEditors, configurationService: IExtHostConfiguration, editorTabs: IExtHostEditorTabs);
    getResolver(): Promise<IConfigurationResolverService>;
    protected homeDir(): string | undefined;
}
