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
import './media/remoteViewlet.css';
import * as nls from '../../../../nls.js';
import * as dom from '../../../../base/browser/dom.js';
import { URI } from '../../../../base/common/uri.js';
import { IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IExtensionService, isProposedApiEnabled } from '../../../services/extensions/common/extensions.js';
import { FilterViewPaneContainer } from '../../../browser/parts/views/viewsViewlet.js';
import { VIEWLET_ID } from './remoteExplorer.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { Extensions, IViewDescriptorService } from '../../../common/views.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IProgressService } from '../../../../platform/progress/common/progress.js';
import { IRemoteAgentService } from '../../../services/remote/common/remoteAgentService.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import Severity from '../../../../base/common/severity.js';
import { ReloadWindowAction } from '../../../browser/actions/windowActions.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { SwitchRemoteViewItem } from './explorerViewItems.js';
import { isStringArray } from '../../../../base/common/types.js';
import { IRemoteExplorerService } from '../../../services/remote/common/remoteExplorerService.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { ViewPane } from '../../../browser/parts/views/viewPane.js';
import { WorkbenchAsyncDataTree } from '../../../../platform/list/browser/listService.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { Event, Emitter } from '../../../../base/common/event.js';
import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.js';
import * as icons from './remoteIcons.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { ITimerService } from '../../../services/timer/browser/timerService.js';
import { getRemoteName } from '../../../../platform/remote/common/remoteHosts.js';
import { getVirtualWorkspaceLocation } from '../../../../platform/workspace/common/virtualWorkspace.js';
import { IWalkthroughsService } from '../../welcomeGettingStarted/browser/gettingStartedService.js';
import { Schemas } from '../../../../base/common/network.js';
import { mainWindow } from '../../../../base/browser/window.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
class HelpTreeVirtualDelegate {
    getHeight(element) {
        return 22;
    }
    getTemplateId(element) {
        return 'HelpItemTemplate';
    }
}
class HelpTreeRenderer {
    constructor() {
        this.templateId = 'HelpItemTemplate';
    }
    renderTemplate(container) {
        container.classList.add('remote-help-tree-node-item');
        const icon = dom.append(container, dom.$('.remote-help-tree-node-item-icon'));
        const parent = container;
        return { parent, icon };
    }
    renderElement(element, index, templateData, height) {
        const container = templateData.parent;
        dom.append(container, templateData.icon);
        templateData.icon.classList.add(...element.element.iconClasses);
        const labelContainer = dom.append(container, dom.$('.help-item-label'));
        labelContainer.innerText = element.element.label;
    }
    disposeTemplate(templateData) {
    }
}
class HelpDataSource {
    hasChildren(element) {
        return element instanceof HelpModel;
    }
    getChildren(element) {
        if (element instanceof HelpModel && element.items) {
            return element.items;
        }
        return [];
    }
}
class HelpModel {
    constructor(viewModel, openerService, quickInputService, commandService, remoteExplorerService, environmentService, workspaceContextService, walkthroughsService) {
        this.viewModel = viewModel;
        this.openerService = openerService;
        this.quickInputService = quickInputService;
        this.commandService = commandService;
        this.remoteExplorerService = remoteExplorerService;
        this.environmentService = environmentService;
        this.workspaceContextService = workspaceContextService;
        this.walkthroughsService = walkthroughsService;
        this.updateItems();
        viewModel.onDidChangeHelpInformation(() => this.updateItems());
    }
    createHelpItemValue(info, infoKey) {
        return new HelpItemValue(this.commandService, this.walkthroughsService, info.extensionDescription, (typeof info.remoteName === 'string') ? [info.remoteName] : info.remoteName, info.virtualWorkspace, info[infoKey]);
    }
    updateItems() {
        const helpItems = [];
        const getStarted = this.viewModel.helpInformation.filter(info => info.getStarted);
        if (getStarted.length) {
            const helpItemValues = getStarted.map((info) => this.createHelpItemValue(info, 'getStarted'));
            const getStartedHelpItem = this.items?.find(item => item.icon === icons.getStartedIcon) ?? new GetStartedHelpItem(icons.getStartedIcon, nls.localize('remote.help.getStarted', "Get Started"), helpItemValues, this.quickInputService, this.environmentService, this.openerService, this.remoteExplorerService, this.workspaceContextService, this.commandService);
            getStartedHelpItem.values = helpItemValues;
            helpItems.push(getStartedHelpItem);
        }
        const documentation = this.viewModel.helpInformation.filter(info => info.documentation);
        if (documentation.length) {
            const helpItemValues = documentation.map((info) => this.createHelpItemValue(info, 'documentation'));
            const documentationHelpItem = this.items?.find(item => item.icon === icons.documentationIcon) ?? new HelpItem(icons.documentationIcon, nls.localize('remote.help.documentation', "Read Documentation"), helpItemValues, this.quickInputService, this.environmentService, this.openerService, this.remoteExplorerService, this.workspaceContextService);
            documentationHelpItem.values = helpItemValues;
            helpItems.push(documentationHelpItem);
        }
        const issues = this.viewModel.helpInformation.filter(info => info.issues);
        if (issues.length) {
            const helpItemValues = issues.map((info) => this.createHelpItemValue(info, 'issues'));
            const reviewIssuesHelpItem = this.items?.find(item => item.icon === icons.reviewIssuesIcon) ?? new HelpItem(icons.reviewIssuesIcon, nls.localize('remote.help.issues', "Review Issues"), helpItemValues, this.quickInputService, this.environmentService, this.openerService, this.remoteExplorerService, this.workspaceContextService);
            reviewIssuesHelpItem.values = helpItemValues;
            helpItems.push(reviewIssuesHelpItem);
        }
        if (helpItems.length) {
            const helpItemValues = this.viewModel.helpInformation.map(info => this.createHelpItemValue(info, 'reportIssue'));
            const issueReporterItem = this.items?.find(item => item.icon === icons.reportIssuesIcon) ?? new IssueReporterItem(icons.reportIssuesIcon, nls.localize('remote.help.report', "Report Issue"), helpItemValues, this.quickInputService, this.environmentService, this.commandService, this.openerService, this.remoteExplorerService, this.workspaceContextService);
            issueReporterItem.values = helpItemValues;
            helpItems.push(issueReporterItem);
        }
        if (helpItems.length) {
            this.items = helpItems;
        }
    }
}
class HelpItemValue {
    constructor(commandService, walkthroughService, extensionDescription, remoteAuthority, virtualWorkspace, urlOrCommandOrId) {
        this.commandService = commandService;
        this.walkthroughService = walkthroughService;
        this.extensionDescription = extensionDescription;
        this.remoteAuthority = remoteAuthority;
        this.virtualWorkspace = virtualWorkspace;
        this.urlOrCommandOrId = urlOrCommandOrId;
    }
    get description() {
        return this.getUrl().then(() => this._description);
    }
    get url() {
        return this.getUrl();
    }
    async getUrl() {
        if (this._url === undefined) {
            if (typeof this.urlOrCommandOrId === 'string') {
                const url = URI.parse(this.urlOrCommandOrId);
                if (url.authority) {
                    this._url = this.urlOrCommandOrId;
                }
                else {
                    const urlCommand = this.commandService.executeCommand(this.urlOrCommandOrId).then((result) => {
                        this._url = result;
                        return this._url;
                    });
                    const emptyString = new Promise(resolve => setTimeout(() => resolve(''), 500));
                    this._url = await Promise.race([urlCommand, emptyString]);
                }
            }
            else if (this.urlOrCommandOrId?.id) {
                try {
                    const walkthroughId = `${this.extensionDescription.id}#${this.urlOrCommandOrId.id}`;
                    const walkthrough = await this.walkthroughService.getWalkthrough(walkthroughId);
                    this._description = walkthrough.title;
                    this._url = walkthroughId;
                }
                catch { }
            }
        }
        if (this._url === undefined) {
            this._url = '';
        }
        return this._url;
    }
}
class HelpItemBase {
    constructor(icon, label, values, quickInputService, environmentService, remoteExplorerService, workspaceContextService) {
        this.icon = icon;
        this.label = label;
        this.values = values;
        this.quickInputService = quickInputService;
        this.environmentService = environmentService;
        this.remoteExplorerService = remoteExplorerService;
        this.workspaceContextService = workspaceContextService;
        this.iconClasses = [];
        this.iconClasses.push(...ThemeIcon.asClassNameArray(icon));
        this.iconClasses.push('remote-help-tree-node-item-icon');
    }
    async getActions() {
        return (await Promise.all(this.values.map(async (value) => {
            return {
                label: value.extensionDescription.displayName || value.extensionDescription.identifier.value,
                description: await value.description ?? await value.url,
                url: await value.url,
                extensionDescription: value.extensionDescription
            };
        }))).filter(item => item.description);
    }
    async handleClick() {
        const remoteAuthority = this.environmentService.remoteAuthority;
        if (remoteAuthority) {
            for (let i = 0; i < this.remoteExplorerService.targetType.length; i++) {
                if (remoteAuthority.startsWith(this.remoteExplorerService.targetType[i])) {
                    for (const value of this.values) {
                        if (value.remoteAuthority) {
                            for (const authority of value.remoteAuthority) {
                                if (remoteAuthority.startsWith(authority)) {
                                    await this.takeAction(value.extensionDescription, await value.url);
                                    return;
                                }
                            }
                        }
                    }
                }
            }
        }
        else {
            const virtualWorkspace = getVirtualWorkspaceLocation(this.workspaceContextService.getWorkspace())?.scheme;
            if (virtualWorkspace) {
                for (let i = 0; i < this.remoteExplorerService.targetType.length; i++) {
                    for (const value of this.values) {
                        if (value.virtualWorkspace && value.remoteAuthority) {
                            for (const authority of value.remoteAuthority) {
                                if (this.remoteExplorerService.targetType[i].startsWith(authority) && virtualWorkspace.startsWith(value.virtualWorkspace)) {
                                    await this.takeAction(value.extensionDescription, await value.url);
                                    return;
                                }
                            }
                        }
                    }
                }
            }
        }
        if (this.values.length > 1) {
            const actions = await this.getActions();
            if (actions.length) {
                const action = await this.quickInputService.pick(actions, { placeHolder: nls.localize('pickRemoteExtension', "Select url to open") });
                if (action) {
                    await this.takeAction(action.extensionDescription, action.url);
                }
            }
        }
        else {
            await this.takeAction(this.values[0].extensionDescription, await this.values[0].url);
        }
    }
}
class GetStartedHelpItem extends HelpItemBase {
    constructor(icon, label, values, quickInputService, environmentService, openerService, remoteExplorerService, workspaceContextService, commandService) {
        super(icon, label, values, quickInputService, environmentService, remoteExplorerService, workspaceContextService);
        this.openerService = openerService;
        this.commandService = commandService;
    }
    async takeAction(extensionDescription, urlOrWalkthroughId) {
        if ([Schemas.http, Schemas.https].includes(URI.parse(urlOrWalkthroughId).scheme)) {
            this.openerService.open(urlOrWalkthroughId, { allowCommands: true });
            return;
        }
        this.commandService.executeCommand('workbench.action.openWalkthrough', urlOrWalkthroughId);
    }
}
class HelpItem extends HelpItemBase {
    constructor(icon, label, values, quickInputService, environmentService, openerService, remoteExplorerService, workspaceContextService) {
        super(icon, label, values, quickInputService, environmentService, remoteExplorerService, workspaceContextService);
        this.openerService = openerService;
    }
    async takeAction(extensionDescription, url) {
        await this.openerService.open(URI.parse(url), { allowCommands: true });
    }
}
class IssueReporterItem extends HelpItemBase {
    constructor(icon, label, values, quickInputService, environmentService, commandService, openerService, remoteExplorerService, workspaceContextService) {
        super(icon, label, values, quickInputService, environmentService, remoteExplorerService, workspaceContextService);
        this.commandService = commandService;
        this.openerService = openerService;
    }
    async getActions() {
        return Promise.all(this.values.map(async (value) => {
            return {
                label: value.extensionDescription.displayName || value.extensionDescription.identifier.value,
                description: '',
                url: await value.url,
                extensionDescription: value.extensionDescription
            };
        }));
    }
    async takeAction(extensionDescription, url) {
        if (!url) {
            await this.commandService.executeCommand('workbench.action.openIssueReporter', [extensionDescription.identifier.value]);
        }
        else {
            await this.openerService.open(URI.parse(url));
        }
    }
}
let HelpPanel = class HelpPanel extends ViewPane {
    static { this.ID = '~remote.helpPanel'; }
    static { this.TITLE = nls.localize2('remote.help', "Help and feedback"); }
    constructor(viewModel, options, keybindingService, contextMenuService, contextKeyService, configurationService, instantiationService, viewDescriptorService, openerService, quickInputService, commandService, remoteExplorerService, environmentService, themeService, telemetryService, hoverService, workspaceContextService, walkthroughsService) {
        super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, hoverService);
        this.viewModel = viewModel;
        this.quickInputService = quickInputService;
        this.commandService = commandService;
        this.remoteExplorerService = remoteExplorerService;
        this.environmentService = environmentService;
        this.workspaceContextService = workspaceContextService;
        this.walkthroughsService = walkthroughsService;
    }
    renderBody(container) {
        super.renderBody(container);
        container.classList.add('remote-help');
        const treeContainer = document.createElement('div');
        treeContainer.classList.add('remote-help-content');
        container.appendChild(treeContainer);
        this.tree = this.instantiationService.createInstance(WorkbenchAsyncDataTree, 'RemoteHelp', treeContainer, new HelpTreeVirtualDelegate(), [new HelpTreeRenderer()], new HelpDataSource(), {
            accessibilityProvider: {
                getAriaLabel: (item) => {
                    return item.label;
                },
                getWidgetAriaLabel: () => nls.localize('remotehelp', "Remote Help")
            }
        });
        const model = new HelpModel(this.viewModel, this.openerService, this.quickInputService, this.commandService, this.remoteExplorerService, this.environmentService, this.workspaceContextService, this.walkthroughsService);
        this.tree.setInput(model);
        this._register(Event.debounce(this.tree.onDidOpen, (last, event) => event, 75, true)(e => {
            e.element?.handleClick();
        }));
    }
    layoutBody(height, width) {
        super.layoutBody(height, width);
        this.tree.layout(height, width);
    }
};
HelpPanel = __decorate([
    __param(2, IKeybindingService),
    __param(3, IContextMenuService),
    __param(4, IContextKeyService),
    __param(5, IConfigurationService),
    __param(6, IInstantiationService),
    __param(7, IViewDescriptorService),
    __param(8, IOpenerService),
    __param(9, IQuickInputService),
    __param(10, ICommandService),
    __param(11, IRemoteExplorerService),
    __param(12, IWorkbenchEnvironmentService),
    __param(13, IThemeService),
    __param(14, ITelemetryService),
    __param(15, IHoverService),
    __param(16, IWorkspaceContextService),
    __param(17, IWalkthroughsService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], HelpPanel);
class HelpPanelDescriptor {
    constructor(viewModel) {
        this.id = HelpPanel.ID;
        this.name = HelpPanel.TITLE;
        this.canToggleVisibility = true;
        this.hideByDefault = false;
        this.group = 'help@50';
        this.order = -10;
        this.ctorDescriptor = new SyncDescriptor(HelpPanel, [viewModel]);
    }
}
let RemoteViewPaneContainer = class RemoteViewPaneContainer extends FilterViewPaneContainer {
    constructor(layoutService, telemetryService, contextService, storageService, configurationService, instantiationService, themeService, contextMenuService, extensionService, remoteExplorerService, viewDescriptorService) {
        super(VIEWLET_ID, remoteExplorerService.onDidChangeTargetType, configurationService, layoutService, telemetryService, storageService, instantiationService, themeService, contextMenuService, extensionService, contextService, viewDescriptorService);
        this.remoteExplorerService = remoteExplorerService;
        this.helpPanelDescriptor = new HelpPanelDescriptor(this);
        this.helpInformation = [];
        this._onDidChangeHelpInformation = new Emitter();
        this.onDidChangeHelpInformation = this._onDidChangeHelpInformation.event;
        this.hasRegisteredHelpView = false;
        this.addConstantViewDescriptors([this.helpPanelDescriptor]);
        this._register(this.remoteSwitcher = this.instantiationService.createInstance(SwitchRemoteViewItem));
        this.remoteExplorerService.onDidChangeHelpInformation(extensions => {
            this._setHelpInformation(extensions);
        });
        this._setHelpInformation(this.remoteExplorerService.helpInformation);
        const viewsRegistry = Registry.as(Extensions.ViewsRegistry);
        this.remoteSwitcher.createOptionItems(viewsRegistry.getViews(this.viewContainer));
        this._register(viewsRegistry.onViewsRegistered(e => {
            const remoteViews = [];
            for (const view of e) {
                if (view.viewContainer.id === VIEWLET_ID) {
                    remoteViews.push(...view.views);
                }
            }
            if (remoteViews.length > 0) {
                this.remoteSwitcher.createOptionItems(remoteViews);
            }
        }));
        this._register(viewsRegistry.onViewsDeregistered(e => {
            if (e.viewContainer.id === VIEWLET_ID) {
                this.remoteSwitcher.removeOptionItems(e.views);
            }
        }));
    }
    _setHelpInformation(extensions) {
        const helpInformation = [];
        for (const extension of extensions) {
            this._handleRemoteInfoExtensionPoint(extension, helpInformation);
        }
        this.helpInformation = helpInformation;
        this._onDidChangeHelpInformation.fire();
        const viewsRegistry = Registry.as(Extensions.ViewsRegistry);
        if (this.helpInformation.length && !this.hasRegisteredHelpView) {
            const view = viewsRegistry.getView(this.helpPanelDescriptor.id);
            if (!view) {
                viewsRegistry.registerViews([this.helpPanelDescriptor], this.viewContainer);
            }
            this.hasRegisteredHelpView = true;
        }
        else if (this.hasRegisteredHelpView) {
            viewsRegistry.deregisterViews([this.helpPanelDescriptor], this.viewContainer);
            this.hasRegisteredHelpView = false;
        }
    }
    _handleRemoteInfoExtensionPoint(extension, helpInformation) {
        if (!isProposedApiEnabled(extension.description, 'contribRemoteHelp')) {
            return;
        }
        if (!extension.value.documentation && !extension.value.getStarted && !extension.value.issues) {
            return;
        }
        helpInformation.push({
            extensionDescription: extension.description,
            getStarted: extension.value.getStarted,
            documentation: extension.value.documentation,
            reportIssue: extension.value.reportIssue,
            issues: extension.value.issues,
            remoteName: extension.value.remoteName,
            virtualWorkspace: extension.value.virtualWorkspace
        });
    }
    getFilterOn(viewDescriptor) {
        return isStringArray(viewDescriptor.remoteAuthority) ? viewDescriptor.remoteAuthority[0] : viewDescriptor.remoteAuthority;
    }
    setFilter(viewDescriptor) {
        this.remoteExplorerService.targetType = isStringArray(viewDescriptor.remoteAuthority) ? viewDescriptor.remoteAuthority : [viewDescriptor.remoteAuthority];
    }
    getTitle() {
        const title = nls.localize('remote.explorer', "Remote Explorer");
        return title;
    }
};
RemoteViewPaneContainer = __decorate([
    __param(0, IWorkbenchLayoutService),
    __param(1, ITelemetryService),
    __param(2, IWorkspaceContextService),
    __param(3, IStorageService),
    __param(4, IConfigurationService),
    __param(5, IInstantiationService),
    __param(6, IThemeService),
    __param(7, IContextMenuService),
    __param(8, IExtensionService),
    __param(9, IRemoteExplorerService),
    __param(10, IViewDescriptorService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], RemoteViewPaneContainer);
Registry.as(Extensions.ViewContainersRegistry).registerViewContainer({
    id: VIEWLET_ID,
    title: nls.localize2('remote.explorer', "Remote Explorer"),
    ctorDescriptor: new SyncDescriptor(RemoteViewPaneContainer),
    hideIfEmpty: true,
    viewOrderDelegate: {
        getOrder: (group) => {
            if (!group) {
                return;
            }
            let matches = /^targets@(\d+)$/.exec(group);
            if (matches) {
                return -1000;
            }
            matches = /^details(@(\d+))?$/.exec(group);
            if (matches) {
                return -500 + Number(matches[2]);
            }
            matches = /^help(@(\d+))?$/.exec(group);
            if (matches) {
                return -10;
            }
            return;
        }
    },
    icon: icons.remoteExplorerViewIcon,
    order: 4
}, 0);
let RemoteMarkers = class RemoteMarkers {
    constructor(remoteAgentService, timerService) {
        remoteAgentService.getEnvironment().then(remoteEnv => {
            if (remoteEnv) {
                timerService.setPerformanceMarks('server', remoteEnv.marks);
            }
        });
    }
};
RemoteMarkers = __decorate([
    __param(0, IRemoteAgentService),
    __param(1, ITimerService),
    __metadata("design:paramtypes", [Object, Object])
], RemoteMarkers);
export { RemoteMarkers };
class VisibleProgress {
    get lastReport() {
        return this._lastReport;
    }
    constructor(progressService, location, initialReport, buttons, onDidCancel) {
        this.location = location;
        this._isDisposed = false;
        this._lastReport = initialReport;
        this._currentProgressPromiseResolve = null;
        this._currentProgress = null;
        this._currentTimer = null;
        const promise = new Promise((resolve) => this._currentProgressPromiseResolve = resolve);
        progressService.withProgress({ location: location, buttons: buttons }, (progress) => { if (!this._isDisposed) {
            this._currentProgress = progress;
        } return promise; }, (choice) => onDidCancel(choice, this._lastReport));
        if (this._lastReport) {
            this.report();
        }
    }
    dispose() {
        this._isDisposed = true;
        if (this._currentProgressPromiseResolve) {
            this._currentProgressPromiseResolve();
            this._currentProgressPromiseResolve = null;
        }
        this._currentProgress = null;
        if (this._currentTimer) {
            this._currentTimer.dispose();
            this._currentTimer = null;
        }
    }
    report(message) {
        if (message) {
            this._lastReport = message;
        }
        if (this._lastReport && this._currentProgress) {
            this._currentProgress.report({ message: this._lastReport });
        }
    }
    startTimer(completionTime) {
        this.stopTimer();
        this._currentTimer = new ReconnectionTimer(this, completionTime);
    }
    stopTimer() {
        if (this._currentTimer) {
            this._currentTimer.dispose();
            this._currentTimer = null;
        }
    }
}
class ReconnectionTimer {
    constructor(parent, completionTime) {
        this._parent = parent;
        this._completionTime = completionTime;
        this._renderInterval = dom.disposableWindowInterval(mainWindow, () => this._render(), 1000);
        this._render();
    }
    dispose() {
        this._renderInterval.dispose();
    }
    _render() {
        const remainingTimeMs = this._completionTime - Date.now();
        if (remainingTimeMs < 0) {
            return;
        }
        const remainingTime = Math.ceil(remainingTimeMs / 1000);
        if (remainingTime === 1) {
            this._parent.report(nls.localize('reconnectionWaitOne', "Attempting to reconnect in {0} second...", remainingTime));
        }
        else {
            this._parent.report(nls.localize('reconnectionWaitMany', "Attempting to reconnect in {0} seconds...", remainingTime));
        }
    }
}
const DISCONNECT_PROMPT_TIME = 40 * 1000;
let RemoteAgentConnectionStatusListener = class RemoteAgentConnectionStatusListener extends Disposable {
    constructor(remoteAgentService, progressService, dialogService, commandService, quickInputService, logService, environmentService, telemetryService) {
        super();
        this._reloadWindowShown = false;
        const connection = remoteAgentService.getConnection();
        if (connection) {
            let quickInputVisible = false;
            this._register(quickInputService.onShow(() => quickInputVisible = true));
            this._register(quickInputService.onHide(() => quickInputVisible = false));
            let visibleProgress = null;
            let reconnectWaitEvent = null;
            let disposableListener = null;
            function showProgress(location, buttons, initialReport = null) {
                if (visibleProgress) {
                    visibleProgress.dispose();
                    visibleProgress = null;
                }
                if (!location) {
                    location = quickInputVisible ? 15 : 20;
                }
                return new VisibleProgress(progressService, location, initialReport, buttons.map(button => button.label), (choice, lastReport) => {
                    if (typeof choice !== 'undefined' && buttons[choice]) {
                        buttons[choice].callback();
                    }
                    else {
                        if (location === 20) {
                            visibleProgress = showProgress(15, buttons, lastReport);
                        }
                        else {
                            hideProgress();
                        }
                    }
                });
            }
            function hideProgress() {
                if (visibleProgress) {
                    visibleProgress.dispose();
                    visibleProgress = null;
                }
            }
            let reconnectionToken = '';
            let lastIncomingDataTime = 0;
            let reconnectionAttempts = 0;
            const reconnectButton = {
                label: nls.localize('reconnectNow', "Reconnect Now"),
                callback: () => {
                    reconnectWaitEvent?.skipWait();
                }
            };
            const reloadButton = {
                label: nls.localize('reloadWindow', "Reload Window"),
                callback: () => {
                    telemetryService.publicLog2('remoteReconnectionReload', {
                        remoteName: getRemoteName(environmentService.remoteAuthority),
                        reconnectionToken: reconnectionToken,
                        millisSinceLastIncomingData: Date.now() - lastIncomingDataTime,
                        attempt: reconnectionAttempts
                    });
                    commandService.executeCommand(ReloadWindowAction.ID);
                }
            };
            connection.onDidStateChange((e) => {
                visibleProgress?.stopTimer();
                if (disposableListener) {
                    disposableListener.dispose();
                    disposableListener = null;
                }
                switch (e.type) {
                    case 0:
                        reconnectionToken = e.reconnectionToken;
                        lastIncomingDataTime = Date.now() - e.millisSinceLastIncomingData;
                        reconnectionAttempts = 0;
                        telemetryService.publicLog2('remoteConnectionLost', {
                            remoteName: getRemoteName(environmentService.remoteAuthority),
                            reconnectionToken: e.reconnectionToken,
                        });
                        if (visibleProgress || e.millisSinceLastIncomingData > DISCONNECT_PROMPT_TIME) {
                            if (!visibleProgress) {
                                visibleProgress = showProgress(null, [reconnectButton, reloadButton]);
                            }
                            visibleProgress.report(nls.localize('connectionLost', "Connection Lost"));
                        }
                        break;
                    case 1:
                        if (visibleProgress) {
                            reconnectWaitEvent = e;
                            visibleProgress = showProgress(null, [reconnectButton, reloadButton]);
                            visibleProgress.startTimer(Date.now() + 1000 * e.durationSeconds);
                        }
                        break;
                    case 2:
                        reconnectionToken = e.reconnectionToken;
                        lastIncomingDataTime = Date.now() - e.millisSinceLastIncomingData;
                        reconnectionAttempts = e.attempt;
                        telemetryService.publicLog2('remoteReconnectionRunning', {
                            remoteName: getRemoteName(environmentService.remoteAuthority),
                            reconnectionToken: e.reconnectionToken,
                            millisSinceLastIncomingData: e.millisSinceLastIncomingData,
                            attempt: e.attempt
                        });
                        if (visibleProgress || e.millisSinceLastIncomingData > DISCONNECT_PROMPT_TIME) {
                            visibleProgress = showProgress(null, [reloadButton]);
                            visibleProgress.report(nls.localize('reconnectionRunning', "Disconnected. Attempting to reconnect..."));
                            disposableListener = quickInputService.onShow(() => {
                                if (visibleProgress && visibleProgress.location === 20) {
                                    visibleProgress = showProgress(15, [reloadButton], visibleProgress.lastReport);
                                }
                            });
                        }
                        break;
                    case 3:
                        reconnectionToken = e.reconnectionToken;
                        lastIncomingDataTime = Date.now() - e.millisSinceLastIncomingData;
                        reconnectionAttempts = e.attempt;
                        telemetryService.publicLog2('remoteReconnectionPermanentFailure', {
                            remoteName: getRemoteName(environmentService.remoteAuthority),
                            reconnectionToken: e.reconnectionToken,
                            millisSinceLastIncomingData: e.millisSinceLastIncomingData,
                            attempt: e.attempt,
                            handled: e.handled
                        });
                        hideProgress();
                        if (e.handled) {
                            logService.info(`Error handled: Not showing a notification for the error.`);
                            console.log(`Error handled: Not showing a notification for the error.`);
                        }
                        else if (!this._reloadWindowShown) {
                            this._reloadWindowShown = true;
                            dialogService.confirm({
                                type: Severity.Error,
                                message: nls.localize('reconnectionPermanentFailure', "Cannot reconnect. Please reload the window."),
                                primaryButton: nls.localize({ key: 'reloadWindow.dialog', comment: ['&& denotes a mnemonic'] }, "&&Reload Window")
                            }).then(result => {
                                if (result.confirmed) {
                                    commandService.executeCommand(ReloadWindowAction.ID);
                                }
                            });
                        }
                        break;
                    case 4:
                        reconnectionToken = e.reconnectionToken;
                        lastIncomingDataTime = Date.now() - e.millisSinceLastIncomingData;
                        reconnectionAttempts = e.attempt;
                        telemetryService.publicLog2('remoteConnectionGain', {
                            remoteName: getRemoteName(environmentService.remoteAuthority),
                            reconnectionToken: e.reconnectionToken,
                            millisSinceLastIncomingData: e.millisSinceLastIncomingData,
                            attempt: e.attempt
                        });
                        hideProgress();
                        break;
                }
            });
        }
    }
};
RemoteAgentConnectionStatusListener = __decorate([
    __param(0, IRemoteAgentService),
    __param(1, IProgressService),
    __param(2, IDialogService),
    __param(3, ICommandService),
    __param(4, IQuickInputService),
    __param(5, ILogService),
    __param(6, IWorkbenchEnvironmentService),
    __param(7, ITelemetryService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object])
], RemoteAgentConnectionStatusListener);
export { RemoteAgentConnectionStatusListener };
