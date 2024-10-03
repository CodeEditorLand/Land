import { Event } from '../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../base/common/lifecycle.js';
import { IExtensionHostProcessOptions, IExtensionHostStarter } from '../common/extensionHostStarter.js';
import { ILifecycleMainService } from '../../lifecycle/electron-main/lifecycleMainService.js';
import { ILogService } from '../../log/common/log.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
import { IWindowsMainService } from '../../windows/electron-main/windows.js';
export declare class ExtensionHostStarter extends Disposable implements IDisposable, IExtensionHostStarter {
    private readonly _logService;
    private readonly _lifecycleMainService;
    private readonly _windowsMainService;
    private readonly _telemetryService;
    readonly _serviceBrand: undefined;
    private static _lastId;
    private readonly _extHosts;
    private _shutdown;
    constructor(_logService: ILogService, _lifecycleMainService: ILifecycleMainService, _windowsMainService: IWindowsMainService, _telemetryService: ITelemetryService);
    dispose(): void;
    private _getExtHost;
    onDynamicStdout(id: string): Event<string>;
    onDynamicStderr(id: string): Event<string>;
    onDynamicMessage(id: string): Event<any>;
    onDynamicExit(id: string): Event<{
        code: number;
        signal: string;
    }>;
    createExtensionHost(): Promise<{
        id: string;
    }>;
    start(id: string, opts: IExtensionHostProcessOptions): Promise<{
        pid: number | undefined;
    }>;
    enableInspectPort(id: string): Promise<boolean>;
    kill(id: string): Promise<void>;
    _killAllNow(): Promise<void>;
    _waitForAllExit(maxWaitTimeMs: number): Promise<void>;
}
