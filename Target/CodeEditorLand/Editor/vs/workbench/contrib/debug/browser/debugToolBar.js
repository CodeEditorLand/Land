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
import * as dom from '../../../../base/browser/dom.js';
import { StandardMouseEvent } from '../../../../base/browser/mouseEvent.js';
import { ActionBar } from '../../../../base/browser/ui/actionbar/actionbar.js';
import { Action } from '../../../../base/common/actions.js';
import * as arrays from '../../../../base/common/arrays.js';
import { RunOnceScheduler } from '../../../../base/common/async.js';
import * as errors from '../../../../base/common/errors.js';
import { DisposableStore, dispose, markAsSingleton, MutableDisposable } from '../../../../base/common/lifecycle.js';
import './media/debugToolBar.css';
import { localize } from '../../../../nls.js';
import { DropdownWithPrimaryActionViewItem } from '../../../../platform/actions/browser/dropdownWithPrimaryActionViewItem.js';
import { createActionViewItem, createAndFillInActionBarActions } from '../../../../platform/actions/browser/menuEntryActionViewItem.js';
import { IMenuService, MenuId, MenuRegistry } from '../../../../platform/actions/common/actions.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ContextKeyExpr, IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { widgetBorder, widgetShadow } from '../../../../platform/theme/common/colorRegistry.js';
import { IThemeService, Themable } from '../../../../platform/theme/common/themeService.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { FocusSessionActionViewItem } from './debugActionViewItems.js';
import { debugToolBarBackground, debugToolBarBorder } from './debugColors.js';
import { CONTINUE_ID, CONTINUE_LABEL, DISCONNECT_AND_SUSPEND_ID, DISCONNECT_AND_SUSPEND_LABEL, DISCONNECT_ID, DISCONNECT_LABEL, FOCUS_SESSION_ID, FOCUS_SESSION_LABEL, PAUSE_ID, PAUSE_LABEL, RESTART_LABEL, RESTART_SESSION_ID, REVERSE_CONTINUE_ID, STEP_BACK_ID, STEP_INTO_ID, STEP_INTO_LABEL, STEP_OUT_ID, STEP_OUT_LABEL, STEP_OVER_ID, STEP_OVER_LABEL, STOP_ID, STOP_LABEL } from './debugCommands.js';
import * as icons from './debugIcons.js';
import { CONTEXT_DEBUG_STATE, CONTEXT_FOCUSED_SESSION_IS_ATTACH, CONTEXT_FOCUSED_SESSION_IS_NO_DEBUG, CONTEXT_IN_DEBUG_MODE, CONTEXT_MULTI_SESSION_DEBUG, CONTEXT_STEP_BACK_SUPPORTED, CONTEXT_SUSPEND_DEBUGGEE_SUPPORTED, CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED, IDebugService, VIEWLET_ID } from '../common/debug.js';
import { IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { mainWindow } from '../../../../base/browser/window.js';
import { clamp } from '../../../../base/common/numbers.js';
import { PixelRatio } from '../../../../base/browser/pixelRatio.js';
const DEBUG_TOOLBAR_POSITION_KEY = 'debug.actionswidgetposition';
const DEBUG_TOOLBAR_Y_KEY = 'debug.actionswidgety';
let DebugToolBar = class DebugToolBar extends Themable {
    constructor(notificationService, telemetryService, debugService, layoutService, storageService, configurationService, themeService, instantiationService, menuService, contextKeyService) {
        super(themeService);
        this.notificationService = notificationService;
        this.telemetryService = telemetryService;
        this.debugService = debugService;
        this.layoutService = layoutService;
        this.storageService = storageService;
        this.configurationService = configurationService;
        this.instantiationService = instantiationService;
        this.isVisible = false;
        this.isBuilt = false;
        this.stopActionViewItemDisposables = this._register(new DisposableStore());
        this.auxWindowCoordinates = new WeakMap();
        this.trackPixelRatioListener = this._register(new MutableDisposable());
        this.$el = dom.$('div.debug-toolbar');
        this.$el.style.top = `${layoutService.mainContainerOffset.top}px`;
        this.dragArea = dom.append(this.$el, dom.$('div.drag-area' + ThemeIcon.asCSSSelector(icons.debugGripper)));
        const actionBarContainer = dom.append(this.$el, dom.$('div.action-bar-container'));
        this.debugToolBarMenu = menuService.createMenu(MenuId.DebugToolBar, contextKeyService);
        this._register(this.debugToolBarMenu);
        this.activeActions = [];
        this.actionBar = this._register(new ActionBar(actionBarContainer, {
            orientation: 0,
            actionViewItemProvider: (action, options) => {
                if (action.id === FOCUS_SESSION_ID) {
                    return this.instantiationService.createInstance(FocusSessionActionViewItem, action, undefined);
                }
                else if (action.id === STOP_ID || action.id === DISCONNECT_ID) {
                    this.stopActionViewItemDisposables.clear();
                    const item = this.instantiationService.invokeFunction(accessor => createDisconnectMenuItemAction(action, this.stopActionViewItemDisposables, accessor, { hoverDelegate: options.hoverDelegate }));
                    if (item) {
                        return item;
                    }
                }
                return createActionViewItem(this.instantiationService, action, options);
            }
        }));
        this.updateScheduler = this._register(new RunOnceScheduler(() => {
            const state = this.debugService.state;
            const toolBarLocation = this.configurationService.getValue('debug').toolBarLocation;
            if (state === 0 ||
                toolBarLocation !== 'floating' ||
                this.debugService.getModel().getSessions().every(s => s.suppressDebugToolbar) ||
                (state === 1 && this.debugService.initializingOptions?.suppressDebugToolbar)) {
                return this.hide();
            }
            const actions = [];
            createAndFillInActionBarActions(this.debugToolBarMenu, { shouldForwardArgs: true }, actions);
            if (!arrays.equals(actions, this.activeActions, (first, second) => first.id === second.id && first.enabled === second.enabled)) {
                this.actionBar.clear();
                this.actionBar.push(actions, { icon: true, label: false });
                this.activeActions = actions;
            }
            this.show();
        }, 20));
        this.updateStyles();
        this.registerListeners();
        this.hide();
    }
    registerListeners() {
        this._register(this.debugService.onDidChangeState(() => this.updateScheduler.schedule()));
        this._register(this.configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('debug.toolBarLocation')) {
                this.updateScheduler.schedule();
            }
            if (e.affectsConfiguration("workbench.editor.showTabs") || e.affectsConfiguration("window.commandCenter")) {
                this._yRange = undefined;
                this.setCoordinates();
            }
        }));
        this._register(this.debugToolBarMenu.onDidChange(() => this.updateScheduler.schedule()));
        this._register(this.actionBar.actionRunner.onDidRun((e) => {
            if (e.error && !errors.isCancellationError(e.error)) {
                this.notificationService.warn(e.error);
            }
            this.telemetryService.publicLog2('workbenchActionExecuted', { id: e.action.id, from: 'debugActionsWidget' });
        }));
        this._register(dom.addDisposableGenericMouseUpListener(this.dragArea, (event) => {
            const mouseClickEvent = new StandardMouseEvent(dom.getWindow(this.dragArea), event);
            const activeWindow = dom.getWindow(this.layoutService.activeContainer);
            if (mouseClickEvent.detail === 2) {
                const widgetWidth = this.$el.clientWidth;
                this.setCoordinates(0.5 * activeWindow.innerWidth - 0.5 * widgetWidth, this.yDefault);
                this.storePosition();
            }
        }));
        this._register(dom.addDisposableGenericMouseDownListener(this.dragArea, (event) => {
            this.dragArea.classList.add('dragged');
            const activeWindow = dom.getWindow(this.layoutService.activeContainer);
            const mouseMoveListener = dom.addDisposableGenericMouseMoveListener(activeWindow, (e) => {
                const mouseMoveEvent = new StandardMouseEvent(activeWindow, e);
                mouseMoveEvent.preventDefault();
                this.setCoordinates(mouseMoveEvent.posx - 14, mouseMoveEvent.posy - 14);
            });
            const mouseUpListener = dom.addDisposableGenericMouseUpListener(activeWindow, (e) => {
                this.storePosition();
                this.dragArea.classList.remove('dragged');
                mouseMoveListener.dispose();
                mouseUpListener.dispose();
            });
        }));
        this._register(this.layoutService.onDidChangePartVisibility(() => this.setCoordinates()));
        const resizeListener = this._register(new MutableDisposable());
        const registerResizeListener = () => {
            resizeListener.value = this._register(dom.addDisposableListener(dom.getWindow(this.layoutService.activeContainer), dom.EventType.RESIZE, () => this.setCoordinates()));
        };
        this._register(this.layoutService.onDidChangeActiveContainer(async () => {
            this._yRange = undefined;
            await this.layoutService.whenContainerStylesLoaded(dom.getWindow(this.layoutService.activeContainer));
            if (this.isBuilt) {
                this.doShowInActiveContainer();
                this.setCoordinates();
            }
            registerResizeListener();
        }));
        registerResizeListener();
    }
    storePosition() {
        const activeWindow = dom.getWindow(this.layoutService.activeContainer);
        const isMainWindow = this.layoutService.activeContainer === this.layoutService.mainContainer;
        const rect = this.$el.getBoundingClientRect();
        const y = rect.top;
        const x = rect.left / activeWindow.innerWidth;
        if (isMainWindow) {
            this.storageService.store(DEBUG_TOOLBAR_POSITION_KEY, x, 0, 1);
            this.storageService.store(DEBUG_TOOLBAR_Y_KEY, y, 0, 1);
        }
        else {
            this.auxWindowCoordinates.set(activeWindow, { x, y });
        }
    }
    updateStyles() {
        super.updateStyles();
        if (this.$el) {
            this.$el.style.backgroundColor = this.getColor(debugToolBarBackground) || '';
            const widgetShadowColor = this.getColor(widgetShadow);
            this.$el.style.boxShadow = widgetShadowColor ? `0 0 8px 2px ${widgetShadowColor}` : '';
            const contrastBorderColor = this.getColor(widgetBorder);
            const borderColor = this.getColor(debugToolBarBorder);
            if (contrastBorderColor) {
                this.$el.style.border = `1px solid ${contrastBorderColor}`;
            }
            else {
                this.$el.style.border = borderColor ? `solid ${borderColor}` : 'none';
                this.$el.style.border = '1px 0';
            }
        }
    }
    setCoordinates(x, y) {
        if (!this.isVisible) {
            return;
        }
        const widgetWidth = this.$el.clientWidth;
        const currentWindow = dom.getWindow(this.layoutService.activeContainer);
        const isMainWindow = currentWindow === mainWindow;
        if (x === undefined) {
            const positionPercentage = isMainWindow
                ? Number(this.storageService.get(DEBUG_TOOLBAR_POSITION_KEY, 0))
                : this.auxWindowCoordinates.get(currentWindow)?.x;
            x = positionPercentage !== undefined && !isNaN(positionPercentage)
                ? positionPercentage * currentWindow.innerWidth
                : (0.5 * currentWindow.innerWidth - 0.5 * widgetWidth);
        }
        x = clamp(x, 0, currentWindow.innerWidth - widgetWidth);
        this.$el.style.left = `${x}px`;
        if (y === undefined) {
            y = isMainWindow
                ? this.storageService.getNumber(DEBUG_TOOLBAR_Y_KEY, 0)
                : this.auxWindowCoordinates.get(currentWindow)?.y;
        }
        this.setYCoordinate(y ?? this.yDefault);
    }
    setYCoordinate(y) {
        const [yMin, yMax] = this.yRange;
        y = Math.max(yMin, Math.min(y, yMax));
        this.$el.style.top = `${y}px`;
    }
    get yDefault() {
        return this.layoutService.mainContainerOffset.top;
    }
    get yRange() {
        if (!this._yRange) {
            const isTitleBarVisible = this.layoutService.isVisible("workbench.parts.titlebar", dom.getWindow(this.layoutService.activeContainer));
            const yMin = isTitleBarVisible ? 0 : this.layoutService.mainContainerOffset.top;
            let yMax = 0;
            if (isTitleBarVisible) {
                if (this.configurationService.getValue("window.commandCenter") === true) {
                    yMax += 35;
                }
                else {
                    yMax += 28;
                }
            }
            if (this.configurationService.getValue("workbench.editor.showTabs") !== "none") {
                yMax += 35;
            }
            this._yRange = [yMin, yMax];
        }
        return this._yRange;
    }
    show() {
        if (this.isVisible) {
            this.setCoordinates();
            return;
        }
        if (!this.isBuilt) {
            this.isBuilt = true;
            this.doShowInActiveContainer();
        }
        this.isVisible = true;
        dom.show(this.$el);
        this.setCoordinates();
    }
    doShowInActiveContainer() {
        this.layoutService.activeContainer.appendChild(this.$el);
        this.trackPixelRatioListener.value = PixelRatio.getInstance(dom.getWindow(this.$el)).onDidChange(() => this.setCoordinates());
    }
    hide() {
        this.isVisible = false;
        dom.hide(this.$el);
    }
    dispose() {
        super.dispose();
        this.$el?.remove();
    }
};
DebugToolBar = __decorate([
    __param(0, INotificationService),
    __param(1, ITelemetryService),
    __param(2, IDebugService),
    __param(3, IWorkbenchLayoutService),
    __param(4, IStorageService),
    __param(5, IConfigurationService),
    __param(6, IThemeService),
    __param(7, IInstantiationService),
    __param(8, IMenuService),
    __param(9, IContextKeyService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], DebugToolBar);
export { DebugToolBar };
export function createDisconnectMenuItemAction(action, disposables, accessor, options) {
    const menuService = accessor.get(IMenuService);
    const contextKeyService = accessor.get(IContextKeyService);
    const instantiationService = accessor.get(IInstantiationService);
    const menu = menuService.getMenuActions(MenuId.DebugToolBarStop, contextKeyService, { shouldForwardArgs: true });
    const secondary = [];
    createAndFillInActionBarActions(menu, secondary);
    if (!secondary.length) {
        return undefined;
    }
    const dropdownAction = disposables.add(new Action('notebook.moreRunActions', localize('notebook.moreRunActionsLabel', "More..."), 'codicon-chevron-down', true));
    const item = instantiationService.createInstance(DropdownWithPrimaryActionViewItem, action, dropdownAction, secondary, 'debug-stop-actions', options);
    return item;
}
const debugViewTitleItems = [];
const registerDebugToolBarItem = (id, title, order, icon, when, precondition, alt) => {
    MenuRegistry.appendMenuItem(MenuId.DebugToolBar, {
        group: 'navigation',
        when,
        order,
        command: {
            id,
            title,
            icon,
            precondition
        },
        alt
    });
    debugViewTitleItems.push(MenuRegistry.appendMenuItem(MenuId.ViewContainerTitle, {
        group: 'navigation',
        when: ContextKeyExpr.and(when, ContextKeyExpr.equals('viewContainer', VIEWLET_ID), CONTEXT_DEBUG_STATE.notEqualsTo('inactive'), ContextKeyExpr.equals('config.debug.toolBarLocation', 'docked')),
        order,
        command: {
            id,
            title,
            icon,
            precondition
        }
    }));
};
markAsSingleton(MenuRegistry.onDidChangeMenu(e => {
    if (e.has(MenuId.DebugToolBar)) {
        dispose(debugViewTitleItems);
        const items = MenuRegistry.getMenuItems(MenuId.DebugToolBar);
        for (const i of items) {
            debugViewTitleItems.push(MenuRegistry.appendMenuItem(MenuId.ViewContainerTitle, {
                ...i,
                when: ContextKeyExpr.and(i.when, ContextKeyExpr.equals('viewContainer', VIEWLET_ID), CONTEXT_DEBUG_STATE.notEqualsTo('inactive'), ContextKeyExpr.equals('config.debug.toolBarLocation', 'docked'))
            }));
        }
    }
}));
const CONTEXT_TOOLBAR_COMMAND_CENTER = ContextKeyExpr.equals('config.debug.toolBarLocation', 'commandCenter');
MenuRegistry.appendMenuItem(MenuId.CommandCenterCenter, {
    submenu: MenuId.DebugToolBar,
    title: 'Debug',
    icon: Codicon.debug,
    order: 1,
    when: ContextKeyExpr.and(CONTEXT_IN_DEBUG_MODE, CONTEXT_TOOLBAR_COMMAND_CENTER)
});
registerDebugToolBarItem(CONTINUE_ID, CONTINUE_LABEL, 10, icons.debugContinue, CONTEXT_DEBUG_STATE.isEqualTo('stopped'));
registerDebugToolBarItem(PAUSE_ID, PAUSE_LABEL, 10, icons.debugPause, CONTEXT_DEBUG_STATE.notEqualsTo('stopped'), ContextKeyExpr.and(CONTEXT_DEBUG_STATE.isEqualTo('running'), CONTEXT_FOCUSED_SESSION_IS_NO_DEBUG.toNegated()));
registerDebugToolBarItem(STOP_ID, STOP_LABEL, 70, icons.debugStop, CONTEXT_FOCUSED_SESSION_IS_ATTACH.toNegated(), undefined, { id: DISCONNECT_ID, title: DISCONNECT_LABEL, icon: icons.debugDisconnect, precondition: ContextKeyExpr.and(CONTEXT_FOCUSED_SESSION_IS_ATTACH.toNegated(), CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED), });
registerDebugToolBarItem(DISCONNECT_ID, DISCONNECT_LABEL, 70, icons.debugDisconnect, CONTEXT_FOCUSED_SESSION_IS_ATTACH, undefined, { id: STOP_ID, title: STOP_LABEL, icon: icons.debugStop, precondition: ContextKeyExpr.and(CONTEXT_FOCUSED_SESSION_IS_ATTACH, CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED), });
registerDebugToolBarItem(STEP_OVER_ID, STEP_OVER_LABEL, 20, icons.debugStepOver, undefined, CONTEXT_DEBUG_STATE.isEqualTo('stopped'));
registerDebugToolBarItem(STEP_INTO_ID, STEP_INTO_LABEL, 30, icons.debugStepInto, undefined, CONTEXT_DEBUG_STATE.isEqualTo('stopped'));
registerDebugToolBarItem(STEP_OUT_ID, STEP_OUT_LABEL, 40, icons.debugStepOut, undefined, CONTEXT_DEBUG_STATE.isEqualTo('stopped'));
registerDebugToolBarItem(RESTART_SESSION_ID, RESTART_LABEL, 60, icons.debugRestart);
registerDebugToolBarItem(STEP_BACK_ID, localize('stepBackDebug', "Step Back"), 50, icons.debugStepBack, CONTEXT_STEP_BACK_SUPPORTED, CONTEXT_DEBUG_STATE.isEqualTo('stopped'));
registerDebugToolBarItem(REVERSE_CONTINUE_ID, localize('reverseContinue', "Reverse"), 55, icons.debugReverseContinue, CONTEXT_STEP_BACK_SUPPORTED, CONTEXT_DEBUG_STATE.isEqualTo('stopped'));
registerDebugToolBarItem(FOCUS_SESSION_ID, FOCUS_SESSION_LABEL, 100, Codicon.listTree, ContextKeyExpr.and(CONTEXT_MULTI_SESSION_DEBUG, CONTEXT_TOOLBAR_COMMAND_CENTER.negate()));
MenuRegistry.appendMenuItem(MenuId.DebugToolBarStop, {
    group: 'navigation',
    when: ContextKeyExpr.and(CONTEXT_FOCUSED_SESSION_IS_ATTACH.toNegated(), CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED),
    order: 0,
    command: {
        id: DISCONNECT_ID,
        title: DISCONNECT_LABEL,
        icon: icons.debugDisconnect
    }
});
MenuRegistry.appendMenuItem(MenuId.DebugToolBarStop, {
    group: 'navigation',
    when: ContextKeyExpr.and(CONTEXT_FOCUSED_SESSION_IS_ATTACH, CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED),
    order: 0,
    command: {
        id: STOP_ID,
        title: STOP_LABEL,
        icon: icons.debugStop
    }
});
MenuRegistry.appendMenuItem(MenuId.DebugToolBarStop, {
    group: 'navigation',
    when: ContextKeyExpr.or(ContextKeyExpr.and(CONTEXT_FOCUSED_SESSION_IS_ATTACH.toNegated(), CONTEXT_SUSPEND_DEBUGGEE_SUPPORTED, CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED), ContextKeyExpr.and(CONTEXT_FOCUSED_SESSION_IS_ATTACH, CONTEXT_SUSPEND_DEBUGGEE_SUPPORTED)),
    order: 0,
    command: {
        id: DISCONNECT_AND_SUSPEND_ID,
        title: DISCONNECT_AND_SUSPEND_LABEL,
        icon: icons.debugDisconnect
    }
});
