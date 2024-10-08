import { IRequestOptions, IRequestContext } from '../../../../base/parts/request/common/request.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IRemoteAgentService } from '../../remote/common/remoteAgentService.js';
import { AbstractRequestService, AuthInfo, Credentials, IRequestService } from '../../../../platform/request/common/request.js';
import { ILogService } from '../../../../platform/log/common/log.js';
export declare class BrowserRequestService extends AbstractRequestService implements IRequestService {
    private readonly remoteAgentService;
    private readonly configurationService;
    readonly _serviceBrand: undefined;
    constructor(remoteAgentService: IRemoteAgentService, configurationService: IConfigurationService, logService: ILogService);
    request(options: IRequestOptions, token: CancellationToken): Promise<IRequestContext>;
    resolveProxy(url: string): Promise<string | undefined>;
    lookupAuthorization(authInfo: AuthInfo): Promise<Credentials | undefined>;
    lookupKerberosAuthorization(url: string): Promise<string | undefined>;
    loadCertificates(): Promise<string[]>;
    private _makeRemoteRequest;
}
