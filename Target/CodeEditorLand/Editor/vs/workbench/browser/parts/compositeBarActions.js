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
var CompositeBarActionViewItem_1, CompositeActionViewItem_1;
import { localize } from '../../../nls.js';
import { Action, Separator } from '../../../base/common/actions.js';
import { $, addDisposableListener, append, clearNode, EventHelper, EventType, getDomNodePagePosition, hide, show } from '../../../base/browser/dom.js';
import { ICommandService } from '../../../platform/commands/common/commands.js';
import { toDisposable, DisposableStore, MutableDisposable } from '../../../base/common/lifecycle.js';
import { IContextMenuService } from '../../../platform/contextview/browser/contextView.js';
import { IThemeService } from '../../../platform/theme/common/themeService.js';
import { NumberBadge, ProgressBadge, IconBadge } from '../../services/activity/common/activity.js';
import { IInstantiationService } from '../../../platform/instantiation/common/instantiation.js';
import { DelayedDragHandler } from '../../../base/browser/dnd.js';
import { IKeybindingService } from '../../../platform/keybinding/common/keybinding.js';
import { Emitter, Event } from '../../../base/common/event.js';
import { CompositeDragAndDropObserver, toggleDropEffect } from '../dnd.js';
import { BaseActionViewItem } from '../../../base/browser/ui/actionbar/actionViewItems.js';
import { Codicon } from '../../../base/common/codicons.js';
import { ThemeIcon } from '../../../base/common/themables.js';
import { IHoverService } from '../../../platform/hover/browser/hover.js';
import { RunOnceScheduler } from '../../../base/common/async.js';
import { IConfigurationService } from '../../../platform/configuration/common/configuration.js';
import { badgeBackground, badgeForeground, contrastBorder } from '../../../platform/theme/common/colorRegistry.js';
export class CompositeBarAction extends Action {
    constructor(item) {
        super(item.id, item.name, item.classNames?.join(' '), true);
        this.item = item;
        this._onDidChangeCompositeBarActionItem = this._register(new Emitter());
        this.onDidChangeCompositeBarActionItem = this._onDidChangeCompositeBarActionItem.event;
        this._onDidChangeActivity = this._register(new Emitter());
        this.onDidChangeActivity = this._onDidChangeActivity.event;
    }
    get compositeBarActionItem() {
        return this.item;
    }
    set compositeBarActionItem(item) {
        this._label = item.name;
        this.item = item;
        this._onDidChangeCompositeBarActionItem.fire(this);
    }
    get activity() {
        return this._activity;
    }
    set activity(activity) {
        this._activity = activity;
        this._onDidChangeActivity.fire(activity);
    }
    activate() {
        if (!this.checked) {
            this._setChecked(true);
        }
    }
    deactivate() {
        if (this.checked) {
            this._setChecked(false);
        }
    }
}
let CompositeBarActionViewItem = class CompositeBarActionViewItem extends BaseActionViewItem {
    static { CompositeBarActionViewItem_1 = this; }
    static { this.hoverLeaveTime = 0; }
    constructor(action, options, badgesEnabled, themeService, hoverService, configurationService, keybindingService) {
        super(null, action, options);
        this.badgesEnabled = badgesEnabled;
        this.themeService = themeService;
        this.hoverService = hoverService;
        this.configurationService = configurationService;
        this.keybindingService = keybindingService;
        this.badgeDisposable = this._register(new MutableDisposable());
        this.hoverDisposables = this._register(new DisposableStore());
        this.showHoverScheduler = new RunOnceScheduler(() => this.showHover(), 0);
        this.options = options;
        this._register(this.themeService.onDidColorThemeChange(this.onThemeChange, this));
        this._register(action.onDidChangeCompositeBarActionItem(() => this.update()));
        this._register(Event.filter(keybindingService.onDidUpdateKeybindings, () => this.keybindingLabel !== this.computeKeybindingLabel())(() => this.updateTitle()));
        this._register(action.onDidChangeActivity(() => this.updateActivity()));
        this._register(toDisposable(() => this.showHoverScheduler.cancel()));
    }
    get compositeBarActionItem() {
        return this._action.compositeBarActionItem;
    }
    updateStyles() {
        const theme = this.themeService.getColorTheme();
        const colors = this.options.colors(theme);
        if (this.label) {
            if (this.options.icon) {
                const foreground = this._action.checked ? colors.activeForegroundColor : colors.inactiveForegroundColor;
                if (this.compositeBarActionItem.iconUrl) {
                    // Apply background color to activity bar item provided with iconUrls
                    this.label.style.backgroundColor = foreground ? foreground.toString() : '';
                    this.label.style.color = '';
                }
                else {
                    // Apply foreground color to activity bar items provided with codicons
                    this.label.style.color = foreground ? foreground.toString() : '';
                    this.label.style.backgroundColor = '';
                }
            }
            else {
                const foreground = this._action.checked ? colors.activeForegroundColor : colors.inactiveForegroundColor;
                const borderBottomColor = this._action.checked ? colors.activeBorderBottomColor : null;
                this.label.style.color = foreground ? foreground.toString() : '';
                this.label.style.borderBottomColor = borderBottomColor ? borderBottomColor.toString() : '';
            }
            this.container.style.setProperty('--insert-border-color', colors.dragAndDropBorder ? colors.dragAndDropBorder.toString() : '');
        }
        // Badge
        if (this.badgeContent) {
            const badgeStyles = this.getActivity()?.badge.getColors(theme);
            const badgeFg = badgeStyles?.badgeForeground ?? colors.badgeForeground ?? theme.getColor(badgeForeground);
            const badgeBg = badgeStyles?.badgeBackground ?? colors.badgeBackground ?? theme.getColor(badgeBackground);
            const contrastBorderColor = badgeStyles?.badgeBorder ?? theme.getColor(contrastBorder);
            this.badgeContent.style.color = badgeFg ? badgeFg.toString() : '';
            this.badgeContent.style.backgroundColor = badgeBg ? badgeBg.toString() : '';
            this.badgeContent.style.borderStyle = contrastBorderColor && !this.options.compact ? 'solid' : '';
            this.badgeContent.style.borderWidth = contrastBorderColor ? '1px' : '';
            this.badgeContent.style.borderColor = contrastBorderColor ? contrastBorderColor.toString() : '';
        }
    }
    render(container) {
        super.render(container);
        this.container = container;
        if (this.options.icon) {
            this.container.classList.add('icon');
        }
        if (this.options.hasPopup) {
            this.container.setAttribute('role', 'button');
            this.container.setAttribute('aria-haspopup', 'true');
        }
        else {
            this.container.setAttribute('role', 'tab');
        }
        // Try hard to prevent keyboard only focus feedback when using mouse
        this._register(addDisposableListener(this.container, EventType.MOUSE_DOWN, () => {
            this.container.classList.add('clicked');
        }));
        this._register(addDisposableListener(this.container, EventType.MOUSE_UP, () => {
            if (this.mouseUpTimeout) {
                clearTimeout(this.mouseUpTimeout);
            }
            this.mouseUpTimeout = setTimeout(() => {
                this.container.classList.remove('clicked');
            }, 800); // delayed to prevent focus feedback from showing on mouse up
        }));
        // Label
        this.label = append(container, $('a'));
        // Badge
        this.badge = append(container, $('.badge'));
        this.badgeContent = append(this.badge, $('.badge-content'));
        // pane composite bar active border + background
        append(container, $('.active-item-indicator'));
        hide(this.badge);
        this.update();
        this.updateStyles();
        this.updateHover();
    }
    onThemeChange(theme) {
        this.updateStyles();
    }
    update() {
        this.updateLabel();
        this.updateActivity();
        this.updateTitle();
        this.updateStyles();
    }
    getActivity() {
        if (this._action instanceof CompositeBarAction) {
            return this._action.activity;
        }
        return undefined;
    }
    updateActivity() {
        if (!this.badge || !this.badgeContent || !(this._action instanceof CompositeBarAction)) {
            return;
        }
        const activity = this.getActivity();
        this.badgeDisposable.value = new DisposableStore();
        clearNode(this.badgeContent);
        hide(this.badge);
        const shouldRenderBadges = this.badgesEnabled(this.compositeBarActionItem.id);
        if (activity && shouldRenderBadges) {
            const { badge } = activity;
            const classes = [];
            if (this.options.compact) {
                classes.push('compact');
            }
            // Progress
            if (badge instanceof ProgressBadge) {
                show(this.badge);
                classes.push('progress-badge');
            }
            // Number
            else if (badge instanceof NumberBadge) {
                if (badge.number) {
                    let number = badge.number.toString();
                    if (badge.number > 999) {
                        const noOfThousands = badge.number / 1000;
                        const floor = Math.floor(noOfThousands);
                        if (noOfThousands > floor) {
                            number = `${floor}K+`;
                        }
                        else {
                            number = `${noOfThousands}K`;
                        }
                    }
                    if (this.options.compact && number.length >= 3) {
                        classes.push('compact-content');
                    }
                    this.badgeContent.textContent = number;
                    show(this.badge);
                }
            }
            // Icon
            else if (badge instanceof IconBadge) {
                classes.push('icon-badge');
                const badgeContentClassess = ['icon-overlay', ...ThemeIcon.asClassNameArray(badge.icon)];
                this.badgeContent.classList.add(...badgeContentClassess);
                this.badgeDisposable.value.add(toDisposable(() => this.badgeContent?.classList.remove(...badgeContentClassess)));
                show(this.badge);
            }
            if (classes.length) {
                this.badge.classList.add(...classes);
                this.badgeDisposable.value.add(toDisposable(() => this.badge.classList.remove(...classes)));
            }
        }
        this.updateTitle();
        this.updateStyles();
    }
    updateLabel() {
        this.label.className = 'action-label';
        if (this.compositeBarActionItem.classNames) {
            this.label.classList.add(...this.compositeBarActionItem.classNames);
        }
        if (!this.options.icon) {
            this.label.textContent = this.action.label;
        }
    }
    updateTitle() {
        const title = this.computeTitle();
        [this.label, this.badge, this.container].forEach(element => {
            if (element) {
                element.setAttribute('aria-label', title);
                element.setAttribute('title', '');
                element.removeAttribute('title');
            }
        });
    }
    computeTitle() {
        this.keybindingLabel = this.computeKeybindingLabel();
        let title = this.keybindingLabel ? localize('titleKeybinding', "{0} ({1})", this.compositeBarActionItem.name, this.keybindingLabel) : this.compositeBarActionItem.name;
        const badge = this.action.activity?.badge;
        if (badge?.getDescription()) {
            title = localize('badgeTitle', "{0} - {1}", title, badge.getDescription());
        }
        return title;
    }
    computeKeybindingLabel() {
        const keybinding = this.compositeBarActionItem.keybindingId ? this.keybindingService.lookupKeybinding(this.compositeBarActionItem.keybindingId) : null;
        return keybinding?.getLabel();
    }
    updateHover() {
        this.hoverDisposables.clear();
        this.updateTitle();
        this.hoverDisposables.add(addDisposableListener(this.container, EventType.MOUSE_OVER, () => {
            if (!this.showHoverScheduler.isScheduled()) {
                if (Date.now() - CompositeBarActionViewItem_1.hoverLeaveTime < 200) {
                    this.showHover(true);
                }
                else {
                    this.showHoverScheduler.schedule(this.configurationService.getValue('workbench.hover.delay'));
                }
            }
        }, true));
        this.hoverDisposables.add(addDisposableListener(this.container, EventType.MOUSE_LEAVE, e => {
            if (e.target === this.container) {
                CompositeBarActionViewItem_1.hoverLeaveTime = Date.now();
                this.hoverService.hideHover();
                this.showHoverScheduler.cancel();
            }
        }, true));
        this.hoverDisposables.add(toDisposable(() => {
            this.hoverService.hideHover();
            this.showHoverScheduler.cancel();
        }));
    }
    showHover(skipFadeInAnimation = false) {
        if (this.lastHover && !this.lastHover.isDisposed) {
            return;
        }
        const hoverPosition = this.options.hoverOptions.position();
        this.lastHover = this.hoverService.showHover({
            target: this.container,
            content: this.computeTitle(),
            position: {
                hoverPosition,
            },
            persistence: {
                hideOnKeyDown: true,
            },
            appearance: {
                showPointer: true,
                compact: true,
                skipFadeInAnimation,
            }
        });
    }
    dispose() {
        super.dispose();
        if (this.mouseUpTimeout) {
            clearTimeout(this.mouseUpTimeout);
        }
        this.badge.remove();
    }
};
CompositeBarActionViewItem = CompositeBarActionViewItem_1 = __decorate([
    __param(3, IThemeService),
    __param(4, IHoverService),
    __param(5, IConfigurationService),
    __param(6, IKeybindingService),
    __metadata("design:paramtypes", [CompositeBarAction, Object, Function, Object, Object, Object, Object])
], CompositeBarActionViewItem);
export { CompositeBarActionViewItem };
export class CompositeOverflowActivityAction extends CompositeBarAction {
    constructor(showMenu) {
        super({
            id: 'additionalComposites.action',
            name: localize('additionalViews', "Additional Views"),
            classNames: ThemeIcon.asClassNameArray(Codicon.more)
        });
        this.showMenu = showMenu;
    }
    async run() {
        this.showMenu();
    }
}
let CompositeOverflowActivityActionViewItem = class CompositeOverflowActivityActionViewItem extends CompositeBarActionViewItem {
    constructor(action, getOverflowingComposites, getActiveCompositeId, getBadge, getCompositeOpenAction, colors, hoverOptions, contextMenuService, themeService, hoverService, configurationService, keybindingService) {
        super(action, { icon: true, colors, hasPopup: true, hoverOptions }, () => true, themeService, hoverService, configurationService, keybindingService);
        this.getOverflowingComposites = getOverflowingComposites;
        this.getActiveCompositeId = getActiveCompositeId;
        this.getBadge = getBadge;
        this.getCompositeOpenAction = getCompositeOpenAction;
        this.contextMenuService = contextMenuService;
    }
    showMenu() {
        this.contextMenuService.showContextMenu({
            getAnchor: () => this.container,
            getActions: () => this.getActions(),
            getCheckedActionsRepresentation: () => 'radio',
        });
    }
    getActions() {
        return this.getOverflowingComposites().map(composite => {
            const action = this.getCompositeOpenAction(composite.id);
            action.checked = this.getActiveCompositeId() === action.id;
            const badge = this.getBadge(composite.id);
            let suffix;
            if (badge instanceof NumberBadge) {
                suffix = badge.number;
            }
            if (suffix) {
                action.label = localize('numberBadge', "{0} ({1})", composite.name, suffix);
            }
            else {
                action.label = composite.name || '';
            }
            return action;
        });
    }
};
CompositeOverflowActivityActionViewItem = __decorate([
    __param(7, IContextMenuService),
    __param(8, IThemeService),
    __param(9, IHoverService),
    __param(10, IConfigurationService),
    __param(11, IKeybindingService),
    __metadata("design:paramtypes", [CompositeBarAction, Function, Function, Function, Function, Function, Object, Object, Object, Object, Object, Object])
], CompositeOverflowActivityActionViewItem);
export { CompositeOverflowActivityActionViewItem };
let ManageExtensionAction = class ManageExtensionAction extends Action {
    constructor(commandService) {
        super('activitybar.manage.extension', localize('manageExtension', "Manage Extension"));
        this.commandService = commandService;
    }
    run(id) {
        return this.commandService.executeCommand('_extensions.manage', id);
    }
};
ManageExtensionAction = __decorate([
    __param(0, ICommandService),
    __metadata("design:paramtypes", [Object])
], ManageExtensionAction);
let CompositeActionViewItem = class CompositeActionViewItem extends CompositeBarActionViewItem {
    static { CompositeActionViewItem_1 = this; }
    constructor(options, compositeActivityAction, toggleCompositePinnedAction, toggleCompositeBadgeAction, compositeContextMenuActionsProvider, contextMenuActionsProvider, dndHandler, compositeBar, contextMenuService, keybindingService, instantiationService, themeService, hoverService, configurationService) {
        super(compositeActivityAction, options, compositeBar.areBadgesEnabled.bind(compositeBar), themeService, hoverService, configurationService, keybindingService);
        this.compositeActivityAction = compositeActivityAction;
        this.toggleCompositePinnedAction = toggleCompositePinnedAction;
        this.toggleCompositeBadgeAction = toggleCompositeBadgeAction;
        this.compositeContextMenuActionsProvider = compositeContextMenuActionsProvider;
        this.contextMenuActionsProvider = contextMenuActionsProvider;
        this.dndHandler = dndHandler;
        this.compositeBar = compositeBar;
        this.contextMenuService = contextMenuService;
        if (!CompositeActionViewItem_1.manageExtensionAction) {
            CompositeActionViewItem_1.manageExtensionAction = instantiationService.createInstance(ManageExtensionAction);
        }
    }
    render(container) {
        super.render(container);
        this.updateChecked();
        this.updateEnabled();
        this._register(addDisposableListener(this.container, EventType.CONTEXT_MENU, e => {
            EventHelper.stop(e, true);
            this.showContextMenu(container);
        }));
        // Allow to drag
        let insertDropBefore = undefined;
        this._register(CompositeDragAndDropObserver.INSTANCE.registerDraggable(this.container, () => { return { type: 'composite', id: this.compositeBarActionItem.id }; }, {
            onDragOver: e => {
                const isValidMove = e.dragAndDropData.getData().id !== this.compositeBarActionItem.id && this.dndHandler.onDragOver(e.dragAndDropData, this.compositeBarActionItem.id, e.eventData);
                toggleDropEffect(e.eventData.dataTransfer, 'move', isValidMove);
                insertDropBefore = this.updateFromDragging(container, isValidMove, e.eventData);
            },
            onDragLeave: e => {
                insertDropBefore = this.updateFromDragging(container, false, e.eventData);
            },
            onDragEnd: e => {
                insertDropBefore = this.updateFromDragging(container, false, e.eventData);
            },
            onDrop: e => {
                EventHelper.stop(e.eventData, true);
                this.dndHandler.drop(e.dragAndDropData, this.compositeBarActionItem.id, e.eventData, insertDropBefore);
                insertDropBefore = this.updateFromDragging(container, false, e.eventData);
            },
            onDragStart: e => {
                if (e.dragAndDropData.getData().id !== this.compositeBarActionItem.id) {
                    return;
                }
                if (e.eventData.dataTransfer) {
                    e.eventData.dataTransfer.effectAllowed = 'move';
                }
                this.blur(); // Remove focus indicator when dragging
            }
        }));
        // Activate on drag over to reveal targets
        [this.badge, this.label].forEach(element => this._register(new DelayedDragHandler(element, () => {
            if (!this.action.checked) {
                this.action.run();
            }
        })));
        this.updateStyles();
    }
    updateFromDragging(element, showFeedback, event) {
        const rect = element.getBoundingClientRect();
        const posX = event.clientX;
        const posY = event.clientY;
        const height = rect.bottom - rect.top;
        const width = rect.right - rect.left;
        const forceTop = posY <= rect.top + height * 0.4;
        const forceBottom = posY > rect.bottom - height * 0.4;
        const preferTop = posY <= rect.top + height * 0.5;
        const forceLeft = posX <= rect.left + width * 0.4;
        const forceRight = posX > rect.right - width * 0.4;
        const preferLeft = posX <= rect.left + width * 0.5;
        const classes = element.classList;
        const lastClasses = {
            vertical: classes.contains('top') ? 'top' : (classes.contains('bottom') ? 'bottom' : undefined),
            horizontal: classes.contains('left') ? 'left' : (classes.contains('right') ? 'right' : undefined)
        };
        const top = forceTop || (preferTop && !lastClasses.vertical) || (!forceBottom && lastClasses.vertical === 'top');
        const bottom = forceBottom || (!preferTop && !lastClasses.vertical) || (!forceTop && lastClasses.vertical === 'bottom');
        const left = forceLeft || (preferLeft && !lastClasses.horizontal) || (!forceRight && lastClasses.horizontal === 'left');
        const right = forceRight || (!preferLeft && !lastClasses.horizontal) || (!forceLeft && lastClasses.horizontal === 'right');
        element.classList.toggle('top', showFeedback && top);
        element.classList.toggle('bottom', showFeedback && bottom);
        element.classList.toggle('left', showFeedback && left);
        element.classList.toggle('right', showFeedback && right);
        if (!showFeedback) {
            return undefined;
        }
        return { verticallyBefore: top, horizontallyBefore: left };
    }
    showContextMenu(container) {
        const actions = [this.toggleCompositePinnedAction, this.toggleCompositeBadgeAction];
        const compositeContextMenuActions = this.compositeContextMenuActionsProvider(this.compositeBarActionItem.id);
        if (compositeContextMenuActions.length) {
            actions.push(...compositeContextMenuActions);
        }
        if (this.compositeActivityAction.compositeBarActionItem.extensionId) {
            actions.push(new Separator());
            actions.push(CompositeActionViewItem_1.manageExtensionAction);
        }
        const isPinned = this.compositeBar.isPinned(this.compositeBarActionItem.id);
        if (isPinned) {
            this.toggleCompositePinnedAction.label = localize('hide', "Hide '{0}'", this.compositeBarActionItem.name);
            this.toggleCompositePinnedAction.checked = false;
            this.toggleCompositePinnedAction.enabled = this.compositeBar.getPinnedCompositeIds().length > 1;
        }
        else {
            this.toggleCompositePinnedAction.label = localize('keep', "Keep '{0}'", this.compositeBarActionItem.name);
            this.toggleCompositePinnedAction.enabled = true;
        }
        const isBadgeEnabled = this.compositeBar.areBadgesEnabled(this.compositeBarActionItem.id);
        if (isBadgeEnabled) {
            this.toggleCompositeBadgeAction.label = localize('hideBadge', "Hide Badge");
        }
        else {
            this.toggleCompositeBadgeAction.label = localize('showBadge', "Show Badge");
        }
        const otherActions = this.contextMenuActionsProvider();
        if (otherActions.length) {
            actions.push(new Separator());
            actions.push(...otherActions);
        }
        const elementPosition = getDomNodePagePosition(container);
        const anchor = {
            x: Math.floor(elementPosition.left + (elementPosition.width / 2)),
            y: elementPosition.top + elementPosition.height
        };
        this.contextMenuService.showContextMenu({
            getAnchor: () => anchor,
            getActions: () => actions,
            getActionsContext: () => this.compositeBarActionItem.id
        });
    }
    updateChecked() {
        if (this.action.checked) {
            this.container.classList.add('checked');
            this.container.setAttribute('aria-label', this.getTooltip() ?? this.container.title);
            this.container.setAttribute('aria-expanded', 'true');
            this.container.setAttribute('aria-selected', 'true');
        }
        else {
            this.container.classList.remove('checked');
            this.container.setAttribute('aria-label', this.getTooltip() ?? this.container.title);
            this.container.setAttribute('aria-expanded', 'false');
            this.container.setAttribute('aria-selected', 'false');
        }
        this.updateStyles();
    }
    updateEnabled() {
        if (!this.element) {
            return;
        }
        if (this.action.enabled) {
            this.element.classList.remove('disabled');
        }
        else {
            this.element.classList.add('disabled');
        }
    }
    dispose() {
        super.dispose();
        this.label.remove();
    }
};
CompositeActionViewItem = CompositeActionViewItem_1 = __decorate([
    __param(8, IContextMenuService),
    __param(9, IKeybindingService),
    __param(10, IInstantiationService),
    __param(11, IThemeService),
    __param(12, IHoverService),
    __param(13, IConfigurationService),
    __metadata("design:paramtypes", [Object, CompositeBarAction, Object, Object, Function, Function, Object, Object, Object, Object, Object, Object, Object, Object])
], CompositeActionViewItem);
export { CompositeActionViewItem };
export class ToggleCompositePinnedAction extends Action {
    constructor(activity, compositeBar) {
        super('show.toggleCompositePinned', activity ? activity.name : localize('toggle', "Toggle View Pinned"));
        this.activity = activity;
        this.compositeBar = compositeBar;
        this.checked = !!this.activity && this.compositeBar.isPinned(this.activity.id);
    }
    async run(context) {
        const id = this.activity ? this.activity.id : context;
        if (this.compositeBar.isPinned(id)) {
            this.compositeBar.unpin(id);
        }
        else {
            this.compositeBar.pin(id);
        }
    }
}
export class ToggleCompositeBadgeAction extends Action {
    constructor(compositeBarActionItem, compositeBar) {
        super('show.toggleCompositeBadge', compositeBarActionItem ? compositeBarActionItem.name : localize('toggleBadge', "Toggle View Badge"));
        this.compositeBarActionItem = compositeBarActionItem;
        this.compositeBar = compositeBar;
        this.checked = false;
    }
    async run(context) {
        const id = this.compositeBarActionItem ? this.compositeBarActionItem.id : context;
        this.compositeBar.toggleBadgeEnablement(id);
    }
}
