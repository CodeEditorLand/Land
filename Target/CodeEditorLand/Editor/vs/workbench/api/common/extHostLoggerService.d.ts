import { ILogger, ILoggerOptions, LogLevel, AbstractLoggerService } from '../../../platform/log/common/log.js';
import { MainThreadLoggerShape, ExtHostLogLevelServiceShape as ExtHostLogLevelServiceShape } from './extHost.protocol.js';
import { IExtHostInitDataService } from './extHostInitDataService.js';
import { IExtHostRpcService } from './extHostRpcService.js';
import { URI, UriComponents } from '../../../base/common/uri.js';
export declare class ExtHostLoggerService extends AbstractLoggerService implements ExtHostLogLevelServiceShape {
    readonly _serviceBrand: undefined;
    protected readonly _proxy: MainThreadLoggerShape;
    constructor(rpc: IExtHostRpcService, initData: IExtHostInitDataService);
    $setLogLevel(logLevel: LogLevel, resource?: UriComponents): void;
    setVisibility(resource: URI, visibility: boolean): void;
    protected doCreateLogger(resource: URI, logLevel: LogLevel, options?: ILoggerOptions): ILogger;
}
