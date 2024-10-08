import { Event } from '../../../../base/common/event.js';
import { IUpdateService, State } from '../../../../platform/update/common/update.js';
import { IBrowserWorkbenchEnvironmentService } from '../../environment/browser/environmentService.js';
import { IHostService } from '../../host/browser/host.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
export interface IUpdate {
    version: string;
}
export interface IUpdateProvider {
    /**
     * Should return with the `IUpdate` object if an update is
     * available or `null` otherwise to signal that there are
     * no updates.
     */
    checkForUpdate(): Promise<IUpdate | null>;
}
export declare class BrowserUpdateService extends Disposable implements IUpdateService {
    private readonly environmentService;
    private readonly hostService;
    readonly _serviceBrand: undefined;
    private _onStateChange;
    readonly onStateChange: Event<State>;
    private _state;
    get state(): State;
    set state(state: State);
    constructor(environmentService: IBrowserWorkbenchEnvironmentService, hostService: IHostService);
    isLatestVersion(): Promise<boolean | undefined>;
    checkForUpdates(explicit: boolean): Promise<void>;
    private doCheckForUpdates;
    downloadUpdate(): Promise<void>;
    applyUpdate(): Promise<void>;
    quitAndInstall(): Promise<void>;
    _applySpecificUpdate(packagePath: string): Promise<void>;
}
