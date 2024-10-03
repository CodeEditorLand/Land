import { Disposable } from '../../../base/common/lifecycle.js';
import { IAccessibilitySignalService } from './accessibilitySignalService.js';
export declare class AccessibilityProgressSignalScheduler extends Disposable {
    private readonly _accessibilitySignalService;
    private _scheduler;
    private _signalLoop;
    constructor(msDelayTime: number, msLoopTime: number | undefined, _accessibilitySignalService: IAccessibilitySignalService);
    dispose(): void;
}
