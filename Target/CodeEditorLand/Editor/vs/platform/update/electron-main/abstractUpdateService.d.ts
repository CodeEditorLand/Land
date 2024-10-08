import { Event } from '../../../base/common/event.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IEnvironmentMainService } from '../../environment/electron-main/environmentMainService.js';
import { ILifecycleMainService } from '../../lifecycle/electron-main/lifecycleMainService.js';
import { ILogService } from '../../log/common/log.js';
import { IProductService } from '../../product/common/productService.js';
import { IRequestService } from '../../request/common/request.js';
import { AvailableForDownload, IUpdateService, State, UpdateType } from '../common/update.js';
export declare function createUpdateURL(platform: string, quality: string, productService: IProductService): string;
export type UpdateNotAvailableClassification = {
    owner: 'joaomoreno';
    explicit: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'Whether the user has manually checked for updates, or this was an automatic check.';
    };
    comment: 'This is used to understand how often VS Code pings the update server for an update and there\'s none available.';
};
export type UpdateErrorClassification = {
    owner: 'joaomoreno';
    messageHash: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'The hash of the error message.';
    };
    comment: 'This is used to know how often VS Code updates have failed.';
};
export declare abstract class AbstractUpdateService implements IUpdateService {
    protected readonly lifecycleMainService: ILifecycleMainService;
    protected configurationService: IConfigurationService;
    private readonly environmentMainService;
    protected requestService: IRequestService;
    protected logService: ILogService;
    protected readonly productService: IProductService;
    readonly _serviceBrand: undefined;
    protected url: string | undefined;
    private _state;
    private readonly _onStateChange;
    readonly onStateChange: Event<State>;
    get state(): State;
    protected setState(state: State): void;
    constructor(lifecycleMainService: ILifecycleMainService, configurationService: IConfigurationService, environmentMainService: IEnvironmentMainService, requestService: IRequestService, logService: ILogService, productService: IProductService);
    /**
     * This must be called before any other call. This is a performance
     * optimization, to avoid using extra CPU cycles before first window open.
     * https://github.com/microsoft/vscode/issues/89784
     */
    protected initialize(): Promise<void>;
    private getProductQuality;
    private scheduleCheckForUpdates;
    checkForUpdates(explicit: boolean): Promise<void>;
    downloadUpdate(): Promise<void>;
    protected doDownloadUpdate(state: AvailableForDownload): Promise<void>;
    applyUpdate(): Promise<void>;
    protected doApplyUpdate(): Promise<void>;
    quitAndInstall(): Promise<void>;
    isLatestVersion(): Promise<boolean | undefined>;
    _applySpecificUpdate(packagePath: string): Promise<void>;
    protected getUpdateType(): UpdateType;
    protected doQuitAndInstall(): void;
    protected abstract buildUpdateFeedUrl(quality: string): string | undefined;
    protected abstract doCheckForUpdates(context: any): void;
}
