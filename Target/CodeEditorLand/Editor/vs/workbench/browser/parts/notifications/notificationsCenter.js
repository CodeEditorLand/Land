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
var NotificationsCenter_1;
import './media/notificationsCenter.css';
import './media/notificationsActions.css';
import { NOTIFICATIONS_CENTER_HEADER_FOREGROUND, NOTIFICATIONS_CENTER_HEADER_BACKGROUND, NOTIFICATIONS_CENTER_BORDER } from '../../../common/theme.js';
import { IThemeService, Themable } from '../../../../platform/theme/common/themeService.js';
import { IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.js';
import { Emitter } from '../../../../base/common/event.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { NotificationActionRunner } from './notificationsCommands.js';
import { NotificationsList } from './notificationsList.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { Dimension, isAncestorOfActiveElement } from '../../../../base/browser/dom.js';
import { widgetShadow } from '../../../../platform/theme/common/colorRegistry.js';
import { IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { localize } from '../../../../nls.js';
import { ActionBar } from '../../../../base/browser/ui/actionbar/actionbar.js';
import { ClearAllNotificationsAction, ConfigureDoNotDisturbAction, ToggleDoNotDisturbBySourceAction, HideNotificationsCenterAction, ToggleDoNotDisturbAction } from './notificationsActions.js';
import { Separator, toAction } from '../../../../base/common/actions.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { assertAllDefined, assertIsDefined } from '../../../../base/common/types.js';
import { NotificationsCenterVisibleContext } from '../../../common/contextkeys.js';
import { INotificationService, NotificationsFilter } from '../../../../platform/notification/common/notification.js';
import { mainWindow } from '../../../../base/browser/window.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { DropdownMenuActionViewItem } from '../../../../base/browser/ui/dropdown/dropdownActionViewItem.js';
import { AccessibilitySignal, IAccessibilitySignalService } from '../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js';
let NotificationsCenter = class NotificationsCenter extends Themable {
    static { NotificationsCenter_1 = this; }
    static { this.MAX_DIMENSIONS = new Dimension(450, 400); }
    static { this.MAX_NOTIFICATION_SOURCES = 10; }
    constructor(container, model, themeService, instantiationService, layoutService, contextKeyService, editorGroupService, keybindingService, notificationService, accessibilitySignalService, contextMenuService) {
        super(themeService);
        this.container = container;
        this.model = model;
        this.instantiationService = instantiationService;
        this.layoutService = layoutService;
        this.contextKeyService = contextKeyService;
        this.editorGroupService = editorGroupService;
        this.keybindingService = keybindingService;
        this.notificationService = notificationService;
        this.accessibilitySignalService = accessibilitySignalService;
        this.contextMenuService = contextMenuService;
        this._onDidChangeVisibility = this._register(new Emitter());
        this.onDidChangeVisibility = this._onDidChangeVisibility.event;
        this.notificationsCenterVisibleContextKey = NotificationsCenterVisibleContext.bindTo(this.contextKeyService);
        this.notificationsCenterVisibleContextKey = NotificationsCenterVisibleContext.bindTo(contextKeyService);
        this.registerListeners();
    }
    registerListeners() {
        this._register(this.model.onDidChangeNotification(e => this.onDidChangeNotification(e)));
        this._register(this.layoutService.onDidLayoutMainContainer(dimension => this.layout(Dimension.lift(dimension))));
        this._register(this.notificationService.onDidChangeFilter(() => this.onDidChangeFilter()));
    }
    onDidChangeFilter() {
        if (this.notificationService.getFilter() === NotificationsFilter.ERROR) {
            this.hide();
        }
    }
    get isVisible() {
        return !!this._isVisible;
    }
    show() {
        if (this._isVisible) {
            const notificationsList = assertIsDefined(this.notificationsList);
            notificationsList.show();
            notificationsList.focusFirst();
            return;
        }
        if (!this.notificationsCenterContainer) {
            this.create();
        }
        this.updateTitle();
        const [notificationsList, notificationsCenterContainer] = assertAllDefined(this.notificationsList, this.notificationsCenterContainer);
        this._isVisible = true;
        notificationsCenterContainer.classList.add('visible');
        notificationsList.show();
        this.layout(this.workbenchDimensions);
        notificationsList.updateNotificationsList(0, 0, this.model.notifications);
        notificationsList.focusFirst();
        this.updateStyles();
        this.model.notifications.forEach(notification => notification.updateVisibility(true));
        this.notificationsCenterVisibleContextKey.set(true);
        this._onDidChangeVisibility.fire();
    }
    updateTitle() {
        const [notificationsCenterTitle, clearAllAction] = assertAllDefined(this.notificationsCenterTitle, this.clearAllAction);
        if (this.model.notifications.length === 0) {
            notificationsCenterTitle.textContent = localize('notificationsEmpty', "No new notifications");
            clearAllAction.enabled = false;
        }
        else {
            notificationsCenterTitle.textContent = localize('notifications', "Notifications");
            clearAllAction.enabled = this.model.notifications.some(notification => !notification.hasProgress);
        }
    }
    create() {
        this.notificationsCenterContainer = document.createElement('div');
        this.notificationsCenterContainer.classList.add('notifications-center');
        this.notificationsCenterHeader = document.createElement('div');
        this.notificationsCenterHeader.classList.add('notifications-center-header');
        this.notificationsCenterContainer.appendChild(this.notificationsCenterHeader);
        this.notificationsCenterTitle = document.createElement('span');
        this.notificationsCenterTitle.classList.add('notifications-center-header-title');
        this.notificationsCenterHeader.appendChild(this.notificationsCenterTitle);
        const toolbarContainer = document.createElement('div');
        toolbarContainer.classList.add('notifications-center-header-toolbar');
        this.notificationsCenterHeader.appendChild(toolbarContainer);
        const actionRunner = this._register(this.instantiationService.createInstance(NotificationActionRunner));
        const that = this;
        const notificationsToolBar = this._register(new ActionBar(toolbarContainer, {
            ariaLabel: localize('notificationsToolbar', "Notification Center Actions"),
            actionRunner,
            actionViewItemProvider: (action, options) => {
                if (action.id === ConfigureDoNotDisturbAction.ID) {
                    return this._register(this.instantiationService.createInstance(DropdownMenuActionViewItem, action, {
                        getActions() {
                            const actions = [toAction({
                                    id: ToggleDoNotDisturbAction.ID,
                                    label: that.notificationService.getFilter() === NotificationsFilter.OFF ? localize('turnOnNotifications', "Enable Do Not Disturb Mode") : localize('turnOffNotifications', "Disable Do Not Disturb Mode"),
                                    run: () => that.notificationService.setFilter(that.notificationService.getFilter() === NotificationsFilter.OFF ? NotificationsFilter.ERROR : NotificationsFilter.OFF)
                                })];
                            const sortedFilters = that.notificationService.getFilters().sort((a, b) => a.label.localeCompare(b.label));
                            for (const source of sortedFilters.slice(0, NotificationsCenter_1.MAX_NOTIFICATION_SOURCES)) {
                                if (actions.length === 1) {
                                    actions.push(new Separator());
                                }
                                actions.push(toAction({
                                    id: `${ToggleDoNotDisturbAction.ID}.${source.id}`,
                                    label: source.label,
                                    checked: source.filter !== NotificationsFilter.ERROR,
                                    run: () => that.notificationService.setFilter({
                                        ...source,
                                        filter: source.filter === NotificationsFilter.ERROR ? NotificationsFilter.OFF : NotificationsFilter.ERROR
                                    })
                                }));
                            }
                            if (sortedFilters.length > NotificationsCenter_1.MAX_NOTIFICATION_SOURCES) {
                                actions.push(new Separator());
                                actions.push(that._register(that.instantiationService.createInstance(ToggleDoNotDisturbBySourceAction, ToggleDoNotDisturbBySourceAction.ID, localize('moreSources', "More…"))));
                            }
                            return actions;
                        },
                    }, this.contextMenuService, {
                        ...options,
                        actionRunner,
                        classNames: action.class,
                        keybindingProvider: action => this.keybindingService.lookupKeybinding(action.id)
                    }));
                }
                return undefined;
            }
        }));
        this.clearAllAction = this._register(this.instantiationService.createInstance(ClearAllNotificationsAction, ClearAllNotificationsAction.ID, ClearAllNotificationsAction.LABEL));
        notificationsToolBar.push(this.clearAllAction, { icon: true, label: false, keybinding: this.getKeybindingLabel(this.clearAllAction) });
        this.configureDoNotDisturbAction = this._register(this.instantiationService.createInstance(ConfigureDoNotDisturbAction, ConfigureDoNotDisturbAction.ID, ConfigureDoNotDisturbAction.LABEL));
        notificationsToolBar.push(this.configureDoNotDisturbAction, { icon: true, label: false });
        const hideAllAction = this._register(this.instantiationService.createInstance(HideNotificationsCenterAction, HideNotificationsCenterAction.ID, HideNotificationsCenterAction.LABEL));
        notificationsToolBar.push(hideAllAction, { icon: true, label: false, keybinding: this.getKeybindingLabel(hideAllAction) });
        this.notificationsList = this.instantiationService.createInstance(NotificationsList, this.notificationsCenterContainer, {
            widgetAriaLabel: localize('notificationsCenterWidgetAriaLabel', "Notifications Center")
        });
        this.container.appendChild(this.notificationsCenterContainer);
    }
    getKeybindingLabel(action) {
        const keybinding = this.keybindingService.lookupKeybinding(action.id);
        return keybinding ? keybinding.getLabel() : null;
    }
    onDidChangeNotification(e) {
        if (!this._isVisible) {
            return;
        }
        let focusEditor = false;
        const [notificationsList, notificationsCenterContainer] = assertAllDefined(this.notificationsList, this.notificationsCenterContainer);
        switch (e.kind) {
            case 0:
                notificationsList.updateNotificationsList(e.index, 0, [e.item]);
                e.item.updateVisibility(true);
                break;
            case 1:
                switch (e.detail) {
                    case 2:
                        notificationsList.updateNotificationsList(e.index, 1, [e.item]);
                        break;
                    case 1:
                        if (e.item.expanded) {
                            notificationsList.updateNotificationHeight(e.item);
                        }
                        break;
                }
                break;
            case 2:
                notificationsList.updateNotificationsList(e.index, 1, [e.item]);
                break;
            case 3:
                focusEditor = isAncestorOfActiveElement(notificationsCenterContainer);
                notificationsList.updateNotificationsList(e.index, 1);
                e.item.updateVisibility(false);
                break;
        }
        this.updateTitle();
        if (this.model.notifications.length === 0) {
            this.hide();
            if (focusEditor) {
                this.editorGroupService.activeGroup.focus();
            }
        }
    }
    hide() {
        if (!this._isVisible || !this.notificationsCenterContainer || !this.notificationsList) {
            return;
        }
        const focusEditor = isAncestorOfActiveElement(this.notificationsCenterContainer);
        this._isVisible = false;
        this.notificationsCenterContainer.classList.remove('visible');
        this.notificationsList.hide();
        this.model.notifications.forEach(notification => notification.updateVisibility(false));
        this.notificationsCenterVisibleContextKey.set(false);
        this._onDidChangeVisibility.fire();
        if (focusEditor) {
            this.editorGroupService.activeGroup.focus();
        }
    }
    updateStyles() {
        if (this.notificationsCenterContainer && this.notificationsCenterHeader) {
            const widgetShadowColor = this.getColor(widgetShadow);
            this.notificationsCenterContainer.style.boxShadow = widgetShadowColor ? `0 0 8px 2px ${widgetShadowColor}` : '';
            const borderColor = this.getColor(NOTIFICATIONS_CENTER_BORDER);
            this.notificationsCenterContainer.style.border = borderColor ? `1px solid ${borderColor}` : '';
            const headerForeground = this.getColor(NOTIFICATIONS_CENTER_HEADER_FOREGROUND);
            this.notificationsCenterHeader.style.color = headerForeground ?? '';
            const headerBackground = this.getColor(NOTIFICATIONS_CENTER_HEADER_BACKGROUND);
            this.notificationsCenterHeader.style.background = headerBackground ?? '';
        }
    }
    layout(dimension) {
        this.workbenchDimensions = dimension;
        if (this._isVisible && this.notificationsCenterContainer) {
            const maxWidth = NotificationsCenter_1.MAX_DIMENSIONS.width;
            const maxHeight = NotificationsCenter_1.MAX_DIMENSIONS.height;
            let availableWidth = maxWidth;
            let availableHeight = maxHeight;
            if (this.workbenchDimensions) {
                availableWidth = this.workbenchDimensions.width;
                availableWidth -= (2 * 8);
                availableHeight = this.workbenchDimensions.height - 35;
                if (this.layoutService.isVisible("workbench.parts.statusbar", mainWindow)) {
                    availableHeight -= 22;
                }
                if (this.layoutService.isVisible("workbench.parts.titlebar", mainWindow)) {
                    availableHeight -= 22;
                }
                availableHeight -= (2 * 12);
            }
            const notificationsList = assertIsDefined(this.notificationsList);
            notificationsList.layout(Math.min(maxWidth, availableWidth), Math.min(maxHeight, availableHeight));
        }
    }
    clearAll() {
        this.hide();
        for (const notification of [...this.model.notifications]) {
            if (!notification.hasProgress) {
                notification.close();
            }
            this.accessibilitySignalService.playSignal(AccessibilitySignal.clear);
        }
    }
};
NotificationsCenter = NotificationsCenter_1 = __decorate([
    __param(2, IThemeService),
    __param(3, IInstantiationService),
    __param(4, IWorkbenchLayoutService),
    __param(5, IContextKeyService),
    __param(6, IEditorGroupsService),
    __param(7, IKeybindingService),
    __param(8, INotificationService),
    __param(9, IAccessibilitySignalService),
    __param(10, IContextMenuService),
    __metadata("design:paramtypes", [HTMLElement, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], NotificationsCenter);
export { NotificationsCenter };
