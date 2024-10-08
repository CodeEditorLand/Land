/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createDecorator } from '../../instantiation/common/instantiation.js';
import { RawContextKey } from '../../contextkey/common/contextkey.js';
import { Registry } from '../../registry/common/platform.js';
export const terminalTabFocusModeContextKey = new RawContextKey('terminalTabFocusMode', false, true);
export var TitleEventSource;
(function (TitleEventSource) {
    /** From the API or the rename command that overrides any other type */
    TitleEventSource[TitleEventSource["Api"] = 0] = "Api";
    /** From the process name property*/
    TitleEventSource[TitleEventSource["Process"] = 1] = "Process";
    /** From the VT sequence */
    TitleEventSource[TitleEventSource["Sequence"] = 2] = "Sequence";
    /** Config changed */
    TitleEventSource[TitleEventSource["Config"] = 3] = "Config";
})(TitleEventSource || (TitleEventSource = {}));
export var TerminalIpcChannels;
(function (TerminalIpcChannels) {
    /**
     * Communicates between the renderer process and shared process.
     */
    TerminalIpcChannels["LocalPty"] = "localPty";
    /**
     * Communicates between the shared process and the pty host process.
     */
    TerminalIpcChannels["PtyHost"] = "ptyHost";
    /**
     * Communicates between the renderer process and the pty host process.
     */
    TerminalIpcChannels["PtyHostWindow"] = "ptyHostWindow";
    /**
     * Deals with logging from the pty host process.
     */
    TerminalIpcChannels["Logger"] = "logger";
    /**
     * Enables the detection of unresponsive pty hosts.
     */
    TerminalIpcChannels["Heartbeat"] = "heartbeat";
})(TerminalIpcChannels || (TerminalIpcChannels = {}));
export const IPtyService = createDecorator('ptyService');
export var HeartbeatConstants;
(function (HeartbeatConstants) {
    /**
     * The duration between heartbeats
     */
    HeartbeatConstants[HeartbeatConstants["BeatInterval"] = 5000] = "BeatInterval";
    /**
     * The duration of the first heartbeat while the pty host is starting up. This is much larger
     * than the regular BeatInterval to accommodate slow machines, we still want to warn about the
     * pty host's unresponsiveness eventually though.
     */
    HeartbeatConstants[HeartbeatConstants["ConnectingBeatInterval"] = 20000] = "ConnectingBeatInterval";
    /**
     * Defines a multiplier for BeatInterval for how long to wait before starting the second wait
     * timer.
     */
    HeartbeatConstants[HeartbeatConstants["FirstWaitMultiplier"] = 1.2] = "FirstWaitMultiplier";
    /**
     * Defines a multiplier for BeatInterval for how long to wait before telling the user about
     * non-responsiveness. The second timer is to avoid informing the user incorrectly when waking
     * the computer up from sleep
     */
    HeartbeatConstants[HeartbeatConstants["SecondWaitMultiplier"] = 1] = "SecondWaitMultiplier";
    /**
     * How long to wait before telling the user about non-responsiveness when they try to create a
     * process. This short circuits the standard wait timeouts to tell the user sooner and only
     * create process is handled to avoid additional perf overhead.
     */
    HeartbeatConstants[HeartbeatConstants["CreateProcessTimeout"] = 5000] = "CreateProcessTimeout";
})(HeartbeatConstants || (HeartbeatConstants = {}));
export var TerminalLocation;
(function (TerminalLocation) {
    TerminalLocation[TerminalLocation["Panel"] = 1] = "Panel";
    TerminalLocation[TerminalLocation["Editor"] = 2] = "Editor";
})(TerminalLocation || (TerminalLocation = {}));
export var TerminalExitReason;
(function (TerminalExitReason) {
    TerminalExitReason[TerminalExitReason["Unknown"] = 0] = "Unknown";
    TerminalExitReason[TerminalExitReason["Shutdown"] = 1] = "Shutdown";
    TerminalExitReason[TerminalExitReason["Process"] = 2] = "Process";
    TerminalExitReason[TerminalExitReason["User"] = 3] = "User";
    TerminalExitReason[TerminalExitReason["Extension"] = 4] = "Extension";
})(TerminalExitReason || (TerminalExitReason = {}));
export const TerminalExtensions = {
    Backend: 'workbench.contributions.terminal.processBackend'
};
class TerminalBackendRegistry {
    constructor() {
        this._backends = new Map();
    }
    get backends() { return this._backends; }
    registerTerminalBackend(backend) {
        const key = this._sanitizeRemoteAuthority(backend.remoteAuthority);
        if (this._backends.has(key)) {
            throw new Error(`A terminal backend with remote authority '${key}' was already registered.`);
        }
        this._backends.set(key, backend);
    }
    getTerminalBackend(remoteAuthority) {
        return this._backends.get(this._sanitizeRemoteAuthority(remoteAuthority));
    }
    _sanitizeRemoteAuthority(remoteAuthority) {
        // Normalize the key to lowercase as the authority is case-insensitive
        return remoteAuthority?.toLowerCase() ?? '';
    }
}
Registry.add(TerminalExtensions.Backend, new TerminalBackendRegistry());
export const ILocalPtyService = createDecorator('localPtyService');
export const ITerminalLogService = createDecorator('terminalLogService');
