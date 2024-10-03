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
var NotificationsToasts_1;
import './media/notificationsToasts.css';
import { localize } from '../../../../nls.js';
import { dispose, toDisposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { addDisposableListener, EventType, Dimension, scheduleAtNextAnimationFrame, isAncestorOfActiveElement, getWindow } from '../../../../base/browser/dom.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { NotificationsList } from './notificationsList.js';
import { Event, Emitter } from '../../../../base/common/event.js';
import { IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.js';
import { NOTIFICATIONS_TOAST_BORDER, NOTIFICATIONS_BACKGROUND } from '../../../common/theme.js';
import { IThemeService, Themable } from '../../../../platform/theme/common/themeService.js';
import { widgetShadow } from '../../../../platform/theme/common/colorRegistry.js';
import { IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { Severity, NotificationsFilter, NotificationPriority } from '../../../../platform/notification/common/notification.js';
import { ILifecycleService } from '../../../services/lifecycle/common/lifecycle.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { IntervalCounter } from '../../../../base/common/async.js';
import { assertIsDefined } from '../../../../base/common/types.js';
import { NotificationsToastsVisibleContext } from '../../../common/contextkeys.js';
import { mainWindow } from '../../../../base/browser/window.js';
var ToastVisibility;
(function (ToastVisibility) {
    ToastVisibility[ToastVisibility["HIDDEN_OR_VISIBLE"] = 0] = "HIDDEN_OR_VISIBLE";
    ToastVisibility[ToastVisibility["HIDDEN"] = 1] = "HIDDEN";
    ToastVisibility[ToastVisibility["VISIBLE"] = 2] = "VISIBLE";
})(ToastVisibility || (ToastVisibility = {}));
let NotificationsToasts = class NotificationsToasts extends Themable {
    static { NotificationsToasts_1 = this; }
    static { this.MAX_WIDTH = 450; }
    static { this.MAX_NOTIFICATIONS = 3; }
    static { this.PURGE_TIMEOUT = {
        [Severity.Info]: 15000,
        [Severity.Warning]: 18000,
        [Severity.Error]: 20000
    }; }
    static { this.SPAM_PROTECTION = {
        interval: 800,
        limit: this.MAX_NOTIFICATIONS
    }; }
    get isVisible() { return !!this._isVisible; }
    constructor(container, model, instantiationService, layoutService, themeService, editorGroupService, contextKeyService, lifecycleService, hostService) {
        super(themeService);
        this.container = container;
        this.model = model;
        this.instantiationService = instantiationService;
        this.layoutService = layoutService;
        this.editorGroupService = editorGroupService;
        this.contextKeyService = contextKeyService;
        this.lifecycleService = lifecycleService;
        this.hostService = hostService;
        this._onDidChangeVisibility = this._register(new Emitter());
        this.onDidChangeVisibility = this._onDidChangeVisibility.event;
        this._isVisible = false;
        this.mapNotificationToToast = new Map();
        this.mapNotificationToDisposable = new Map();
        this.notificationsToastsVisibleContextKey = NotificationsToastsVisibleContext.bindTo(this.contextKeyService);
        this.addedToastsIntervalCounter = new IntervalCounter(NotificationsToasts_1.SPAM_PROTECTION.interval);
        this.registerListeners();
    }
    registerListeners() {
        this._register(this.layoutService.onDidLayoutMainContainer(dimension => this.layout(Dimension.lift(dimension))));
        this.lifecycleService.when(3).then(() => {
            this.model.notifications.forEach(notification => this.addToast(notification));
            this._register(this.model.onDidChangeNotification(e => this.onDidChangeNotification(e)));
        });
        this._register(this.model.onDidChangeFilter(({ global, sources }) => {
            if (global === NotificationsFilter.ERROR) {
                this.hide();
            }
            else if (sources) {
                for (const [notification] of this.mapNotificationToToast) {
                    if (typeof notification.sourceId === 'string' && sources.get(notification.sourceId) === NotificationsFilter.ERROR && notification.severity !== Severity.Error && notification.priority !== NotificationPriority.URGENT) {
                        this.removeToast(notification);
                    }
                }
            }
        }));
    }
    onDidChangeNotification(e) {
        switch (e.kind) {
            case 0:
                return this.addToast(e.item);
            case 3:
                return this.removeToast(e.item);
        }
    }
    addToast(item) {
        if (this.isNotificationsCenterVisible) {
            return;
        }
        if (item.priority === NotificationPriority.SILENT) {
            return;
        }
        if (this.addedToastsIntervalCounter.increment() > NotificationsToasts_1.SPAM_PROTECTION.limit) {
            return;
        }
        const itemDisposables = new DisposableStore();
        this.mapNotificationToDisposable.set(item, itemDisposables);
        itemDisposables.add(scheduleAtNextAnimationFrame(getWindow(this.container), () => this.doAddToast(item, itemDisposables)));
    }
    doAddToast(item, itemDisposables) {
        let notificationsToastsContainer = this.notificationsToastsContainer;
        if (!notificationsToastsContainer) {
            notificationsToastsContainer = this.notificationsToastsContainer = document.createElement('div');
            notificationsToastsContainer.classList.add('notifications-toasts');
            this.container.appendChild(notificationsToastsContainer);
        }
        notificationsToastsContainer.classList.add('visible');
        const notificationToastContainer = document.createElement('div');
        notificationToastContainer.classList.add('notification-toast-container');
        const firstToast = notificationsToastsContainer.firstChild;
        if (firstToast) {
            notificationsToastsContainer.insertBefore(notificationToastContainer, firstToast);
        }
        else {
            notificationsToastsContainer.appendChild(notificationToastContainer);
        }
        const notificationToast = document.createElement('div');
        notificationToast.classList.add('notification-toast');
        notificationToastContainer.appendChild(notificationToast);
        const notificationList = this.instantiationService.createInstance(NotificationsList, notificationToast, {
            verticalScrollMode: 2,
            widgetAriaLabel: (() => {
                if (!item.source) {
                    return localize('notificationAriaLabel', "{0}, notification", item.message.raw);
                }
                return localize('notificationWithSourceAriaLabel', "{0}, source: {1}, notification", item.message.raw, item.source);
            })()
        });
        itemDisposables.add(notificationList);
        const toast = { item, list: notificationList, container: notificationToastContainer, toast: notificationToast };
        this.mapNotificationToToast.set(item, toast);
        itemDisposables.add(toDisposable(() => this.updateToastVisibility(toast, false)));
        notificationList.show();
        const maxDimensions = this.computeMaxDimensions();
        this.layoutLists(maxDimensions.width);
        notificationList.updateNotificationsList(0, 0, [item]);
        this.layoutContainer(maxDimensions.height);
        itemDisposables.add(item.onDidChangeExpansion(() => {
            notificationList.updateNotificationsList(0, 1, [item]);
        }));
        itemDisposables.add(item.onDidChangeContent(e => {
            switch (e.kind) {
                case 2:
                    notificationList.updateNotificationsList(0, 1, [item]);
                    break;
                case 1:
                    if (item.expanded) {
                        notificationList.updateNotificationHeight(item);
                    }
                    break;
            }
        }));
        Event.once(item.onDidClose)(() => {
            this.removeToast(item);
        });
        this.purgeNotification(item, notificationToastContainer, notificationList, itemDisposables);
        this.updateStyles();
        this.notificationsToastsVisibleContextKey.set(true);
        notificationToast.classList.add('notification-fade-in');
        itemDisposables.add(addDisposableListener(notificationToast, 'transitionend', () => {
            notificationToast.classList.remove('notification-fade-in');
            notificationToast.classList.add('notification-fade-in-done');
        }));
        item.updateVisibility(true);
        if (!this._isVisible) {
            this._isVisible = true;
            this._onDidChangeVisibility.fire();
        }
    }
    purgeNotification(item, notificationToastContainer, notificationList, disposables) {
        let isMouseOverToast = false;
        disposables.add(addDisposableListener(notificationToastContainer, EventType.MOUSE_OVER, () => isMouseOverToast = true));
        disposables.add(addDisposableListener(notificationToastContainer, EventType.MOUSE_OUT, () => isMouseOverToast = false));
        let purgeTimeoutHandle;
        let listener;
        const hideAfterTimeout = () => {
            purgeTimeoutHandle = setTimeout(() => {
                if (!this.hostService.hasFocus) {
                    if (!listener) {
                        listener = this.hostService.onDidChangeFocus(focus => {
                            if (focus) {
                                hideAfterTimeout();
                            }
                        });
                        disposables.add(listener);
                    }
                }
                else if (item.sticky ||
                    notificationList.hasFocus() ||
                    isMouseOverToast) {
                    hideAfterTimeout();
                }
                else {
                    this.removeToast(item);
                }
            }, NotificationsToasts_1.PURGE_TIMEOUT[item.severity]);
        };
        hideAfterTimeout();
        disposables.add(toDisposable(() => clearTimeout(purgeTimeoutHandle)));
    }
    removeToast(item) {
        let focusEditor = false;
        const notificationToast = this.mapNotificationToToast.get(item);
        if (notificationToast) {
            const toastHasDOMFocus = isAncestorOfActiveElement(notificationToast.container);
            if (toastHasDOMFocus) {
                focusEditor = !(this.focusNext() || this.focusPrevious());
            }
            this.mapNotificationToToast.delete(item);
        }
        const notificationDisposables = this.mapNotificationToDisposable.get(item);
        if (notificationDisposables) {
            dispose(notificationDisposables);
            this.mapNotificationToDisposable.delete(item);
        }
        if (this.mapNotificationToToast.size > 0) {
            this.layout(this.workbenchDimensions);
        }
        else {
            this.doHide();
            if (focusEditor) {
                this.editorGroupService.activeGroup.focus();
            }
        }
    }
    removeToasts() {
        this.mapNotificationToToast.clear();
        this.mapNotificationToDisposable.forEach(disposable => dispose(disposable));
        this.mapNotificationToDisposable.clear();
        this.doHide();
    }
    doHide() {
        this.notificationsToastsContainer?.classList.remove('visible');
        this.notificationsToastsVisibleContextKey.set(false);
        if (this._isVisible) {
            this._isVisible = false;
            this._onDidChangeVisibility.fire();
        }
    }
    hide() {
        const focusEditor = this.notificationsToastsContainer ? isAncestorOfActiveElement(this.notificationsToastsContainer) : false;
        this.removeToasts();
        if (focusEditor) {
            this.editorGroupService.activeGroup.focus();
        }
    }
    focus() {
        const toasts = this.getToasts(ToastVisibility.VISIBLE);
        if (toasts.length > 0) {
            toasts[0].list.focusFirst();
            return true;
        }
        return false;
    }
    focusNext() {
        const toasts = this.getToasts(ToastVisibility.VISIBLE);
        for (let i = 0; i < toasts.length; i++) {
            const toast = toasts[i];
            if (toast.list.hasFocus()) {
                const nextToast = toasts[i + 1];
                if (nextToast) {
                    nextToast.list.focusFirst();
                    return true;
                }
                break;
            }
        }
        return false;
    }
    focusPrevious() {
        const toasts = this.getToasts(ToastVisibility.VISIBLE);
        for (let i = 0; i < toasts.length; i++) {
            const toast = toasts[i];
            if (toast.list.hasFocus()) {
                const previousToast = toasts[i - 1];
                if (previousToast) {
                    previousToast.list.focusFirst();
                    return true;
                }
                break;
            }
        }
        return false;
    }
    focusFirst() {
        const toast = this.getToasts(ToastVisibility.VISIBLE)[0];
        if (toast) {
            toast.list.focusFirst();
            return true;
        }
        return false;
    }
    focusLast() {
        const toasts = this.getToasts(ToastVisibility.VISIBLE);
        if (toasts.length > 0) {
            toasts[toasts.length - 1].list.focusFirst();
            return true;
        }
        return false;
    }
    update(isCenterVisible) {
        if (this.isNotificationsCenterVisible !== isCenterVisible) {
            this.isNotificationsCenterVisible = isCenterVisible;
            if (this.isNotificationsCenterVisible) {
                this.removeToasts();
            }
        }
    }
    updateStyles() {
        this.mapNotificationToToast.forEach(({ toast }) => {
            const backgroundColor = this.getColor(NOTIFICATIONS_BACKGROUND);
            toast.style.background = backgroundColor ? backgroundColor : '';
            const widgetShadowColor = this.getColor(widgetShadow);
            toast.style.boxShadow = widgetShadowColor ? `0 0 8px 2px ${widgetShadowColor}` : '';
            const borderColor = this.getColor(NOTIFICATIONS_TOAST_BORDER);
            toast.style.border = borderColor ? `1px solid ${borderColor}` : '';
        });
    }
    getToasts(state) {
        const notificationToasts = [];
        this.mapNotificationToToast.forEach(toast => {
            switch (state) {
                case ToastVisibility.HIDDEN_OR_VISIBLE:
                    notificationToasts.push(toast);
                    break;
                case ToastVisibility.HIDDEN:
                    if (!this.isToastInDOM(toast)) {
                        notificationToasts.push(toast);
                    }
                    break;
                case ToastVisibility.VISIBLE:
                    if (this.isToastInDOM(toast)) {
                        notificationToasts.push(toast);
                    }
                    break;
            }
        });
        return notificationToasts.reverse();
    }
    layout(dimension) {
        this.workbenchDimensions = dimension;
        const maxDimensions = this.computeMaxDimensions();
        if (maxDimensions.height) {
            this.layoutContainer(maxDimensions.height);
        }
        this.layoutLists(maxDimensions.width);
    }
    computeMaxDimensions() {
        const maxWidth = NotificationsToasts_1.MAX_WIDTH;
        let availableWidth = maxWidth;
        let availableHeight;
        if (this.workbenchDimensions) {
            availableWidth = this.workbenchDimensions.width;
            availableWidth -= (2 * 8);
            availableHeight = this.workbenchDimensions.height;
            if (this.layoutService.isVisible("workbench.parts.statusbar", mainWindow)) {
                availableHeight -= 22;
            }
            if (this.layoutService.isVisible("workbench.parts.titlebar", mainWindow)) {
                availableHeight -= 22;
            }
            availableHeight -= (2 * 12);
        }
        availableHeight = typeof availableHeight === 'number'
            ? Math.round(availableHeight * 0.618)
            : 0;
        return new Dimension(Math.min(maxWidth, availableWidth), availableHeight);
    }
    layoutLists(width) {
        this.mapNotificationToToast.forEach(({ list }) => list.layout(width));
    }
    layoutContainer(heightToGive) {
        let visibleToasts = 0;
        for (const toast of this.getToasts(ToastVisibility.HIDDEN_OR_VISIBLE)) {
            toast.container.style.opacity = '0';
            this.updateToastVisibility(toast, true);
            heightToGive -= toast.container.offsetHeight;
            let makeVisible = false;
            if (visibleToasts === NotificationsToasts_1.MAX_NOTIFICATIONS) {
                makeVisible = false;
            }
            else if (heightToGive >= 0) {
                makeVisible = true;
            }
            this.updateToastVisibility(toast, makeVisible);
            toast.container.style.opacity = '';
            if (makeVisible) {
                visibleToasts++;
            }
        }
    }
    updateToastVisibility(toast, visible) {
        if (this.isToastInDOM(toast) === visible) {
            return;
        }
        const notificationsToastsContainer = assertIsDefined(this.notificationsToastsContainer);
        if (visible) {
            notificationsToastsContainer.appendChild(toast.container);
        }
        else {
            toast.container.remove();
        }
        toast.item.updateVisibility(visible);
    }
    isToastInDOM(toast) {
        return !!toast.container.parentElement;
    }
};
NotificationsToasts = NotificationsToasts_1 = __decorate([
    __param(2, IInstantiationService),
    __param(3, IWorkbenchLayoutService),
    __param(4, IThemeService),
    __param(5, IEditorGroupsService),
    __param(6, IContextKeyService),
    __param(7, ILifecycleService),
    __param(8, IHostService),
    __metadata("design:paramtypes", [HTMLElement, Object, Object, Object, Object, Object, Object, Object, Object])
], NotificationsToasts);
export { NotificationsToasts };
