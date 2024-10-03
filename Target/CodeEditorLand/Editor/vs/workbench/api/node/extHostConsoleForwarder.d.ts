import { AbstractExtHostConsoleForwarder } from '../common/extHostConsoleForwarder.js';
import { IExtHostInitDataService } from '../common/extHostInitDataService.js';
import { IExtHostRpcService } from '../common/extHostRpcService.js';
export declare class ExtHostConsoleForwarder extends AbstractExtHostConsoleForwarder {
    private _isMakingConsoleCall;
    constructor(extHostRpc: IExtHostRpcService, initData: IExtHostInitDataService);
    protected _nativeConsoleLogMessage(method: 'log' | 'info' | 'warn' | 'error' | 'debug', original: (...args: any[]) => void, args: IArguments): void;
    private _wrapStream;
}
