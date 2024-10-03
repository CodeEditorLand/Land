import { Disposable, dispose, toDisposable } from '../../../../base/common/lifecycle.js';
import { TerminalCapabilityStore } from '../capabilities/terminalCapabilityStore.js';
import { CommandDetectionCapability } from '../capabilities/commandDetectionCapability.js';
import { CwdDetectionCapability } from '../capabilities/cwdDetectionCapability.js';
import { PartialCommandDetectionCapability } from '../capabilities/partialCommandDetectionCapability.js';
import { Emitter } from '../../../../base/common/event.js';
import { BufferMarkCapability } from '../capabilities/bufferMarkCapability.js';
import { URI } from '../../../../base/common/uri.js';
import { sanitizeCwd } from '../terminalEnvironment.js';
import { removeAnsiEscapeCodesFromPrompt } from '../../../../base/common/strings.js';
export class ShellIntegrationAddon extends Disposable {
    get status() { return this._status; }
    constructor(_nonce, _disableTelemetry, _telemetryService, _logService) {
        super();
        this._nonce = _nonce;
        this._disableTelemetry = _disableTelemetry;
        this._telemetryService = _telemetryService;
        this._logService = _logService;
        this.capabilities = this._register(new TerminalCapabilityStore());
        this._hasUpdatedTelemetry = false;
        this._commonProtocolDisposables = [];
        this._status = 0;
        this._onDidChangeStatus = new Emitter();
        this.onDidChangeStatus = this._onDidChangeStatus.event;
        this._register(toDisposable(() => {
            this._clearActivationTimeout();
            this._disposeCommonProtocol();
        }));
    }
    _disposeCommonProtocol() {
        dispose(this._commonProtocolDisposables);
        this._commonProtocolDisposables.length = 0;
    }
    activate(xterm) {
        this._terminal = xterm;
        this.capabilities.add(3, this._register(new PartialCommandDetectionCapability(this._terminal)));
        this._register(xterm.parser.registerOscHandler(633, data => this._handleVSCodeSequence(data)));
        this._register(xterm.parser.registerOscHandler(1337, data => this._doHandleITermSequence(data)));
        this._commonProtocolDisposables.push(xterm.parser.registerOscHandler(133, data => this._handleFinalTermSequence(data)));
        this._register(xterm.parser.registerOscHandler(7, data => this._doHandleSetCwd(data)));
        this._register(xterm.parser.registerOscHandler(9, data => this._doHandleSetWindowsFriendlyCwd(data)));
        this._ensureCapabilitiesOrAddFailureTelemetry();
    }
    getMarkerId(terminal, vscodeMarkerId) {
        this._createOrGetBufferMarkDetection(terminal).getMark(vscodeMarkerId);
    }
    _handleFinalTermSequence(data) {
        const didHandle = this._doHandleFinalTermSequence(data);
        if (this._status === 0) {
            this._status = 1;
            this._onDidChangeStatus.fire(this._status);
        }
        return didHandle;
    }
    _doHandleFinalTermSequence(data) {
        if (!this._terminal) {
            return false;
        }
        const [command, ...args] = data.split(';');
        switch (command) {
            case "A":
                this._createOrGetCommandDetection(this._terminal).handlePromptStart();
                return true;
            case "B":
                this._createOrGetCommandDetection(this._terminal).handleCommandStart({ ignoreCommandLine: true });
                return true;
            case "C":
                this._createOrGetCommandDetection(this._terminal).handleCommandExecuted();
                return true;
            case "D": {
                const exitCode = args.length === 1 ? parseInt(args[0]) : undefined;
                this._createOrGetCommandDetection(this._terminal).handleCommandFinished(exitCode);
                return true;
            }
        }
        return false;
    }
    _handleVSCodeSequence(data) {
        const didHandle = this._doHandleVSCodeSequence(data);
        if (!this._hasUpdatedTelemetry && didHandle) {
            this._telemetryService?.publicLog2('terminal/shellIntegrationActivationSucceeded');
            this._hasUpdatedTelemetry = true;
            this._clearActivationTimeout();
        }
        if (this._status !== 2) {
            this._status = 2;
            this._onDidChangeStatus.fire(this._status);
        }
        return didHandle;
    }
    async _ensureCapabilitiesOrAddFailureTelemetry() {
        if (!this._telemetryService || this._disableTelemetry) {
            return;
        }
        this._activationTimeout = setTimeout(() => {
            if (!this.capabilities.get(2) && !this.capabilities.get(0)) {
                this._telemetryService?.publicLog2('terminal/shellIntegrationActivationTimeout');
                this._logService.warn('Shell integration failed to add capabilities within 10 seconds');
            }
            this._hasUpdatedTelemetry = true;
        }, 10000);
    }
    _clearActivationTimeout() {
        if (this._activationTimeout !== undefined) {
            clearTimeout(this._activationTimeout);
            this._activationTimeout = undefined;
        }
    }
    _doHandleVSCodeSequence(data) {
        if (!this._terminal) {
            return false;
        }
        const argsIndex = data.indexOf(';');
        const sequenceCommand = argsIndex === -1 ? data : data.substring(0, argsIndex);
        const args = argsIndex === -1 ? [] : data.substring(argsIndex + 1).split(';');
        switch (sequenceCommand) {
            case "A":
                this._createOrGetCommandDetection(this._terminal).handlePromptStart();
                return true;
            case "B":
                this._createOrGetCommandDetection(this._terminal).handleCommandStart();
                return true;
            case "C":
                this._createOrGetCommandDetection(this._terminal).handleCommandExecuted();
                return true;
            case "D": {
                const arg0 = args[0];
                const exitCode = arg0 !== undefined ? parseInt(arg0) : undefined;
                this._createOrGetCommandDetection(this._terminal).handleCommandFinished(exitCode);
                return true;
            }
            case "E": {
                const arg0 = args[0];
                const arg1 = args[1];
                let commandLine;
                if (arg0 !== undefined) {
                    commandLine = deserializeMessage(arg0);
                }
                else {
                    commandLine = '';
                }
                this._createOrGetCommandDetection(this._terminal).setCommandLine(commandLine, arg1 === this._nonce);
                return true;
            }
            case "F": {
                this._createOrGetCommandDetection(this._terminal).handleContinuationStart();
                return true;
            }
            case "G": {
                this._createOrGetCommandDetection(this._terminal).handleContinuationEnd();
                return true;
            }
            case "H": {
                this._createOrGetCommandDetection(this._terminal).handleRightPromptStart();
                return true;
            }
            case "I": {
                this._createOrGetCommandDetection(this._terminal).handleRightPromptEnd();
                return true;
            }
            case "P": {
                const arg0 = args[0];
                const deserialized = arg0 !== undefined ? deserializeMessage(arg0) : '';
                const { key, value } = parseKeyValueAssignment(deserialized);
                if (value === undefined) {
                    return true;
                }
                switch (key) {
                    case 'ContinuationPrompt': {
                        this._updateContinuationPrompt(removeAnsiEscapeCodesFromPrompt(value));
                        return true;
                    }
                    case 'Cwd': {
                        this._updateCwd(value);
                        return true;
                    }
                    case 'IsWindows': {
                        this._createOrGetCommandDetection(this._terminal).setIsWindowsPty(value === 'True' ? true : false);
                        return true;
                    }
                    case 'Prompt': {
                        const sanitizedValue = value.replace(/\x1b\[[0-9;]*m/g, '');
                        this._updatePromptTerminator(sanitizedValue);
                        return true;
                    }
                    case 'Task': {
                        this._createOrGetBufferMarkDetection(this._terminal);
                        this.capabilities.get(2)?.setIsCommandStorageDisabled();
                        return true;
                    }
                }
            }
            case "SetMark": {
                this._createOrGetBufferMarkDetection(this._terminal).addMark(parseMarkSequence(args));
                return true;
            }
        }
        return false;
    }
    _updateContinuationPrompt(value) {
        if (!this._terminal) {
            return;
        }
        this._createOrGetCommandDetection(this._terminal).setContinuationPrompt(value);
    }
    _updatePromptTerminator(prompt) {
        if (!this._terminal) {
            return;
        }
        const lastPromptLine = prompt.substring(prompt.lastIndexOf('\n') + 1);
        const promptTerminator = lastPromptLine.substring(lastPromptLine.lastIndexOf(' '));
        if (promptTerminator) {
            this._createOrGetCommandDetection(this._terminal).setPromptTerminator(promptTerminator, lastPromptLine);
        }
    }
    _updateCwd(value) {
        value = sanitizeCwd(value);
        this._createOrGetCwdDetection().updateCwd(value);
        const commandDetection = this.capabilities.get(2);
        commandDetection?.setCwd(value);
    }
    _doHandleITermSequence(data) {
        if (!this._terminal) {
            return false;
        }
        const [command] = data.split(';');
        switch (command) {
            case "SetMark": {
                this._createOrGetBufferMarkDetection(this._terminal).addMark();
            }
            default: {
                const { key, value } = parseKeyValueAssignment(command);
                if (value === undefined) {
                    return true;
                }
                switch (key) {
                    case "CurrentDir":
                        this._updateCwd(value);
                        return true;
                }
            }
        }
        return false;
    }
    _doHandleSetWindowsFriendlyCwd(data) {
        if (!this._terminal) {
            return false;
        }
        const [command, ...args] = data.split(';');
        switch (command) {
            case '9':
                if (args.length) {
                    this._updateCwd(args[0]);
                }
                return true;
        }
        return false;
    }
    _doHandleSetCwd(data) {
        if (!this._terminal) {
            return false;
        }
        const [command] = data.split(';');
        if (command.match(/^file:\/\/.*\//)) {
            const uri = URI.parse(command);
            if (uri.path && uri.path.length > 0) {
                this._updateCwd(uri.path);
                return true;
            }
        }
        return false;
    }
    serialize() {
        if (!this._terminal || !this.capabilities.has(2)) {
            return {
                isWindowsPty: false,
                commands: [],
                promptInputModel: undefined,
            };
        }
        const result = this._createOrGetCommandDetection(this._terminal).serialize();
        return result;
    }
    deserialize(serialized) {
        if (!this._terminal) {
            throw new Error('Cannot restore commands before addon is activated');
        }
        this._createOrGetCommandDetection(this._terminal).deserialize(serialized);
    }
    _createOrGetCwdDetection() {
        let cwdDetection = this.capabilities.get(0);
        if (!cwdDetection) {
            cwdDetection = this._register(new CwdDetectionCapability());
            this.capabilities.add(0, cwdDetection);
        }
        return cwdDetection;
    }
    _createOrGetCommandDetection(terminal) {
        let commandDetection = this.capabilities.get(2);
        if (!commandDetection) {
            commandDetection = this._register(new CommandDetectionCapability(terminal, this._logService));
            this.capabilities.add(2, commandDetection);
        }
        return commandDetection;
    }
    _createOrGetBufferMarkDetection(terminal) {
        let bufferMarkDetection = this.capabilities.get(4);
        if (!bufferMarkDetection) {
            bufferMarkDetection = this._register(new BufferMarkCapability(terminal));
            this.capabilities.add(4, bufferMarkDetection);
        }
        return bufferMarkDetection;
    }
}
export function deserializeMessage(message) {
    return message.replaceAll(/\\(\\|x([0-9a-f]{2}))/gi, (_match, op, hex) => hex ? String.fromCharCode(parseInt(hex, 16)) : op);
}
export function parseKeyValueAssignment(message) {
    const separatorIndex = message.indexOf('=');
    if (separatorIndex === -1) {
        return { key: message, value: undefined };
    }
    return {
        key: message.substring(0, separatorIndex),
        value: message.substring(1 + separatorIndex)
    };
}
export function parseMarkSequence(sequence) {
    let id = undefined;
    let hidden = false;
    for (const property of sequence) {
        if (property === undefined) {
            continue;
        }
        if (property === 'Hidden') {
            hidden = true;
        }
        if (property.startsWith('Id=')) {
            id = property.substring(3);
        }
    }
    return { id, hidden };
}
