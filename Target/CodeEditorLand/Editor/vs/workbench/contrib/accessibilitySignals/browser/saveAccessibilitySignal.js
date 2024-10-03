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
import { Disposable } from '../../../../base/common/lifecycle.js';
import { AccessibilitySignal, IAccessibilitySignalService } from '../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js';
import { IWorkingCopyService } from '../../../services/workingCopy/common/workingCopyService.js';
let SaveAccessibilitySignalContribution = class SaveAccessibilitySignalContribution extends Disposable {
    static { this.ID = 'workbench.contrib.saveAccessibilitySignal'; }
    constructor(_accessibilitySignalService, _workingCopyService) {
        super();
        this._accessibilitySignalService = _accessibilitySignalService;
        this._workingCopyService = _workingCopyService;
        this._register(this._workingCopyService.onDidSave(e => this._accessibilitySignalService.playSignal(AccessibilitySignal.save, { userGesture: e.reason === 1 })));
    }
};
SaveAccessibilitySignalContribution = __decorate([
    __param(0, IAccessibilitySignalService),
    __param(1, IWorkingCopyService),
    __metadata("design:paramtypes", [Object, Object])
], SaveAccessibilitySignalContribution);
export { SaveAccessibilitySignalContribution };
