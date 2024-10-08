import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { MainThreadConsoleShape } from '../common/extHost.protocol.js';
import { IEnvironmentService } from '../../../platform/environment/common/environment.js';
import { IRemoteConsoleLog } from '../../../base/common/console.js';
import { ILogService } from '../../../platform/log/common/log.js';
export declare class MainThreadConsole implements MainThreadConsoleShape {
    private readonly _environmentService;
    private readonly _logService;
    private readonly _isExtensionDevTestFromCli;
    constructor(_extHostContext: IExtHostContext, _environmentService: IEnvironmentService, _logService: ILogService);
    dispose(): void;
    $logExtensionHostMessage(entry: IRemoteConsoleLog): void;
}
