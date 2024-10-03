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
import { Disposable, toDisposable } from '../../../../base/common/lifecycle.js';
import { autorunWithStore, observableFromEvent } from '../../../../base/common/observable.js';
import { IAccessibilitySignalService, AccessibilitySignal, AccessibilitySignalService } from '../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js';
import { IDebugService } from '../../debug/common/debug.js';
let AccessibilitySignalLineDebuggerContribution = class AccessibilitySignalLineDebuggerContribution extends Disposable {
    constructor(debugService, accessibilitySignalService) {
        super();
        this.accessibilitySignalService = accessibilitySignalService;
        const isEnabled = observableFromEvent(this, accessibilitySignalService.onSoundEnabledChanged(AccessibilitySignal.onDebugBreak), () => accessibilitySignalService.isSoundEnabled(AccessibilitySignal.onDebugBreak));
        this._register(autorunWithStore((reader, store) => {
            if (!isEnabled.read(reader)) {
                return;
            }
            const sessionDisposables = new Map();
            store.add(toDisposable(() => {
                sessionDisposables.forEach(d => d.dispose());
                sessionDisposables.clear();
            }));
            store.add(debugService.onDidNewSession((session) => sessionDisposables.set(session, this.handleSession(session))));
            store.add(debugService.onDidEndSession(({ session }) => {
                sessionDisposables.get(session)?.dispose();
                sessionDisposables.delete(session);
            }));
            debugService
                .getModel()
                .getSessions()
                .forEach((session) => sessionDisposables.set(session, this.handleSession(session)));
        }));
    }
    handleSession(session) {
        return session.onDidChangeState(e => {
            const stoppedDetails = session.getStoppedDetails();
            const BREAKPOINT_STOP_REASON = 'breakpoint';
            if (stoppedDetails && stoppedDetails.reason === BREAKPOINT_STOP_REASON) {
                this.accessibilitySignalService.playSignal(AccessibilitySignal.onDebugBreak);
            }
        });
    }
};
AccessibilitySignalLineDebuggerContribution = __decorate([
    __param(0, IDebugService),
    __param(1, IAccessibilitySignalService),
    __metadata("design:paramtypes", [Object, AccessibilitySignalService])
], AccessibilitySignalLineDebuggerContribution);
export { AccessibilitySignalLineDebuggerContribution };
