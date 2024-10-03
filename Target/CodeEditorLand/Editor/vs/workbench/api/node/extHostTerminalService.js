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
import { generateUuid } from '../../../base/common/uuid.js';
import { IExtHostRpcService } from '../common/extHostRpcService.js';
import { BaseExtHostTerminalService, ExtHostTerminal } from '../common/extHostTerminalService.js';
import { IExtHostCommands } from '../common/extHostCommands.js';
let ExtHostTerminalService = class ExtHostTerminalService extends BaseExtHostTerminalService {
    constructor(extHostCommands, extHostRpc) {
        super(true, extHostCommands, extHostRpc);
    }
    createTerminal(name, shellPath, shellArgs) {
        return this.createTerminalFromOptions({ name, shellPath, shellArgs });
    }
    createTerminalFromOptions(options, internalOptions) {
        const terminal = new ExtHostTerminal(this._proxy, generateUuid(), options, options.name);
        this._terminals.push(terminal);
        terminal.create(options, this._serializeParentTerminal(options, internalOptions));
        return terminal.value;
    }
};
ExtHostTerminalService = __decorate([
    __param(0, IExtHostCommands),
    __param(1, IExtHostRpcService),
    __metadata("design:paramtypes", [Object, Object])
], ExtHostTerminalService);
export { ExtHostTerminalService };
