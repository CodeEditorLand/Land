import { Disposable } from '../../../../base/common/lifecycle.js';
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IStatusbarService } from '../../../services/statusbar/browser/statusbar.js';
export declare class AccessibilityStatus extends Disposable implements IWorkbenchContribution {
    private readonly configurationService;
    private readonly notificationService;
    private readonly accessibilityService;
    private readonly statusbarService;
    static readonly ID = "workbench.contrib.accessibilityStatus";
    private screenReaderNotification;
    private promptedScreenReader;
    private readonly screenReaderModeElement;
    constructor(configurationService: IConfigurationService, notificationService: INotificationService, accessibilityService: IAccessibilityService, statusbarService: IStatusbarService);
    private registerListeners;
    private showScreenReaderNotification;
    private updateScreenReaderModeElement;
    private onScreenReaderModeChange;
}
