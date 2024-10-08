import { INotificationsModel } from '../../../common/notifications.js';
import { IStatusbarService } from '../../../services/statusbar/browser/statusbar.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
export declare class NotificationsStatus extends Disposable {
    private readonly model;
    private readonly statusbarService;
    private readonly notificationService;
    private notificationsCenterStatusItem;
    private newNotificationsCount;
    private currentStatusMessage;
    private isNotificationsCenterVisible;
    private isNotificationsToastsVisible;
    constructor(model: INotificationsModel, statusbarService: IStatusbarService, notificationService: INotificationService);
    private registerListeners;
    private onDidChangeNotification;
    private updateNotificationsCenterStatusItem;
    private getTooltip;
    update(isCenterVisible: boolean, isToastsVisible: boolean): void;
    private onDidChangeStatusMessage;
    private doSetStatusMessage;
}
