import { IDebugService } from './debug.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
export declare class DebugWatchAccessibilityAnnouncer extends Disposable implements IWorkbenchContribution {
    private readonly _debugService;
    private readonly _logService;
    private readonly _accessibilityService;
    private readonly _configurationService;
    static ID: string;
    private readonly _listener;
    constructor(_debugService: IDebugService, _logService: ILogService, _accessibilityService: IAccessibilityService, _configurationService: IConfigurationService);
    private _setListener;
}
