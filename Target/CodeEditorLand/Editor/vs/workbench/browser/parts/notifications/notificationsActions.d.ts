import './media/notificationsActions.css';
import { INotificationViewItem } from '../../../common/notifications.js';
import { Action } from '../../../../base/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
export declare class ClearNotificationAction extends Action {
    private readonly commandService;
    static readonly ID = "notification.clear";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
    run(notification: INotificationViewItem): Promise<void>;
}
export declare class ClearAllNotificationsAction extends Action {
    private readonly commandService;
    static readonly ID = "notifications.clearAll";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
    run(): Promise<void>;
}
export declare class ToggleDoNotDisturbAction extends Action {
    private readonly commandService;
    static readonly ID = "notifications.toggleDoNotDisturbMode";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
    run(): Promise<void>;
}
export declare class ToggleDoNotDisturbBySourceAction extends Action {
    private readonly commandService;
    static readonly ID = "notifications.toggleDoNotDisturbModeBySource";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
    run(): Promise<void>;
}
export declare class ConfigureDoNotDisturbAction extends Action {
    static readonly ID = "workbench.action.configureDoNotDisturbMode";
    static readonly LABEL: string;
    constructor(id: string, label: string);
}
export declare class HideNotificationsCenterAction extends Action {
    private readonly commandService;
    static readonly ID = "notifications.hideList";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
    run(): Promise<void>;
}
export declare class ExpandNotificationAction extends Action {
    private readonly commandService;
    static readonly ID = "notification.expand";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
    run(notification: INotificationViewItem): Promise<void>;
}
export declare class CollapseNotificationAction extends Action {
    private readonly commandService;
    static readonly ID = "notification.collapse";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
    run(notification: INotificationViewItem): Promise<void>;
}
export declare class ConfigureNotificationAction extends Action {
    readonly notification: INotificationViewItem;
    static readonly ID = "workbench.action.configureNotification";
    static readonly LABEL: string;
    constructor(id: string, label: string, notification: INotificationViewItem);
}
export declare class CopyNotificationMessageAction extends Action {
    private readonly clipboardService;
    static readonly ID = "workbench.action.copyNotificationMessage";
    static readonly LABEL: string;
    constructor(id: string, label: string, clipboardService: IClipboardService);
    run(notification: INotificationViewItem): Promise<void>;
}
