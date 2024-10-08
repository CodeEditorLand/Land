import { IExtHostInitDataService } from './extHostInitDataService.js';
import { IExtHostRpcService } from './extHostRpcService.js';
export declare abstract class AbstractExtHostConsoleForwarder {
    private readonly _mainThreadConsole;
    private readonly _includeStack;
    private readonly _logNative;
    constructor(extHostRpc: IExtHostRpcService, initData: IExtHostInitDataService);
    /**
     * Wraps a console message so that it is transmitted to the renderer. If
     * native logging is turned on, the original console message will be written
     * as well. This is needed since the console methods are "magic" in V8 and
     * are the only methods that allow later introspection of logged variables.
     *
     * The wrapped property is not defined with `writable: false` to avoid
     * throwing errors, but rather a no-op setting. See https://github.com/microsoft/vscode-extension-telemetry/issues/88
     */
    private _wrapConsoleMethod;
    private _handleConsoleCall;
    protected abstract _nativeConsoleLogMessage(method: 'log' | 'info' | 'warn' | 'error' | 'debug', original: (...args: any[]) => void, args: IArguments): void;
}
