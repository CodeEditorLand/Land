import { ShutdownReason, StartupKind } from '../common/lifecycle.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { AbstractLifecycleService } from '../common/lifecycleService.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
export declare class BrowserLifecycleService extends AbstractLifecycleService {
    private beforeUnloadListener;
    private unloadListener;
    private ignoreBeforeUnload;
    private didUnload;
    constructor(logService: ILogService, storageService: IStorageService);
    private registerListeners;
    private onBeforeUnload;
    private vetoBeforeUnload;
    withExpectedShutdown(reason: ShutdownReason): Promise<void>;
    withExpectedShutdown(reason: {
        disableShutdownHandling: true;
    }, callback: Function): void;
    shutdown(): Promise<void>;
    private doShutdown;
    private onUnload;
    private onLoadAfterUnload;
    protected doResolveStartupKind(): StartupKind | undefined;
}
