import { URI } from '../../../base/common/uri.js';
import { IURITransformer } from '../../../base/common/uriIpc.js';
import { IMessagePassingProtocol } from '../../../base/parts/ipc/common/ipc.js';
import { MainThreadConsoleShape } from './extHost.protocol.js';
import { IExtensionHostInitData } from '../../services/extensions/common/extensionHostProtocol.js';
import { ServicesAccessor } from '../../../platform/instantiation/common/instantiation.js';
import { IHostUtils } from './extHostExtensionService.js';
export interface IExitFn {
    (code?: number): any;
}
export interface IConsolePatchFn {
    (mainThreadConsole: MainThreadConsoleShape): any;
}
export declare abstract class ErrorHandler {
    static installEarlyHandler(accessor: ServicesAccessor): Promise<void>;
    static installFullHandler(accessor: ServicesAccessor): Promise<void>;
}
export declare class ExtensionHostMain {
    private readonly _hostUtils;
    private readonly _rpcProtocol;
    private readonly _extensionService;
    private readonly _logService;
    constructor(protocol: IMessagePassingProtocol, initData: IExtensionHostInitData, hostUtils: IHostUtils, uriTransformer: IURITransformer | null, messagePorts?: ReadonlyMap<string, MessagePort>);
    asBrowserUri(uri: URI): Promise<URI>;
    terminate(reason: string): void;
    private static _transform;
}
