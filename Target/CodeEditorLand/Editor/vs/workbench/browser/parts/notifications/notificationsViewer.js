/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
var NotificationRenderer_1, NotificationTemplateRenderer_1;
import { clearNode, addDisposableListener, EventType, EventHelper, $, isEventLike } from '../../../../base/browser/dom.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { URI } from '../../../../base/common/uri.js';
import { localize } from '../../../../nls.js';
import { ButtonBar } from '../../../../base/browser/ui/button/button.js';
import { ActionBar } from '../../../../base/browser/ui/actionbar/actionbar.js';
import { ActionRunner, Separator, toAction } from '../../../../base/common/actions.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { dispose, DisposableStore, Disposable } from '../../../../base/common/lifecycle.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { NotificationViewItem, ChoiceAction } from '../../../common/notifications.js';
import { ClearNotificationAction, ExpandNotificationAction, CollapseNotificationAction, ConfigureNotificationAction } from './notificationsActions.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { ProgressBar } from '../../../../base/browser/ui/progressbar/progressbar.js';
import { INotificationService, NotificationsFilter, Severity, isNotificationSource } from '../../../../platform/notification/common/notification.js';
import { isNonEmptyArray } from '../../../../base/common/arrays.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { DropdownMenuActionViewItem } from '../../../../base/browser/ui/dropdown/dropdownActionViewItem.js';
import { DomEmitter } from '../../../../base/browser/event.js';
import { Gesture, EventType as GestureEventType } from '../../../../base/browser/touch.js';
import { Event } from '../../../../base/common/event.js';
import { defaultButtonStyles, defaultProgressBarStyles } from '../../../../platform/theme/browser/defaultStyles.js';
import { StandardKeyboardEvent } from '../../../../base/browser/keyboardEvent.js';
import { getDefaultHoverDelegate } from '../../../../base/browser/ui/hover/hoverDelegateFactory.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
export class NotificationsListDelegate {
    static { this.ROW_HEIGHT = 42; }
    static { this.LINE_HEIGHT = 22; }
    constructor(container) {
        this.offsetHelper = this.createOffsetHelper(container);
    }
    createOffsetHelper(container) {
        const offsetHelper = document.createElement('div');
        offsetHelper.classList.add('notification-offset-helper');
        container.appendChild(offsetHelper);
        return offsetHelper;
    }
    getHeight(notification) {
        if (!notification.expanded) {
            return NotificationsListDelegate.ROW_HEIGHT; // return early if there are no more rows to show
        }
        // First row: message and actions
        let expandedHeight = NotificationsListDelegate.ROW_HEIGHT;
        // Dynamic height: if message overflows
        const preferredMessageHeight = this.computePreferredHeight(notification);
        const messageOverflows = NotificationsListDelegate.LINE_HEIGHT < preferredMessageHeight;
        if (messageOverflows) {
            const overflow = preferredMessageHeight - NotificationsListDelegate.LINE_HEIGHT;
            expandedHeight += overflow;
        }
        // Last row: source and buttons if we have any
        if (notification.source || isNonEmptyArray(notification.actions && notification.actions.primary)) {
            expandedHeight += NotificationsListDelegate.ROW_HEIGHT;
        }
        // If the expanded height is same as collapsed, unset the expanded state
        // but skip events because there is no change that has visual impact
        if (expandedHeight === NotificationsListDelegate.ROW_HEIGHT) {
            notification.collapse(true /* skip events, no change in height */);
        }
        return expandedHeight;
    }
    computePreferredHeight(notification) {
        // Prepare offset helper depending on toolbar actions count
        let actions = 0;
        if (!notification.hasProgress) {
            actions++; // close
        }
        if (notification.canCollapse) {
            actions++; // expand/collapse
        }
        if (isNonEmptyArray(notification.actions && notification.actions.secondary)) {
            actions++; // secondary actions
        }
        this.offsetHelper.style.width = `${450 /* notifications container width */ - (10 /* padding */ + 30 /* severity icon */ + (actions * 30) /* actions */ - (Math.max(actions - 1, 0) * 4) /* less padding for actions > 1 */)}px`;
        // Render message into offset helper
        const renderedMessage = NotificationMessageRenderer.render(notification.message);
        this.offsetHelper.appendChild(renderedMessage);
        // Compute height
        const preferredHeight = Math.max(this.offsetHelper.offsetHeight, this.offsetHelper.scrollHeight);
        // Always clear offset helper after use
        clearNode(this.offsetHelper);
        return preferredHeight;
    }
    getTemplateId(element) {
        if (element instanceof NotificationViewItem) {
            return NotificationRenderer.TEMPLATE_ID;
        }
        throw new Error('unknown element type: ' + element);
    }
}
class NotificationMessageRenderer {
    static render(message, actionHandler) {
        const messageContainer = document.createElement('span');
        for (const node of message.linkedText.nodes) {
            if (typeof node === 'string') {
                messageContainer.appendChild(document.createTextNode(node));
            }
            else {
                let title = node.title;
                if (!title && node.href.startsWith('command:')) {
                    title = localize('executeCommand', "Click to execute command '{0}'", node.href.substr('command:'.length));
                }
                else if (!title) {
                    title = node.href;
                }
                const anchor = $('a', { href: node.href, title, tabIndex: 0 }, node.label);
                if (actionHandler) {
                    const handleOpen = (e) => {
                        if (isEventLike(e)) {
                            EventHelper.stop(e, true);
                        }
                        actionHandler.callback(node.href);
                    };
                    const onClick = actionHandler.toDispose.add(new DomEmitter(anchor, EventType.CLICK)).event;
                    const onKeydown = actionHandler.toDispose.add(new DomEmitter(anchor, EventType.KEY_DOWN)).event;
                    const onSpaceOrEnter = Event.chain(onKeydown, $ => $.filter(e => {
                        const event = new StandardKeyboardEvent(e);
                        return event.equals(10 /* KeyCode.Space */) || event.equals(3 /* KeyCode.Enter */);
                    }));
                    actionHandler.toDispose.add(Gesture.addTarget(anchor));
                    const onTap = actionHandler.toDispose.add(new DomEmitter(anchor, GestureEventType.Tap)).event;
                    Event.any(onClick, onTap, onSpaceOrEnter)(handleOpen, null, actionHandler.toDispose);
                }
                messageContainer.appendChild(anchor);
            }
        }
        return messageContainer;
    }
}
let NotificationRenderer = class NotificationRenderer {
    static { NotificationRenderer_1 = this; }
    static { this.TEMPLATE_ID = 'notification'; }
    constructor(actionRunner, contextMenuService, instantiationService, notificationService) {
        this.actionRunner = actionRunner;
        this.contextMenuService = contextMenuService;
        this.instantiationService = instantiationService;
        this.notificationService = notificationService;
    }
    get templateId() {
        return NotificationRenderer_1.TEMPLATE_ID;
    }
    renderTemplate(container) {
        const data = Object.create(null);
        data.toDispose = new DisposableStore();
        // Container
        data.container = document.createElement('div');
        data.container.classList.add('notification-list-item');
        // Main Row
        data.mainRow = document.createElement('div');
        data.mainRow.classList.add('notification-list-item-main-row');
        // Icon
        data.icon = document.createElement('div');
        data.icon.classList.add('notification-list-item-icon', 'codicon');
        // Message
        data.message = document.createElement('div');
        data.message.classList.add('notification-list-item-message');
        // Toolbar
        const that = this;
        const toolbarContainer = document.createElement('div');
        toolbarContainer.classList.add('notification-list-item-toolbar-container');
        data.toolbar = new ActionBar(toolbarContainer, {
            ariaLabel: localize('notificationActions', "Notification Actions"),
            actionViewItemProvider: (action, options) => {
                if (action instanceof ConfigureNotificationAction) {
                    return data.toDispose.add(new DropdownMenuActionViewItem(action, {
                        getActions() {
                            const actions = [];
                            const source = { id: action.notification.sourceId, label: action.notification.source };
                            if (isNotificationSource(source)) {
                                const isSourceFiltered = that.notificationService.getFilter(source) === NotificationsFilter.ERROR;
                                actions.push(toAction({
                                    id: source.id,
                                    label: isSourceFiltered ? localize('turnOnNotifications', "Turn On All Notifications from '{0}'", source.label) : localize('turnOffNotifications', "Turn Off Info and Warning Notifications from '{0}'", source.label),
                                    run: () => that.notificationService.setFilter({ ...source, filter: isSourceFiltered ? NotificationsFilter.OFF : NotificationsFilter.ERROR })
                                }));
                                if (action.notification.actions?.secondary?.length) {
                                    actions.push(new Separator());
                                }
                            }
                            if (Array.isArray(action.notification.actions?.secondary)) {
                                actions.push(...action.notification.actions.secondary);
                            }
                            return actions;
                        },
                    }, this.contextMenuService, {
                        ...options,
                        actionRunner: this.actionRunner,
                        classNames: action.class
                    }));
                }
                return undefined;
            },
            actionRunner: this.actionRunner
        });
        data.toDispose.add(data.toolbar);
        // Details Row
        data.detailsRow = document.createElement('div');
        data.detailsRow.classList.add('notification-list-item-details-row');
        // Source
        data.source = document.createElement('div');
        data.source.classList.add('notification-list-item-source');
        // Buttons Container
        data.buttonsContainer = document.createElement('div');
        data.buttonsContainer.classList.add('notification-list-item-buttons-container');
        container.appendChild(data.container);
        // the details row appears first in order for better keyboard access to notification buttons
        data.container.appendChild(data.detailsRow);
        data.detailsRow.appendChild(data.source);
        data.detailsRow.appendChild(data.buttonsContainer);
        // main row
        data.container.appendChild(data.mainRow);
        data.mainRow.appendChild(data.icon);
        data.mainRow.appendChild(data.message);
        data.mainRow.appendChild(toolbarContainer);
        // Progress: below the rows to span the entire width of the item
        data.progress = new ProgressBar(container, defaultProgressBarStyles);
        data.toDispose.add(data.progress);
        // Renderer
        data.renderer = this.instantiationService.createInstance(NotificationTemplateRenderer, data, this.actionRunner);
        data.toDispose.add(data.renderer);
        return data;
    }
    renderElement(notification, index, data) {
        data.renderer.setInput(notification);
    }
    disposeTemplate(templateData) {
        dispose(templateData.toDispose);
    }
};
NotificationRenderer = NotificationRenderer_1 = __decorate([
    __param(1, IContextMenuService),
    __param(2, IInstantiationService),
    __param(3, INotificationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], NotificationRenderer);
export { NotificationRenderer };
let NotificationTemplateRenderer = class NotificationTemplateRenderer extends Disposable {
    static { NotificationTemplateRenderer_1 = this; }
    static { this.SEVERITIES = [Severity.Info, Severity.Warning, Severity.Error]; }
    constructor(template, actionRunner, openerService, instantiationService, keybindingService, contextMenuService, hoverService) {
        super();
        this.template = template;
        this.actionRunner = actionRunner;
        this.openerService = openerService;
        this.instantiationService = instantiationService;
        this.keybindingService = keybindingService;
        this.contextMenuService = contextMenuService;
        this.hoverService = hoverService;
        this.inputDisposables = this._register(new DisposableStore());
        if (!NotificationTemplateRenderer_1.closeNotificationAction) {
            NotificationTemplateRenderer_1.closeNotificationAction = instantiationService.createInstance(ClearNotificationAction, ClearNotificationAction.ID, ClearNotificationAction.LABEL);
            NotificationTemplateRenderer_1.expandNotificationAction = instantiationService.createInstance(ExpandNotificationAction, ExpandNotificationAction.ID, ExpandNotificationAction.LABEL);
            NotificationTemplateRenderer_1.collapseNotificationAction = instantiationService.createInstance(CollapseNotificationAction, CollapseNotificationAction.ID, CollapseNotificationAction.LABEL);
        }
    }
    setInput(notification) {
        this.inputDisposables.clear();
        this.render(notification);
    }
    render(notification) {
        // Container
        this.template.container.classList.toggle('expanded', notification.expanded);
        this.inputDisposables.add(addDisposableListener(this.template.container, EventType.MOUSE_UP, e => {
            if (e.button === 1 /* Middle Button */) {
                // Prevent firing the 'paste' event in the editor textarea - #109322
                EventHelper.stop(e, true);
            }
        }));
        this.inputDisposables.add(addDisposableListener(this.template.container, EventType.AUXCLICK, e => {
            if (!notification.hasProgress && e.button === 1 /* Middle Button */) {
                EventHelper.stop(e, true);
                notification.close();
            }
        }));
        // Severity Icon
        this.renderSeverity(notification);
        // Message
        const messageCustomHover = this.inputDisposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate('mouse'), this.template.message, ''));
        const messageOverflows = this.renderMessage(notification, messageCustomHover);
        // Secondary Actions
        this.renderSecondaryActions(notification, messageOverflows);
        // Source
        const sourceCustomHover = this.inputDisposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate('mouse'), this.template.source, ''));
        this.renderSource(notification, sourceCustomHover);
        // Buttons
        this.renderButtons(notification);
        // Progress
        this.renderProgress(notification);
        // Label Change Events that we can handle directly
        // (changes to actions require an entire redraw of
        // the notification because it has an impact on
        // epxansion state)
        this.inputDisposables.add(notification.onDidChangeContent(event => {
            switch (event.kind) {
                case 0 /* NotificationViewItemContentChangeKind.SEVERITY */:
                    this.renderSeverity(notification);
                    break;
                case 3 /* NotificationViewItemContentChangeKind.PROGRESS */:
                    this.renderProgress(notification);
                    break;
                case 1 /* NotificationViewItemContentChangeKind.MESSAGE */:
                    this.renderMessage(notification, messageCustomHover);
                    break;
            }
        }));
    }
    renderSeverity(notification) {
        // first remove, then set as the codicon class names overlap
        NotificationTemplateRenderer_1.SEVERITIES.forEach(severity => {
            if (notification.severity !== severity) {
                this.template.icon.classList.remove(...ThemeIcon.asClassNameArray(this.toSeverityIcon(severity)));
            }
        });
        this.template.icon.classList.add(...ThemeIcon.asClassNameArray(this.toSeverityIcon(notification.severity)));
    }
    renderMessage(notification, customHover) {
        clearNode(this.template.message);
        this.template.message.appendChild(NotificationMessageRenderer.render(notification.message, {
            callback: link => this.openerService.open(URI.parse(link), { allowCommands: true }),
            toDispose: this.inputDisposables
        }));
        const messageOverflows = notification.canCollapse && !notification.expanded && this.template.message.scrollWidth > this.template.message.clientWidth;
        customHover.update(messageOverflows ? this.template.message.textContent + '' : '');
        return messageOverflows;
    }
    renderSecondaryActions(notification, messageOverflows) {
        const actions = [];
        // Secondary Actions
        if (isNonEmptyArray(notification.actions?.secondary)) {
            const configureNotificationAction = this.instantiationService.createInstance(ConfigureNotificationAction, ConfigureNotificationAction.ID, ConfigureNotificationAction.LABEL, notification);
            actions.push(configureNotificationAction);
            this.inputDisposables.add(configureNotificationAction);
        }
        // Expand / Collapse
        let showExpandCollapseAction = false;
        if (notification.canCollapse) {
            if (notification.expanded) {
                showExpandCollapseAction = true; // allow to collapse an expanded message
            }
            else if (notification.source) {
                showExpandCollapseAction = true; // allow to expand to details row
            }
            else if (messageOverflows) {
                showExpandCollapseAction = true; // allow to expand if message overflows
            }
        }
        if (showExpandCollapseAction) {
            actions.push(notification.expanded ? NotificationTemplateRenderer_1.collapseNotificationAction : NotificationTemplateRenderer_1.expandNotificationAction);
        }
        // Close (unless progress is showing)
        if (!notification.hasProgress) {
            actions.push(NotificationTemplateRenderer_1.closeNotificationAction);
        }
        this.template.toolbar.clear();
        this.template.toolbar.context = notification;
        actions.forEach(action => this.template.toolbar.push(action, { icon: true, label: false, keybinding: this.getKeybindingLabel(action) }));
    }
    renderSource(notification, sourceCustomHover) {
        if (notification.expanded && notification.source) {
            this.template.source.textContent = localize('notificationSource', "Source: {0}", notification.source);
            sourceCustomHover.update(notification.source);
        }
        else {
            this.template.source.textContent = '';
            sourceCustomHover.update('');
        }
    }
    renderButtons(notification) {
        clearNode(this.template.buttonsContainer);
        const primaryActions = notification.actions ? notification.actions.primary : undefined;
        if (notification.expanded && isNonEmptyArray(primaryActions)) {
            const that = this;
            const actionRunner = new class extends ActionRunner {
                async runAction(action) {
                    // Run action
                    that.actionRunner.run(action, notification);
                    // Hide notification (unless explicitly prevented)
                    if (!(action instanceof ChoiceAction) || !action.keepOpen) {
                        notification.close();
                    }
                }
            }();
            const buttonToolbar = this.inputDisposables.add(new ButtonBar(this.template.buttonsContainer));
            for (let i = 0; i < primaryActions.length; i++) {
                const action = primaryActions[i];
                const options = {
                    title: true, // assign titles to buttons in case they overflow
                    secondary: i > 0,
                    ...defaultButtonStyles
                };
                const dropdownActions = action instanceof ChoiceAction ? action.menu : undefined;
                const button = this.inputDisposables.add(dropdownActions ?
                    buttonToolbar.addButtonWithDropdown({
                        ...options,
                        contextMenuProvider: this.contextMenuService,
                        actions: dropdownActions,
                        actionRunner
                    }) :
                    buttonToolbar.addButton(options));
                button.label = action.label;
                this.inputDisposables.add(button.onDidClick(e => {
                    if (e) {
                        EventHelper.stop(e, true);
                    }
                    actionRunner.run(action);
                }));
            }
        }
    }
    renderProgress(notification) {
        // Return early if the item has no progress
        if (!notification.hasProgress) {
            this.template.progress.stop().hide();
            return;
        }
        // Infinite
        const state = notification.progress.state;
        if (state.infinite) {
            this.template.progress.infinite().show();
        }
        // Total / Worked
        else if (typeof state.total === 'number' || typeof state.worked === 'number') {
            if (typeof state.total === 'number' && !this.template.progress.hasTotal()) {
                this.template.progress.total(state.total);
            }
            if (typeof state.worked === 'number') {
                this.template.progress.setWorked(state.worked).show();
            }
        }
        // Done
        else {
            this.template.progress.done().hide();
        }
    }
    toSeverityIcon(severity) {
        switch (severity) {
            case Severity.Warning:
                return Codicon.warning;
            case Severity.Error:
                return Codicon.error;
        }
        return Codicon.info;
    }
    getKeybindingLabel(action) {
        const keybinding = this.keybindingService.lookupKeybinding(action.id);
        return keybinding ? keybinding.getLabel() : null;
    }
};
NotificationTemplateRenderer = NotificationTemplateRenderer_1 = __decorate([
    __param(2, IOpenerService),
    __param(3, IInstantiationService),
    __param(4, IKeybindingService),
    __param(5, IContextMenuService),
    __param(6, IHoverService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object])
], NotificationTemplateRenderer);
export { NotificationTemplateRenderer };
