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
import { ITerminalEditorService } from './terminal.js';
let TerminalInputSerializer = class TerminalInputSerializer {
    constructor(_terminalEditorService) {
        this._terminalEditorService = _terminalEditorService;
    }
    canSerialize(editorInput) {
        return typeof editorInput.terminalInstance?.persistentProcessId === 'number' && editorInput.terminalInstance.shouldPersist;
    }
    serialize(editorInput) {
        if (!this.canSerialize(editorInput)) {
            return;
        }
        return JSON.stringify(this._toJson(editorInput.terminalInstance));
    }
    deserialize(instantiationService, serializedEditorInput) {
        const terminalInstance = JSON.parse(serializedEditorInput);
        return this._terminalEditorService.reviveInput(terminalInstance);
    }
    _toJson(instance) {
        return {
            id: instance.persistentProcessId,
            pid: instance.processId || 0,
            title: instance.title,
            titleSource: instance.titleSource,
            cwd: '',
            icon: instance.icon,
            color: instance.color,
            hasChildProcesses: instance.hasChildProcesses,
            isFeatureTerminal: instance.shellLaunchConfig.isFeatureTerminal,
            hideFromUser: instance.shellLaunchConfig.hideFromUser,
            reconnectionProperties: instance.shellLaunchConfig.reconnectionProperties,
            shellIntegrationNonce: instance.shellIntegrationNonce
        };
    }
};
TerminalInputSerializer = __decorate([
    __param(0, ITerminalEditorService),
    __metadata("design:paramtypes", [Object])
], TerminalInputSerializer);
export { TerminalInputSerializer };
