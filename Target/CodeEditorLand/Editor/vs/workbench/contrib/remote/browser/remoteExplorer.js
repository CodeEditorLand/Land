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
import { Disposable, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { Extensions } from '../../../common/views.js';
import { IRemoteExplorerService, PORT_AUTO_FALLBACK_SETTING, PORT_AUTO_FORWARD_SETTING, PORT_AUTO_SOURCE_SETTING, PORT_AUTO_SOURCE_SETTING_HYBRID, PORT_AUTO_SOURCE_SETTING_OUTPUT, PORT_AUTO_SOURCE_SETTING_PROCESS, PortsEnablement, TUNNEL_VIEW_CONTAINER_ID, TUNNEL_VIEW_ID } from '../../../services/remote/common/remoteExplorerService.js';
import { AutoTunnelSource, forwardedPortsFeaturesEnabled, forwardedPortsViewEnabled, makeAddress, mapHasAddressLocalhostOrAllInterfaces, OnPortForward, TunnelCloseReason, TunnelSource } from '../../../services/remote/common/tunnelModel.js';
import { ForwardPortAction, OpenPortInBrowserAction, TunnelPanel, TunnelPanelDescriptor, TunnelViewModel, OpenPortInPreviewAction, openPreviewEnabledContext } from './tunnelView.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { IStatusbarService } from '../../../services/statusbar/browser/statusbar.js';
import { UrlFinder } from './urlFinder.js';
import Severity from '../../../../base/common/severity.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { ITerminalService } from '../../terminal/browser/terminal.js';
import { IDebugService } from '../../debug/common/debug.js';
import { IRemoteAgentService } from '../../../services/remote/common/remoteAgentService.js';
import { isWeb } from '../../../../base/common/platform.js';
import { ITunnelService, TunnelPrivacyId } from '../../../../platform/tunnel/common/tunnel.js';
import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.js';
import { ViewPaneContainer } from '../../../browser/parts/views/viewPaneContainer.js';
import { IActivityService, NumberBadge } from '../../../services/activity/common/activity.js';
import { portsViewIcon } from './remoteIcons.js';
import { Event } from '../../../../base/common/event.js';
import { IExternalUriOpenerService } from '../../externalUriOpener/common/externalUriOpenerService.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { Extensions as ConfigurationExtensions } from '../../../../platform/configuration/common/configurationRegistry.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IWorkbenchConfigurationService } from '../../../services/configuration/common/configuration.js';
import { Action } from '../../../../base/common/actions.js';
import { IPreferencesService } from '../../../services/preferences/common/preferences.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
export const VIEWLET_ID = 'workbench.view.remote';
let ForwardedPortsView = class ForwardedPortsView extends Disposable {
    constructor(contextKeyService, environmentService, remoteExplorerService, tunnelService, activityService, statusbarService) {
        super();
        this.contextKeyService = contextKeyService;
        this.environmentService = environmentService;
        this.remoteExplorerService = remoteExplorerService;
        this.tunnelService = tunnelService;
        this.activityService = activityService;
        this.statusbarService = statusbarService;
        this.contextKeyListener = this._register(new MutableDisposable());
        this.activityBadge = this._register(new MutableDisposable());
        this._register(Registry.as(Extensions.ViewsRegistry).registerViewWelcomeContent(TUNNEL_VIEW_ID, {
            content: this.environmentService.remoteAuthority ? nls.localize('remoteNoPorts', "No forwarded ports. Forward a port to access your running services locally.\n[Forward a Port]({0})", `command:${ForwardPortAction.INLINE_ID}`)
                : nls.localize('noRemoteNoPorts', "No forwarded ports. Forward a port to access your locally running services over the internet.\n[Forward a Port]({0})", `command:${ForwardPortAction.INLINE_ID}`),
        }));
        this.enableBadgeAndStatusBar();
        this.enableForwardedPortsFeatures();
    }
    async getViewContainer() {
        return Registry.as(Extensions.ViewContainersRegistry).registerViewContainer({
            id: TUNNEL_VIEW_CONTAINER_ID,
            title: nls.localize2('ports', "Ports"),
            icon: portsViewIcon,
            ctorDescriptor: new SyncDescriptor(ViewPaneContainer, [TUNNEL_VIEW_CONTAINER_ID, { mergeViewWithContainerWhenSingleView: true }]),
            storageId: TUNNEL_VIEW_CONTAINER_ID,
            hideIfEmpty: true,
            order: 5
        }, 1);
    }
    async enableForwardedPortsFeatures() {
        this.contextKeyListener.clear();
        const featuresEnabled = !!forwardedPortsFeaturesEnabled.getValue(this.contextKeyService);
        const viewEnabled = !!forwardedPortsViewEnabled.getValue(this.contextKeyService);
        if (featuresEnabled || viewEnabled) {
            if (!viewEnabled) {
                this.contextKeyService.createKey(forwardedPortsViewEnabled.key, true);
            }
            const viewContainer = await this.getViewContainer();
            const tunnelPanelDescriptor = new TunnelPanelDescriptor(new TunnelViewModel(this.remoteExplorerService, this.tunnelService), this.environmentService);
            const viewsRegistry = Registry.as(Extensions.ViewsRegistry);
            if (viewContainer) {
                this.remoteExplorerService.enablePortsFeatures(!featuresEnabled);
                viewsRegistry.registerViews([tunnelPanelDescriptor], viewContainer);
            }
        }
        else {
            this.contextKeyListener.value = this.contextKeyService.onDidChangeContext(e => {
                if (e.affectsSome(new Set([...forwardedPortsFeaturesEnabled.keys(), ...forwardedPortsViewEnabled.keys()]))) {
                    this.enableForwardedPortsFeatures();
                }
            });
        }
    }
    enableBadgeAndStatusBar() {
        const disposable = Registry.as(Extensions.ViewsRegistry).onViewsRegistered(e => {
            if (e.find(view => view.views.find(viewDescriptor => viewDescriptor.id === TUNNEL_VIEW_ID))) {
                this._register(Event.debounce(this.remoteExplorerService.tunnelModel.onForwardPort, (_last, e) => e, 50)(() => {
                    this.updateActivityBadge();
                    this.updateStatusBar();
                }));
                this._register(Event.debounce(this.remoteExplorerService.tunnelModel.onClosePort, (_last, e) => e, 50)(() => {
                    this.updateActivityBadge();
                    this.updateStatusBar();
                }));
                this.updateActivityBadge();
                this.updateStatusBar();
                disposable.dispose();
            }
        });
    }
    async updateActivityBadge() {
        if (this.remoteExplorerService.tunnelModel.forwarded.size > 0) {
            this.activityBadge.value = this.activityService.showViewActivity(TUNNEL_VIEW_ID, {
                badge: new NumberBadge(this.remoteExplorerService.tunnelModel.forwarded.size, n => n === 1 ? nls.localize('1forwardedPort', "1 forwarded port") : nls.localize('nForwardedPorts', "{0} forwarded ports", n))
            });
        }
    }
    updateStatusBar() {
        if (!this.entryAccessor) {
            this._register(this.entryAccessor = this.statusbarService.addEntry(this.entry, 'status.forwardedPorts', 0, 40));
        }
        else {
            this.entryAccessor.update(this.entry);
        }
    }
    get entry() {
        let tooltip;
        const count = this.remoteExplorerService.tunnelModel.forwarded.size + this.remoteExplorerService.tunnelModel.detected.size;
        const text = `${count}`;
        if (count === 0) {
            tooltip = nls.localize('remote.forwardedPorts.statusbarTextNone', "No Ports Forwarded");
        }
        else {
            const allTunnels = Array.from(this.remoteExplorerService.tunnelModel.forwarded.values());
            allTunnels.push(...Array.from(this.remoteExplorerService.tunnelModel.detected.values()));
            tooltip = nls.localize('remote.forwardedPorts.statusbarTooltip', "Forwarded Ports: {0}", allTunnels.map(forwarded => forwarded.remotePort).join(', '));
        }
        return {
            name: nls.localize('status.forwardedPorts', "Forwarded Ports"),
            text: `$(radio-tower) ${text}`,
            ariaLabel: tooltip,
            tooltip,
            command: `${TUNNEL_VIEW_ID}.focus`
        };
    }
};
ForwardedPortsView = __decorate([
    __param(0, IContextKeyService),
    __param(1, IWorkbenchEnvironmentService),
    __param(2, IRemoteExplorerService),
    __param(3, ITunnelService),
    __param(4, IActivityService),
    __param(5, IStatusbarService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], ForwardedPortsView);
export { ForwardedPortsView };
let PortRestore = class PortRestore {
    constructor(remoteExplorerService, logService) {
        this.remoteExplorerService = remoteExplorerService;
        this.logService = logService;
        if (!this.remoteExplorerService.tunnelModel.environmentTunnelsSet) {
            Event.once(this.remoteExplorerService.tunnelModel.onEnvironmentTunnelsSet)(async () => {
                await this.restore();
            });
        }
        else {
            this.restore();
        }
    }
    async restore() {
        this.logService.trace('ForwardedPorts: Doing first restore.');
        return this.remoteExplorerService.restore();
    }
};
PortRestore = __decorate([
    __param(0, IRemoteExplorerService),
    __param(1, ILogService),
    __metadata("design:paramtypes", [Object, Object])
], PortRestore);
export { PortRestore };
let AutomaticPortForwarding = class AutomaticPortForwarding extends Disposable {
    constructor(terminalService, notificationService, openerService, externalOpenerService, remoteExplorerService, environmentService, contextKeyService, configurationService, debugService, remoteAgentService, tunnelService, hostService, logService, storageService, preferencesService) {
        super();
        this.terminalService = terminalService;
        this.notificationService = notificationService;
        this.openerService = openerService;
        this.externalOpenerService = externalOpenerService;
        this.remoteExplorerService = remoteExplorerService;
        this.contextKeyService = contextKeyService;
        this.configurationService = configurationService;
        this.debugService = debugService;
        this.tunnelService = tunnelService;
        this.hostService = hostService;
        this.logService = logService;
        this.storageService = storageService;
        this.preferencesService = preferencesService;
        if (!environmentService.remoteAuthority) {
            return;
        }
        configurationService.whenRemoteConfigurationLoaded().then(() => remoteAgentService.getEnvironment()).then(environment => {
            this.setup(environment);
            this._register(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(PORT_AUTO_SOURCE_SETTING)) {
                    this.setup(environment);
                }
                else if (e.affectsConfiguration(PORT_AUTO_FALLBACK_SETTING) && !this.portListener) {
                    this.listenForPorts();
                }
            }));
        });
        if (!this.storageService.getBoolean('processPortForwardingFallback', 1, true)) {
            this.configurationService.updateValue(PORT_AUTO_FALLBACK_SETTING, 0, 5);
        }
    }
    getPortAutoFallbackNumber() {
        const fallbackAt = this.configurationService.inspect(PORT_AUTO_FALLBACK_SETTING);
        if ((fallbackAt.value !== undefined) && (fallbackAt.value === 0 || (fallbackAt.value !== fallbackAt.defaultValue))) {
            return fallbackAt.value;
        }
        const inspectSource = this.configurationService.inspect(PORT_AUTO_SOURCE_SETTING);
        if (inspectSource.applicationValue === PORT_AUTO_SOURCE_SETTING_PROCESS ||
            inspectSource.userValue === PORT_AUTO_SOURCE_SETTING_PROCESS ||
            inspectSource.userLocalValue === PORT_AUTO_SOURCE_SETTING_PROCESS ||
            inspectSource.userRemoteValue === PORT_AUTO_SOURCE_SETTING_PROCESS ||
            inspectSource.workspaceFolderValue === PORT_AUTO_SOURCE_SETTING_PROCESS ||
            inspectSource.workspaceValue === PORT_AUTO_SOURCE_SETTING_PROCESS) {
            return 0;
        }
        return fallbackAt.value ?? 20;
    }
    listenForPorts() {
        let fallbackAt = this.getPortAutoFallbackNumber();
        if (fallbackAt === 0) {
            this.portListener?.dispose();
            return;
        }
        if (this.procForwarder && !this.portListener && (this.configurationService.getValue(PORT_AUTO_SOURCE_SETTING) === PORT_AUTO_SOURCE_SETTING_PROCESS)) {
            this.portListener = this._register(this.remoteExplorerService.tunnelModel.onForwardPort(async () => {
                fallbackAt = this.getPortAutoFallbackNumber();
                if (fallbackAt === 0) {
                    this.portListener?.dispose();
                    return;
                }
                if (Array.from(this.remoteExplorerService.tunnelModel.forwarded.values()).filter(tunnel => tunnel.source.source === TunnelSource.Auto).length > fallbackAt) {
                    await this.configurationService.updateValue(PORT_AUTO_SOURCE_SETTING, PORT_AUTO_SOURCE_SETTING_HYBRID);
                    this.notificationService.notify({
                        message: nls.localize('remote.autoForwardPortsSource.fallback', "Over 20 ports have been automatically forwarded. The `process` based automatic port forwarding has been switched to `hybrid` in settings. Some ports may no longer be detected."),
                        severity: Severity.Warning,
                        actions: {
                            primary: [
                                new Action('switchBack', nls.localize('remote.autoForwardPortsSource.fallback.switchBack', "Undo"), undefined, true, async () => {
                                    await this.configurationService.updateValue(PORT_AUTO_SOURCE_SETTING, PORT_AUTO_SOURCE_SETTING_PROCESS);
                                    await this.configurationService.updateValue(PORT_AUTO_FALLBACK_SETTING, 0, 5);
                                    this.portListener?.dispose();
                                    this.portListener = undefined;
                                }),
                                new Action('showPortSourceSetting', nls.localize('remote.autoForwardPortsSource.fallback.showPortSourceSetting', "Show Setting"), undefined, true, async () => {
                                    await this.preferencesService.openSettings({
                                        query: 'remote.autoForwardPortsSource'
                                    });
                                })
                            ]
                        }
                    });
                }
            }));
        }
        else {
            this.portListener?.dispose();
            this.portListener = undefined;
        }
    }
    setup(environment) {
        const alreadyForwarded = this.procForwarder?.forwarded;
        const isSwitch = this.outputForwarder || this.procForwarder;
        this.procForwarder?.dispose();
        this.procForwarder = undefined;
        this.outputForwarder?.dispose();
        this.outputForwarder = undefined;
        if (environment?.os !== 3) {
            if (this.configurationService.inspect(PORT_AUTO_SOURCE_SETTING).default?.value !== PORT_AUTO_SOURCE_SETTING_OUTPUT) {
                Registry.as(ConfigurationExtensions.Configuration)
                    .registerDefaultConfigurations([{ overrides: { 'remote.autoForwardPortsSource': PORT_AUTO_SOURCE_SETTING_OUTPUT } }]);
            }
            this.outputForwarder = this._register(new OutputAutomaticPortForwarding(this.terminalService, this.notificationService, this.openerService, this.externalOpenerService, this.remoteExplorerService, this.configurationService, this.debugService, this.tunnelService, this.hostService, this.logService, this.contextKeyService, () => false));
        }
        else {
            const useProc = () => (this.configurationService.getValue(PORT_AUTO_SOURCE_SETTING) === PORT_AUTO_SOURCE_SETTING_PROCESS);
            if (useProc()) {
                this.procForwarder = this._register(new ProcAutomaticPortForwarding(false, alreadyForwarded, !isSwitch, this.configurationService, this.remoteExplorerService, this.notificationService, this.openerService, this.externalOpenerService, this.tunnelService, this.hostService, this.logService, this.contextKeyService));
            }
            else if (this.configurationService.getValue(PORT_AUTO_SOURCE_SETTING) === PORT_AUTO_SOURCE_SETTING_HYBRID) {
                this.procForwarder = this._register(new ProcAutomaticPortForwarding(true, alreadyForwarded, !isSwitch, this.configurationService, this.remoteExplorerService, this.notificationService, this.openerService, this.externalOpenerService, this.tunnelService, this.hostService, this.logService, this.contextKeyService));
            }
            this.outputForwarder = this._register(new OutputAutomaticPortForwarding(this.terminalService, this.notificationService, this.openerService, this.externalOpenerService, this.remoteExplorerService, this.configurationService, this.debugService, this.tunnelService, this.hostService, this.logService, this.contextKeyService, useProc));
        }
        this.listenForPorts();
    }
};
AutomaticPortForwarding = __decorate([
    __param(0, ITerminalService),
    __param(1, INotificationService),
    __param(2, IOpenerService),
    __param(3, IExternalUriOpenerService),
    __param(4, IRemoteExplorerService),
    __param(5, IWorkbenchEnvironmentService),
    __param(6, IContextKeyService),
    __param(7, IWorkbenchConfigurationService),
    __param(8, IDebugService),
    __param(9, IRemoteAgentService),
    __param(10, ITunnelService),
    __param(11, IHostService),
    __param(12, ILogService),
    __param(13, IStorageService),
    __param(14, IPreferencesService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], AutomaticPortForwarding);
export { AutomaticPortForwarding };
class OnAutoForwardedAction extends Disposable {
    static { this.NOTIFY_COOL_DOWN = 5000; }
    constructor(notificationService, remoteExplorerService, openerService, externalOpenerService, tunnelService, hostService, logService, contextKeyService) {
        super();
        this.notificationService = notificationService;
        this.remoteExplorerService = remoteExplorerService;
        this.openerService = openerService;
        this.externalOpenerService = externalOpenerService;
        this.tunnelService = tunnelService;
        this.hostService = hostService;
        this.logService = logService;
        this.contextKeyService = contextKeyService;
        this.alreadyOpenedOnce = new Set();
        this.lastNotifyTime = new Date();
        this.lastNotifyTime.setFullYear(this.lastNotifyTime.getFullYear() - 1);
    }
    async doAction(tunnels) {
        this.logService.trace(`ForwardedPorts: (OnAutoForwardedAction) Starting action for ${tunnels[0]?.tunnelRemotePort}`);
        this.doActionTunnels = tunnels;
        const tunnel = await this.portNumberHeuristicDelay();
        this.logService.trace(`ForwardedPorts: (OnAutoForwardedAction) Heuristic chose ${tunnel?.tunnelRemotePort}`);
        if (tunnel) {
            const allAttributes = await this.remoteExplorerService.tunnelModel.getAttributes([{ port: tunnel.tunnelRemotePort, host: tunnel.tunnelRemoteHost }]);
            const attributes = allAttributes?.get(tunnel.tunnelRemotePort)?.onAutoForward;
            this.logService.trace(`ForwardedPorts: (OnAutoForwardedAction) onAutoForward action is ${attributes}`);
            switch (attributes) {
                case OnPortForward.OpenBrowserOnce: {
                    if (this.alreadyOpenedOnce.has(tunnel.localAddress)) {
                        break;
                    }
                    this.alreadyOpenedOnce.add(tunnel.localAddress);
                }
                case OnPortForward.OpenBrowser: {
                    const address = makeAddress(tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
                    await OpenPortInBrowserAction.run(this.remoteExplorerService.tunnelModel, this.openerService, address);
                    break;
                }
                case OnPortForward.OpenPreview: {
                    const address = makeAddress(tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
                    await OpenPortInPreviewAction.run(this.remoteExplorerService.tunnelModel, this.openerService, this.externalOpenerService, address);
                    break;
                }
                case OnPortForward.Silent: break;
                default: {
                    const elapsed = new Date().getTime() - this.lastNotifyTime.getTime();
                    this.logService.trace(`ForwardedPorts: (OnAutoForwardedAction) time elapsed since last notification ${elapsed} ms`);
                    if (elapsed > OnAutoForwardedAction.NOTIFY_COOL_DOWN) {
                        await this.showNotification(tunnel);
                    }
                }
            }
        }
    }
    hide(removedPorts) {
        if (this.doActionTunnels) {
            this.doActionTunnels = this.doActionTunnels.filter(value => !removedPorts.includes(value.tunnelRemotePort));
        }
        if (this.lastShownPort && removedPorts.indexOf(this.lastShownPort) >= 0) {
            this.lastNotification?.close();
        }
    }
    async portNumberHeuristicDelay() {
        this.logService.trace(`ForwardedPorts: (OnAutoForwardedAction) Starting heuristic delay`);
        if (!this.doActionTunnels || this.doActionTunnels.length === 0) {
            return;
        }
        this.doActionTunnels = this.doActionTunnels.sort((a, b) => a.tunnelRemotePort - b.tunnelRemotePort);
        const firstTunnel = this.doActionTunnels.shift();
        if (firstTunnel.tunnelRemotePort % 1000 === 0) {
            this.logService.trace(`ForwardedPorts: (OnAutoForwardedAction) Heuristic chose tunnel because % 1000: ${firstTunnel.tunnelRemotePort}`);
            this.newerTunnel = firstTunnel;
            return firstTunnel;
        }
        else if (firstTunnel.tunnelRemotePort < 10000 && firstTunnel.tunnelRemotePort !== 9229) {
            this.logService.trace(`ForwardedPorts: (OnAutoForwardedAction) Heuristic chose tunnel because < 10000: ${firstTunnel.tunnelRemotePort}`);
            this.newerTunnel = firstTunnel;
            return firstTunnel;
        }
        this.logService.trace(`ForwardedPorts: (OnAutoForwardedAction) Waiting for "better" tunnel than ${firstTunnel.tunnelRemotePort}`);
        this.newerTunnel = undefined;
        return new Promise(resolve => {
            setTimeout(() => {
                if (this.newerTunnel) {
                    resolve(undefined);
                }
                else if (this.doActionTunnels?.includes(firstTunnel)) {
                    resolve(firstTunnel);
                }
                else {
                    resolve(undefined);
                }
            }, 3000);
        });
    }
    async basicMessage(tunnel) {
        const properties = await this.remoteExplorerService.tunnelModel.getAttributes([{ host: tunnel.tunnelRemoteHost, port: tunnel.tunnelRemotePort }], false);
        const label = properties?.get(tunnel.tunnelRemotePort)?.label;
        return nls.localize('remote.tunnelsView.automaticForward', "Your application{0} running on port {1} is available.  ", label ? ` (${label})` : '', tunnel.tunnelRemotePort);
    }
    linkMessage() {
        return nls.localize({ key: 'remote.tunnelsView.notificationLink2', comment: ['[See all forwarded ports]({0}) is a link. Only translate `See all forwarded ports`. Do not change brackets and parentheses or {0}'] }, "[See all forwarded ports]({0})", `command:${TunnelPanel.ID}.focus`);
    }
    async showNotification(tunnel) {
        if (!await this.hostService.hadLastFocus()) {
            return;
        }
        this.lastNotification?.close();
        let message = await this.basicMessage(tunnel);
        const choices = [this.openBrowserChoice(tunnel)];
        if (!isWeb || openPreviewEnabledContext.getValue(this.contextKeyService)) {
            choices.push(this.openPreviewChoice(tunnel));
        }
        if ((tunnel.tunnelLocalPort !== tunnel.tunnelRemotePort) && this.tunnelService.canElevate && this.tunnelService.isPortPrivileged(tunnel.tunnelRemotePort)) {
            message += nls.localize('remote.tunnelsView.elevationMessage', "You'll need to run as superuser to use port {0} locally.  ", tunnel.tunnelRemotePort);
            choices.unshift(this.elevateChoice(tunnel));
        }
        if (tunnel.privacy === TunnelPrivacyId.Private && isWeb && this.tunnelService.canChangePrivacy) {
            choices.push(this.makePublicChoice(tunnel));
        }
        message += this.linkMessage();
        this.lastNotification = this.notificationService.prompt(Severity.Info, message, choices, { neverShowAgain: { id: 'remote.tunnelsView.autoForwardNeverShow', isSecondary: true } });
        this.lastShownPort = tunnel.tunnelRemotePort;
        this.lastNotifyTime = new Date();
        this.lastNotification.onDidClose(() => {
            this.lastNotification = undefined;
            this.lastShownPort = undefined;
        });
    }
    makePublicChoice(tunnel) {
        return {
            label: nls.localize('remote.tunnelsView.makePublic', "Make Public"),
            run: async () => {
                const oldTunnelDetails = mapHasAddressLocalhostOrAllInterfaces(this.remoteExplorerService.tunnelModel.forwarded, tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
                await this.remoteExplorerService.close({ host: tunnel.tunnelRemoteHost, port: tunnel.tunnelRemotePort }, TunnelCloseReason.Other);
                return this.remoteExplorerService.forward({
                    remote: { host: tunnel.tunnelRemoteHost, port: tunnel.tunnelRemotePort },
                    local: tunnel.tunnelLocalPort,
                    name: oldTunnelDetails?.name,
                    elevateIfNeeded: true,
                    privacy: TunnelPrivacyId.Public,
                    source: oldTunnelDetails?.source
                });
            }
        };
    }
    openBrowserChoice(tunnel) {
        const address = makeAddress(tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
        return {
            label: OpenPortInBrowserAction.LABEL,
            run: () => OpenPortInBrowserAction.run(this.remoteExplorerService.tunnelModel, this.openerService, address)
        };
    }
    openPreviewChoice(tunnel) {
        const address = makeAddress(tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
        return {
            label: OpenPortInPreviewAction.LABEL,
            run: () => OpenPortInPreviewAction.run(this.remoteExplorerService.tunnelModel, this.openerService, this.externalOpenerService, address)
        };
    }
    elevateChoice(tunnel) {
        return {
            label: nls.localize('remote.tunnelsView.elevationButton', "Use Port {0} as Sudo...", tunnel.tunnelRemotePort),
            run: async () => {
                await this.remoteExplorerService.close({ host: tunnel.tunnelRemoteHost, port: tunnel.tunnelRemotePort }, TunnelCloseReason.Other);
                const newTunnel = await this.remoteExplorerService.forward({
                    remote: { host: tunnel.tunnelRemoteHost, port: tunnel.tunnelRemotePort },
                    local: tunnel.tunnelRemotePort,
                    elevateIfNeeded: true,
                    source: AutoTunnelSource
                });
                if (!newTunnel || (typeof newTunnel === 'string')) {
                    return;
                }
                this.lastNotification?.close();
                this.lastShownPort = newTunnel.tunnelRemotePort;
                this.lastNotification = this.notificationService.prompt(Severity.Info, await this.basicMessage(newTunnel) + this.linkMessage(), [this.openBrowserChoice(newTunnel), this.openPreviewChoice(tunnel)], { neverShowAgain: { id: 'remote.tunnelsView.autoForwardNeverShow', isSecondary: true } });
                this.lastNotification.onDidClose(() => {
                    this.lastNotification = undefined;
                    this.lastShownPort = undefined;
                });
            }
        };
    }
}
class OutputAutomaticPortForwarding extends Disposable {
    constructor(terminalService, notificationService, openerService, externalOpenerService, remoteExplorerService, configurationService, debugService, tunnelService, hostService, logService, contextKeyService, privilegedOnly) {
        super();
        this.terminalService = terminalService;
        this.notificationService = notificationService;
        this.openerService = openerService;
        this.externalOpenerService = externalOpenerService;
        this.remoteExplorerService = remoteExplorerService;
        this.configurationService = configurationService;
        this.debugService = debugService;
        this.tunnelService = tunnelService;
        this.hostService = hostService;
        this.logService = logService;
        this.contextKeyService = contextKeyService;
        this.privilegedOnly = privilegedOnly;
        this.notifier = new OnAutoForwardedAction(notificationService, remoteExplorerService, openerService, externalOpenerService, tunnelService, hostService, logService, contextKeyService);
        this._register(configurationService.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration(PORT_AUTO_FORWARD_SETTING)) {
                this.tryStartStopUrlFinder();
            }
        }));
        this.portsFeatures = this._register(this.remoteExplorerService.onEnabledPortsFeatures(() => {
            this.tryStartStopUrlFinder();
        }));
        this.tryStartStopUrlFinder();
        if (configurationService.getValue(PORT_AUTO_SOURCE_SETTING) === PORT_AUTO_SOURCE_SETTING_HYBRID) {
            this._register(this.tunnelService.onTunnelClosed(tunnel => this.notifier.hide([tunnel.port])));
        }
    }
    tryStartStopUrlFinder() {
        if (this.configurationService.getValue(PORT_AUTO_FORWARD_SETTING)) {
            this.startUrlFinder();
        }
        else {
            this.stopUrlFinder();
        }
    }
    startUrlFinder() {
        if (!this.urlFinder && (this.remoteExplorerService.portsFeaturesEnabled !== PortsEnablement.AdditionalFeatures)) {
            return;
        }
        this.portsFeatures?.dispose();
        this.urlFinder = this._register(new UrlFinder(this.terminalService, this.debugService));
        this._register(this.urlFinder.onDidMatchLocalUrl(async (localUrl) => {
            if (mapHasAddressLocalhostOrAllInterfaces(this.remoteExplorerService.tunnelModel.detected, localUrl.host, localUrl.port)) {
                return;
            }
            const attributes = (await this.remoteExplorerService.tunnelModel.getAttributes([localUrl]))?.get(localUrl.port);
            if (attributes?.onAutoForward === OnPortForward.Ignore) {
                return;
            }
            if (this.privilegedOnly() && !this.tunnelService.isPortPrivileged(localUrl.port)) {
                return;
            }
            const forwarded = await this.remoteExplorerService.forward({ remote: localUrl, source: AutoTunnelSource }, attributes ?? null);
            if (forwarded && (typeof forwarded !== 'string')) {
                this.notifier.doAction([forwarded]);
            }
        }));
    }
    stopUrlFinder() {
        if (this.urlFinder) {
            this.urlFinder.dispose();
            this.urlFinder = undefined;
        }
    }
}
class ProcAutomaticPortForwarding extends Disposable {
    constructor(unforwardOnly, alreadyAutoForwarded, needsInitialCandidates, configurationService, remoteExplorerService, notificationService, openerService, externalOpenerService, tunnelService, hostService, logService, contextKeyService) {
        super();
        this.unforwardOnly = unforwardOnly;
        this.alreadyAutoForwarded = alreadyAutoForwarded;
        this.needsInitialCandidates = needsInitialCandidates;
        this.configurationService = configurationService;
        this.remoteExplorerService = remoteExplorerService;
        this.notificationService = notificationService;
        this.openerService = openerService;
        this.externalOpenerService = externalOpenerService;
        this.tunnelService = tunnelService;
        this.hostService = hostService;
        this.logService = logService;
        this.contextKeyService = contextKeyService;
        this.autoForwarded = new Set();
        this.notifiedOnly = new Set();
        this.initialCandidates = new Set();
        this.notifier = new OnAutoForwardedAction(notificationService, remoteExplorerService, openerService, externalOpenerService, tunnelService, hostService, logService, contextKeyService);
        alreadyAutoForwarded?.forEach(port => this.autoForwarded.add(port));
        this.initialize();
    }
    get forwarded() {
        return this.autoForwarded;
    }
    async initialize() {
        if (!this.remoteExplorerService.tunnelModel.environmentTunnelsSet) {
            await new Promise(resolve => this.remoteExplorerService.tunnelModel.onEnvironmentTunnelsSet(() => resolve()));
        }
        this._register(this.configurationService.onDidChangeConfiguration(async (e) => {
            if (e.affectsConfiguration(PORT_AUTO_FORWARD_SETTING)) {
                await this.startStopCandidateListener();
            }
        }));
        this.portsFeatures = this._register(this.remoteExplorerService.onEnabledPortsFeatures(async () => {
            await this.startStopCandidateListener();
        }));
        this.startStopCandidateListener();
    }
    async startStopCandidateListener() {
        if (this.configurationService.getValue(PORT_AUTO_FORWARD_SETTING)) {
            await this.startCandidateListener();
        }
        else {
            this.stopCandidateListener();
        }
    }
    stopCandidateListener() {
        if (this.candidateListener) {
            this.candidateListener.dispose();
            this.candidateListener = undefined;
        }
    }
    async startCandidateListener() {
        if (this.candidateListener || (this.remoteExplorerService.portsFeaturesEnabled !== PortsEnablement.AdditionalFeatures)) {
            return;
        }
        this.portsFeatures?.dispose();
        await this.setInitialCandidates();
        if (this.configurationService.getValue(PORT_AUTO_FORWARD_SETTING)) {
            this.candidateListener = this._register(this.remoteExplorerService.tunnelModel.onCandidatesChanged(this.handleCandidateUpdate, this));
        }
    }
    async setInitialCandidates() {
        if (!this.needsInitialCandidates) {
            this.logService.debug(`ForwardedPorts: (ProcForwarding) Not setting initial candidates`);
            return;
        }
        let startingCandidates = this.remoteExplorerService.tunnelModel.candidatesOrUndefined;
        if (!startingCandidates) {
            await new Promise(resolve => this.remoteExplorerService.tunnelModel.onCandidatesChanged(() => resolve()));
            startingCandidates = this.remoteExplorerService.tunnelModel.candidates;
        }
        for (const value of startingCandidates) {
            this.initialCandidates.add(makeAddress(value.host, value.port));
        }
        this.logService.debug(`ForwardedPorts: (ProcForwarding) Initial candidates set to ${startingCandidates.map(candidate => candidate.port).join(', ')}`);
    }
    async forwardCandidates() {
        let attributes;
        const allTunnels = [];
        this.logService.trace(`ForwardedPorts: (ProcForwarding) Attempting to forward ${this.remoteExplorerService.tunnelModel.candidates.length} candidates`);
        for (const value of this.remoteExplorerService.tunnelModel.candidates) {
            if (!value.detail) {
                this.logService.trace(`ForwardedPorts: (ProcForwarding) Port ${value.port} missing detail`);
                continue;
            }
            if (!attributes) {
                attributes = await this.remoteExplorerService.tunnelModel.getAttributes(this.remoteExplorerService.tunnelModel.candidates);
            }
            const portAttributes = attributes?.get(value.port);
            const address = makeAddress(value.host, value.port);
            if (this.initialCandidates.has(address) && (portAttributes?.onAutoForward === undefined)) {
                continue;
            }
            if (this.notifiedOnly.has(address) || this.autoForwarded.has(address)) {
                continue;
            }
            const alreadyForwarded = mapHasAddressLocalhostOrAllInterfaces(this.remoteExplorerService.tunnelModel.forwarded, value.host, value.port);
            if (mapHasAddressLocalhostOrAllInterfaces(this.remoteExplorerService.tunnelModel.detected, value.host, value.port)) {
                continue;
            }
            if (portAttributes?.onAutoForward === OnPortForward.Ignore) {
                this.logService.trace(`ForwardedPorts: (ProcForwarding) Port ${value.port} is ignored`);
                continue;
            }
            const forwarded = await this.remoteExplorerService.forward({ remote: value, source: AutoTunnelSource }, portAttributes ?? null);
            if (!alreadyForwarded && forwarded) {
                this.logService.trace(`ForwardedPorts: (ProcForwarding) Port ${value.port} has been forwarded`);
                this.autoForwarded.add(address);
            }
            else if (forwarded) {
                this.logService.trace(`ForwardedPorts: (ProcForwarding) Port ${value.port} has been notified`);
                this.notifiedOnly.add(address);
            }
            if (forwarded && (typeof forwarded !== 'string')) {
                allTunnels.push(forwarded);
            }
        }
        this.logService.trace(`ForwardedPorts: (ProcForwarding) Forwarded ${allTunnels.length} candidates`);
        if (allTunnels.length === 0) {
            return undefined;
        }
        return allTunnels;
    }
    async handleCandidateUpdate(removed) {
        const removedPorts = [];
        let autoForwarded;
        if (this.unforwardOnly) {
            autoForwarded = new Map();
            for (const entry of this.remoteExplorerService.tunnelModel.forwarded.entries()) {
                if (entry[1].source.source === TunnelSource.Auto) {
                    autoForwarded.set(entry[0], entry[1]);
                }
            }
        }
        else {
            autoForwarded = new Map(this.autoForwarded.entries());
        }
        for (const removedPort of removed) {
            const key = removedPort[0];
            let value = removedPort[1];
            const forwardedValue = mapHasAddressLocalhostOrAllInterfaces(autoForwarded, value.host, value.port);
            if (forwardedValue) {
                if (typeof forwardedValue === 'string') {
                    this.autoForwarded.delete(key);
                }
                else {
                    value = { host: forwardedValue.remoteHost, port: forwardedValue.remotePort };
                }
                await this.remoteExplorerService.close(value, TunnelCloseReason.AutoForwardEnd);
                removedPorts.push(value.port);
            }
            else if (this.notifiedOnly.has(key)) {
                this.notifiedOnly.delete(key);
                removedPorts.push(value.port);
            }
            else if (this.initialCandidates.has(key)) {
                this.initialCandidates.delete(key);
            }
        }
        if (this.unforwardOnly) {
            return;
        }
        if (removedPorts.length > 0) {
            await this.notifier.hide(removedPorts);
        }
        const tunnels = await this.forwardCandidates();
        if (tunnels) {
            await this.notifier.doAction(tunnels);
        }
    }
}
