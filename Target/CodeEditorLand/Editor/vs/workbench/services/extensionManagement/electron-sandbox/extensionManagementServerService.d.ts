import { ExtensionInstallLocation, IExtensionManagementServer, IExtensionManagementServerService } from '../common/extensionManagement.js';
import { IRemoteAgentService } from '../../remote/common/remoteAgentService.js';
import { ISharedProcessService } from '../../../../platform/ipc/electron-sandbox/services.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { IExtension } from '../../../../platform/extensions/common/extensions.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
export declare class ExtensionManagementServerService extends Disposable implements IExtensionManagementServerService {
    readonly _serviceBrand: undefined;
    readonly localExtensionManagementServer: IExtensionManagementServer;
    readonly remoteExtensionManagementServer: IExtensionManagementServer | null;
    readonly webExtensionManagementServer: IExtensionManagementServer | null;
    constructor(sharedProcessService: ISharedProcessService, remoteAgentService: IRemoteAgentService, labelService: ILabelService, instantiationService: IInstantiationService);
    getExtensionManagementServer(extension: IExtension): IExtensionManagementServer;
    getExtensionInstallLocation(extension: IExtension): ExtensionInstallLocation | null;
}
