import { INotificationViewItem, NotificationsModel } from '../../../common/notifications.js';
import { IListService } from '../../../../platform/list/browser/listService.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { ActionRunner, IAction } from '../../../../base/common/actions.js';
export declare const SHOW_NOTIFICATIONS_CENTER = "notifications.showList";
export declare const HIDE_NOTIFICATIONS_CENTER = "notifications.hideList";
export declare const HIDE_NOTIFICATION_TOAST = "notifications.hideToasts";
export declare const COLLAPSE_NOTIFICATION = "notification.collapse";
export declare const EXPAND_NOTIFICATION = "notification.expand";
export declare const ACCEPT_PRIMARY_ACTION_NOTIFICATION = "notification.acceptPrimaryAction";
export declare const CLEAR_NOTIFICATION = "notification.clear";
export declare const CLEAR_ALL_NOTIFICATIONS = "notifications.clearAll";
export declare const TOGGLE_DO_NOT_DISTURB_MODE = "notifications.toggleDoNotDisturbMode";
export declare const TOGGLE_DO_NOT_DISTURB_MODE_BY_SOURCE = "notifications.toggleDoNotDisturbModeBySource";
export interface INotificationsCenterController {
    readonly isVisible: boolean;
    show(): void;
    hide(): void;
    clearAll(): void;
}
export interface INotificationsToastController {
    focus(): void;
    focusNext(): void;
    focusPrevious(): void;
    focusFirst(): void;
    focusLast(): void;
    hide(): void;
}
export declare function getNotificationFromContext(listService: IListService, context?: unknown): INotificationViewItem | undefined;
export declare function registerNotificationCommands(center: INotificationsCenterController, toasts: INotificationsToastController, model: NotificationsModel): void;
export declare class NotificationActionRunner extends ActionRunner {
    private readonly telemetryService;
    private readonly notificationService;
    constructor(telemetryService: ITelemetryService, notificationService: INotificationService);
    protected runAction(action: IAction, context: unknown): Promise<void>;
}
