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
import { Event } from '../../../base/common/event.js';
import { Disposable, toDisposable } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { ExtHostContext, MainContext } from '../common/extHost.protocol.js';
import { ITerminalService } from '../../contrib/terminal/browser/terminal.js';
import { IWorkbenchEnvironmentService } from '../../services/environment/common/environmentService.js';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { TerminalShellExecutionCommandLineConfidence } from '../common/extHostTypes.js';
let MainThreadTerminalShellIntegration = class MainThreadTerminalShellIntegration extends Disposable {
    constructor(extHostContext, _terminalService, workbenchEnvironmentService) {
        super();
        this._terminalService = _terminalService;
        this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostTerminalShellIntegration);
        const instanceDataListeners = new Map();
        this._register(toDisposable(() => {
            for (const listener of instanceDataListeners.values()) {
                listener.dispose();
            }
        }));
        const onDidAddCommandDetection = this._store.add(this._terminalService.createOnInstanceEvent(instance => {
            return Event.map(Event.filter(instance.capabilities.onDidAddCapabilityType, e => {
                return e === 2;
            }), () => instance);
        })).event;
        this._store.add(onDidAddCommandDetection(e => this._proxy.$shellIntegrationChange(e.instanceId)));
        const commandDetectionStartEvent = this._store.add(this._terminalService.createOnInstanceCapabilityEvent(2, e => e.onCommandExecuted));
        let currentCommand;
        this._store.add(commandDetectionStartEvent.event(e => {
            if (e.data === currentCommand) {
                return;
            }
            currentCommand = e.data;
            const instanceId = e.instance.instanceId;
            this._proxy.$shellExecutionStart(instanceId, e.data.command, convertToExtHostCommandLineConfidence(e.data), e.data.isTrusted, this._convertCwdToUri(e.data.cwd));
            instanceDataListeners.get(instanceId)?.dispose();
            instanceDataListeners.set(instanceId, Event.accumulate(e.instance.onData, 50, this._store)(events => this._proxy.$shellExecutionData(instanceId, events.join(''))));
        }));
        const commandDetectionEndEvent = this._store.add(this._terminalService.createOnInstanceCapabilityEvent(2, e => e.onCommandFinished));
        this._store.add(commandDetectionEndEvent.event(e => {
            currentCommand = undefined;
            const instanceId = e.instance.instanceId;
            instanceDataListeners.get(instanceId)?.dispose();
            setTimeout(() => {
                this._proxy.$shellExecutionEnd(instanceId, e.data.command, convertToExtHostCommandLineConfidence(e.data), e.data.isTrusted, e.data.exitCode);
            });
        }));
        const cwdChangeEvent = this._store.add(this._terminalService.createOnInstanceCapabilityEvent(0, e => e.onDidChangeCwd));
        this._store.add(cwdChangeEvent.event(e => {
            this._proxy.$cwdChange(e.instance.instanceId, this._convertCwdToUri(e.data));
        }));
        this._store.add(this._terminalService.onDidDisposeInstance(e => this._proxy.$closeTerminal(e.instanceId)));
    }
    $executeCommand(terminalId, commandLine) {
        this._terminalService.getInstanceFromId(terminalId)?.runCommand(commandLine, true);
    }
    _convertCwdToUri(cwd) {
        return cwd ? URI.file(cwd) : undefined;
    }
};
MainThreadTerminalShellIntegration = __decorate([
    extHostNamedCustomer(MainContext.MainThreadTerminalShellIntegration),
    __param(1, ITerminalService),
    __param(2, IWorkbenchEnvironmentService),
    __metadata("design:paramtypes", [Object, Object, Object])
], MainThreadTerminalShellIntegration);
export { MainThreadTerminalShellIntegration };
function convertToExtHostCommandLineConfidence(command) {
    switch (command.commandLineConfidence) {
        case 'high':
            return TerminalShellExecutionCommandLineConfidence.High;
        case 'medium':
            return TerminalShellExecutionCommandLineConfidence.Medium;
        case 'low':
        default:
            return TerminalShellExecutionCommandLineConfidence.Low;
    }
}
