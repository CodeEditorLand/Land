import { Disposable } from '../../../base/common/lifecycle.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { MainThreadSecretStateShape } from '../common/extHost.protocol.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { ISecretStorageService } from '../../../platform/secrets/common/secrets.js';
import { IBrowserWorkbenchEnvironmentService } from '../../services/environment/browser/environmentService.js';
export declare class MainThreadSecretState extends Disposable implements MainThreadSecretStateShape {
    private readonly secretStorageService;
    private readonly logService;
    private readonly _proxy;
    private readonly _sequencer;
    constructor(extHostContext: IExtHostContext, secretStorageService: ISecretStorageService, logService: ILogService, environmentService: IBrowserWorkbenchEnvironmentService);
    $getPassword(extensionId: string, key: string): Promise<string | undefined>;
    private doGetPassword;
    $setPassword(extensionId: string, key: string, value: string): Promise<void>;
    private doSetPassword;
    $deletePassword(extensionId: string, key: string): Promise<void>;
    private doDeletePassword;
    private getKey;
    private parseKey;
}
