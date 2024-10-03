import { Event } from '../../../base/common/event.js';
import BaseSeverity from '../../../base/common/severity.js';
import { createDecorator } from '../../instantiation/common/instantiation.js';
export var Severity = BaseSeverity;
export const INotificationService = createDecorator('notificationService');
export var NotificationPriority;
(function (NotificationPriority) {
    NotificationPriority[NotificationPriority["DEFAULT"] = 0] = "DEFAULT";
    NotificationPriority[NotificationPriority["SILENT"] = 1] = "SILENT";
    NotificationPriority[NotificationPriority["URGENT"] = 2] = "URGENT";
})(NotificationPriority || (NotificationPriority = {}));
export var NeverShowAgainScope;
(function (NeverShowAgainScope) {
    NeverShowAgainScope[NeverShowAgainScope["WORKSPACE"] = 0] = "WORKSPACE";
    NeverShowAgainScope[NeverShowAgainScope["PROFILE"] = 1] = "PROFILE";
    NeverShowAgainScope[NeverShowAgainScope["APPLICATION"] = 2] = "APPLICATION";
})(NeverShowAgainScope || (NeverShowAgainScope = {}));
export function isNotificationSource(thing) {
    if (thing) {
        const candidate = thing;
        return typeof candidate.id === 'string' && typeof candidate.label === 'string';
    }
    return false;
}
export var NotificationsFilter;
(function (NotificationsFilter) {
    NotificationsFilter[NotificationsFilter["OFF"] = 0] = "OFF";
    NotificationsFilter[NotificationsFilter["ERROR"] = 1] = "ERROR";
})(NotificationsFilter || (NotificationsFilter = {}));
export class NoOpNotification {
    constructor() {
        this.progress = new NoOpProgress();
        this.onDidClose = Event.None;
        this.onDidChangeVisibility = Event.None;
    }
    updateSeverity(severity) { }
    updateMessage(message) { }
    updateActions(actions) { }
    close() { }
}
export class NoOpProgress {
    infinite() { }
    done() { }
    total(value) { }
    worked(value) { }
}
