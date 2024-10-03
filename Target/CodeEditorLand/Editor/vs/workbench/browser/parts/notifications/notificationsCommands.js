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
import { CommandsRegistry } from '../../../../platform/commands/common/commands.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { KeybindingsRegistry } from '../../../../platform/keybinding/common/keybindingsRegistry.js';
import { KeyChord } from '../../../../base/common/keyCodes.js';
import { isNotificationViewItem } from '../../../common/notifications.js';
import { MenuRegistry, MenuId } from '../../../../platform/actions/common/actions.js';
import { localize, localize2 } from '../../../../nls.js';
import { IListService, WorkbenchList } from '../../../../platform/list/browser/listService.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { notificationToMetrics } from './notificationsTelemetry.js';
import { NotificationFocusedContext, NotificationsCenterVisibleContext, NotificationsToastsVisibleContext } from '../../../common/contextkeys.js';
import { INotificationService, NotificationPriority, NotificationsFilter } from '../../../../platform/notification/common/notification.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ActionRunner } from '../../../../base/common/actions.js';
import { hash } from '../../../../base/common/hash.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { AccessibilitySignal, IAccessibilitySignalService } from '../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js';
export const SHOW_NOTIFICATIONS_CENTER = 'notifications.showList';
export const HIDE_NOTIFICATIONS_CENTER = 'notifications.hideList';
const TOGGLE_NOTIFICATIONS_CENTER = 'notifications.toggleList';
export const HIDE_NOTIFICATION_TOAST = 'notifications.hideToasts';
const FOCUS_NOTIFICATION_TOAST = 'notifications.focusToasts';
const FOCUS_NEXT_NOTIFICATION_TOAST = 'notifications.focusNextToast';
const FOCUS_PREVIOUS_NOTIFICATION_TOAST = 'notifications.focusPreviousToast';
const FOCUS_FIRST_NOTIFICATION_TOAST = 'notifications.focusFirstToast';
const FOCUS_LAST_NOTIFICATION_TOAST = 'notifications.focusLastToast';
export const COLLAPSE_NOTIFICATION = 'notification.collapse';
export const EXPAND_NOTIFICATION = 'notification.expand';
export const ACCEPT_PRIMARY_ACTION_NOTIFICATION = 'notification.acceptPrimaryAction';
const TOGGLE_NOTIFICATION = 'notification.toggle';
export const CLEAR_NOTIFICATION = 'notification.clear';
export const CLEAR_ALL_NOTIFICATIONS = 'notifications.clearAll';
export const TOGGLE_DO_NOT_DISTURB_MODE = 'notifications.toggleDoNotDisturbMode';
export const TOGGLE_DO_NOT_DISTURB_MODE_BY_SOURCE = 'notifications.toggleDoNotDisturbModeBySource';
export function getNotificationFromContext(listService, context) {
    if (isNotificationViewItem(context)) {
        return context;
    }
    const list = listService.lastFocusedList;
    if (list instanceof WorkbenchList) {
        let element = list.getFocusedElements()[0];
        if (!isNotificationViewItem(element)) {
            if (list.isDOMFocused()) {
                element = list.element(0);
            }
        }
        if (isNotificationViewItem(element)) {
            return element;
        }
    }
    return undefined;
}
export function registerNotificationCommands(center, toasts, model) {
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: SHOW_NOTIFICATIONS_CENTER,
        weight: 200,
        primary: KeyChord(2048 | 41, 2048 | 1024 | 44),
        handler: () => {
            toasts.hide();
            center.show();
        }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: HIDE_NOTIFICATIONS_CENTER,
        weight: 200 + 50,
        when: NotificationsCenterVisibleContext,
        primary: 9,
        handler: accessor => {
            const telemetryService = accessor.get(ITelemetryService);
            for (const notification of model.notifications) {
                if (notification.visible) {
                    telemetryService.publicLog2('notification:hide', notificationToMetrics(notification.message.original, notification.sourceId, notification.priority === NotificationPriority.SILENT));
                }
            }
            center.hide();
        }
    });
    CommandsRegistry.registerCommand(TOGGLE_NOTIFICATIONS_CENTER, () => {
        if (center.isVisible) {
            center.hide();
        }
        else {
            toasts.hide();
            center.show();
        }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: CLEAR_NOTIFICATION,
        weight: 200,
        when: NotificationFocusedContext,
        primary: 20,
        mac: {
            primary: 2048 | 1
        },
        handler: (accessor, args) => {
            const accessibilitySignalService = accessor.get(IAccessibilitySignalService);
            const notification = getNotificationFromContext(accessor.get(IListService), args);
            if (notification && !notification.hasProgress) {
                notification.close();
                accessibilitySignalService.playSignal(AccessibilitySignal.clear);
            }
        }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: EXPAND_NOTIFICATION,
        weight: 200,
        when: NotificationFocusedContext,
        primary: 17,
        handler: (accessor, args) => {
            const notification = getNotificationFromContext(accessor.get(IListService), args);
            notification?.expand();
        }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: ACCEPT_PRIMARY_ACTION_NOTIFICATION,
        weight: 200,
        when: ContextKeyExpr.or(NotificationFocusedContext, NotificationsToastsVisibleContext),
        primary: 2048 | 1024 | 31,
        handler: (accessor) => {
            const actionRunner = accessor.get(IInstantiationService).createInstance(NotificationActionRunner);
            const notification = getNotificationFromContext(accessor.get(IListService)) || model.notifications.at(0);
            if (!notification) {
                return;
            }
            const primaryAction = notification.actions?.primary ? notification.actions.primary.at(0) : undefined;
            if (!primaryAction) {
                return;
            }
            actionRunner.run(primaryAction, notification);
            notification.close();
        }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: COLLAPSE_NOTIFICATION,
        weight: 200,
        when: NotificationFocusedContext,
        primary: 15,
        handler: (accessor, args) => {
            const notification = getNotificationFromContext(accessor.get(IListService), args);
            notification?.collapse();
        }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: TOGGLE_NOTIFICATION,
        weight: 200,
        when: NotificationFocusedContext,
        primary: 10,
        secondary: [3],
        handler: accessor => {
            const notification = getNotificationFromContext(accessor.get(IListService));
            notification?.toggle();
        }
    });
    CommandsRegistry.registerCommand(HIDE_NOTIFICATION_TOAST, accessor => {
        const telemetryService = accessor.get(ITelemetryService);
        for (const notification of model.notifications) {
            if (notification.visible) {
                telemetryService.publicLog2('notification:hide', notificationToMetrics(notification.message.original, notification.sourceId, notification.priority === NotificationPriority.SILENT));
            }
        }
        toasts.hide();
    });
    KeybindingsRegistry.registerKeybindingRule({
        id: HIDE_NOTIFICATION_TOAST,
        weight: 200 - 50,
        when: NotificationsToastsVisibleContext,
        primary: 9
    });
    KeybindingsRegistry.registerKeybindingRule({
        id: HIDE_NOTIFICATION_TOAST,
        weight: 200 + 100,
        when: ContextKeyExpr.and(NotificationsToastsVisibleContext, NotificationFocusedContext),
        primary: 9
    });
    CommandsRegistry.registerCommand(FOCUS_NOTIFICATION_TOAST, () => toasts.focus());
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: FOCUS_NEXT_NOTIFICATION_TOAST,
        weight: 200,
        when: ContextKeyExpr.and(NotificationFocusedContext, NotificationsToastsVisibleContext),
        primary: 18,
        handler: () => {
            toasts.focusNext();
        }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: FOCUS_PREVIOUS_NOTIFICATION_TOAST,
        weight: 200,
        when: ContextKeyExpr.and(NotificationFocusedContext, NotificationsToastsVisibleContext),
        primary: 16,
        handler: () => {
            toasts.focusPrevious();
        }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: FOCUS_FIRST_NOTIFICATION_TOAST,
        weight: 200,
        when: ContextKeyExpr.and(NotificationFocusedContext, NotificationsToastsVisibleContext),
        primary: 11,
        secondary: [14],
        handler: () => {
            toasts.focusFirst();
        }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: FOCUS_LAST_NOTIFICATION_TOAST,
        weight: 200,
        when: ContextKeyExpr.and(NotificationFocusedContext, NotificationsToastsVisibleContext),
        primary: 12,
        secondary: [13],
        handler: () => {
            toasts.focusLast();
        }
    });
    CommandsRegistry.registerCommand(CLEAR_ALL_NOTIFICATIONS, () => center.clearAll());
    CommandsRegistry.registerCommand(TOGGLE_DO_NOT_DISTURB_MODE, accessor => {
        const notificationService = accessor.get(INotificationService);
        notificationService.setFilter(notificationService.getFilter() === NotificationsFilter.ERROR ? NotificationsFilter.OFF : NotificationsFilter.ERROR);
    });
    CommandsRegistry.registerCommand(TOGGLE_DO_NOT_DISTURB_MODE_BY_SOURCE, accessor => {
        const notificationService = accessor.get(INotificationService);
        const quickInputService = accessor.get(IQuickInputService);
        const sortedFilters = notificationService.getFilters().sort((a, b) => a.label.localeCompare(b.label));
        const disposables = new DisposableStore();
        const picker = disposables.add(quickInputService.createQuickPick());
        picker.items = sortedFilters.map(source => ({
            id: source.id,
            label: source.label,
            tooltip: `${source.label} (${source.id})`,
            filter: source.filter
        }));
        picker.canSelectMany = true;
        picker.placeholder = localize('selectSources', "Select sources to enable all notifications from");
        picker.selectedItems = picker.items.filter(item => item.filter === NotificationsFilter.OFF);
        picker.show();
        disposables.add(picker.onDidAccept(async () => {
            for (const item of picker.items) {
                notificationService.setFilter({
                    id: item.id,
                    label: item.label,
                    filter: picker.selectedItems.includes(item) ? NotificationsFilter.OFF : NotificationsFilter.ERROR
                });
            }
            picker.hide();
        }));
        disposables.add(picker.onDidHide(() => disposables.dispose()));
    });
    const category = localize2('notifications', 'Notifications');
    MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command: { id: SHOW_NOTIFICATIONS_CENTER, title: localize2('showNotifications', 'Show Notifications'), category } });
    MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command: { id: HIDE_NOTIFICATIONS_CENTER, title: localize2('hideNotifications', 'Hide Notifications'), category }, when: NotificationsCenterVisibleContext });
    MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command: { id: CLEAR_ALL_NOTIFICATIONS, title: localize2('clearAllNotifications', 'Clear All Notifications'), category } });
    MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command: { id: ACCEPT_PRIMARY_ACTION_NOTIFICATION, title: localize2('acceptNotificationPrimaryAction', 'Accept Notification Primary Action'), category } });
    MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command: { id: TOGGLE_DO_NOT_DISTURB_MODE, title: localize2('toggleDoNotDisturbMode', 'Toggle Do Not Disturb Mode'), category } });
    MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command: { id: TOGGLE_DO_NOT_DISTURB_MODE_BY_SOURCE, title: localize2('toggleDoNotDisturbModeBySource', 'Toggle Do Not Disturb Mode By Source...'), category } });
    MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command: { id: FOCUS_NOTIFICATION_TOAST, title: localize2('focusNotificationToasts', 'Focus Notification Toast'), category }, when: NotificationsToastsVisibleContext });
}
let NotificationActionRunner = class NotificationActionRunner extends ActionRunner {
    constructor(telemetryService, notificationService) {
        super();
        this.telemetryService = telemetryService;
        this.notificationService = notificationService;
    }
    async runAction(action, context) {
        this.telemetryService.publicLog2('workbenchActionExecuted', { id: action.id, from: 'message' });
        if (isNotificationViewItem(context)) {
            this.telemetryService.publicLog2('notification:actionExecuted', {
                id: hash(context.message.original.toString()).toString(),
                actionLabel: action.label,
                source: context.sourceId || 'core',
                silent: context.priority === NotificationPriority.SILENT
            });
        }
        try {
            await super.runAction(action, context);
        }
        catch (error) {
            this.notificationService.error(error);
        }
    }
};
NotificationActionRunner = __decorate([
    __param(0, ITelemetryService),
    __param(1, INotificationService),
    __metadata("design:paramtypes", [Object, Object])
], NotificationActionRunner);
export { NotificationActionRunner };
