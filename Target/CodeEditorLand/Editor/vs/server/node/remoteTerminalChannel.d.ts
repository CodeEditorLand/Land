import { Event } from '../../base/common/event.js';
import { Disposable } from '../../base/common/lifecycle.js';
import { IServerChannel } from '../../base/parts/ipc/common/ipc.js';
import { RemoteAgentConnectionContext } from '../../platform/remote/common/remoteAgentEnvironment.js';
import { IPtyHostService } from '../../platform/terminal/common/terminal.js';
import { RemoteTerminalChannelEvent, RemoteTerminalChannelRequest } from '../../workbench/contrib/terminal/common/remote/terminal.js';
import { IServerEnvironmentService } from './serverEnvironmentService.js';
import { IProductService } from '../../platform/product/common/productService.js';
import { IExtensionManagementService } from '../../platform/extensionManagement/common/extensionManagement.js';
import { IConfigurationService } from '../../platform/configuration/common/configuration.js';
import { ILogService } from '../../platform/log/common/log.js';
export declare class RemoteTerminalChannel extends Disposable implements IServerChannel<RemoteAgentConnectionContext> {
    private readonly _environmentService;
    private readonly _logService;
    private readonly _ptyHostService;
    private readonly _productService;
    private readonly _extensionManagementService;
    private readonly _configurationService;
    private _lastReqId;
    private readonly _pendingCommands;
    private readonly _onExecuteCommand;
    readonly onExecuteCommand: Event<{
        reqId: number;
        persistentProcessId: number;
        commandId: string;
        commandArgs: any[];
    }>;
    constructor(_environmentService: IServerEnvironmentService, _logService: ILogService, _ptyHostService: IPtyHostService, _productService: IProductService, _extensionManagementService: IExtensionManagementService, _configurationService: IConfigurationService);
    call(ctx: RemoteAgentConnectionContext, command: RemoteTerminalChannelRequest, args?: any): Promise<any>;
    listen(_: any, event: RemoteTerminalChannelEvent, arg: any): Event<any>;
    private _createProcess;
    private _executeCommand;
    private _sendCommandResult;
    private _getDefaultSystemShell;
    private _getProfiles;
    private _getEnvironment;
    private _getWslPath;
    private _reduceConnectionGraceTime;
}
