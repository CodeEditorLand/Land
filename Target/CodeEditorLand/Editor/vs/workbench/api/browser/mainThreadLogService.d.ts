import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { ILoggerOptions, ILoggerResource, ILoggerService, LogLevel } from '../../../platform/log/common/log.js';
import { MainThreadLoggerShape } from '../common/extHost.protocol.js';
import { UriComponents, UriDto } from '../../../base/common/uri.js';
export declare class MainThreadLoggerService implements MainThreadLoggerShape {
    private readonly loggerService;
    private readonly disposables;
    constructor(extHostContext: IExtHostContext, loggerService: ILoggerService);
    $log(file: UriComponents, messages: [LogLevel, string][]): void;
    $createLogger(file: UriComponents, options?: ILoggerOptions): Promise<void>;
    $registerLogger(logResource: UriDto<ILoggerResource>): Promise<void>;
    $deregisterLogger(resource: UriComponents): Promise<void>;
    $setVisibility(resource: UriComponents, visible: boolean): Promise<void>;
    $flush(file: UriComponents): void;
    dispose(): void;
}
