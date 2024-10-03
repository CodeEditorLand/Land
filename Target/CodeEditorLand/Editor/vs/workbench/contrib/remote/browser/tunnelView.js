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
var TunnelPanel_1;
import './media/tunnelView.css';
import * as nls from '../../../../nls.js';
import * as dom from '../../../../base/browser/dom.js';
import { IViewDescriptorService } from '../../../common/views.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IContextMenuService, IContextViewService } from '../../../../platform/contextview/browser/contextView.js';
import { IContextKeyService, RawContextKey, ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { ICommandService, CommandsRegistry } from '../../../../platform/commands/common/commands.js';
import { Event } from '../../../../base/common/event.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { Disposable, toDisposable, dispose, DisposableStore } from '../../../../base/common/lifecycle.js';
import { ActionBar } from '../../../../base/browser/ui/actionbar/actionbar.js';
import { IconLabel } from '../../../../base/browser/ui/iconLabel/iconLabel.js';
import { ActionRunner } from '../../../../base/common/actions.js';
import { IMenuService, MenuId, MenuRegistry } from '../../../../platform/actions/common/actions.js';
import { createAndFillInActionBarActions, createActionViewItem } from '../../../../platform/actions/browser/menuEntryActionViewItem.js';
import { IRemoteExplorerService, TunnelType, TUNNEL_VIEW_ID, TunnelEditId } from '../../../services/remote/common/remoteExplorerService.js';
import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { INotificationService, Severity } from '../../../../platform/notification/common/notification.js';
import { InputBox } from '../../../../base/browser/ui/inputbox/inputBox.js';
import { createSingleCallFunction } from '../../../../base/common/functional.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { ViewPane } from '../../../browser/parts/views/viewPane.js';
import { URI } from '../../../../base/common/uri.js';
import { isAllInterfaces, isLocalhost, ITunnelService, TunnelPrivacyId, TunnelProtocol } from '../../../../platform/tunnel/common/tunnel.js';
import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.js';
import { KeybindingsRegistry } from '../../../../platform/keybinding/common/keybindingsRegistry.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { ActionViewItem } from '../../../../base/browser/ui/actionbar/actionViewItems.js';
import { copyAddressIcon, forwardedPortWithoutProcessIcon, forwardedPortWithProcessIcon, forwardPortIcon, labelPortIcon, openBrowserIcon, openPreviewIcon, portsViewIcon, privatePortIcon, stopForwardIcon } from './remoteIcons.js';
import { IExternalUriOpenerService } from '../../externalUriOpener/common/externalUriOpenerService.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { isMacintosh } from '../../../../base/common/platform.js';
import { WorkbenchTable } from '../../../../platform/list/browser/listService.js';
import { Button } from '../../../../base/browser/ui/button/button.js';
import { registerColor } from '../../../../platform/theme/common/colorRegistry.js';
import { MarkdownString } from '../../../../base/common/htmlContent.js';
import { STATUS_BAR_REMOTE_ITEM_BACKGROUND } from '../../../common/theme.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { defaultButtonStyles, defaultInputBoxStyles } from '../../../../platform/theme/browser/defaultStyles.js';
import { TunnelCloseReason, TunnelSource, forwardedPortsViewEnabled, makeAddress, mapHasAddressLocalhostOrAllInterfaces, parseAddress } from '../../../services/remote/common/tunnelModel.js';
import { getDefaultHoverDelegate } from '../../../../base/browser/ui/hover/hoverDelegateFactory.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
export const openPreviewEnabledContext = new RawContextKey('openPreviewEnabled', false);
class TunnelTreeVirtualDelegate {
    constructor(remoteExplorerService) {
        this.remoteExplorerService = remoteExplorerService;
        this.headerRowHeight = 22;
    }
    getHeight(row) {
        return (row.tunnelType === TunnelType.Add && !this.remoteExplorerService.getEditableData(undefined)) ? 30 : 22;
    }
}
let TunnelViewModel = class TunnelViewModel {
    constructor(remoteExplorerService, tunnelService) {
        this.remoteExplorerService = remoteExplorerService;
        this.tunnelService = tunnelService;
        this._candidates = new Map();
        this.input = {
            label: nls.localize('remote.tunnelsView.addPort', "Add Port"),
            icon: undefined,
            tunnelType: TunnelType.Add,
            hasRunningProcess: false,
            remoteHost: '',
            remotePort: 0,
            processDescription: '',
            tooltipPostfix: '',
            iconTooltip: '',
            portTooltip: '',
            processTooltip: '',
            originTooltip: '',
            privacyTooltip: '',
            source: { source: TunnelSource.User, description: '' },
            protocol: TunnelProtocol.Http,
            privacy: {
                id: TunnelPrivacyId.Private,
                themeIcon: privatePortIcon.id,
                label: nls.localize('tunnelPrivacy.private', "Private")
            },
            strip: () => undefined
        };
        this.model = remoteExplorerService.tunnelModel;
        this.onForwardedPortsChanged = Event.any(this.model.onForwardPort, this.model.onClosePort, this.model.onPortName, this.model.onCandidatesChanged);
    }
    get all() {
        const result = [];
        this._candidates = new Map();
        this.model.candidates.forEach(candidate => {
            this._candidates.set(makeAddress(candidate.host, candidate.port), candidate);
        });
        if ((this.model.forwarded.size > 0) || this.remoteExplorerService.getEditableData(undefined)) {
            result.push(...this.forwarded);
        }
        if (this.model.detected.size > 0) {
            result.push(...this.detected);
        }
        result.push(this.input);
        return result;
    }
    addProcessInfoFromCandidate(tunnelItem) {
        const key = makeAddress(tunnelItem.remoteHost, tunnelItem.remotePort);
        if (this._candidates.has(key)) {
            tunnelItem.processDescription = this._candidates.get(key).detail;
        }
    }
    get forwarded() {
        const forwarded = Array.from(this.model.forwarded.values()).map(tunnel => {
            const tunnelItem = TunnelItem.createFromTunnel(this.remoteExplorerService, this.tunnelService, tunnel);
            this.addProcessInfoFromCandidate(tunnelItem);
            return tunnelItem;
        }).sort((a, b) => {
            if (a.remotePort === b.remotePort) {
                return a.remoteHost < b.remoteHost ? -1 : 1;
            }
            else {
                return a.remotePort < b.remotePort ? -1 : 1;
            }
        });
        return forwarded;
    }
    get detected() {
        return Array.from(this.model.detected.values()).map(tunnel => {
            const tunnelItem = TunnelItem.createFromTunnel(this.remoteExplorerService, this.tunnelService, tunnel, TunnelType.Detected, false);
            this.addProcessInfoFromCandidate(tunnelItem);
            return tunnelItem;
        });
    }
    isEmpty() {
        return (this.detected.length === 0) &&
            ((this.forwarded.length === 0) || (this.forwarded.length === 1 &&
                (this.forwarded[0].tunnelType === TunnelType.Add) && !this.remoteExplorerService.getEditableData(undefined)));
    }
};
TunnelViewModel = __decorate([
    __param(0, IRemoteExplorerService),
    __param(1, ITunnelService),
    __metadata("design:paramtypes", [Object, Object])
], TunnelViewModel);
export { TunnelViewModel };
function emptyCell(item) {
    return { label: '', tunnel: item, editId: TunnelEditId.None, tooltip: '' };
}
class IconColumn {
    constructor() {
        this.label = '';
        this.tooltip = '';
        this.weight = 1;
        this.minimumWidth = 40;
        this.maximumWidth = 40;
        this.templateId = 'actionbar';
    }
    project(row) {
        if (row.tunnelType === TunnelType.Add) {
            return emptyCell(row);
        }
        const icon = row.processDescription ? forwardedPortWithProcessIcon : forwardedPortWithoutProcessIcon;
        let tooltip = '';
        if (row instanceof TunnelItem) {
            tooltip = `${row.iconTooltip} ${row.tooltipPostfix}`;
        }
        return {
            label: '', icon, tunnel: row, editId: TunnelEditId.None, tooltip
        };
    }
}
class PortColumn {
    constructor() {
        this.label = nls.localize('tunnel.portColumn.label', "Port");
        this.tooltip = nls.localize('tunnel.portColumn.tooltip', "The label and remote port number of the forwarded port.");
        this.weight = 1;
        this.templateId = 'actionbar';
    }
    project(row) {
        const isAdd = row.tunnelType === TunnelType.Add;
        const label = row.label;
        let tooltip = '';
        if (row instanceof TunnelItem && !isAdd) {
            tooltip = `${row.portTooltip} ${row.tooltipPostfix}`;
        }
        else {
            tooltip = label;
        }
        return {
            label, tunnel: row, menuId: MenuId.TunnelPortInline,
            editId: row.tunnelType === TunnelType.Add ? TunnelEditId.New : TunnelEditId.Label, tooltip
        };
    }
}
class LocalAddressColumn {
    constructor() {
        this.label = nls.localize('tunnel.addressColumn.label', "Forwarded Address");
        this.tooltip = nls.localize('tunnel.addressColumn.tooltip', "The address that the forwarded port is available at.");
        this.weight = 1;
        this.templateId = 'actionbar';
    }
    project(row) {
        if (row.tunnelType === TunnelType.Add) {
            return emptyCell(row);
        }
        const label = row.localAddress ?? '';
        let tooltip = label;
        if (row instanceof TunnelItem) {
            tooltip = row.tooltipPostfix;
        }
        return {
            label,
            menuId: MenuId.TunnelLocalAddressInline,
            tunnel: row,
            editId: TunnelEditId.LocalPort,
            tooltip,
            markdownTooltip: label ? LocalAddressColumn.getHoverText(label) : undefined
        };
    }
    static getHoverText(localAddress) {
        return function (configurationService) {
            const editorConf = configurationService.getValue('editor');
            let clickLabel = '';
            if (editorConf.multiCursorModifier === 'ctrlCmd') {
                if (isMacintosh) {
                    clickLabel = nls.localize('portsLink.followLinkAlt.mac', "option + click");
                }
                else {
                    clickLabel = nls.localize('portsLink.followLinkAlt', "alt + click");
                }
            }
            else {
                if (isMacintosh) {
                    clickLabel = nls.localize('portsLink.followLinkCmd', "cmd + click");
                }
                else {
                    clickLabel = nls.localize('portsLink.followLinkCtrl', "ctrl + click");
                }
            }
            const markdown = new MarkdownString('', true);
            const uri = localAddress.startsWith('http') ? localAddress : `http://${localAddress}`;
            return markdown.appendLink(uri, 'Follow link').appendMarkdown(` (${clickLabel})`);
        };
    }
}
class RunningProcessColumn {
    constructor() {
        this.label = nls.localize('tunnel.processColumn.label', "Running Process");
        this.tooltip = nls.localize('tunnel.processColumn.tooltip', "The command line of the process that is using the port.");
        this.weight = 2;
        this.templateId = 'actionbar';
    }
    project(row) {
        if (row.tunnelType === TunnelType.Add) {
            return emptyCell(row);
        }
        const label = row.processDescription ?? '';
        return { label, tunnel: row, editId: TunnelEditId.None, tooltip: row instanceof TunnelItem ? row.processTooltip : '' };
    }
}
class OriginColumn {
    constructor() {
        this.label = nls.localize('tunnel.originColumn.label', "Origin");
        this.tooltip = nls.localize('tunnel.originColumn.tooltip', "The source that a forwarded port originates from. Can be an extension, user forwarded, statically forwarded, or automatically forwarded.");
        this.weight = 1;
        this.templateId = 'actionbar';
    }
    project(row) {
        if (row.tunnelType === TunnelType.Add) {
            return emptyCell(row);
        }
        const label = row.source.description;
        const tooltip = `${row instanceof TunnelItem ? row.originTooltip : ''}. ${row instanceof TunnelItem ? row.tooltipPostfix : ''}`;
        return { label, menuId: MenuId.TunnelOriginInline, tunnel: row, editId: TunnelEditId.None, tooltip };
    }
}
class PrivacyColumn {
    constructor() {
        this.label = nls.localize('tunnel.privacyColumn.label', "Visibility");
        this.tooltip = nls.localize('tunnel.privacyColumn.tooltip', "The availability of the forwarded port.");
        this.weight = 1;
        this.templateId = 'actionbar';
    }
    project(row) {
        if (row.tunnelType === TunnelType.Add) {
            return emptyCell(row);
        }
        const label = row.privacy?.label;
        let tooltip = '';
        if (row instanceof TunnelItem) {
            tooltip = `${row.privacy.label} ${row.tooltipPostfix}`;
        }
        return { label, tunnel: row, icon: { id: row.privacy.themeIcon }, editId: TunnelEditId.None, tooltip };
    }
}
let ActionBarRenderer = class ActionBarRenderer extends Disposable {
    constructor(instantiationService, contextKeyService, menuService, contextViewService, remoteExplorerService, commandService, configurationService) {
        super();
        this.instantiationService = instantiationService;
        this.contextKeyService = contextKeyService;
        this.menuService = menuService;
        this.contextViewService = contextViewService;
        this.remoteExplorerService = remoteExplorerService;
        this.commandService = commandService;
        this.configurationService = configurationService;
        this.templateId = 'actionbar';
        this._hoverDelegate = getDefaultHoverDelegate('mouse');
    }
    set actionRunner(actionRunner) {
        this._actionRunner = actionRunner;
    }
    renderTemplate(container) {
        const cell = dom.append(container, dom.$('.ports-view-actionbar-cell'));
        const icon = dom.append(cell, dom.$('.ports-view-actionbar-cell-icon'));
        const label = new IconLabel(cell, {
            supportHighlights: true,
            hoverDelegate: this._hoverDelegate
        });
        const actionsContainer = dom.append(cell, dom.$('.actions'));
        const actionBar = new ActionBar(actionsContainer, {
            actionViewItemProvider: createActionViewItem.bind(undefined, this.instantiationService),
            hoverDelegate: this._hoverDelegate
        });
        return { label, icon, actionBar, container: cell, elementDisposable: Disposable.None };
    }
    renderElement(element, index, templateData) {
        templateData.actionBar.clear();
        templateData.icon.className = 'ports-view-actionbar-cell-icon';
        templateData.icon.style.display = 'none';
        templateData.label.setLabel('');
        templateData.label.element.style.display = 'none';
        templateData.container.style.height = '22px';
        if (templateData.button) {
            templateData.button.element.style.display = 'none';
            templateData.button.dispose();
        }
        templateData.container.style.paddingLeft = '0px';
        templateData.elementDisposable.dispose();
        let editableData;
        if (element.editId === TunnelEditId.New && (editableData = this.remoteExplorerService.getEditableData(undefined))) {
            this.renderInputBox(templateData.container, editableData);
        }
        else {
            editableData = this.remoteExplorerService.getEditableData(element.tunnel, element.editId);
            if (editableData) {
                this.renderInputBox(templateData.container, editableData);
            }
            else if ((element.tunnel.tunnelType === TunnelType.Add) && (element.menuId === MenuId.TunnelPortInline)) {
                this.renderButton(element, templateData);
            }
            else {
                this.renderActionBarItem(element, templateData);
            }
        }
    }
    renderButton(element, templateData) {
        templateData.container.style.paddingLeft = '7px';
        templateData.container.style.height = '28px';
        templateData.button = this._register(new Button(templateData.container, defaultButtonStyles));
        templateData.button.label = element.label;
        templateData.button.element.title = element.tooltip;
        this._register(templateData.button.onDidClick(() => {
            this.commandService.executeCommand(ForwardPortAction.INLINE_ID);
        }));
    }
    tunnelContext(tunnel) {
        let context;
        if (tunnel instanceof TunnelItem) {
            context = tunnel.strip();
        }
        if (!context) {
            context = {
                tunnelType: tunnel.tunnelType,
                remoteHost: tunnel.remoteHost,
                remotePort: tunnel.remotePort,
                localAddress: tunnel.localAddress,
                protocol: tunnel.protocol,
                localUri: tunnel.localUri,
                localPort: tunnel.localPort,
                name: tunnel.name,
                closeable: tunnel.closeable,
                source: tunnel.source,
                privacy: tunnel.privacy,
                processDescription: tunnel.processDescription,
                label: tunnel.label
            };
        }
        return context;
    }
    renderActionBarItem(element, templateData) {
        templateData.label.element.style.display = 'flex';
        templateData.label.setLabel(element.label, undefined, {
            title: element.markdownTooltip ?
                { markdown: element.markdownTooltip(this.configurationService), markdownNotSupportedFallback: element.tooltip }
                : element.tooltip,
            extraClasses: element.menuId === MenuId.TunnelLocalAddressInline ? ['ports-view-actionbar-cell-localaddress'] : undefined
        });
        templateData.actionBar.context = this.tunnelContext(element.tunnel);
        templateData.container.style.paddingLeft = '10px';
        const context = [
            ['view', TUNNEL_VIEW_ID],
            [TunnelTypeContextKey.key, element.tunnel.tunnelType],
            [TunnelCloseableContextKey.key, element.tunnel.closeable],
            [TunnelPrivacyContextKey.key, element.tunnel.privacy.id],
            [TunnelProtocolContextKey.key, element.tunnel.protocol]
        ];
        const contextKeyService = this.contextKeyService.createOverlay(context);
        const disposableStore = new DisposableStore();
        templateData.elementDisposable = disposableStore;
        if (element.menuId) {
            const menu = disposableStore.add(this.menuService.createMenu(element.menuId, contextKeyService));
            let actions = [];
            createAndFillInActionBarActions(menu, { shouldForwardArgs: true }, actions);
            if (actions) {
                const labelActions = actions.filter(action => action.id.toLowerCase().indexOf('label') >= 0);
                if (labelActions.length > 1) {
                    labelActions.sort((a, b) => a.label.length - b.label.length);
                    labelActions.pop();
                    actions = actions.filter(action => labelActions.indexOf(action) < 0);
                }
                templateData.actionBar.push(actions, { icon: true, label: false });
                if (this._actionRunner) {
                    templateData.actionBar.actionRunner = this._actionRunner;
                }
            }
        }
        if (element.icon) {
            templateData.icon.className = `ports-view-actionbar-cell-icon ${ThemeIcon.asClassName(element.icon)}`;
            templateData.icon.title = element.tooltip;
            templateData.icon.style.display = 'inline';
        }
    }
    renderInputBox(container, editableData) {
        if (this.inputDone) {
            this.inputDone(false, false);
            this.inputDone = undefined;
        }
        container.style.paddingLeft = '5px';
        const value = editableData.startingValue || '';
        const inputBox = new InputBox(container, this.contextViewService, {
            ariaLabel: nls.localize('remote.tunnelsView.input', "Press Enter to confirm or Escape to cancel."),
            validationOptions: {
                validation: (value) => {
                    const message = editableData.validationMessage(value);
                    if (!message) {
                        return null;
                    }
                    return {
                        content: message.content,
                        formatContent: true,
                        type: message.severity === Severity.Error ? 3 : 1
                    };
                }
            },
            placeholder: editableData.placeholder || '',
            inputBoxStyles: defaultInputBoxStyles
        });
        inputBox.value = value;
        inputBox.focus();
        inputBox.select({ start: 0, end: editableData.startingValue ? editableData.startingValue.length : 0 });
        const done = createSingleCallFunction(async (success, finishEditing) => {
            dispose(toDispose);
            if (this.inputDone) {
                this.inputDone = undefined;
            }
            inputBox.element.style.display = 'none';
            const inputValue = inputBox.value;
            if (finishEditing) {
                return editableData.onFinish(inputValue, success);
            }
        });
        this.inputDone = done;
        const toDispose = [
            inputBox,
            dom.addStandardDisposableListener(inputBox.inputElement, dom.EventType.KEY_DOWN, async (e) => {
                if (e.equals(3)) {
                    e.stopPropagation();
                    if (inputBox.validate() !== 3) {
                        return done(true, true);
                    }
                    else {
                        return done(false, true);
                    }
                }
                else if (e.equals(9)) {
                    e.preventDefault();
                    e.stopPropagation();
                    return done(false, true);
                }
            }),
            dom.addDisposableListener(inputBox.inputElement, dom.EventType.BLUR, () => {
                return done(inputBox.validate() !== 3, true);
            })
        ];
        return toDisposable(() => {
            done(false, false);
        });
    }
    disposeElement(element, index, templateData, height) {
        templateData.elementDisposable.dispose();
    }
    disposeTemplate(templateData) {
        templateData.label.dispose();
        templateData.actionBar.dispose();
        templateData.elementDisposable.dispose();
        templateData.button?.dispose();
    }
};
ActionBarRenderer = __decorate([
    __param(0, IInstantiationService),
    __param(1, IContextKeyService),
    __param(2, IMenuService),
    __param(3, IContextViewService),
    __param(4, IRemoteExplorerService),
    __param(5, ICommandService),
    __param(6, IConfigurationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object])
], ActionBarRenderer);
class TunnelItem {
    static createFromTunnel(remoteExplorerService, tunnelService, tunnel, type = TunnelType.Forwarded, closeable) {
        return new TunnelItem(type, tunnel.remoteHost, tunnel.remotePort, tunnel.source, !!tunnel.hasRunningProcess, tunnel.protocol, tunnel.localUri, tunnel.localAddress, tunnel.localPort, closeable === undefined ? tunnel.closeable : closeable, tunnel.name, tunnel.runningProcess, tunnel.pid, tunnel.privacy, remoteExplorerService, tunnelService);
    }
    strip() {
        return new TunnelItem(this.tunnelType, this.remoteHost, this.remotePort, this.source, this.hasRunningProcess, this.protocol, this.localUri, this.localAddress, this.localPort, this.closeable, this.name, this.runningProcess, this.pid, this._privacy);
    }
    constructor(tunnelType, remoteHost, remotePort, source, hasRunningProcess, protocol, localUri, localAddress, localPort, closeable, name, runningProcess, pid, _privacy, remoteExplorerService, tunnelService) {
        this.tunnelType = tunnelType;
        this.remoteHost = remoteHost;
        this.remotePort = remotePort;
        this.source = source;
        this.hasRunningProcess = hasRunningProcess;
        this.protocol = protocol;
        this.localUri = localUri;
        this.localAddress = localAddress;
        this.localPort = localPort;
        this.closeable = closeable;
        this.name = name;
        this.runningProcess = runningProcess;
        this.pid = pid;
        this._privacy = _privacy;
        this.remoteExplorerService = remoteExplorerService;
        this.tunnelService = tunnelService;
    }
    get label() {
        if (this.tunnelType === TunnelType.Add && this.name) {
            return this.name;
        }
        const portNumberLabel = (isLocalhost(this.remoteHost) || isAllInterfaces(this.remoteHost))
            ? `${this.remotePort}`
            : `${this.remoteHost}:${this.remotePort}`;
        if (this.name) {
            return `${this.name} (${portNumberLabel})`;
        }
        else {
            return portNumberLabel;
        }
    }
    set processDescription(description) {
        this.runningProcess = description;
    }
    get processDescription() {
        let description = '';
        if (this.runningProcess) {
            if (this.pid && this.remoteExplorerService?.namedProcesses.has(this.pid)) {
                description = this.remoteExplorerService.namedProcesses.get(this.pid);
            }
            else {
                description = this.runningProcess.replace(/\0/g, ' ').trim();
            }
            if (this.pid) {
                description += ` (${this.pid})`;
            }
        }
        else if (this.hasRunningProcess) {
            description = nls.localize('tunnelView.runningProcess.inacessable', "Process information unavailable");
        }
        return description;
    }
    get tooltipPostfix() {
        let information;
        if (this.localAddress) {
            information = nls.localize('remote.tunnel.tooltipForwarded', "Remote port {0}:{1} forwarded to local address {2}. ", this.remoteHost, this.remotePort, this.localAddress);
        }
        else {
            information = nls.localize('remote.tunnel.tooltipCandidate', "Remote port {0}:{1} not forwarded. ", this.remoteHost, this.remotePort);
        }
        return information;
    }
    get iconTooltip() {
        const isAdd = this.tunnelType === TunnelType.Add;
        if (!isAdd) {
            return `${this.processDescription ? nls.localize('tunnel.iconColumn.running', "Port has running process.") :
                nls.localize('tunnel.iconColumn.notRunning', "No running process.")}`;
        }
        else {
            return this.label;
        }
    }
    get portTooltip() {
        const isAdd = this.tunnelType === TunnelType.Add;
        if (!isAdd) {
            return `${this.name ? nls.localize('remote.tunnel.tooltipName', "Port labeled {0}. ", this.name) : ''}`;
        }
        else {
            return '';
        }
    }
    get processTooltip() {
        return this.processDescription ?? '';
    }
    get originTooltip() {
        return this.source.description;
    }
    get privacy() {
        if (this.tunnelService?.privacyOptions) {
            return this.tunnelService?.privacyOptions.find(element => element.id === this._privacy) ??
                {
                    id: '',
                    themeIcon: Codicon.question.id,
                    label: nls.localize('tunnelPrivacy.unknown', "Unknown")
                };
        }
        else {
            return {
                id: TunnelPrivacyId.Private,
                themeIcon: privatePortIcon.id,
                label: nls.localize('tunnelPrivacy.private', "Private")
            };
        }
    }
}
const TunnelTypeContextKey = new RawContextKey('tunnelType', TunnelType.Add, true);
const TunnelCloseableContextKey = new RawContextKey('tunnelCloseable', false, true);
const TunnelPrivacyContextKey = new RawContextKey('tunnelPrivacy', undefined, true);
const TunnelPrivacyEnabledContextKey = new RawContextKey('tunnelPrivacyEnabled', false, true);
const TunnelProtocolContextKey = new RawContextKey('tunnelProtocol', TunnelProtocol.Http, true);
const TunnelViewFocusContextKey = new RawContextKey('tunnelViewFocus', false, nls.localize('tunnel.focusContext', "Whether the Ports view has focus."));
const TunnelViewSelectionKeyName = 'tunnelViewSelection';
const TunnelViewSelectionContextKey = new RawContextKey(TunnelViewSelectionKeyName, undefined, true);
const TunnelViewMultiSelectionKeyName = 'tunnelViewMultiSelection';
const TunnelViewMultiSelectionContextKey = new RawContextKey(TunnelViewMultiSelectionKeyName, undefined, true);
const PortChangableContextKey = new RawContextKey('portChangable', false, true);
const ProtocolChangeableContextKey = new RawContextKey('protocolChangable', true, true);
let TunnelPanel = class TunnelPanel extends ViewPane {
    static { TunnelPanel_1 = this; }
    static { this.ID = TUNNEL_VIEW_ID; }
    static { this.TITLE = nls.localize2('remote.tunnel', "Ports"); }
    constructor(viewModel, options, keybindingService, contextMenuService, contextKeyService, configurationService, instantiationService, viewDescriptorService, openerService, quickInputService, commandService, menuService, themeService, remoteExplorerService, telemetryService, hoverService, tunnelService, contextViewService) {
        super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, hoverService);
        this.viewModel = viewModel;
        this.quickInputService = quickInputService;
        this.commandService = commandService;
        this.menuService = menuService;
        this.remoteExplorerService = remoteExplorerService;
        this.tunnelService = tunnelService;
        this.contextViewService = contextViewService;
        this.tableDisposables = this._register(new DisposableStore());
        this.isEditing = false;
        this.titleActions = [];
        this.lastFocus = [];
        this.height = 0;
        this.width = 0;
        this.tunnelTypeContext = TunnelTypeContextKey.bindTo(contextKeyService);
        this.tunnelCloseableContext = TunnelCloseableContextKey.bindTo(contextKeyService);
        this.tunnelPrivacyContext = TunnelPrivacyContextKey.bindTo(contextKeyService);
        this.tunnelPrivacyEnabledContext = TunnelPrivacyEnabledContextKey.bindTo(contextKeyService);
        this.tunnelPrivacyEnabledContext.set(tunnelService.canChangePrivacy);
        this.protocolChangableContextKey = ProtocolChangeableContextKey.bindTo(contextKeyService);
        this.protocolChangableContextKey.set(tunnelService.canChangeProtocol);
        this.tunnelProtocolContext = TunnelProtocolContextKey.bindTo(contextKeyService);
        this.tunnelViewFocusContext = TunnelViewFocusContextKey.bindTo(contextKeyService);
        this.tunnelViewSelectionContext = TunnelViewSelectionContextKey.bindTo(contextKeyService);
        this.tunnelViewMultiSelectionContext = TunnelViewMultiSelectionContextKey.bindTo(contextKeyService);
        this.portChangableContextKey = PortChangableContextKey.bindTo(contextKeyService);
        const overlayContextKeyService = this.contextKeyService.createOverlay([['view', TunnelPanel_1.ID]]);
        const titleMenu = this._register(this.menuService.createMenu(MenuId.TunnelTitle, overlayContextKeyService));
        const updateActions = () => {
            this.titleActions = [];
            createAndFillInActionBarActions(titleMenu, undefined, this.titleActions);
            this.updateActions();
        };
        this._register(titleMenu.onDidChange(updateActions));
        updateActions();
        this._register(toDisposable(() => {
            this.titleActions = [];
        }));
        this.registerPrivacyActions();
        this._register(Event.once(this.tunnelService.onAddedTunnelProvider)(() => {
            let updated = false;
            if (this.tunnelPrivacyEnabledContext.get() === false) {
                this.tunnelPrivacyEnabledContext.set(tunnelService.canChangePrivacy);
                updated = true;
            }
            if (this.protocolChangableContextKey.get() === true) {
                this.protocolChangableContextKey.set(tunnelService.canChangeProtocol);
                updated = true;
            }
            if (updated) {
                updateActions();
                this.registerPrivacyActions();
                this.createTable();
                this.table?.layout(this.height, this.width);
            }
        }));
    }
    registerPrivacyActions() {
        for (const privacyOption of this.tunnelService.privacyOptions) {
            const optionId = `remote.tunnel.privacy${privacyOption.id}`;
            CommandsRegistry.registerCommand(optionId, ChangeTunnelPrivacyAction.handler(privacyOption.id));
            MenuRegistry.appendMenuItem(MenuId.TunnelPrivacy, ({
                order: 0,
                command: {
                    id: optionId,
                    title: privacyOption.label,
                    toggled: TunnelPrivacyContextKey.isEqualTo(privacyOption.id)
                }
            }));
        }
    }
    get portCount() {
        return this.remoteExplorerService.tunnelModel.forwarded.size + this.remoteExplorerService.tunnelModel.detected.size;
    }
    createTable() {
        if (!this.panelContainer) {
            return;
        }
        this.tableDisposables.clear();
        dom.clearNode(this.panelContainer);
        const widgetContainer = dom.append(this.panelContainer, dom.$('.customview-tree'));
        widgetContainer.classList.add('ports-view');
        widgetContainer.classList.add('file-icon-themable-tree', 'show-file-icons');
        const actionBarRenderer = new ActionBarRenderer(this.instantiationService, this.contextKeyService, this.menuService, this.contextViewService, this.remoteExplorerService, this.commandService, this.configurationService);
        const columns = [new IconColumn(), new PortColumn(), new LocalAddressColumn(), new RunningProcessColumn()];
        if (this.tunnelService.canChangePrivacy) {
            columns.push(new PrivacyColumn());
        }
        columns.push(new OriginColumn());
        this.table = this.instantiationService.createInstance(WorkbenchTable, 'RemoteTunnels', widgetContainer, new TunnelTreeVirtualDelegate(this.remoteExplorerService), columns, [actionBarRenderer], {
            keyboardNavigationLabelProvider: {
                getKeyboardNavigationLabel: (item) => {
                    return item.label;
                }
            },
            multipleSelectionSupport: true,
            accessibilityProvider: {
                getAriaLabel: (item) => {
                    if (item instanceof TunnelItem) {
                        return `${item.tooltipPostfix} ${item.portTooltip} ${item.iconTooltip} ${item.processTooltip} ${item.originTooltip} ${this.tunnelService.canChangePrivacy ? item.privacy.label : ''}`;
                    }
                    else {
                        return item.label;
                    }
                },
                getWidgetAriaLabel: () => nls.localize('tunnelView', "Tunnel View")
            },
            openOnSingleClick: true
        });
        const actionRunner = new ActionRunner();
        actionBarRenderer.actionRunner = actionRunner;
        this.tableDisposables.add(this.table);
        this.tableDisposables.add(this.table.onContextMenu(e => this.onContextMenu(e, actionRunner)));
        this.tableDisposables.add(this.table.onMouseDblClick(e => this.onMouseDblClick(e)));
        this.tableDisposables.add(this.table.onDidChangeFocus(e => this.onFocusChanged(e)));
        this.tableDisposables.add(this.table.onDidChangeSelection(e => this.onSelectionChanged(e)));
        this.tableDisposables.add(this.table.onDidFocus(() => this.tunnelViewFocusContext.set(true)));
        this.tableDisposables.add(this.table.onDidBlur(() => this.tunnelViewFocusContext.set(false)));
        const rerender = () => this.table?.splice(0, Number.POSITIVE_INFINITY, this.viewModel.all);
        rerender();
        let lastPortCount = this.portCount;
        this.tableDisposables.add(Event.debounce(this.viewModel.onForwardedPortsChanged, (_last, e) => e, 50)(() => {
            const newPortCount = this.portCount;
            if (((lastPortCount === 0) || (newPortCount === 0)) && (lastPortCount !== newPortCount)) {
                this._onDidChangeViewWelcomeState.fire();
            }
            lastPortCount = newPortCount;
            rerender();
        }));
        this.tableDisposables.add(this.table.onMouseClick(e => {
            if (this.hasOpenLinkModifier(e.browserEvent) && this.table) {
                const selection = this.table.getSelectedElements();
                if ((selection.length === 0) ||
                    ((selection.length === 1) && (selection[0] === e.element))) {
                    this.commandService.executeCommand(OpenPortInBrowserAction.ID, e.element);
                }
            }
        }));
        this.tableDisposables.add(this.table.onDidOpen(e => {
            if (!e.element || (e.element.tunnelType !== TunnelType.Forwarded)) {
                return;
            }
            if (e.browserEvent?.type === 'dblclick') {
                this.commandService.executeCommand(LabelTunnelAction.ID);
            }
        }));
        this.tableDisposables.add(this.remoteExplorerService.onDidChangeEditable(e => {
            this.isEditing = !!this.remoteExplorerService.getEditableData(e?.tunnel, e?.editId);
            this._onDidChangeViewWelcomeState.fire();
            if (!this.isEditing) {
                widgetContainer.classList.remove('highlight');
            }
            rerender();
            if (this.isEditing) {
                widgetContainer.classList.add('highlight');
                if (!e) {
                    this.table?.reveal(this.table.indexOf(this.viewModel.input));
                }
            }
            else {
                if (e && (e.tunnel.tunnelType !== TunnelType.Add)) {
                    this.table?.setFocus(this.lastFocus);
                }
                this.focus();
            }
        }));
    }
    renderBody(container) {
        super.renderBody(container);
        this.panelContainer = dom.append(container, dom.$('.tree-explorer-viewlet-tree-view'));
        this.createTable();
    }
    shouldShowWelcome() {
        return this.viewModel.isEmpty() && !this.isEditing;
    }
    focus() {
        super.focus();
        this.table?.domFocus();
    }
    onFocusChanged(event) {
        if (event.indexes.length > 0 && event.elements.length > 0) {
            this.lastFocus = [...event.indexes];
        }
        const elements = event.elements;
        const item = elements && elements.length ? elements[0] : undefined;
        if (item) {
            this.tunnelViewSelectionContext.set(makeAddress(item.remoteHost, item.remotePort));
            this.tunnelTypeContext.set(item.tunnelType);
            this.tunnelCloseableContext.set(!!item.closeable);
            this.tunnelPrivacyContext.set(item.privacy.id);
            this.tunnelProtocolContext.set(item.protocol === TunnelProtocol.Https ? TunnelProtocol.Https : TunnelProtocol.Https);
            this.portChangableContextKey.set(!!item.localPort);
        }
        else {
            this.tunnelTypeContext.reset();
            this.tunnelViewSelectionContext.reset();
            this.tunnelCloseableContext.reset();
            this.tunnelPrivacyContext.reset();
            this.tunnelProtocolContext.reset();
            this.portChangableContextKey.reset();
        }
    }
    hasOpenLinkModifier(e) {
        const editorConf = this.configurationService.getValue('editor');
        let modifierKey = false;
        if (editorConf.multiCursorModifier === 'ctrlCmd') {
            modifierKey = e.altKey;
        }
        else {
            if (isMacintosh) {
                modifierKey = e.metaKey;
            }
            else {
                modifierKey = e.ctrlKey;
            }
        }
        return modifierKey;
    }
    onSelectionChanged(event) {
        const elements = event.elements;
        if (elements.length > 1) {
            this.tunnelViewMultiSelectionContext.set(elements.map(element => makeAddress(element.remoteHost, element.remotePort)));
        }
        else {
            this.tunnelViewMultiSelectionContext.set(undefined);
        }
    }
    onContextMenu(event, actionRunner) {
        if ((event.element !== undefined) && !(event.element instanceof TunnelItem)) {
            return;
        }
        event.browserEvent.preventDefault();
        event.browserEvent.stopPropagation();
        const node = event.element;
        if (node) {
            this.table?.setFocus([this.table.indexOf(node)]);
            this.tunnelTypeContext.set(node.tunnelType);
            this.tunnelCloseableContext.set(!!node.closeable);
            this.tunnelPrivacyContext.set(node.privacy.id);
            this.tunnelProtocolContext.set(node.protocol);
            this.portChangableContextKey.set(!!node.localPort);
        }
        else {
            this.tunnelTypeContext.set(TunnelType.Add);
            this.tunnelCloseableContext.set(false);
            this.tunnelPrivacyContext.set(undefined);
            this.tunnelProtocolContext.set(undefined);
            this.portChangableContextKey.set(false);
        }
        this.contextMenuService.showContextMenu({
            menuId: MenuId.TunnelContext,
            menuActionOptions: { shouldForwardArgs: true },
            contextKeyService: this.table?.contextKeyService,
            getAnchor: () => event.anchor,
            getActionViewItem: (action) => {
                const keybinding = this.keybindingService.lookupKeybinding(action.id);
                if (keybinding) {
                    return new ActionViewItem(action, action, { label: true, keybinding: keybinding.getLabel() });
                }
                return undefined;
            },
            onHide: (wasCancelled) => {
                if (wasCancelled) {
                    this.table?.domFocus();
                }
            },
            getActionsContext: () => node?.strip(),
            actionRunner
        });
    }
    onMouseDblClick(e) {
        if (!e.element) {
            this.commandService.executeCommand(ForwardPortAction.INLINE_ID);
        }
    }
    layoutBody(height, width) {
        this.height = height;
        this.width = width;
        super.layoutBody(height, width);
        this.table?.layout(height, width);
    }
};
TunnelPanel = TunnelPanel_1 = __decorate([
    __param(2, IKeybindingService),
    __param(3, IContextMenuService),
    __param(4, IContextKeyService),
    __param(5, IConfigurationService),
    __param(6, IInstantiationService),
    __param(7, IViewDescriptorService),
    __param(8, IOpenerService),
    __param(9, IQuickInputService),
    __param(10, ICommandService),
    __param(11, IMenuService),
    __param(12, IThemeService),
    __param(13, IRemoteExplorerService),
    __param(14, ITelemetryService),
    __param(15, IHoverService),
    __param(16, ITunnelService),
    __param(17, IContextViewService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], TunnelPanel);
export { TunnelPanel };
export class TunnelPanelDescriptor {
    constructor(viewModel, environmentService) {
        this.id = TunnelPanel.ID;
        this.name = TunnelPanel.TITLE;
        this.canToggleVisibility = true;
        this.hideByDefault = false;
        this.group = 'details@0';
        this.order = -500;
        this.canMoveView = true;
        this.containerIcon = portsViewIcon;
        this.ctorDescriptor = new SyncDescriptor(TunnelPanel, [viewModel]);
        this.remoteAuthority = environmentService.remoteAuthority ? environmentService.remoteAuthority.split('+')[0] : undefined;
    }
}
function isITunnelItem(item) {
    return item && item.tunnelType && item.remoteHost && item.source;
}
var LabelTunnelAction;
(function (LabelTunnelAction) {
    LabelTunnelAction.ID = 'remote.tunnel.label';
    LabelTunnelAction.LABEL = nls.localize('remote.tunnel.label', "Set Port Label");
    LabelTunnelAction.COMMAND_ID_KEYWORD = 'label';
    function handler() {
        return async (accessor, arg) => {
            const remoteExplorerService = accessor.get(IRemoteExplorerService);
            let tunnelContext;
            if (isITunnelItem(arg)) {
                tunnelContext = arg;
            }
            else {
                const context = accessor.get(IContextKeyService).getContextKeyValue(TunnelViewSelectionKeyName);
                const tunnel = context ? remoteExplorerService.tunnelModel.forwarded.get(context) : undefined;
                if (tunnel) {
                    const tunnelService = accessor.get(ITunnelService);
                    tunnelContext = TunnelItem.createFromTunnel(remoteExplorerService, tunnelService, tunnel);
                }
            }
            if (tunnelContext) {
                const tunnelItem = tunnelContext;
                return new Promise(resolve => {
                    const startingValue = tunnelItem.name ? tunnelItem.name : `${tunnelItem.remotePort}`;
                    remoteExplorerService.setEditable(tunnelItem, TunnelEditId.Label, {
                        onFinish: async (value, success) => {
                            value = value.trim();
                            remoteExplorerService.setEditable(tunnelItem, TunnelEditId.Label, null);
                            const changed = success && (value !== startingValue);
                            if (changed) {
                                await remoteExplorerService.tunnelModel.name(tunnelItem.remoteHost, tunnelItem.remotePort, value);
                            }
                            resolve(changed ? { port: tunnelItem.remotePort, label: value } : undefined);
                        },
                        validationMessage: () => null,
                        placeholder: nls.localize('remote.tunnelsView.labelPlaceholder', "Port label"),
                        startingValue
                    });
                });
            }
            return undefined;
        };
    }
    LabelTunnelAction.handler = handler;
})(LabelTunnelAction || (LabelTunnelAction = {}));
const invalidPortString = nls.localize('remote.tunnelsView.portNumberValid', "Forwarded port should be a number or a host:port.");
const maxPortNumber = 65536;
const invalidPortNumberString = nls.localize('remote.tunnelsView.portNumberToHigh', "Port number must be \u2265 0 and < {0}.", maxPortNumber);
const requiresSudoString = nls.localize('remote.tunnelView.inlineElevationMessage', "May Require Sudo");
const alreadyForwarded = nls.localize('remote.tunnelView.alreadyForwarded', "Port is already forwarded");
export var ForwardPortAction;
(function (ForwardPortAction) {
    ForwardPortAction.INLINE_ID = 'remote.tunnel.forwardInline';
    ForwardPortAction.COMMANDPALETTE_ID = 'remote.tunnel.forwardCommandPalette';
    ForwardPortAction.LABEL = nls.localize2('remote.tunnel.forward', "Forward a Port");
    ForwardPortAction.TREEITEM_LABEL = nls.localize('remote.tunnel.forwardItem', "Forward Port");
    const forwardPrompt = nls.localize('remote.tunnel.forwardPrompt', "Port number or address (eg. 3000 or 10.10.10.10:2000).");
    function validateInput(remoteExplorerService, tunnelService, value, canElevate) {
        const parsed = parseAddress(value);
        if (!parsed) {
            return { content: invalidPortString, severity: Severity.Error };
        }
        else if (parsed.port >= maxPortNumber) {
            return { content: invalidPortNumberString, severity: Severity.Error };
        }
        else if (canElevate && tunnelService.isPortPrivileged(parsed.port)) {
            return { content: requiresSudoString, severity: Severity.Info };
        }
        else if (mapHasAddressLocalhostOrAllInterfaces(remoteExplorerService.tunnelModel.forwarded, parsed.host, parsed.port)) {
            return { content: alreadyForwarded, severity: Severity.Error };
        }
        return null;
    }
    function error(notificationService, tunnelOrError, host, port) {
        if (!tunnelOrError) {
            notificationService.warn(nls.localize('remote.tunnel.forwardError', "Unable to forward {0}:{1}. The host may not be available or that remote port may already be forwarded", host, port));
        }
        else if (typeof tunnelOrError === 'string') {
            notificationService.warn(nls.localize('remote.tunnel.forwardErrorProvided', "Unable to forward {0}:{1}. {2}", host, port, tunnelOrError));
        }
    }
    function inlineHandler() {
        return async (accessor, arg) => {
            const remoteExplorerService = accessor.get(IRemoteExplorerService);
            const notificationService = accessor.get(INotificationService);
            const tunnelService = accessor.get(ITunnelService);
            remoteExplorerService.setEditable(undefined, TunnelEditId.New, {
                onFinish: async (value, success) => {
                    remoteExplorerService.setEditable(undefined, TunnelEditId.New, null);
                    let parsed;
                    if (success && (parsed = parseAddress(value))) {
                        remoteExplorerService.forward({
                            remote: { host: parsed.host, port: parsed.port },
                            elevateIfNeeded: true
                        }).then(tunnelOrError => error(notificationService, tunnelOrError, parsed.host, parsed.port));
                    }
                },
                validationMessage: (value) => validateInput(remoteExplorerService, tunnelService, value, tunnelService.canElevate),
                placeholder: forwardPrompt
            });
        };
    }
    ForwardPortAction.inlineHandler = inlineHandler;
    function commandPaletteHandler() {
        return async (accessor, arg) => {
            const remoteExplorerService = accessor.get(IRemoteExplorerService);
            const notificationService = accessor.get(INotificationService);
            const viewsService = accessor.get(IViewsService);
            const quickInputService = accessor.get(IQuickInputService);
            const tunnelService = accessor.get(ITunnelService);
            await viewsService.openView(TunnelPanel.ID, true);
            const value = await quickInputService.input({
                prompt: forwardPrompt,
                validateInput: (value) => Promise.resolve(validateInput(remoteExplorerService, tunnelService, value, tunnelService.canElevate))
            });
            let parsed;
            if (value && (parsed = parseAddress(value))) {
                remoteExplorerService.forward({
                    remote: { host: parsed.host, port: parsed.port },
                    elevateIfNeeded: true
                }).then(tunnel => error(notificationService, tunnel, parsed.host, parsed.port));
            }
        };
    }
    ForwardPortAction.commandPaletteHandler = commandPaletteHandler;
})(ForwardPortAction || (ForwardPortAction = {}));
function makeTunnelPicks(tunnels, remoteExplorerService, tunnelService) {
    const picks = tunnels.map(forwarded => {
        const item = TunnelItem.createFromTunnel(remoteExplorerService, tunnelService, forwarded);
        return {
            label: item.label,
            description: item.processDescription,
            tunnel: item
        };
    });
    if (picks.length === 0) {
        picks.push({
            label: nls.localize('remote.tunnel.closeNoPorts', "No ports currently forwarded. Try running the {0} command", ForwardPortAction.LABEL.value)
        });
    }
    return picks;
}
var ClosePortAction;
(function (ClosePortAction) {
    ClosePortAction.INLINE_ID = 'remote.tunnel.closeInline';
    ClosePortAction.COMMANDPALETTE_ID = 'remote.tunnel.closeCommandPalette';
    ClosePortAction.LABEL = nls.localize2('remote.tunnel.close', "Stop Forwarding Port");
    function inlineHandler() {
        return async (accessor, arg) => {
            const contextKeyService = accessor.get(IContextKeyService);
            const remoteExplorerService = accessor.get(IRemoteExplorerService);
            let ports = [];
            const multiSelectContext = contextKeyService.getContextKeyValue(TunnelViewMultiSelectionKeyName);
            if (multiSelectContext) {
                multiSelectContext.forEach(context => {
                    const tunnel = remoteExplorerService.tunnelModel.forwarded.get(context);
                    if (tunnel) {
                        ports?.push(tunnel);
                    }
                });
            }
            else if (isITunnelItem(arg)) {
                ports = [arg];
            }
            else {
                const context = contextKeyService.getContextKeyValue(TunnelViewSelectionKeyName);
                const tunnel = context ? remoteExplorerService.tunnelModel.forwarded.get(context) : undefined;
                if (tunnel) {
                    ports = [tunnel];
                }
            }
            if (!ports || ports.length === 0) {
                return;
            }
            return Promise.all(ports.map(port => remoteExplorerService.close({ host: port.remoteHost, port: port.remotePort }, TunnelCloseReason.User)));
        };
    }
    ClosePortAction.inlineHandler = inlineHandler;
    function commandPaletteHandler() {
        return async (accessor) => {
            const quickInputService = accessor.get(IQuickInputService);
            const remoteExplorerService = accessor.get(IRemoteExplorerService);
            const tunnelService = accessor.get(ITunnelService);
            const commandService = accessor.get(ICommandService);
            const picks = makeTunnelPicks(Array.from(remoteExplorerService.tunnelModel.forwarded.values()).filter(tunnel => tunnel.closeable), remoteExplorerService, tunnelService);
            const result = await quickInputService.pick(picks, { placeHolder: nls.localize('remote.tunnel.closePlaceholder', "Choose a port to stop forwarding") });
            if (result && result.tunnel) {
                await remoteExplorerService.close({ host: result.tunnel.remoteHost, port: result.tunnel.remotePort }, TunnelCloseReason.User);
            }
            else if (result) {
                await commandService.executeCommand(ForwardPortAction.COMMANDPALETTE_ID);
            }
        };
    }
    ClosePortAction.commandPaletteHandler = commandPaletteHandler;
})(ClosePortAction || (ClosePortAction = {}));
export var OpenPortInBrowserAction;
(function (OpenPortInBrowserAction) {
    OpenPortInBrowserAction.ID = 'remote.tunnel.open';
    OpenPortInBrowserAction.LABEL = nls.localize('remote.tunnel.open', "Open in Browser");
    function handler() {
        return async (accessor, arg) => {
            let key;
            if (isITunnelItem(arg)) {
                key = makeAddress(arg.remoteHost, arg.remotePort);
            }
            else if (arg.tunnelRemoteHost && arg.tunnelRemotePort) {
                key = makeAddress(arg.tunnelRemoteHost, arg.tunnelRemotePort);
            }
            if (key) {
                const model = accessor.get(IRemoteExplorerService).tunnelModel;
                const openerService = accessor.get(IOpenerService);
                return run(model, openerService, key);
            }
        };
    }
    OpenPortInBrowserAction.handler = handler;
    function run(model, openerService, key) {
        const tunnel = model.forwarded.get(key) || model.detected.get(key);
        if (tunnel) {
            return openerService.open(tunnel.localUri, { allowContributedOpeners: false });
        }
        return Promise.resolve();
    }
    OpenPortInBrowserAction.run = run;
})(OpenPortInBrowserAction || (OpenPortInBrowserAction = {}));
export var OpenPortInPreviewAction;
(function (OpenPortInPreviewAction) {
    OpenPortInPreviewAction.ID = 'remote.tunnel.openPreview';
    OpenPortInPreviewAction.LABEL = nls.localize('remote.tunnel.openPreview', "Preview in Editor");
    function handler() {
        return async (accessor, arg) => {
            let key;
            if (isITunnelItem(arg)) {
                key = makeAddress(arg.remoteHost, arg.remotePort);
            }
            else if (arg.tunnelRemoteHost && arg.tunnelRemotePort) {
                key = makeAddress(arg.tunnelRemoteHost, arg.tunnelRemotePort);
            }
            if (key) {
                const model = accessor.get(IRemoteExplorerService).tunnelModel;
                const openerService = accessor.get(IOpenerService);
                const externalOpenerService = accessor.get(IExternalUriOpenerService);
                return run(model, openerService, externalOpenerService, key);
            }
        };
    }
    OpenPortInPreviewAction.handler = handler;
    async function run(model, openerService, externalOpenerService, key) {
        const tunnel = model.forwarded.get(key) || model.detected.get(key);
        if (tunnel) {
            const remoteHost = tunnel.remoteHost.includes(':') ? `[${tunnel.remoteHost}]` : tunnel.remoteHost;
            const sourceUri = URI.parse(`http://${remoteHost}:${tunnel.remotePort}`);
            const opener = await externalOpenerService.getOpener(tunnel.localUri, { sourceUri }, CancellationToken.None);
            if (opener) {
                return opener.openExternalUri(tunnel.localUri, { sourceUri }, CancellationToken.None);
            }
            return openerService.open(tunnel.localUri);
        }
        return Promise.resolve();
    }
    OpenPortInPreviewAction.run = run;
})(OpenPortInPreviewAction || (OpenPortInPreviewAction = {}));
var OpenPortInBrowserCommandPaletteAction;
(function (OpenPortInBrowserCommandPaletteAction) {
    OpenPortInBrowserCommandPaletteAction.ID = 'remote.tunnel.openCommandPalette';
    OpenPortInBrowserCommandPaletteAction.LABEL = nls.localize('remote.tunnel.openCommandPalette', "Open Port in Browser");
    function handler() {
        return async (accessor, arg) => {
            const remoteExplorerService = accessor.get(IRemoteExplorerService);
            const tunnelService = accessor.get(ITunnelService);
            const model = remoteExplorerService.tunnelModel;
            const quickPickService = accessor.get(IQuickInputService);
            const openerService = accessor.get(IOpenerService);
            const commandService = accessor.get(ICommandService);
            const options = [...model.forwarded, ...model.detected].map(value => {
                const tunnelItem = TunnelItem.createFromTunnel(remoteExplorerService, tunnelService, value[1]);
                return {
                    label: tunnelItem.label,
                    description: tunnelItem.processDescription,
                    tunnel: tunnelItem
                };
            });
            if (options.length === 0) {
                options.push({
                    label: nls.localize('remote.tunnel.openCommandPaletteNone', "No ports currently forwarded. Open the Ports view to get started.")
                });
            }
            else {
                options.push({
                    label: nls.localize('remote.tunnel.openCommandPaletteView', "Open the Ports view...")
                });
            }
            const picked = await quickPickService.pick(options, { placeHolder: nls.localize('remote.tunnel.openCommandPalettePick', "Choose the port to open") });
            if (picked && picked.tunnel) {
                return OpenPortInBrowserAction.run(model, openerService, makeAddress(picked.tunnel.remoteHost, picked.tunnel.remotePort));
            }
            else if (picked) {
                return commandService.executeCommand(`${TUNNEL_VIEW_ID}.focus`);
            }
        };
    }
    OpenPortInBrowserCommandPaletteAction.handler = handler;
})(OpenPortInBrowserCommandPaletteAction || (OpenPortInBrowserCommandPaletteAction = {}));
var CopyAddressAction;
(function (CopyAddressAction) {
    CopyAddressAction.INLINE_ID = 'remote.tunnel.copyAddressInline';
    CopyAddressAction.COMMANDPALETTE_ID = 'remote.tunnel.copyAddressCommandPalette';
    CopyAddressAction.INLINE_LABEL = nls.localize('remote.tunnel.copyAddressInline', "Copy Local Address");
    CopyAddressAction.COMMANDPALETTE_LABEL = nls.localize('remote.tunnel.copyAddressCommandPalette', "Copy Forwarded Port Address");
    async function copyAddress(remoteExplorerService, clipboardService, tunnelItem) {
        const address = remoteExplorerService.tunnelModel.address(tunnelItem.remoteHost, tunnelItem.remotePort);
        if (address) {
            await clipboardService.writeText(address.toString());
        }
    }
    function inlineHandler() {
        return async (accessor, arg) => {
            const remoteExplorerService = accessor.get(IRemoteExplorerService);
            let tunnelItem;
            if (isITunnelItem(arg)) {
                tunnelItem = arg;
            }
            else {
                const context = accessor.get(IContextKeyService).getContextKeyValue(TunnelViewSelectionKeyName);
                tunnelItem = context ? remoteExplorerService.tunnelModel.forwarded.get(context) : undefined;
            }
            if (tunnelItem) {
                return copyAddress(remoteExplorerService, accessor.get(IClipboardService), tunnelItem);
            }
        };
    }
    CopyAddressAction.inlineHandler = inlineHandler;
    function commandPaletteHandler() {
        return async (accessor, arg) => {
            const quickInputService = accessor.get(IQuickInputService);
            const remoteExplorerService = accessor.get(IRemoteExplorerService);
            const tunnelService = accessor.get(ITunnelService);
            const commandService = accessor.get(ICommandService);
            const clipboardService = accessor.get(IClipboardService);
            const tunnels = Array.from(remoteExplorerService.tunnelModel.forwarded.values()).concat(Array.from(remoteExplorerService.tunnelModel.detected.values()));
            const result = await quickInputService.pick(makeTunnelPicks(tunnels, remoteExplorerService, tunnelService), { placeHolder: nls.localize('remote.tunnel.copyAddressPlaceholdter', "Choose a forwarded port") });
            if (result && result.tunnel) {
                await copyAddress(remoteExplorerService, clipboardService, result.tunnel);
            }
            else if (result) {
                await commandService.executeCommand(ForwardPortAction.COMMANDPALETTE_ID);
            }
        };
    }
    CopyAddressAction.commandPaletteHandler = commandPaletteHandler;
})(CopyAddressAction || (CopyAddressAction = {}));
var ChangeLocalPortAction;
(function (ChangeLocalPortAction) {
    ChangeLocalPortAction.ID = 'remote.tunnel.changeLocalPort';
    ChangeLocalPortAction.LABEL = nls.localize('remote.tunnel.changeLocalPort', "Change Local Address Port");
    function validateInput(tunnelService, value, canElevate) {
        if (!value.match(/^[0-9]+$/)) {
            return { content: nls.localize('remote.tunnelsView.portShouldBeNumber', "Local port should be a number."), severity: Severity.Error };
        }
        else if (Number(value) >= maxPortNumber) {
            return { content: invalidPortNumberString, severity: Severity.Error };
        }
        else if (canElevate && tunnelService.isPortPrivileged(Number(value))) {
            return { content: requiresSudoString, severity: Severity.Info };
        }
        return null;
    }
    function handler() {
        return async (accessor, arg) => {
            const remoteExplorerService = accessor.get(IRemoteExplorerService);
            const notificationService = accessor.get(INotificationService);
            const tunnelService = accessor.get(ITunnelService);
            let tunnelContext;
            if (isITunnelItem(arg)) {
                tunnelContext = arg;
            }
            else {
                const context = accessor.get(IContextKeyService).getContextKeyValue(TunnelViewSelectionKeyName);
                const tunnel = context ? remoteExplorerService.tunnelModel.forwarded.get(context) : undefined;
                if (tunnel) {
                    const tunnelService = accessor.get(ITunnelService);
                    tunnelContext = TunnelItem.createFromTunnel(remoteExplorerService, tunnelService, tunnel);
                }
            }
            if (tunnelContext) {
                const tunnelItem = tunnelContext;
                remoteExplorerService.setEditable(tunnelItem, TunnelEditId.LocalPort, {
                    onFinish: async (value, success) => {
                        remoteExplorerService.setEditable(tunnelItem, TunnelEditId.LocalPort, null);
                        if (success) {
                            await remoteExplorerService.close({ host: tunnelItem.remoteHost, port: tunnelItem.remotePort }, TunnelCloseReason.Other);
                            const numberValue = Number(value);
                            const newForward = await remoteExplorerService.forward({
                                remote: { host: tunnelItem.remoteHost, port: tunnelItem.remotePort },
                                local: numberValue,
                                name: tunnelItem.name,
                                elevateIfNeeded: true,
                                source: tunnelItem.source
                            });
                            if (newForward && (typeof newForward !== 'string') && newForward.tunnelLocalPort !== numberValue) {
                                notificationService.warn(nls.localize('remote.tunnel.changeLocalPortNumber', "The local port {0} is not available. Port number {1} has been used instead", value, newForward.tunnelLocalPort ?? newForward.localAddress));
                            }
                        }
                    },
                    validationMessage: (value) => validateInput(tunnelService, value, tunnelService.canElevate),
                    placeholder: nls.localize('remote.tunnelsView.changePort', "New local port")
                });
            }
        };
    }
    ChangeLocalPortAction.handler = handler;
})(ChangeLocalPortAction || (ChangeLocalPortAction = {}));
var ChangeTunnelPrivacyAction;
(function (ChangeTunnelPrivacyAction) {
    function handler(privacyId) {
        return async (accessor, arg) => {
            if (isITunnelItem(arg)) {
                const remoteExplorerService = accessor.get(IRemoteExplorerService);
                await remoteExplorerService.close({ host: arg.remoteHost, port: arg.remotePort }, TunnelCloseReason.Other);
                return remoteExplorerService.forward({
                    remote: { host: arg.remoteHost, port: arg.remotePort },
                    local: arg.localPort,
                    name: arg.name,
                    elevateIfNeeded: true,
                    privacy: privacyId,
                    source: arg.source
                });
            }
            return undefined;
        };
    }
    ChangeTunnelPrivacyAction.handler = handler;
})(ChangeTunnelPrivacyAction || (ChangeTunnelPrivacyAction = {}));
var SetTunnelProtocolAction;
(function (SetTunnelProtocolAction) {
    SetTunnelProtocolAction.ID_HTTP = 'remote.tunnel.setProtocolHttp';
    SetTunnelProtocolAction.ID_HTTPS = 'remote.tunnel.setProtocolHttps';
    SetTunnelProtocolAction.LABEL_HTTP = nls.localize('remote.tunnel.protocolHttp', "HTTP");
    SetTunnelProtocolAction.LABEL_HTTPS = nls.localize('remote.tunnel.protocolHttps', "HTTPS");
    async function handler(arg, protocol, remoteExplorerService, environmentService) {
        if (isITunnelItem(arg)) {
            const attributes = {
                protocol
            };
            const target = environmentService.remoteAuthority ? 4 : 3;
            return remoteExplorerService.tunnelModel.configPortsAttributes.addAttributes(arg.remotePort, attributes, target);
        }
    }
    function handlerHttp() {
        return async (accessor, arg) => {
            return handler(arg, TunnelProtocol.Http, accessor.get(IRemoteExplorerService), accessor.get(IWorkbenchEnvironmentService));
        };
    }
    SetTunnelProtocolAction.handlerHttp = handlerHttp;
    function handlerHttps() {
        return async (accessor, arg) => {
            return handler(arg, TunnelProtocol.Https, accessor.get(IRemoteExplorerService), accessor.get(IWorkbenchEnvironmentService));
        };
    }
    SetTunnelProtocolAction.handlerHttps = handlerHttps;
})(SetTunnelProtocolAction || (SetTunnelProtocolAction = {}));
const tunnelViewCommandsWeightBonus = 10;
const isForwardedExpr = TunnelTypeContextKey.isEqualTo(TunnelType.Forwarded);
const isForwardedOrDetectedExpr = ContextKeyExpr.or(isForwardedExpr, TunnelTypeContextKey.isEqualTo(TunnelType.Detected));
const isNotMultiSelectionExpr = TunnelViewMultiSelectionContextKey.isEqualTo(undefined);
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: LabelTunnelAction.ID,
    weight: 200 + tunnelViewCommandsWeightBonus,
    when: ContextKeyExpr.and(TunnelViewFocusContextKey, isForwardedExpr, isNotMultiSelectionExpr),
    primary: 60,
    mac: {
        primary: 3
    },
    handler: LabelTunnelAction.handler()
});
CommandsRegistry.registerCommand(ForwardPortAction.INLINE_ID, ForwardPortAction.inlineHandler());
CommandsRegistry.registerCommand(ForwardPortAction.COMMANDPALETTE_ID, ForwardPortAction.commandPaletteHandler());
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: ClosePortAction.INLINE_ID,
    weight: 200 + tunnelViewCommandsWeightBonus,
    when: ContextKeyExpr.and(TunnelCloseableContextKey, TunnelViewFocusContextKey),
    primary: 20,
    mac: {
        primary: 2048 | 1,
        secondary: [20]
    },
    handler: ClosePortAction.inlineHandler()
});
CommandsRegistry.registerCommand(ClosePortAction.COMMANDPALETTE_ID, ClosePortAction.commandPaletteHandler());
CommandsRegistry.registerCommand(OpenPortInBrowserAction.ID, OpenPortInBrowserAction.handler());
CommandsRegistry.registerCommand(OpenPortInPreviewAction.ID, OpenPortInPreviewAction.handler());
CommandsRegistry.registerCommand(OpenPortInBrowserCommandPaletteAction.ID, OpenPortInBrowserCommandPaletteAction.handler());
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: CopyAddressAction.INLINE_ID,
    weight: 200 + tunnelViewCommandsWeightBonus,
    when: ContextKeyExpr.and(TunnelViewFocusContextKey, isForwardedOrDetectedExpr, isNotMultiSelectionExpr),
    primary: 2048 | 33,
    handler: CopyAddressAction.inlineHandler()
});
CommandsRegistry.registerCommand(CopyAddressAction.COMMANDPALETTE_ID, CopyAddressAction.commandPaletteHandler());
CommandsRegistry.registerCommand(ChangeLocalPortAction.ID, ChangeLocalPortAction.handler());
CommandsRegistry.registerCommand(SetTunnelProtocolAction.ID_HTTP, SetTunnelProtocolAction.handlerHttp());
CommandsRegistry.registerCommand(SetTunnelProtocolAction.ID_HTTPS, SetTunnelProtocolAction.handlerHttps());
MenuRegistry.appendMenuItem(MenuId.CommandPalette, ({
    command: {
        id: ClosePortAction.COMMANDPALETTE_ID,
        title: ClosePortAction.LABEL
    },
    when: forwardedPortsViewEnabled
}));
MenuRegistry.appendMenuItem(MenuId.CommandPalette, ({
    command: {
        id: ForwardPortAction.COMMANDPALETTE_ID,
        title: ForwardPortAction.LABEL
    },
    when: forwardedPortsViewEnabled
}));
MenuRegistry.appendMenuItem(MenuId.CommandPalette, ({
    command: {
        id: CopyAddressAction.COMMANDPALETTE_ID,
        title: CopyAddressAction.COMMANDPALETTE_LABEL
    },
    when: forwardedPortsViewEnabled
}));
MenuRegistry.appendMenuItem(MenuId.CommandPalette, ({
    command: {
        id: OpenPortInBrowserCommandPaletteAction.ID,
        title: OpenPortInBrowserCommandPaletteAction.LABEL
    },
    when: forwardedPortsViewEnabled
}));
MenuRegistry.appendMenuItem(MenuId.TunnelContext, ({
    group: '._open',
    order: 0,
    command: {
        id: OpenPortInBrowserAction.ID,
        title: OpenPortInBrowserAction.LABEL,
    },
    when: ContextKeyExpr.and(isForwardedOrDetectedExpr, isNotMultiSelectionExpr)
}));
MenuRegistry.appendMenuItem(MenuId.TunnelContext, ({
    group: '._open',
    order: 1,
    command: {
        id: OpenPortInPreviewAction.ID,
        title: OpenPortInPreviewAction.LABEL,
    },
    when: ContextKeyExpr.and(isForwardedOrDetectedExpr, isNotMultiSelectionExpr)
}));
MenuRegistry.appendMenuItem(MenuId.TunnelContext, ({
    group: '0_manage',
    order: 1,
    command: {
        id: LabelTunnelAction.ID,
        title: LabelTunnelAction.LABEL,
        icon: labelPortIcon
    },
    when: ContextKeyExpr.and(isForwardedExpr, isNotMultiSelectionExpr)
}));
MenuRegistry.appendMenuItem(MenuId.TunnelContext, ({
    group: '2_localaddress',
    order: 0,
    command: {
        id: CopyAddressAction.INLINE_ID,
        title: CopyAddressAction.INLINE_LABEL,
    },
    when: ContextKeyExpr.and(isForwardedOrDetectedExpr, isNotMultiSelectionExpr)
}));
MenuRegistry.appendMenuItem(MenuId.TunnelContext, ({
    group: '2_localaddress',
    order: 1,
    command: {
        id: ChangeLocalPortAction.ID,
        title: ChangeLocalPortAction.LABEL,
    },
    when: ContextKeyExpr.and(isForwardedExpr, PortChangableContextKey, isNotMultiSelectionExpr)
}));
MenuRegistry.appendMenuItem(MenuId.TunnelContext, ({
    group: '2_localaddress',
    order: 2,
    submenu: MenuId.TunnelPrivacy,
    title: nls.localize('tunnelContext.privacyMenu', "Port Visibility"),
    when: ContextKeyExpr.and(isForwardedExpr, TunnelPrivacyEnabledContextKey)
}));
MenuRegistry.appendMenuItem(MenuId.TunnelContext, ({
    group: '2_localaddress',
    order: 3,
    submenu: MenuId.TunnelProtocol,
    title: nls.localize('tunnelContext.protocolMenu', "Change Port Protocol"),
    when: ContextKeyExpr.and(isForwardedExpr, isNotMultiSelectionExpr, ProtocolChangeableContextKey)
}));
MenuRegistry.appendMenuItem(MenuId.TunnelContext, ({
    group: '3_forward',
    order: 0,
    command: {
        id: ClosePortAction.INLINE_ID,
        title: ClosePortAction.LABEL,
    },
    when: TunnelCloseableContextKey
}));
MenuRegistry.appendMenuItem(MenuId.TunnelContext, ({
    group: '3_forward',
    order: 1,
    command: {
        id: ForwardPortAction.INLINE_ID,
        title: ForwardPortAction.LABEL,
    },
}));
MenuRegistry.appendMenuItem(MenuId.TunnelProtocol, ({
    order: 0,
    command: {
        id: SetTunnelProtocolAction.ID_HTTP,
        title: SetTunnelProtocolAction.LABEL_HTTP,
        toggled: TunnelProtocolContextKey.isEqualTo(TunnelProtocol.Http)
    }
}));
MenuRegistry.appendMenuItem(MenuId.TunnelProtocol, ({
    order: 1,
    command: {
        id: SetTunnelProtocolAction.ID_HTTPS,
        title: SetTunnelProtocolAction.LABEL_HTTPS,
        toggled: TunnelProtocolContextKey.isEqualTo(TunnelProtocol.Https)
    }
}));
MenuRegistry.appendMenuItem(MenuId.TunnelPortInline, ({
    group: '0_manage',
    order: 0,
    command: {
        id: ForwardPortAction.INLINE_ID,
        title: ForwardPortAction.TREEITEM_LABEL,
        icon: forwardPortIcon
    },
    when: TunnelTypeContextKey.isEqualTo(TunnelType.Candidate)
}));
MenuRegistry.appendMenuItem(MenuId.TunnelPortInline, ({
    group: '0_manage',
    order: 4,
    command: {
        id: LabelTunnelAction.ID,
        title: LabelTunnelAction.LABEL,
        icon: labelPortIcon
    },
    when: isForwardedExpr
}));
MenuRegistry.appendMenuItem(MenuId.TunnelPortInline, ({
    group: '0_manage',
    order: 5,
    command: {
        id: ClosePortAction.INLINE_ID,
        title: ClosePortAction.LABEL,
        icon: stopForwardIcon
    },
    when: TunnelCloseableContextKey
}));
MenuRegistry.appendMenuItem(MenuId.TunnelLocalAddressInline, ({
    order: -1,
    command: {
        id: CopyAddressAction.INLINE_ID,
        title: CopyAddressAction.INLINE_LABEL,
        icon: copyAddressIcon
    },
    when: isForwardedOrDetectedExpr
}));
MenuRegistry.appendMenuItem(MenuId.TunnelLocalAddressInline, ({
    order: 0,
    command: {
        id: OpenPortInBrowserAction.ID,
        title: OpenPortInBrowserAction.LABEL,
        icon: openBrowserIcon
    },
    when: isForwardedOrDetectedExpr
}));
MenuRegistry.appendMenuItem(MenuId.TunnelLocalAddressInline, ({
    order: 1,
    command: {
        id: OpenPortInPreviewAction.ID,
        title: OpenPortInPreviewAction.LABEL,
        icon: openPreviewIcon
    },
    when: isForwardedOrDetectedExpr
}));
registerColor('ports.iconRunningProcessForeground', STATUS_BAR_REMOTE_ITEM_BACKGROUND, nls.localize('portWithRunningProcess.foreground', "The color of the icon for a port that has an associated running process."));
