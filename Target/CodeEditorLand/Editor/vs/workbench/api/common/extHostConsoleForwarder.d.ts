import { IExtHostInitDataService } from './extHostInitDataService.js';
import { IExtHostRpcService } from './extHostRpcService.js';
export declare abstract class AbstractExtHostConsoleForwarder {
    private readonly _mainThreadConsole;
    private readonly _includeStack;
    private readonly _logNative;
    constructor(extHostRpc: IExtHostRpcService, initData: IExtHostInitDataService);
    private _wrapConsoleMethod;
    private _handleConsoleCall;
    protected abstract _nativeConsoleLogMessage(method: 'log' | 'info' | 'warn' | 'error' | 'debug', original: (...args: any[]) => void, args: IArguments): void;
}
