import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { AbstractRequestService, AuthInfo, Credentials, IRequestService } from '../../../../platform/request/common/request.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';
import { IRequestContext, IRequestOptions } from '../../../../base/parts/request/common/request.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
export declare class NativeRequestService extends AbstractRequestService implements IRequestService {
    private readonly nativeHostService;
    private readonly configurationService;
    readonly _serviceBrand: undefined;
    constructor(nativeHostService: INativeHostService, configurationService: IConfigurationService, logService: ILogService);
    request(options: IRequestOptions, token: CancellationToken): Promise<IRequestContext>;
    resolveProxy(url: string): Promise<string | undefined>;
    lookupAuthorization(authInfo: AuthInfo): Promise<Credentials | undefined>;
    lookupKerberosAuthorization(url: string): Promise<string | undefined>;
    loadCertificates(): Promise<string[]>;
}
