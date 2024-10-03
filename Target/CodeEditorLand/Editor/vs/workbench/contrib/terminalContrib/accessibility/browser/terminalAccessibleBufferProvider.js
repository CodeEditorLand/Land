var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Emitter } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IModelService } from '../../../../../editor/common/services/model.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { ITerminalService } from '../../../terminal/browser/terminal.js';
import { BufferContentTracker } from './bufferContentTracker.js';
let TerminalAccessibleBufferProvider = class TerminalAccessibleBufferProvider extends Disposable {
    constructor(_instance, _bufferTracker, customHelp, _modelService, configurationService, _contextKeyService, _terminalService) {
        super();
        this._instance = _instance;
        this._bufferTracker = _bufferTracker;
        this.id = "terminal";
        this.options = { type: "view", language: 'terminal', id: "terminal" };
        this.verbositySettingKey = "accessibility.verbosity.terminal";
        this._onDidRequestClearProvider = new Emitter();
        this.onDidRequestClearLastProvider = this._onDidRequestClearProvider.event;
        this.options.customHelp = customHelp;
        this.options.position = configurationService.getValue("terminal.integrated.accessibleViewPreserveCursorPosition") ? 'initial-bottom' : 'bottom';
        this._register(this._instance.onDisposed(() => this._onDidRequestClearProvider.fire("terminal")));
        this._register(configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration("terminal.integrated.accessibleViewPreserveCursorPosition")) {
                this.options.position = configurationService.getValue("terminal.integrated.accessibleViewPreserveCursorPosition") ? 'initial-bottom' : 'bottom';
            }
        }));
        this._focusedInstance = _terminalService.activeInstance;
        this._register(_terminalService.onDidChangeActiveInstance(() => {
            if (_terminalService.activeInstance && this._focusedInstance?.instanceId !== _terminalService.activeInstance?.instanceId) {
                this._onDidRequestClearProvider.fire("terminal");
                this._focusedInstance = _terminalService.activeInstance;
            }
        }));
    }
    onClose() {
        this._instance.focus();
    }
    provideContent() {
        this._bufferTracker.update();
        return this._bufferTracker.lines.join('\n');
    }
    getSymbols() {
        const commands = this._getCommandsWithEditorLine() ?? [];
        const symbols = [];
        for (const command of commands) {
            const label = command.command.command;
            if (label) {
                symbols.push({
                    label,
                    lineNumber: command.lineNumber
                });
            }
        }
        return symbols;
    }
    _getCommandsWithEditorLine() {
        const capability = this._instance.capabilities.get(2);
        const commands = capability?.commands;
        const currentCommand = capability?.currentCommand;
        if (!commands?.length) {
            return;
        }
        const result = [];
        for (const command of commands) {
            const lineNumber = this._getEditorLineForCommand(command);
            if (lineNumber === undefined) {
                continue;
            }
            result.push({ command, lineNumber, exitCode: command.exitCode });
        }
        if (currentCommand) {
            const lineNumber = this._getEditorLineForCommand(currentCommand);
            if (lineNumber !== undefined) {
                result.push({ command: currentCommand, lineNumber });
            }
        }
        return result;
    }
    _getEditorLineForCommand(command) {
        let line;
        if ('marker' in command) {
            line = command.marker?.line;
        }
        else if ('commandStartMarker' in command) {
            line = command.commandStartMarker?.line;
        }
        if (line === undefined || line < 0) {
            return;
        }
        line = this._bufferTracker.bufferToEditorLineMapping.get(line);
        if (line === undefined) {
            return;
        }
        return line + 1;
    }
};
TerminalAccessibleBufferProvider = __decorate([
    __param(3, IModelService),
    __param(4, IConfigurationService),
    __param(5, IContextKeyService),
    __param(6, ITerminalService),
    __metadata("design:paramtypes", [Object, BufferContentTracker, Function, Object, Object, Object, Object])
], TerminalAccessibleBufferProvider);
export { TerminalAccessibleBufferProvider };
