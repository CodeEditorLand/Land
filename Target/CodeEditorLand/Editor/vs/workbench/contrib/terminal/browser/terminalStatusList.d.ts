import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import Severity from '../../../../base/common/severity.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ITerminalStatus } from '../common/terminal.js';
/**
 * The set of _internal_ terminal statuses, other components building on the terminal should put
 * their statuses within their component.
 */
export declare const enum TerminalStatus {
    Bell = "bell",
    Disconnected = "disconnected",
    RelaunchNeeded = "relaunch-needed",
    EnvironmentVariableInfoChangesActive = "env-var-info-changes-active",
    ShellIntegrationAttentionNeeded = "shell-integration-attention-needed"
}
export interface ITerminalStatusList {
    /** Gets the most recent, highest severity status. */
    readonly primary: ITerminalStatus | undefined;
    /** Gets all active statues. */
    readonly statuses: ITerminalStatus[];
    readonly onDidAddStatus: Event<ITerminalStatus>;
    readonly onDidRemoveStatus: Event<ITerminalStatus>;
    readonly onDidChangePrimaryStatus: Event<ITerminalStatus | undefined>;
    /**
     * Adds a status to the list.
     * @param status The status object. Ideally a single status object that does not change will be
     * shared as this call will no-op if the status is already set (checked by by object reference).
     * @param duration An optional duration in milliseconds of the status, when specified the status
     * will remove itself when the duration elapses unless the status gets re-added.
     */
    add(status: ITerminalStatus, duration?: number): void;
    remove(status: ITerminalStatus): void;
    remove(statusId: string): void;
    toggle(status: ITerminalStatus, value: boolean): void;
}
export declare class TerminalStatusList extends Disposable implements ITerminalStatusList {
    private readonly _configurationService;
    private readonly _statuses;
    private readonly _statusTimeouts;
    private readonly _onDidAddStatus;
    get onDidAddStatus(): Event<ITerminalStatus>;
    private readonly _onDidRemoveStatus;
    get onDidRemoveStatus(): Event<ITerminalStatus>;
    private readonly _onDidChangePrimaryStatus;
    get onDidChangePrimaryStatus(): Event<ITerminalStatus | undefined>;
    constructor(_configurationService: IConfigurationService);
    get primary(): ITerminalStatus | undefined;
    get statuses(): ITerminalStatus[];
    add(status: ITerminalStatus, duration?: number): void;
    remove(status: ITerminalStatus): void;
    remove(statusId: string): void;
    toggle(status: ITerminalStatus, value: boolean): void;
    private _applyAnimationSetting;
}
export declare function getColorForSeverity(severity: Severity): string;
