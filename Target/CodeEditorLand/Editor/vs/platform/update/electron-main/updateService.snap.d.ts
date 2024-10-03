import { Event } from '../../../base/common/event.js';
import { IEnvironmentMainService } from '../../environment/electron-main/environmentMainService.js';
import { ILifecycleMainService } from '../../lifecycle/electron-main/lifecycleMainService.js';
import { ILogService } from '../../log/common/log.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
import { AvailableForDownload, IUpdateService, State, UpdateType } from '../common/update.js';
declare abstract class AbstractUpdateService implements IUpdateService {
    private readonly lifecycleMainService;
    protected logService: ILogService;
    readonly _serviceBrand: undefined;
    private _state;
    private readonly _onStateChange;
    readonly onStateChange: Event<State>;
    get state(): State;
    protected setState(state: State): void;
    constructor(lifecycleMainService: ILifecycleMainService, environmentMainService: IEnvironmentMainService, logService: ILogService);
    private scheduleCheckForUpdates;
    checkForUpdates(explicit: boolean): Promise<void>;
    downloadUpdate(): Promise<void>;
    protected doDownloadUpdate(state: AvailableForDownload): Promise<void>;
    applyUpdate(): Promise<void>;
    protected doApplyUpdate(): Promise<void>;
    quitAndInstall(): Promise<void>;
    protected getUpdateType(): UpdateType;
    protected doQuitAndInstall(): void;
    abstract isLatestVersion(): Promise<boolean | undefined>;
    _applySpecificUpdate(packagePath: string): Promise<void>;
    protected abstract doCheckForUpdates(context: any): void;
}
export declare class SnapUpdateService extends AbstractUpdateService {
    private snap;
    private snapRevision;
    private readonly telemetryService;
    constructor(snap: string, snapRevision: string, lifecycleMainService: ILifecycleMainService, environmentMainService: IEnvironmentMainService, logService: ILogService, telemetryService: ITelemetryService);
    protected doCheckForUpdates(): void;
    protected doQuitAndInstall(): void;
    private isUpdateAvailable;
    isLatestVersion(): Promise<boolean | undefined>;
}
export {};
