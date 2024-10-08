import { ShutdownReason } from '../common/lifecycle.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { AbstractLifecycleService } from '../common/lifecycleService.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';
export declare class NativeLifecycleService extends AbstractLifecycleService {
    private readonly nativeHostService;
    private static readonly BEFORE_SHUTDOWN_WARNING_DELAY;
    private static readonly WILL_SHUTDOWN_WARNING_DELAY;
    constructor(nativeHostService: INativeHostService, storageService: IStorageService, logService: ILogService);
    private registerListeners;
    protected handleBeforeShutdown(reason: ShutdownReason): Promise<boolean>;
    private handleBeforeShutdownError;
    protected handleWillShutdown(reason: ShutdownReason): Promise<void>;
    shutdown(): Promise<void>;
}
