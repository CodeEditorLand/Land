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
import { IDebugService } from '../common/debug.js';
import { dispose } from '../../../../base/common/lifecycle.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { ITitleService } from '../../../services/title/browser/titleService.js';
let DebugTitleContribution = class DebugTitleContribution {
    constructor(debugService, hostService, titleService) {
        this.toDispose = [];
        const updateTitle = () => {
            if (debugService.state === 2 && !hostService.hasFocus) {
                titleService.updateProperties({ prefix: '🔴' });
            }
            else {
                titleService.updateProperties({ prefix: '' });
            }
        };
        this.toDispose.push(debugService.onDidChangeState(updateTitle));
        this.toDispose.push(hostService.onDidChangeFocus(updateTitle));
    }
    dispose() {
        dispose(this.toDispose);
    }
};
DebugTitleContribution = __decorate([
    __param(0, IDebugService),
    __param(1, IHostService),
    __param(2, ITitleService),
    __metadata("design:paramtypes", [Object, Object, Object])
], DebugTitleContribution);
export { DebugTitleContribution };
