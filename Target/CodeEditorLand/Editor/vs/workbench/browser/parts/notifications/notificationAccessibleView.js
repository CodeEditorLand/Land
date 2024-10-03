import { Codicon } from '../../../../base/common/codicons.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { localize } from '../../../../nls.js';
import { IAccessibleViewService, AccessibleContentProvider } from '../../../../platform/accessibility/browser/accessibleView.js';
import { IAccessibilitySignalService, AccessibilitySignal } from '../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IListService, WorkbenchList } from '../../../../platform/list/browser/listService.js';
import { getNotificationFromContext } from './notificationsCommands.js';
import { NotificationFocusedContext } from '../../../common/contextkeys.js';
export class NotificationAccessibleView {
    constructor() {
        this.priority = 90;
        this.name = 'notifications';
        this.when = NotificationFocusedContext;
        this.type = "view";
    }
    getProvider(accessor) {
        const accessibleViewService = accessor.get(IAccessibleViewService);
        const listService = accessor.get(IListService);
        const commandService = accessor.get(ICommandService);
        const accessibilitySignalService = accessor.get(IAccessibilitySignalService);
        function getProvider() {
            const notification = getNotificationFromContext(listService);
            if (!notification) {
                return;
            }
            commandService.executeCommand('notifications.showList');
            let notificationIndex;
            const list = listService.lastFocusedList;
            if (list instanceof WorkbenchList) {
                notificationIndex = list.indexOf(notification);
            }
            if (notificationIndex === undefined) {
                return;
            }
            function focusList() {
                commandService.executeCommand('notifications.showList');
                if (list && notificationIndex !== undefined) {
                    list.domFocus();
                    try {
                        list.setFocus([notificationIndex]);
                    }
                    catch { }
                }
            }
            function getContentForNotification() {
                const notification = getNotificationFromContext(listService);
                const message = notification?.message.original.toString();
                if (!notification) {
                    return;
                }
                return notification.source ? localize('notification.accessibleViewSrc', '{0} Source: {1}', message, notification.source) : localize('notification.accessibleView', '{0}', message);
            }
            const content = getContentForNotification();
            if (!content) {
                return;
            }
            notification.onDidClose(() => accessibleViewService.next());
            return new AccessibleContentProvider("notification", { type: "view" }, () => content, () => focusList(), 'accessibility.verbosity.notification', undefined, getActionsFromNotification(notification, accessibilitySignalService), () => {
                if (!list) {
                    return;
                }
                focusList();
                list.focusNext();
                return getContentForNotification();
            }, () => {
                if (!list) {
                    return;
                }
                focusList();
                list.focusPrevious();
                return getContentForNotification();
            });
        }
        return getProvider();
    }
}
function getActionsFromNotification(notification, accessibilitySignalService) {
    let actions = undefined;
    if (notification.actions) {
        actions = [];
        if (notification.actions.primary) {
            actions.push(...notification.actions.primary);
        }
        if (notification.actions.secondary) {
            actions.push(...notification.actions.secondary);
        }
    }
    if (actions) {
        for (const action of actions) {
            action.class = ThemeIcon.asClassName(Codicon.bell);
            const initialAction = action.run;
            action.run = () => {
                initialAction();
                notification.close();
            };
        }
    }
    const manageExtension = actions?.find(a => a.label.includes('Manage Extension'));
    if (manageExtension) {
        manageExtension.class = ThemeIcon.asClassName(Codicon.gear);
    }
    if (actions) {
        actions.push({
            id: 'clearNotification', label: localize('clearNotification', "Clear Notification"), tooltip: localize('clearNotification', "Clear Notification"), run: () => {
                notification.close();
                accessibilitySignalService.playSignal(AccessibilitySignal.clear);
            }, enabled: true, class: ThemeIcon.asClassName(Codicon.clearAll)
        });
    }
    return actions;
}
