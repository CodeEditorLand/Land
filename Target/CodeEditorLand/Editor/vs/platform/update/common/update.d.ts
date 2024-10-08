import { Event } from '../../../base/common/event.js';
export interface IUpdate {
    version: string;
    productVersion?: string;
    timestamp?: number;
    url?: string;
    sha256hash?: string;
}
/**
 * Updates are run as a state machine:
 *
 *      Uninitialized
 *           ↓
 *          Idle
 *          ↓  ↑
 *   Checking for Updates  →  Available for Download
 *         ↓
 *     Downloading  →   Ready
 *         ↓               ↑
 *     Downloaded   →  Updating
 *
 * Available: There is an update available for download (linux).
 * Ready: Code will be updated as soon as it restarts (win32, darwin).
 * Downloaded: There is an update ready to be installed in the background (win32).
 */
export declare const enum StateType {
    Uninitialized = "uninitialized",
    Idle = "idle",
    Disabled = "disabled",
    CheckingForUpdates = "checking for updates",
    AvailableForDownload = "available for download",
    Downloading = "downloading",
    Downloaded = "downloaded",
    Updating = "updating",
    Ready = "ready"
}
export declare const enum UpdateType {
    Setup = 0,
    Archive = 1,
    Snap = 2
}
export declare const enum DisablementReason {
    NotBuilt = 0,
    DisabledByEnvironment = 1,
    ManuallyDisabled = 2,
    MissingConfiguration = 3,
    InvalidConfiguration = 4,
    RunningAsAdmin = 5
}
export type Uninitialized = {
    type: StateType.Uninitialized;
};
export type Disabled = {
    type: StateType.Disabled;
    reason: DisablementReason;
};
export type Idle = {
    type: StateType.Idle;
    updateType: UpdateType;
    error?: string;
};
export type CheckingForUpdates = {
    type: StateType.CheckingForUpdates;
    explicit: boolean;
};
export type AvailableForDownload = {
    type: StateType.AvailableForDownload;
    update: IUpdate;
};
export type Downloading = {
    type: StateType.Downloading;
};
export type Downloaded = {
    type: StateType.Downloaded;
    update: IUpdate;
};
export type Updating = {
    type: StateType.Updating;
    update: IUpdate;
};
export type Ready = {
    type: StateType.Ready;
    update: IUpdate;
};
export type State = Uninitialized | Disabled | Idle | CheckingForUpdates | AvailableForDownload | Downloading | Downloaded | Updating | Ready;
export declare const State: {
    Uninitialized: Uninitialized;
    Disabled: (reason: DisablementReason) => Disabled;
    Idle: (updateType: UpdateType, error?: string) => Idle;
    CheckingForUpdates: (explicit: boolean) => CheckingForUpdates;
    AvailableForDownload: (update: IUpdate) => AvailableForDownload;
    Downloading: Downloading;
    Downloaded: (update: IUpdate) => Downloaded;
    Updating: (update: IUpdate) => Updating;
    Ready: (update: IUpdate) => Ready;
};
export interface IAutoUpdater extends Event.NodeEventEmitter {
    setFeedURL(url: string): void;
    checkForUpdates(): void;
    applyUpdate?(): Promise<void>;
    quitAndInstall(): void;
}
export declare const IUpdateService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IUpdateService>;
export interface IUpdateService {
    readonly _serviceBrand: undefined;
    readonly onStateChange: Event<State>;
    readonly state: State;
    checkForUpdates(explicit: boolean): Promise<void>;
    downloadUpdate(): Promise<void>;
    applyUpdate(): Promise<void>;
    quitAndInstall(): Promise<void>;
    isLatestVersion(): Promise<boolean | undefined>;
    _applySpecificUpdate(packagePath: string): Promise<void>;
}
