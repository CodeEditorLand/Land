import { IShellIntegration, ShellIntegrationStatus } from '../terminal.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { TerminalCapabilityStore } from '../capabilities/terminalCapabilityStore.js';
import { IBufferMarkCapability, ICommandDetectionCapability, ICwdDetectionCapability, ISerializedCommandDetectionCapability } from '../capabilities/capabilities.js';
import { ILogService } from '../../../log/common/log.js';
import { ITelemetryService } from '../../../telemetry/common/telemetry.js';
import type { ITerminalAddon, Terminal } from '@xterm/headless';
export declare const enum ShellIntegrationOscPs {
    FinalTerm = 133,
    VSCode = 633,
    ITerm = 1337,
    SetCwd = 7,
    SetWindowsFriendlyCwd = 9
}
export declare class ShellIntegrationAddon extends Disposable implements IShellIntegration, ITerminalAddon {
    private _nonce;
    private readonly _disableTelemetry;
    private readonly _telemetryService;
    private readonly _logService;
    private _terminal?;
    readonly capabilities: TerminalCapabilityStore;
    private _hasUpdatedTelemetry;
    private _activationTimeout;
    private _commonProtocolDisposables;
    private _status;
    get status(): ShellIntegrationStatus;
    private readonly _onDidChangeStatus;
    readonly onDidChangeStatus: import("../../../../workbench/workbench.web.main.internal.js").Event<ShellIntegrationStatus>;
    constructor(_nonce: string, _disableTelemetry: boolean | undefined, _telemetryService: ITelemetryService | undefined, _logService: ILogService);
    private _disposeCommonProtocol;
    activate(xterm: Terminal): void;
    getMarkerId(terminal: Terminal, vscodeMarkerId: string): void;
    private _handleFinalTermSequence;
    private _doHandleFinalTermSequence;
    private _handleVSCodeSequence;
    private _ensureCapabilitiesOrAddFailureTelemetry;
    private _clearActivationTimeout;
    private _doHandleVSCodeSequence;
    private _updateContinuationPrompt;
    private _updatePromptTerminator;
    private _updateCwd;
    private _doHandleITermSequence;
    private _doHandleSetWindowsFriendlyCwd;
    private _doHandleSetCwd;
    serialize(): ISerializedCommandDetectionCapability;
    deserialize(serialized: ISerializedCommandDetectionCapability): void;
    protected _createOrGetCwdDetection(): ICwdDetectionCapability;
    protected _createOrGetCommandDetection(terminal: Terminal): ICommandDetectionCapability;
    protected _createOrGetBufferMarkDetection(terminal: Terminal): IBufferMarkCapability;
}
export declare function deserializeMessage(message: string): string;
export declare function parseKeyValueAssignment(message: string): {
    key: string;
    value: string | undefined;
};
export declare function parseMarkSequence(sequence: (string | undefined)[]): {
    id?: string;
    hidden?: boolean;
};
