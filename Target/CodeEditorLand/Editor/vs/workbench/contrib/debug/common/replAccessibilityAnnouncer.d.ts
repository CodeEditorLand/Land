import { Disposable } from '../../../../base/common/lifecycle.js';
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IDebugService } from './debug.js';
export declare class ReplAccessibilityAnnouncer extends Disposable implements IWorkbenchContribution {
    static ID: string;
    constructor(debugService: IDebugService, accessibilityService: IAccessibilityService, logService: ILogService);
}
