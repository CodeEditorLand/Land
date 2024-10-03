import { Disposable } from '../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IEncryptionMainService } from '../../encryption/common/encryptionService.js';
import { IEnvironmentMainService } from '../../environment/electron-main/environmentMainService.js';
import { ILogService } from '../../log/common/log.js';
import { AuthInfo, Credentials } from '../../request/common/request.js';
import { IApplicationStorageMainService } from '../../storage/electron-main/storageMainService.js';
import { IWindowsMainService } from '../../windows/electron-main/windows.js';
export declare const IProxyAuthService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IProxyAuthService>;
export interface IProxyAuthService {
    lookupAuthorization(authInfo: AuthInfo): Promise<Credentials | undefined>;
}
export declare class ProxyAuthService extends Disposable implements IProxyAuthService {
    private readonly logService;
    private readonly windowsMainService;
    private readonly encryptionMainService;
    private readonly applicationStorageMainService;
    private readonly configurationService;
    private readonly environmentMainService;
    readonly _serviceBrand: undefined;
    private readonly PROXY_CREDENTIALS_SERVICE_KEY;
    private pendingProxyResolves;
    private currentDialog;
    private cancelledAuthInfoHashes;
    private sessionCredentials;
    constructor(logService: ILogService, windowsMainService: IWindowsMainService, encryptionMainService: IEncryptionMainService, applicationStorageMainService: IApplicationStorageMainService, configurationService: IConfigurationService, environmentMainService: IEnvironmentMainService);
    private registerListeners;
    lookupAuthorization(authInfo: AuthInfo): Promise<Credentials | undefined>;
    private onLogin;
    private resolveProxyCredentials;
    private doResolveProxyCredentials;
    private showProxyCredentialsDialog;
}
