import { CancellationToken } from '../../../base/common/cancellation.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { IRequestContext, IRequestOptions } from '../../../base/parts/request/common/request.js';
import { ConfigurationScope } from '../../configuration/common/configurationRegistry.js';
import { ILogService } from '../../log/common/log.js';
export declare const IRequestService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IRequestService>;
export interface AuthInfo {
    isProxy: boolean;
    scheme: string;
    host: string;
    port: number;
    realm: string;
    attempt: number;
}
export interface Credentials {
    username: string;
    password: string;
}
export interface IRequestService {
    readonly _serviceBrand: undefined;
    request(options: IRequestOptions, token: CancellationToken): Promise<IRequestContext>;
    resolveProxy(url: string): Promise<string | undefined>;
    lookupAuthorization(authInfo: AuthInfo): Promise<Credentials | undefined>;
    lookupKerberosAuthorization(url: string): Promise<string | undefined>;
    loadCertificates(): Promise<string[]>;
}
export declare abstract class AbstractRequestService extends Disposable implements IRequestService {
    protected readonly logService: ILogService;
    readonly _serviceBrand: undefined;
    private counter;
    constructor(logService: ILogService);
    protected logAndRequest(options: IRequestOptions, request: () => Promise<IRequestContext>): Promise<IRequestContext>;
    abstract request(options: IRequestOptions, token: CancellationToken): Promise<IRequestContext>;
    abstract resolveProxy(url: string): Promise<string | undefined>;
    abstract lookupAuthorization(authInfo: AuthInfo): Promise<Credentials | undefined>;
    abstract lookupKerberosAuthorization(url: string): Promise<string | undefined>;
    abstract loadCertificates(): Promise<string[]>;
}
export declare function isSuccess(context: IRequestContext): boolean;
export declare function hasNoContent(context: IRequestContext): boolean;
export declare function asText(context: IRequestContext): Promise<string | null>;
export declare function asTextOrError(context: IRequestContext): Promise<string | null>;
export declare function asJson<T = {}>(context: IRequestContext): Promise<T | null>;
export declare function updateProxyConfigurationsScope(scope: ConfigurationScope): void;
