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
import * as nls from '../../../../nls.js';
import * as dom from '../../../../base/browser/dom.js';
import { Action } from '../../../../base/common/actions.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextMenuService, IContextViewService } from '../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IThemeService, Themable } from '../../../../platform/theme/common/themeService.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { switchTerminalActionViewItemSeparator, switchTerminalShowTabsTitle } from './terminalActions.js';
import { INotificationService, Severity } from '../../../../platform/notification/common/notification.js';
import { ITerminalConfigurationService, ITerminalGroupService, ITerminalService } from './terminal.js';
import { ViewPane } from '../../../browser/parts/views/viewPane.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IViewDescriptorService } from '../../../common/views.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IMenuService, MenuId, MenuItemAction } from '../../../../platform/actions/common/actions.js';
import { ITerminalProfileResolverService, ITerminalProfileService } from '../common/terminal.js';
import { TerminalLocation } from '../../../../platform/terminal/common/terminal.js';
import { ActionViewItem, SelectActionViewItem } from '../../../../base/browser/ui/actionbar/actionViewItems.js';
import { asCssVariable, selectBorder } from '../../../../platform/theme/common/colorRegistry.js';
import { TerminalTabbedView } from './terminalTabbedView.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { renderLabelWithIcons } from '../../../../base/browser/ui/iconLabel/iconLabels.js';
import { getColorForSeverity } from './terminalStatusList.js';
import { createAndFillInContextMenuActions, MenuEntryActionViewItem } from '../../../../platform/actions/browser/menuEntryActionViewItem.js';
import { DropdownWithPrimaryActionViewItem } from '../../../../platform/actions/browser/dropdownWithPrimaryActionViewItem.js';
import { DisposableStore, dispose, MutableDisposable, toDisposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { ColorScheme } from '../../../../platform/theme/common/theme.js';
import { getColorClass, getUriClasses } from './terminalIcon.js';
import { getTerminalActionBarArgs } from './terminalMenus.js';
import { TerminalContextKeys } from '../common/terminalContextKey.js';
import { getInstanceHoverInfo } from './terminalTooltip.js';
import { defaultSelectBoxStyles } from '../../../../platform/theme/browser/defaultStyles.js';
import { Event } from '../../../../base/common/event.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.js';
import { InstanceContext, TerminalContextActionRunner } from './terminalContextMenu.js';
import { MicrotaskDelay } from '../../../../base/common/symbols.js';
let TerminalViewPane = class TerminalViewPane extends ViewPane {
    get terminalTabbedView() { return this._terminalTabbedView; }
    constructor(options, keybindingService, _contextKeyService, viewDescriptorService, _configurationService, _contextMenuService, _instantiationService, _terminalService, _terminalConfigurationService, _terminalGroupService, themeService, telemetryService, hoverService, _notificationService, _keybindingService, openerService, _menuService, _terminalProfileService, _terminalProfileResolverService, _themeService, _accessibilityService) {
        super(options, keybindingService, _contextMenuService, _configurationService, _contextKeyService, viewDescriptorService, _instantiationService, openerService, themeService, telemetryService, hoverService);
        this._contextKeyService = _contextKeyService;
        this._configurationService = _configurationService;
        this._contextMenuService = _contextMenuService;
        this._instantiationService = _instantiationService;
        this._terminalService = _terminalService;
        this._terminalConfigurationService = _terminalConfigurationService;
        this._terminalGroupService = _terminalGroupService;
        this._notificationService = _notificationService;
        this._keybindingService = _keybindingService;
        this._menuService = _menuService;
        this._terminalProfileService = _terminalProfileService;
        this._terminalProfileResolverService = _terminalProfileResolverService;
        this._themeService = _themeService;
        this._accessibilityService = _accessibilityService;
        this._isInitialized = false;
        this._newDropdown = this._register(new MutableDisposable());
        this._disposableStore = this._register(new DisposableStore());
        this._register(this._terminalService.onDidRegisterProcessSupport(() => {
            this._onDidChangeViewWelcomeState.fire();
        }));
        this._register(this._terminalService.onDidChangeInstances(() => {
            if (this._hasWelcomeScreen() && this._terminalGroupService.instances.length <= 1) {
                this._onDidChangeViewWelcomeState.fire();
            }
            if (!this._parentDomElement) {
                return;
            }
            if (!this._terminalTabbedView) {
                this._createTabsView();
            }
            if (this._terminalGroupService.instances.length === 1) {
                this.layoutBody(this._parentDomElement.offsetHeight, this._parentDomElement.offsetWidth);
            }
        }));
        this._dropdownMenu = this._register(this._menuService.createMenu(MenuId.TerminalNewDropdownContext, this._contextKeyService));
        this._singleTabMenu = this._register(this._menuService.createMenu(MenuId.TerminalTabContext, this._contextKeyService));
        this._register(this._terminalProfileService.onDidChangeAvailableProfiles(profiles => this._updateTabActionBar(profiles)));
        this._viewShowing = TerminalContextKeys.viewShowing.bindTo(this._contextKeyService);
        this._register(this.onDidChangeBodyVisibility(e => {
            if (e) {
                this._terminalTabbedView?.rerenderTabs();
            }
        }));
        this._register(this._configurationService.onDidChangeConfiguration(e => {
            if (this._parentDomElement && (e.affectsConfiguration("terminal.integrated.shellIntegration.decorationsEnabled") || e.affectsConfiguration("terminal.integrated.shellIntegration.enabled"))) {
                this._updateForShellIntegration(this._parentDomElement);
            }
        }));
        this._register(this._terminalService.onDidCreateInstance((i) => {
            i.capabilities.onDidAddCapabilityType(c => {
                if (c === 2 && this._gutterDecorationsEnabled()) {
                    this._parentDomElement?.classList.add('shell-integration');
                }
            });
        }));
    }
    _updateForShellIntegration(container) {
        container.classList.toggle('shell-integration', this._gutterDecorationsEnabled());
    }
    _gutterDecorationsEnabled() {
        const decorationsEnabled = this._configurationService.getValue("terminal.integrated.shellIntegration.decorationsEnabled");
        return (decorationsEnabled === 'both' || decorationsEnabled === 'gutter') && this._configurationService.getValue("terminal.integrated.shellIntegration.enabled");
    }
    _initializeTerminal(checkRestoredTerminals) {
        if (this.isBodyVisible() && this._terminalService.isProcessSupportRegistered && this._terminalService.connectionState === 1) {
            const wasInitialized = this._isInitialized;
            this._isInitialized = true;
            let hideOnStartup = 'never';
            if (!wasInitialized) {
                hideOnStartup = this._configurationService.getValue("terminal.integrated.hideOnStartup");
                if (hideOnStartup === 'always') {
                    this._terminalGroupService.hidePanel();
                }
            }
            let shouldCreate = this._terminalGroupService.groups.length === 0;
            if (checkRestoredTerminals) {
                shouldCreate &&= this._terminalService.restoredGroupCount === 0;
            }
            if (!shouldCreate) {
                return;
            }
            if (!wasInitialized) {
                switch (hideOnStartup) {
                    case 'never':
                        this._terminalService.createTerminal({ location: TerminalLocation.Panel });
                        break;
                    case 'whenEmpty':
                        if (this._terminalService.restoredGroupCount === 0) {
                            this._terminalGroupService.hidePanel();
                        }
                        break;
                }
                return;
            }
            this._terminalService.createTerminal({ location: TerminalLocation.Panel });
        }
    }
    renderBody(container) {
        super.renderBody(container);
        if (!this._parentDomElement) {
            this._updateForShellIntegration(container);
        }
        this._parentDomElement = container;
        this._parentDomElement.classList.add('integrated-terminal');
        dom.createStyleSheet(this._parentDomElement);
        this._instantiationService.createInstance(TerminalThemeIconStyle, this._parentDomElement);
        if (!this.shouldShowWelcome()) {
            this._createTabsView();
        }
        this._register(this.configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration("terminal.integrated.fontFamily") || e.affectsConfiguration('editor.fontFamily')) {
                if (!this._terminalConfigurationService.configFontIsMonospace()) {
                    const choices = [{
                            label: nls.localize('terminal.useMonospace', "Use 'monospace'"),
                            run: () => this.configurationService.updateValue("terminal.integrated.fontFamily", 'monospace'),
                        }];
                    this._notificationService.prompt(Severity.Warning, nls.localize('terminal.monospaceOnly', "The terminal only supports monospace fonts. Be sure to restart VS Code if this is a newly installed font."), choices);
                }
            }
        }));
        this._register(this.onDidChangeBodyVisibility(async (visible) => {
            this._viewShowing.set(visible);
            if (visible) {
                if (this._hasWelcomeScreen()) {
                    this._onDidChangeViewWelcomeState.fire();
                }
                this._initializeTerminal(false);
                this._terminalGroupService.showPanel(false);
            }
            else {
                for (const instance of this._terminalGroupService.instances) {
                    instance.resetFocusContextKey();
                }
            }
            this._terminalGroupService.updateVisibility();
        }));
        this._register(this._terminalService.onDidChangeConnectionState(() => this._initializeTerminal(true)));
        this.layoutBody(this._parentDomElement.offsetHeight, this._parentDomElement.offsetWidth);
    }
    _createTabsView() {
        if (!this._parentDomElement) {
            return;
        }
        this._terminalTabbedView = this._register(this.instantiationService.createInstance(TerminalTabbedView, this._parentDomElement));
    }
    layoutBody(height, width) {
        super.layoutBody(height, width);
        this._terminalTabbedView?.layout(width, height);
    }
    getActionViewItem(action, options) {
        switch (action.id) {
            case "workbench.action.terminal.split": {
                const that = this;
                const panelOnlySplitAction = new class extends Action {
                    constructor() {
                        super(action.id, action.label, action.class, action.enabled);
                        this.checked = action.checked;
                        this.tooltip = action.tooltip;
                        this._register(action);
                    }
                    async run() {
                        const instance = that._terminalGroupService.activeInstance;
                        if (instance) {
                            const newInstance = await that._terminalService.createTerminal({ location: { parentTerminal: instance } });
                            return newInstance?.focusWhenReady();
                        }
                        return;
                    }
                };
                return new ActionViewItem(action, panelOnlySplitAction, { ...options, icon: true, label: false, keybinding: this._getKeybindingLabel(action) });
            }
            case "workbench.action.terminal.switchTerminal": {
                return this._instantiationService.createInstance(SwitchTerminalActionViewItem, action);
            }
            case "workbench.action.terminal.focus": {
                if (action instanceof MenuItemAction) {
                    const actions = [];
                    createAndFillInContextMenuActions(this._singleTabMenu, { shouldForwardArgs: true }, actions);
                    return this._instantiationService.createInstance(SingleTerminalTabActionViewItem, action, actions);
                }
            }
            case "workbench.action.terminal.new": {
                if (action instanceof MenuItemAction) {
                    const actions = getTerminalActionBarArgs(TerminalLocation.Panel, this._terminalProfileService.availableProfiles, this._getDefaultProfileName(), this._terminalProfileService.contributedProfiles, this._terminalService, this._dropdownMenu);
                    this._registerDisposableActions(actions.dropdownAction, actions.dropdownMenuActions);
                    this._newDropdown.value = new DropdownWithPrimaryActionViewItem(action, actions.dropdownAction, actions.dropdownMenuActions, actions.className, { hoverDelegate: options.hoverDelegate }, this._contextMenuService, this._keybindingService, this._notificationService, this._contextKeyService, this._themeService, this._accessibilityService);
                    this._newDropdown.value?.update(actions.dropdownAction, actions.dropdownMenuActions);
                    return this._newDropdown.value;
                }
            }
        }
        return super.getActionViewItem(action, options);
    }
    _registerDisposableActions(dropdownAction, dropdownMenuActions) {
        this._disposableStore.clear();
        if (dropdownAction instanceof Action) {
            this._disposableStore.add(dropdownAction);
        }
        dropdownMenuActions.filter(a => a instanceof Action).forEach(a => this._disposableStore.add(a));
    }
    _getDefaultProfileName() {
        let defaultProfileName;
        try {
            defaultProfileName = this._terminalProfileService.getDefaultProfileName();
        }
        catch (e) {
            defaultProfileName = this._terminalProfileResolverService.defaultProfileName;
        }
        return defaultProfileName;
    }
    _getKeybindingLabel(action) {
        return this._keybindingService.lookupKeybinding(action.id)?.getLabel() ?? undefined;
    }
    _updateTabActionBar(profiles) {
        const actions = getTerminalActionBarArgs(TerminalLocation.Panel, profiles, this._getDefaultProfileName(), this._terminalProfileService.contributedProfiles, this._terminalService, this._dropdownMenu);
        this._registerDisposableActions(actions.dropdownAction, actions.dropdownMenuActions);
        this._newDropdown.value?.update(actions.dropdownAction, actions.dropdownMenuActions);
    }
    focus() {
        super.focus();
        if (this._terminalService.connectionState === 1) {
            this._terminalGroupService.showPanel(true);
            return;
        }
        const previousActiveElement = this.element.ownerDocument.activeElement;
        if (previousActiveElement) {
            this._register(this._terminalService.onDidChangeConnectionState(() => {
                if (previousActiveElement && dom.isActiveElement(previousActiveElement)) {
                    this._terminalGroupService.showPanel(true);
                }
            }));
        }
    }
    _hasWelcomeScreen() {
        return !this._terminalService.isProcessSupportRegistered;
    }
    shouldShowWelcome() {
        return this._hasWelcomeScreen() && this._terminalService.instances.length === 0;
    }
};
TerminalViewPane = __decorate([
    __param(1, IKeybindingService),
    __param(2, IContextKeyService),
    __param(3, IViewDescriptorService),
    __param(4, IConfigurationService),
    __param(5, IContextMenuService),
    __param(6, IInstantiationService),
    __param(7, ITerminalService),
    __param(8, ITerminalConfigurationService),
    __param(9, ITerminalGroupService),
    __param(10, IThemeService),
    __param(11, ITelemetryService),
    __param(12, IHoverService),
    __param(13, INotificationService),
    __param(14, IKeybindingService),
    __param(15, IOpenerService),
    __param(16, IMenuService),
    __param(17, ITerminalProfileService),
    __param(18, ITerminalProfileResolverService),
    __param(19, IThemeService),
    __param(20, IAccessibilityService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], TerminalViewPane);
export { TerminalViewPane };
let SwitchTerminalActionViewItem = class SwitchTerminalActionViewItem extends SelectActionViewItem {
    constructor(action, _terminalService, _terminalGroupService, contextViewService, terminalProfileService) {
        super(null, action, getTerminalSelectOpenItems(_terminalService, _terminalGroupService), _terminalGroupService.activeGroupIndex, contextViewService, defaultSelectBoxStyles, { ariaLabel: nls.localize('terminals', 'Open Terminals.'), optionsAsChildren: true });
        this._terminalService = _terminalService;
        this._terminalGroupService = _terminalGroupService;
        this._register(_terminalService.onDidChangeInstances(() => this._updateItems(), this));
        this._register(_terminalService.onDidChangeActiveGroup(() => this._updateItems(), this));
        this._register(_terminalService.onDidChangeActiveInstance(() => this._updateItems(), this));
        this._register(_terminalService.onAnyInstanceTitleChange(() => this._updateItems(), this));
        this._register(_terminalGroupService.onDidChangeGroups(() => this._updateItems(), this));
        this._register(_terminalService.onDidChangeConnectionState(() => this._updateItems(), this));
        this._register(terminalProfileService.onDidChangeAvailableProfiles(() => this._updateItems(), this));
        this._register(_terminalService.onAnyInstancePrimaryStatusChange(() => this._updateItems(), this));
    }
    render(container) {
        super.render(container);
        container.classList.add('switch-terminal');
        container.style.borderColor = asCssVariable(selectBorder);
    }
    _updateItems() {
        const options = getTerminalSelectOpenItems(this._terminalService, this._terminalGroupService);
        this.setOptions(options, this._terminalGroupService.activeGroupIndex);
    }
};
SwitchTerminalActionViewItem = __decorate([
    __param(1, ITerminalService),
    __param(2, ITerminalGroupService),
    __param(3, IContextViewService),
    __param(4, ITerminalProfileService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], SwitchTerminalActionViewItem);
function getTerminalSelectOpenItems(terminalService, terminalGroupService) {
    let items;
    if (terminalService.connectionState === 1) {
        items = terminalGroupService.getGroupLabels().map(label => {
            return { text: label };
        });
    }
    else {
        items = [{ text: nls.localize('terminalConnectingLabel', "Starting...") }];
    }
    items.push({ text: switchTerminalActionViewItemSeparator, isDisabled: true });
    items.push({ text: switchTerminalShowTabsTitle });
    return items;
}
let SingleTerminalTabActionViewItem = class SingleTerminalTabActionViewItem extends MenuEntryActionViewItem {
    constructor(action, _actions, keybindingService, notificationService, contextKeyService, themeService, _terminalService, _terminaConfigurationService, _terminalGroupService, contextMenuService, _commandService, _instantiationService, _accessibilityService) {
        super(action, {
            draggable: true,
            hoverDelegate: _instantiationService.createInstance(SingleTabHoverDelegate)
        }, keybindingService, notificationService, contextKeyService, themeService, contextMenuService, _accessibilityService);
        this._actions = _actions;
        this._terminalService = _terminalService;
        this._terminaConfigurationService = _terminaConfigurationService;
        this._terminalGroupService = _terminalGroupService;
        this._commandService = _commandService;
        this._instantiationService = _instantiationService;
        this._elementDisposables = [];
        this._register(Event.debounce(Event.any(this._terminalService.onAnyInstancePrimaryStatusChange, this._terminalGroupService.onDidChangeActiveInstance, Event.map(this._terminalService.onAnyInstanceIconChange, e => e.instance), this._terminalService.onAnyInstanceTitleChange, this._terminalService.onDidChangeInstanceCapability), (last, e) => {
            if (!last) {
                last = new Set();
            }
            if (e) {
                last.add(e);
            }
            return last;
        }, MicrotaskDelay)(merged => {
            for (const e of merged) {
                this.updateLabel(e);
            }
        }));
        this._register(toDisposable(() => dispose(this._elementDisposables)));
    }
    async onClick(event) {
        this._terminalGroupService.lastAccessedMenu = 'inline-tab';
        if (event.altKey && this._menuItemAction.alt) {
            this._commandService.executeCommand(this._menuItemAction.alt.id, { location: TerminalLocation.Panel });
        }
        else {
            this._openContextMenu();
        }
    }
    updateLabel(e) {
        if (e && e !== this._terminalGroupService.activeInstance) {
            return;
        }
        if (this._elementDisposables.length === 0 && this.element && this.label) {
            this._elementDisposables.push(dom.addDisposableListener(this.element, dom.EventType.CONTEXT_MENU, e => {
                if (e.button === 2) {
                    this._openContextMenu();
                    e.preventDefault();
                }
            }));
            this._elementDisposables.push(dom.addDisposableListener(this.element, dom.EventType.AUXCLICK, e => {
                if (e.button === 1) {
                    const instance = this._terminalGroupService.activeInstance;
                    if (instance) {
                        this._terminalService.safeDisposeTerminal(instance);
                    }
                    e.preventDefault();
                }
            }));
            this._elementDisposables.push(dom.addDisposableListener(this.element, dom.EventType.DRAG_START, e => {
                const instance = this._terminalGroupService.activeInstance;
                if (e.dataTransfer && instance) {
                    e.dataTransfer.setData("Terminals", JSON.stringify([instance.resource.toString()]));
                }
            }));
        }
        if (this.label) {
            const label = this.label;
            const instance = this._terminalGroupService.activeInstance;
            if (!instance) {
                dom.reset(label, '');
                return;
            }
            label.classList.add('single-terminal-tab');
            let colorStyle = '';
            const primaryStatus = instance.statusList.primary;
            if (primaryStatus) {
                const colorKey = getColorForSeverity(primaryStatus.severity);
                this._themeService.getColorTheme();
                const foundColor = this._themeService.getColorTheme().getColor(colorKey);
                if (foundColor) {
                    colorStyle = foundColor.toString();
                }
            }
            label.style.color = colorStyle;
            dom.reset(label, ...renderLabelWithIcons(this._instantiationService.invokeFunction(getSingleTabLabel, instance, this._terminaConfigurationService.config.tabs.separator, ThemeIcon.isThemeIcon(this._commandAction.item.icon) ? this._commandAction.item.icon : undefined)));
            if (this._altCommand) {
                label.classList.remove(this._altCommand);
                this._altCommand = undefined;
            }
            if (this._color) {
                label.classList.remove(this._color);
                this._color = undefined;
            }
            if (this._class) {
                label.classList.remove(this._class);
                label.classList.remove('terminal-uri-icon');
                this._class = undefined;
            }
            const colorClass = getColorClass(instance);
            if (colorClass) {
                this._color = colorClass;
                label.classList.add(colorClass);
            }
            const uriClasses = getUriClasses(instance, this._themeService.getColorTheme().type);
            if (uriClasses) {
                this._class = uriClasses?.[0];
                label.classList.add(...uriClasses);
            }
            if (this._commandAction.item.icon) {
                this._altCommand = `alt-command`;
                label.classList.add(this._altCommand);
            }
            this.updateTooltip();
        }
    }
    _openContextMenu() {
        this._contextMenuService.showContextMenu({
            actionRunner: new TerminalContextActionRunner(),
            getAnchor: () => this.element,
            getActions: () => this._actions,
            getActionsContext: () => {
                const instance = this._terminalGroupService.activeInstance;
                return instance ? [new InstanceContext(instance)] : [];
            }
        });
    }
};
SingleTerminalTabActionViewItem = __decorate([
    __param(2, IKeybindingService),
    __param(3, INotificationService),
    __param(4, IContextKeyService),
    __param(5, IThemeService),
    __param(6, ITerminalService),
    __param(7, ITerminalConfigurationService),
    __param(8, ITerminalGroupService),
    __param(9, IContextMenuService),
    __param(10, ICommandService),
    __param(11, IInstantiationService),
    __param(12, IAccessibilityService),
    __metadata("design:paramtypes", [MenuItemAction, Array, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], SingleTerminalTabActionViewItem);
function getSingleTabLabel(accessor, instance, separator, icon) {
    if (!instance || !instance.title) {
        return '';
    }
    const iconId = ThemeIcon.isThemeIcon(instance.icon) ? instance.icon.id : accessor.get(ITerminalProfileResolverService).getDefaultIcon().id;
    const label = `$(${icon?.id || iconId}) ${getSingleTabTitle(instance, separator)}`;
    const primaryStatus = instance.statusList.primary;
    if (!primaryStatus?.icon) {
        return label;
    }
    return `${label} $(${primaryStatus.icon.id})`;
}
function getSingleTabTitle(instance, separator) {
    if (!instance) {
        return '';
    }
    return !instance.description ? instance.title : `${instance.title} ${separator} ${instance.description}`;
}
let TerminalThemeIconStyle = class TerminalThemeIconStyle extends Themable {
    constructor(container, _themeService, _terminalService, _terminalGroupService) {
        super(_themeService);
        this._themeService = _themeService;
        this._terminalService = _terminalService;
        this._terminalGroupService = _terminalGroupService;
        this._registerListeners();
        this._styleElement = dom.createStyleSheet(container);
        this._register(toDisposable(() => this._styleElement.remove()));
        this.updateStyles();
    }
    _registerListeners() {
        this._register(this._terminalService.onAnyInstanceIconChange(() => this.updateStyles()));
        this._register(this._terminalService.onDidChangeInstances(() => this.updateStyles()));
        this._register(this._terminalGroupService.onDidChangeGroups(() => this.updateStyles()));
    }
    updateStyles() {
        super.updateStyles();
        const colorTheme = this._themeService.getColorTheme();
        let css = '';
        for (const instance of this._terminalService.instances) {
            const icon = instance.icon;
            if (!icon) {
                continue;
            }
            let uri = undefined;
            if (icon instanceof URI) {
                uri = icon;
            }
            else if (icon instanceof Object && 'light' in icon && 'dark' in icon) {
                uri = colorTheme.type === ColorScheme.LIGHT ? icon.light : icon.dark;
            }
            const iconClasses = getUriClasses(instance, colorTheme.type);
            if (uri instanceof URI && iconClasses && iconClasses.length > 1) {
                css += (`.monaco-workbench .${iconClasses[0]} .monaco-highlighted-label .codicon, .monaco-action-bar .terminal-uri-icon.single-terminal-tab.action-label:not(.alt-command) .codicon` +
                    `{background-image: ${dom.asCSSUrl(uri)};}`);
            }
        }
        for (const instance of this._terminalService.instances) {
            const colorClass = getColorClass(instance);
            if (!colorClass || !instance.color) {
                continue;
            }
            const color = colorTheme.getColor(instance.color);
            if (color) {
                css += (`.monaco-workbench .${colorClass} .codicon:first-child:not(.codicon-split-horizontal):not(.codicon-trashcan):not(.file-icon)` +
                    `{ color: ${color} !important; }`);
            }
        }
        this._styleElement.textContent = css;
    }
};
TerminalThemeIconStyle = __decorate([
    __param(1, IThemeService),
    __param(2, ITerminalService),
    __param(3, ITerminalGroupService),
    __metadata("design:paramtypes", [HTMLElement, Object, Object, Object])
], TerminalThemeIconStyle);
let SingleTabHoverDelegate = class SingleTabHoverDelegate {
    constructor(_configurationService, _hoverService, _terminalGroupService) {
        this._configurationService = _configurationService;
        this._hoverService = _hoverService;
        this._terminalGroupService = _terminalGroupService;
        this._lastHoverHideTime = 0;
        this.placement = 'element';
    }
    get delay() {
        return Date.now() - this._lastHoverHideTime < 200
            ? 0
            : this._configurationService.getValue('workbench.hover.delay');
    }
    showHover(options, focus) {
        const instance = this._terminalGroupService.activeInstance;
        if (!instance) {
            return;
        }
        const hoverInfo = getInstanceHoverInfo(instance);
        return this._hoverService.showHover({
            ...options,
            content: hoverInfo.content,
            actions: hoverInfo.actions
        }, focus);
    }
    onDidHideHover() {
        this._lastHoverHideTime = Date.now();
    }
};
SingleTabHoverDelegate = __decorate([
    __param(0, IConfigurationService),
    __param(1, IHoverService),
    __param(2, ITerminalGroupService),
    __metadata("design:paramtypes", [Object, Object, Object])
], SingleTabHoverDelegate);
