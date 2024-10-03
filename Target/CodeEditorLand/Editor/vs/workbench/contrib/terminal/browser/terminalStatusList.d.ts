import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import Severity from '../../../../base/common/severity.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ITerminalStatus } from '../common/terminal.js';
export declare const enum TerminalStatus {
    Bell = "bell",
    Disconnected = "disconnected",
    RelaunchNeeded = "relaunch-needed",
    EnvironmentVariableInfoChangesActive = "env-var-info-changes-active",
    ShellIntegrationAttentionNeeded = "shell-integration-attention-needed"
}
export interface ITerminalStatusList {
    readonly primary: ITerminalStatus | undefined;
    readonly statuses: ITerminalStatus[];
    readonly onDidAddStatus: Event<ITerminalStatus>;
    readonly onDidRemoveStatus: Event<ITerminalStatus>;
    readonly onDidChangePrimaryStatus: Event<ITerminalStatus | undefined>;
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
