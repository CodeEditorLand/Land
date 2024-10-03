import { BrowserClipboardService as BaseBrowserClipboardService } from '../../../../platform/clipboard/browser/clipboardService.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { ILayoutService } from '../../../../platform/layout/browser/layoutService.js';
export declare class BrowserClipboardService extends BaseBrowserClipboardService {
    private readonly notificationService;
    private readonly openerService;
    private readonly environmentService;
    constructor(notificationService: INotificationService, openerService: IOpenerService, environmentService: IWorkbenchEnvironmentService, logService: ILogService, layoutService: ILayoutService);
    writeText(text: string, type?: string): Promise<void>;
    readText(type?: string): Promise<string>;
}
