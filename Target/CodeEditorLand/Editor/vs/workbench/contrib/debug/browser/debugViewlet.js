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
import { DisposableStore, dispose } from '../../../../base/common/lifecycle.js';
import './media/debugViewlet.css';
import * as nls from '../../../../nls.js';
import { createActionViewItem } from '../../../../platform/actions/browser/menuEntryActionViewItem.js';
import { Action2, MenuId, MenuRegistry, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ContextKeyExpr, IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService, IContextViewService } from '../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IProgressService } from '../../../../platform/progress/common/progress.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { ViewPaneContainer, ViewsSubMenu } from '../../../browser/parts/views/viewPaneContainer.js';
import { WorkbenchStateContext } from '../../../common/contextkeys.js';
import { IViewDescriptorService } from '../../../common/views.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
import { FocusSessionActionViewItem, StartDebugActionViewItem } from './debugActionViewItems.js';
import { DEBUG_CONFIGURE_COMMAND_ID, DEBUG_CONFIGURE_LABEL, DEBUG_START_COMMAND_ID, DEBUG_START_LABEL, DISCONNECT_ID, FOCUS_SESSION_ID, SELECT_AND_START_ID, STOP_ID } from './debugCommands.js';
import { debugConfigure } from './debugIcons.js';
import { createDisconnectMenuItemAction } from './debugToolBar.js';
import { WelcomeView } from './welcomeView.js';
import { BREAKPOINTS_VIEW_ID, CONTEXT_DEBUGGERS_AVAILABLE, CONTEXT_DEBUG_STATE, CONTEXT_DEBUG_UX, CONTEXT_DEBUG_UX_KEY, getStateLabel, IDebugService, REPL_VIEW_ID, VIEWLET_ID } from '../common/debug.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.js';
let DebugViewPaneContainer = class DebugViewPaneContainer extends ViewPaneContainer {
    constructor(layoutService, telemetryService, progressService, debugService, instantiationService, contextService, storageService, themeService, contextMenuService, extensionService, configurationService, contextViewService, contextKeyService, viewDescriptorService) {
        super(VIEWLET_ID, { mergeViewWithContainerWhenSingleView: true }, instantiationService, configurationService, layoutService, contextMenuService, telemetryService, extensionService, themeService, storageService, contextService, viewDescriptorService);
        this.progressService = progressService;
        this.debugService = debugService;
        this.contextViewService = contextViewService;
        this.contextKeyService = contextKeyService;
        this.paneListeners = new Map();
        this.stopActionViewItemDisposables = this._register(new DisposableStore());
        this._register(this.debugService.onDidChangeState(state => this.onDebugServiceStateChange(state)));
        this._register(this.contextKeyService.onDidChangeContext(e => {
            if (e.affectsSome(new Set([CONTEXT_DEBUG_UX_KEY, 'inDebugMode']))) {
                this.updateTitleArea();
            }
        }));
        this._register(this.contextService.onDidChangeWorkbenchState(() => this.updateTitleArea()));
        this._register(this.configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('debug.toolBarLocation') || e.affectsConfiguration('debug.hideLauncherWhileDebugging')) {
                this.updateTitleArea();
            }
        }));
    }
    create(parent) {
        super.create(parent);
        parent.classList.add('debug-viewlet');
    }
    focus() {
        super.focus();
        if (this.startDebugActionViewItem) {
            this.startDebugActionViewItem.focus();
        }
        else {
            this.focusView(WelcomeView.ID);
        }
    }
    getActionViewItem(action, options) {
        if (action.id === DEBUG_START_COMMAND_ID) {
            this.startDebugActionViewItem = this.instantiationService.createInstance(StartDebugActionViewItem, null, action, options);
            return this.startDebugActionViewItem;
        }
        if (action.id === FOCUS_SESSION_ID) {
            return new FocusSessionActionViewItem(action, undefined, this.debugService, this.contextViewService, this.configurationService);
        }
        if (action.id === STOP_ID || action.id === DISCONNECT_ID) {
            this.stopActionViewItemDisposables.clear();
            const item = this.instantiationService.invokeFunction(accessor => createDisconnectMenuItemAction(action, this.stopActionViewItemDisposables, accessor, { hoverDelegate: options.hoverDelegate }));
            if (item) {
                return item;
            }
        }
        return createActionViewItem(this.instantiationService, action, options);
    }
    focusView(id) {
        const view = this.getView(id);
        if (view) {
            view.focus();
        }
    }
    onDebugServiceStateChange(state) {
        if (this.progressResolve) {
            this.progressResolve();
            this.progressResolve = undefined;
        }
        if (state === 1) {
            this.progressService.withProgress({ location: VIEWLET_ID, }, _progress => {
                return new Promise(resolve => this.progressResolve = resolve);
            });
        }
    }
    addPanes(panes) {
        super.addPanes(panes);
        for (const { pane: pane } of panes) {
            if (pane.id === BREAKPOINTS_VIEW_ID) {
                this.breakpointView = pane;
                this.updateBreakpointsMaxSize();
            }
            else {
                this.paneListeners.set(pane.id, pane.onDidChange(() => this.updateBreakpointsMaxSize()));
            }
        }
    }
    removePanes(panes) {
        super.removePanes(panes);
        for (const pane of panes) {
            dispose(this.paneListeners.get(pane.id));
            this.paneListeners.delete(pane.id);
        }
    }
    updateBreakpointsMaxSize() {
        if (this.breakpointView) {
            const allOtherCollapsed = this.panes.every(view => !view.isExpanded() || view === this.breakpointView);
            this.breakpointView.maximumBodySize = allOtherCollapsed ? Number.POSITIVE_INFINITY : this.breakpointView.minimumBodySize;
        }
    }
};
DebugViewPaneContainer = __decorate([
    __param(0, IWorkbenchLayoutService),
    __param(1, ITelemetryService),
    __param(2, IProgressService),
    __param(3, IDebugService),
    __param(4, IInstantiationService),
    __param(5, IWorkspaceContextService),
    __param(6, IStorageService),
    __param(7, IThemeService),
    __param(8, IContextMenuService),
    __param(9, IExtensionService),
    __param(10, IConfigurationService),
    __param(11, IContextViewService),
    __param(12, IContextKeyService),
    __param(13, IViewDescriptorService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], DebugViewPaneContainer);
export { DebugViewPaneContainer };
MenuRegistry.appendMenuItem(MenuId.ViewContainerTitle, {
    when: ContextKeyExpr.and(ContextKeyExpr.equals('viewContainer', VIEWLET_ID), CONTEXT_DEBUG_UX.notEqualsTo('simple'), WorkbenchStateContext.notEqualsTo('empty'), ContextKeyExpr.or(CONTEXT_DEBUG_STATE.isEqualTo('inactive'), ContextKeyExpr.notEquals('config.debug.toolBarLocation', 'docked')), ContextKeyExpr.or(ContextKeyExpr.not('config.debug.hideLauncherWhileDebugging'), ContextKeyExpr.not('inDebugMode'))),
    order: 10,
    group: 'navigation',
    command: {
        precondition: CONTEXT_DEBUG_STATE.notEqualsTo(getStateLabel(1)),
        id: DEBUG_START_COMMAND_ID,
        title: DEBUG_START_LABEL
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: DEBUG_CONFIGURE_COMMAND_ID,
            title: {
                value: DEBUG_CONFIGURE_LABEL,
                original: 'Open \'launch.json\'',
                mnemonicTitle: nls.localize({ key: 'miOpenConfigurations', comment: ['&& denotes a mnemonic'] }, "Open &&Configurations")
            },
            metadata: {
                description: nls.localize2('openLaunchConfigDescription', 'Opens the file used to configure how your program is debugged')
            },
            f1: true,
            icon: debugConfigure,
            precondition: CONTEXT_DEBUG_UX.notEqualsTo('simple'),
            menu: [{
                    id: MenuId.ViewContainerTitle,
                    group: 'navigation',
                    order: 20,
                    when: ContextKeyExpr.and(ContextKeyExpr.equals('viewContainer', VIEWLET_ID), CONTEXT_DEBUG_UX.notEqualsTo('simple'), WorkbenchStateContext.notEqualsTo('empty'), ContextKeyExpr.or(CONTEXT_DEBUG_STATE.isEqualTo('inactive'), ContextKeyExpr.notEquals('config.debug.toolBarLocation', 'docked')))
                }, {
                    id: MenuId.ViewContainerTitle,
                    order: 20,
                    when: ContextKeyExpr.and(ContextKeyExpr.equals('viewContainer', VIEWLET_ID), CONTEXT_DEBUG_STATE.notEqualsTo('inactive'), ContextKeyExpr.equals('config.debug.toolBarLocation', 'docked'))
                }, {
                    id: MenuId.MenubarDebugMenu,
                    group: '2_configuration',
                    order: 1,
                    when: CONTEXT_DEBUGGERS_AVAILABLE
                }]
        });
    }
    async run(accessor) {
        const debugService = accessor.get(IDebugService);
        const quickInputService = accessor.get(IQuickInputService);
        const configurationManager = debugService.getConfigurationManager();
        let launch;
        if (configurationManager.selectedConfiguration.name) {
            launch = configurationManager.selectedConfiguration.launch;
        }
        else {
            const launches = configurationManager.getLaunches().filter(l => !l.hidden);
            if (launches.length === 1) {
                launch = launches[0];
            }
            else {
                const picks = launches.map(l => ({ label: l.name, launch: l }));
                const picked = await quickInputService.pick(picks, {
                    activeItem: picks[0],
                    placeHolder: nls.localize({ key: 'selectWorkspaceFolder', comment: ['User picks a workspace folder or a workspace configuration file here. Workspace configuration files can contain settings and thus a launch.json configuration can be written into one.'] }, "Select a workspace folder to create a launch.json file in or add it to the workspace config file")
                });
                if (picked) {
                    launch = picked.launch;
                }
            }
        }
        if (launch) {
            await launch.openConfigFile({ preserveFocus: false });
        }
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'debug.toggleReplIgnoreFocus',
            title: nls.localize('debugPanel', "Debug Console"),
            toggled: ContextKeyExpr.has(`view.${REPL_VIEW_ID}.visible`),
            menu: [{
                    id: ViewsSubMenu,
                    group: '3_toggleRepl',
                    order: 30,
                    when: ContextKeyExpr.and(ContextKeyExpr.equals('viewContainer', VIEWLET_ID))
                }]
        });
    }
    async run(accessor) {
        const viewsService = accessor.get(IViewsService);
        if (viewsService.isViewVisible(REPL_VIEW_ID)) {
            viewsService.closeView(REPL_VIEW_ID);
        }
        else {
            await viewsService.openView(REPL_VIEW_ID);
        }
    }
});
MenuRegistry.appendMenuItem(MenuId.ViewContainerTitle, {
    when: ContextKeyExpr.and(ContextKeyExpr.equals('viewContainer', VIEWLET_ID), CONTEXT_DEBUG_STATE.notEqualsTo('inactive'), ContextKeyExpr.or(ContextKeyExpr.equals('config.debug.toolBarLocation', 'docked'), ContextKeyExpr.has('config.debug.hideLauncherWhileDebugging'))),
    order: 10,
    command: {
        id: SELECT_AND_START_ID,
        title: nls.localize('startAdditionalSession', "Start Additional Session"),
    }
});
