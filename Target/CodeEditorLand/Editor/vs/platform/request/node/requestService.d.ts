import * as http from 'http';
import { CancellationToken } from '../../../base/common/cancellation.js';
import { IRequestContext, IRequestOptions } from '../../../base/parts/request/common/request.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { INativeEnvironmentService } from '../../environment/common/environment.js';
import { ILogService } from '../../log/common/log.js';
import { AbstractRequestService, AuthInfo, Credentials, IRequestService } from '../common/request.js';
import { Agent } from './proxy.js';
export interface IRawRequestFunction {
    (options: http.RequestOptions, callback?: (res: http.IncomingMessage) => void): http.ClientRequest;
}
export interface NodeRequestOptions extends IRequestOptions {
    agent?: Agent;
    strictSSL?: boolean;
    isChromiumNetwork?: boolean;
    getRawRequest?(options: IRequestOptions): IRawRequestFunction;
}
export declare class RequestService extends AbstractRequestService implements IRequestService {
    private readonly configurationService;
    private readonly environmentService;
    readonly _serviceBrand: undefined;
    private proxyUrl?;
    private strictSSL;
    private authorization?;
    private shellEnvErrorLogged?;
    constructor(configurationService: IConfigurationService, environmentService: INativeEnvironmentService, logService: ILogService);
    private configure;
    request(options: NodeRequestOptions, token: CancellationToken): Promise<IRequestContext>;
    resolveProxy(url: string): Promise<string | undefined>;
    lookupAuthorization(authInfo: AuthInfo): Promise<Credentials | undefined>;
    lookupKerberosAuthorization(urlStr: string): Promise<string | undefined>;
    loadCertificates(): Promise<string[]>;
}
export declare function nodeRequest(options: NodeRequestOptions, token: CancellationToken): Promise<IRequestContext>;
