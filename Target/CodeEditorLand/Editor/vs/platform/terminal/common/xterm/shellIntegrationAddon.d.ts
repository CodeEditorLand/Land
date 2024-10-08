import { IShellIntegration, ShellIntegrationStatus } from '../terminal.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { TerminalCapabilityStore } from '../capabilities/terminalCapabilityStore.js';
import { IBufferMarkCapability, ICommandDetectionCapability, ICwdDetectionCapability, ISerializedCommandDetectionCapability } from '../capabilities/capabilities.js';
import { ILogService } from '../../../log/common/log.js';
import { ITelemetryService } from '../../../telemetry/common/telemetry.js';
import type { ITerminalAddon, Terminal } from '@xterm/headless';
/**
 * Shell integration is a feature that enhances the terminal's understanding of what's happening
 * in the shell by injecting special sequences into the shell's prompt using the "Set Text
 * Parameters" sequence (`OSC Ps ; Pt ST`).
 *
 * Definitions:
 * - OSC: `\x1b]`
 * - Ps:  A single (usually optional) numeric parameter, composed of one or more digits.
 * - Pt:  A text parameter composed of printable characters.
 * - ST: `\x7`
 *
 * This is inspired by a feature of the same name in the FinalTerm, iTerm2 and kitty terminals.
 */
/**
 * The identifier for the first numeric parameter (`Ps`) for OSC commands used by shell integration.
 */
export declare const enum ShellIntegrationOscPs {
    /**
     * Sequences pioneered by FinalTerm.
     */
    FinalTerm = 133,
    /**
     * Sequences pioneered by VS Code. The number is derived from the least significant digit of
     * "VSC" when encoded in hex ("VSC" = 0x56, 0x53, 0x43).
     */
    VSCode = 633,
    /**
     * Sequences pioneered by iTerm.
     */
    ITerm = 1337,
    SetCwd = 7,
    SetWindowsFriendlyCwd = 9
}
/**
 * The shell integration addon extends xterm by reading shell integration sequences and creating
 * capabilities and passing along relevant sequences to the capabilities. This is meant to
 * encapsulate all handling/parsing of sequences so the capabilities don't need to.
 */
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
    /**
     * Handles the sequence: `OSC 7 ; scheme://cwd ST`
     */
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
