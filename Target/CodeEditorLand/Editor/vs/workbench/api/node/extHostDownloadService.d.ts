import { IExtHostCommands } from '../common/extHostCommands.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { IExtHostRpcService } from '../common/extHostRpcService.js';
export declare class ExtHostDownloadService extends Disposable {
    constructor(extHostRpc: IExtHostRpcService, commands: IExtHostCommands);
}
