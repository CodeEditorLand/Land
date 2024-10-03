import { createDecorator } from '../../instantiation/common/instantiation.js';
import { RawContextKey } from '../../contextkey/common/contextkey.js';
import { Registry } from '../../registry/common/platform.js';
export const terminalTabFocusModeContextKey = new RawContextKey('terminalTabFocusMode', false, true);
export var TitleEventSource;
(function (TitleEventSource) {
    TitleEventSource[TitleEventSource["Api"] = 0] = "Api";
    TitleEventSource[TitleEventSource["Process"] = 1] = "Process";
    TitleEventSource[TitleEventSource["Sequence"] = 2] = "Sequence";
    TitleEventSource[TitleEventSource["Config"] = 3] = "Config";
})(TitleEventSource || (TitleEventSource = {}));
export var TerminalIpcChannels;
(function (TerminalIpcChannels) {
    TerminalIpcChannels["LocalPty"] = "localPty";
    TerminalIpcChannels["PtyHost"] = "ptyHost";
    TerminalIpcChannels["PtyHostWindow"] = "ptyHostWindow";
    TerminalIpcChannels["Logger"] = "logger";
    TerminalIpcChannels["Heartbeat"] = "heartbeat";
})(TerminalIpcChannels || (TerminalIpcChannels = {}));
export const IPtyService = createDecorator('ptyService');
export var HeartbeatConstants;
(function (HeartbeatConstants) {
    HeartbeatConstants[HeartbeatConstants["BeatInterval"] = 5000] = "BeatInterval";
    HeartbeatConstants[HeartbeatConstants["ConnectingBeatInterval"] = 20000] = "ConnectingBeatInterval";
    HeartbeatConstants[HeartbeatConstants["FirstWaitMultiplier"] = 1.2] = "FirstWaitMultiplier";
    HeartbeatConstants[HeartbeatConstants["SecondWaitMultiplier"] = 1] = "SecondWaitMultiplier";
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
        return remoteAuthority?.toLowerCase() ?? '';
    }
}
Registry.add(TerminalExtensions.Backend, new TerminalBackendRegistry());
export const ILocalPtyService = createDecorator('localPtyService');
export const ITerminalLogService = createDecorator('terminalLogService');
