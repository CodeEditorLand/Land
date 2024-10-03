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
import { debounce } from '../../../../base/common/decorators.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { hash } from '../../../../base/common/hash.js';
import { Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IRemoteAuthorityResolverService } from '../../../../platform/remote/common/remoteAuthorityResolver.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITunnelService, TunnelProtocol, TunnelPrivacyId, LOCALHOST_ADDRESSES, isLocalhost, isAllInterfaces, ProvidedOnAutoForward, ALL_INTERFACES_ADDRESSES } from '../../../../platform/tunnel/common/tunnel.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { IExtensionService } from '../../extensions/common/extensions.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { isNumber, isObject, isString } from '../../../../base/common/types.js';
import { deepClone } from '../../../../base/common/objects.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
const MISMATCH_LOCAL_PORT_COOLDOWN = 10 * 1000;
const TUNNELS_TO_RESTORE = 'remote.tunnels.toRestore';
const TUNNELS_TO_RESTORE_EXPIRATION = 'remote.tunnels.toRestoreExpiration';
const RESTORE_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 14;
export const ACTIVATION_EVENT = 'onTunnel';
export const forwardedPortsFeaturesEnabled = new RawContextKey('forwardedPortsViewEnabled', false, nls.localize('tunnel.forwardedPortsViewEnabled', "Whether the Ports view is enabled."));
export const forwardedPortsViewEnabled = new RawContextKey('forwardedPortsViewOnlyEnabled', false, nls.localize('tunnel.forwardedPortsViewEnabled', "Whether the Ports view is enabled."));
export function parseAddress(address) {
    const matches = address.match(/^([a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)*:)?([0-9]+)$/);
    if (!matches) {
        return undefined;
    }
    return { host: matches[1]?.substring(0, matches[1].length - 1) || 'localhost', port: Number(matches[2]) };
}
export var TunnelCloseReason;
(function (TunnelCloseReason) {
    TunnelCloseReason["Other"] = "Other";
    TunnelCloseReason["User"] = "User";
    TunnelCloseReason["AutoForwardEnd"] = "AutoForwardEnd";
})(TunnelCloseReason || (TunnelCloseReason = {}));
export var TunnelSource;
(function (TunnelSource) {
    TunnelSource[TunnelSource["User"] = 0] = "User";
    TunnelSource[TunnelSource["Auto"] = 1] = "Auto";
    TunnelSource[TunnelSource["Extension"] = 2] = "Extension";
})(TunnelSource || (TunnelSource = {}));
export const UserTunnelSource = {
    source: TunnelSource.User,
    description: nls.localize('tunnel.source.user', "User Forwarded")
};
export const AutoTunnelSource = {
    source: TunnelSource.Auto,
    description: nls.localize('tunnel.source.auto', "Auto Forwarded")
};
export function mapHasAddress(map, host, port) {
    const initialAddress = map.get(makeAddress(host, port));
    if (initialAddress) {
        return initialAddress;
    }
    if (isLocalhost(host)) {
        for (const testHost of LOCALHOST_ADDRESSES) {
            const testAddress = makeAddress(testHost, port);
            if (map.has(testAddress)) {
                return map.get(testAddress);
            }
        }
    }
    else if (isAllInterfaces(host)) {
        for (const testHost of ALL_INTERFACES_ADDRESSES) {
            const testAddress = makeAddress(testHost, port);
            if (map.has(testAddress)) {
                return map.get(testAddress);
            }
        }
    }
    return undefined;
}
export function mapHasAddressLocalhostOrAllInterfaces(map, host, port) {
    const originalAddress = mapHasAddress(map, host, port);
    if (originalAddress) {
        return originalAddress;
    }
    const otherHost = isAllInterfaces(host) ? 'localhost' : (isLocalhost(host) ? '0.0.0.0' : undefined);
    if (otherHost) {
        return mapHasAddress(map, otherHost, port);
    }
    return undefined;
}
export function makeAddress(host, port) {
    return host + ':' + port;
}
export var OnPortForward;
(function (OnPortForward) {
    OnPortForward["Notify"] = "notify";
    OnPortForward["OpenBrowser"] = "openBrowser";
    OnPortForward["OpenBrowserOnce"] = "openBrowserOnce";
    OnPortForward["OpenPreview"] = "openPreview";
    OnPortForward["Silent"] = "silent";
    OnPortForward["Ignore"] = "ignore";
})(OnPortForward || (OnPortForward = {}));
export function isCandidatePort(candidate) {
    return candidate && 'host' in candidate && typeof candidate.host === 'string'
        && 'port' in candidate && typeof candidate.port === 'number'
        && (!('detail' in candidate) || typeof candidate.detail === 'string')
        && (!('pid' in candidate) || typeof candidate.pid === 'string');
}
export class PortsAttributes extends Disposable {
    static { this.SETTING = 'remote.portsAttributes'; }
    static { this.DEFAULTS = 'remote.otherPortsAttributes'; }
    static { this.RANGE = /^(\d+)\-(\d+)$/; }
    static { this.HOST_AND_PORT = /^([a-z0-9\-]+):(\d{1,5})$/; }
    constructor(configurationService) {
        super();
        this.configurationService = configurationService;
        this.portsAttributes = [];
        this._onDidChangeAttributes = new Emitter();
        this.onDidChangeAttributes = this._onDidChangeAttributes.event;
        this._register(configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(PortsAttributes.SETTING) || e.affectsConfiguration(PortsAttributes.DEFAULTS)) {
                this.updateAttributes();
            }
        }));
        this.updateAttributes();
    }
    updateAttributes() {
        this.portsAttributes = this.readSetting();
        this._onDidChangeAttributes.fire();
    }
    getAttributes(port, host, commandLine) {
        let index = this.findNextIndex(port, host, commandLine, this.portsAttributes, 0);
        const attributes = {
            label: undefined,
            onAutoForward: undefined,
            elevateIfNeeded: undefined,
            requireLocalPort: undefined,
            protocol: undefined
        };
        while (index >= 0) {
            const found = this.portsAttributes[index];
            if (found.key === port) {
                attributes.onAutoForward = found.onAutoForward ?? attributes.onAutoForward;
                attributes.elevateIfNeeded = (found.elevateIfNeeded !== undefined) ? found.elevateIfNeeded : attributes.elevateIfNeeded;
                attributes.label = found.label ?? attributes.label;
                attributes.requireLocalPort = found.requireLocalPort;
                attributes.protocol = found.protocol;
            }
            else {
                attributes.onAutoForward = attributes.onAutoForward ?? found.onAutoForward;
                attributes.elevateIfNeeded = (attributes.elevateIfNeeded !== undefined) ? attributes.elevateIfNeeded : found.elevateIfNeeded;
                attributes.label = attributes.label ?? found.label;
                attributes.requireLocalPort = (attributes.requireLocalPort !== undefined) ? attributes.requireLocalPort : undefined;
                attributes.protocol = attributes.protocol ?? found.protocol;
            }
            index = this.findNextIndex(port, host, commandLine, this.portsAttributes, index + 1);
        }
        if (attributes.onAutoForward !== undefined || attributes.elevateIfNeeded !== undefined
            || attributes.label !== undefined || attributes.requireLocalPort !== undefined
            || attributes.protocol !== undefined) {
            return attributes;
        }
        return this.getOtherAttributes();
    }
    hasStartEnd(value) {
        return (value.start !== undefined) && (value.end !== undefined);
    }
    hasHostAndPort(value) {
        return (value.host !== undefined) && (value.port !== undefined)
            && isString(value.host) && isNumber(value.port);
    }
    findNextIndex(port, host, commandLine, attributes, fromIndex) {
        if (fromIndex >= attributes.length) {
            return -1;
        }
        const shouldUseHost = !isLocalhost(host) && !isAllInterfaces(host);
        const sliced = attributes.slice(fromIndex);
        const foundIndex = sliced.findIndex((value) => {
            if (isNumber(value.key)) {
                return shouldUseHost ? false : value.key === port;
            }
            else if (this.hasStartEnd(value.key)) {
                return shouldUseHost ? false : (port >= value.key.start && port <= value.key.end);
            }
            else if (this.hasHostAndPort(value.key)) {
                return (port === value.key.port) && (host === value.key.host);
            }
            else {
                return commandLine ? value.key.test(commandLine) : false;
            }
        });
        return foundIndex >= 0 ? foundIndex + fromIndex : -1;
    }
    readSetting() {
        const settingValue = this.configurationService.getValue(PortsAttributes.SETTING);
        if (!settingValue || !isObject(settingValue)) {
            return [];
        }
        const attributes = [];
        for (const attributesKey in settingValue) {
            if (attributesKey === undefined) {
                continue;
            }
            const setting = settingValue[attributesKey];
            let key = undefined;
            if (Number(attributesKey)) {
                key = Number(attributesKey);
            }
            else if (isString(attributesKey)) {
                if (PortsAttributes.RANGE.test(attributesKey)) {
                    const match = attributesKey.match(PortsAttributes.RANGE);
                    key = { start: Number(match[1]), end: Number(match[2]) };
                }
                else if (PortsAttributes.HOST_AND_PORT.test(attributesKey)) {
                    const match = attributesKey.match(PortsAttributes.HOST_AND_PORT);
                    key = { host: match[1], port: Number(match[2]) };
                }
                else {
                    let regTest = undefined;
                    try {
                        regTest = RegExp(attributesKey);
                    }
                    catch (e) {
                    }
                    if (regTest) {
                        key = regTest;
                    }
                }
            }
            if (!key) {
                continue;
            }
            attributes.push({
                key: key,
                elevateIfNeeded: setting.elevateIfNeeded,
                onAutoForward: setting.onAutoForward,
                label: setting.label,
                requireLocalPort: setting.requireLocalPort,
                protocol: setting.protocol
            });
        }
        const defaults = this.configurationService.getValue(PortsAttributes.DEFAULTS);
        if (defaults) {
            this.defaultPortAttributes = {
                elevateIfNeeded: defaults.elevateIfNeeded,
                label: defaults.label,
                onAutoForward: defaults.onAutoForward,
                requireLocalPort: defaults.requireLocalPort,
                protocol: defaults.protocol
            };
        }
        return this.sortAttributes(attributes);
    }
    sortAttributes(attributes) {
        function getVal(item, thisRef) {
            if (isNumber(item.key)) {
                return item.key;
            }
            else if (thisRef.hasStartEnd(item.key)) {
                return item.key.start;
            }
            else if (thisRef.hasHostAndPort(item.key)) {
                return item.key.port;
            }
            else {
                return Number.MAX_VALUE;
            }
        }
        return attributes.sort((a, b) => {
            return getVal(a, this) - getVal(b, this);
        });
    }
    getOtherAttributes() {
        return this.defaultPortAttributes;
    }
    static providedActionToAction(providedAction) {
        switch (providedAction) {
            case ProvidedOnAutoForward.Notify: return OnPortForward.Notify;
            case ProvidedOnAutoForward.OpenBrowser: return OnPortForward.OpenBrowser;
            case ProvidedOnAutoForward.OpenBrowserOnce: return OnPortForward.OpenBrowserOnce;
            case ProvidedOnAutoForward.OpenPreview: return OnPortForward.OpenPreview;
            case ProvidedOnAutoForward.Silent: return OnPortForward.Silent;
            case ProvidedOnAutoForward.Ignore: return OnPortForward.Ignore;
            default: return undefined;
        }
    }
    async addAttributes(port, attributes, target) {
        const settingValue = this.configurationService.inspect(PortsAttributes.SETTING);
        const remoteValue = settingValue.userRemoteValue;
        let newRemoteValue;
        if (!remoteValue || !isObject(remoteValue)) {
            newRemoteValue = {};
        }
        else {
            newRemoteValue = deepClone(remoteValue);
        }
        if (!newRemoteValue[`${port}`]) {
            newRemoteValue[`${port}`] = {};
        }
        for (const attribute in attributes) {
            newRemoteValue[`${port}`][attribute] = attributes[attribute];
        }
        return this.configurationService.updateValue(PortsAttributes.SETTING, newRemoteValue, target);
    }
}
let TunnelModel = class TunnelModel extends Disposable {
    constructor(tunnelService, storageService, configurationService, environmentService, remoteAuthorityResolverService, workspaceContextService, logService, dialogService, extensionService, contextKeyService) {
        super();
        this.tunnelService = tunnelService;
        this.storageService = storageService;
        this.configurationService = configurationService;
        this.environmentService = environmentService;
        this.remoteAuthorityResolverService = remoteAuthorityResolverService;
        this.workspaceContextService = workspaceContextService;
        this.logService = logService;
        this.dialogService = dialogService;
        this.extensionService = extensionService;
        this.contextKeyService = contextKeyService;
        this.inProgress = new Map();
        this._onForwardPort = new Emitter();
        this.onForwardPort = this._onForwardPort.event;
        this._onClosePort = new Emitter();
        this.onClosePort = this._onClosePort.event;
        this._onPortName = new Emitter();
        this.onPortName = this._onPortName.event;
        this._onCandidatesChanged = new Emitter();
        this.onCandidatesChanged = this._onCandidatesChanged.event;
        this._onEnvironmentTunnelsSet = new Emitter();
        this.onEnvironmentTunnelsSet = this._onEnvironmentTunnelsSet.event;
        this._environmentTunnelsSet = false;
        this.restoreListener = undefined;
        this.restoreComplete = false;
        this.onRestoreComplete = new Emitter();
        this.unrestoredExtensionTunnels = new Map();
        this.sessionCachedProperties = new Map();
        this.portAttributesProviders = [];
        this.hasCheckedExtensionsOnTunnelOpened = false;
        this.mismatchCooldown = new Date();
        this.configPortsAttributes = new PortsAttributes(configurationService);
        this.tunnelRestoreValue = this.getTunnelRestoreValue();
        this._register(this.configPortsAttributes.onDidChangeAttributes(this.updateAttributes, this));
        this.forwarded = new Map();
        this.remoteTunnels = new Map();
        this.tunnelService.tunnels.then(async (tunnels) => {
            const attributes = await this.getAttributes(tunnels.map(tunnel => {
                return { port: tunnel.tunnelRemotePort, host: tunnel.tunnelRemoteHost };
            }));
            for (const tunnel of tunnels) {
                if (tunnel.localAddress) {
                    const key = makeAddress(tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
                    const matchingCandidate = mapHasAddressLocalhostOrAllInterfaces(this._candidates ?? new Map(), tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
                    this.forwarded.set(key, {
                        remotePort: tunnel.tunnelRemotePort,
                        remoteHost: tunnel.tunnelRemoteHost,
                        localAddress: tunnel.localAddress,
                        protocol: attributes?.get(tunnel.tunnelRemotePort)?.protocol ?? TunnelProtocol.Http,
                        localUri: await this.makeLocalUri(tunnel.localAddress, attributes?.get(tunnel.tunnelRemotePort)),
                        localPort: tunnel.tunnelLocalPort,
                        name: attributes?.get(tunnel.tunnelRemotePort)?.label,
                        runningProcess: matchingCandidate?.detail,
                        hasRunningProcess: !!matchingCandidate,
                        pid: matchingCandidate?.pid,
                        privacy: tunnel.privacy,
                        source: UserTunnelSource,
                    });
                    this.remoteTunnels.set(key, tunnel);
                }
            }
        });
        this.detected = new Map();
        this._register(this.tunnelService.onTunnelOpened(async (tunnel) => {
            const key = makeAddress(tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
            if (!mapHasAddressLocalhostOrAllInterfaces(this.forwarded, tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort)
                && !mapHasAddressLocalhostOrAllInterfaces(this.detected, tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort)
                && !mapHasAddressLocalhostOrAllInterfaces(this.inProgress, tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort)
                && tunnel.localAddress) {
                const matchingCandidate = mapHasAddressLocalhostOrAllInterfaces(this._candidates ?? new Map(), tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
                const attributes = (await this.getAttributes([{ port: tunnel.tunnelRemotePort, host: tunnel.tunnelRemoteHost }]))?.get(tunnel.tunnelRemotePort);
                this.forwarded.set(key, {
                    remoteHost: tunnel.tunnelRemoteHost,
                    remotePort: tunnel.tunnelRemotePort,
                    localAddress: tunnel.localAddress,
                    protocol: attributes?.protocol ?? TunnelProtocol.Http,
                    localUri: await this.makeLocalUri(tunnel.localAddress, attributes),
                    localPort: tunnel.tunnelLocalPort,
                    name: attributes?.label,
                    closeable: true,
                    runningProcess: matchingCandidate?.detail,
                    hasRunningProcess: !!matchingCandidate,
                    pid: matchingCandidate?.pid,
                    privacy: tunnel.privacy,
                    source: UserTunnelSource,
                });
            }
            await this.storeForwarded();
            this.checkExtensionActivationEvents(true);
            this.remoteTunnels.set(key, tunnel);
            this._onForwardPort.fire(this.forwarded.get(key));
        }));
        this._register(this.tunnelService.onTunnelClosed(address => {
            return this.onTunnelClosed(address, TunnelCloseReason.Other);
        }));
        this.checkExtensionActivationEvents(false);
    }
    extensionHasActivationEvent() {
        if (this.extensionService.extensions.find(extension => extension.activationEvents?.includes(ACTIVATION_EVENT))) {
            this.contextKeyService.createKey(forwardedPortsViewEnabled.key, true);
            return true;
        }
        return false;
    }
    checkExtensionActivationEvents(tunnelOpened) {
        if (this.hasCheckedExtensionsOnTunnelOpened) {
            return;
        }
        if (tunnelOpened) {
            this.hasCheckedExtensionsOnTunnelOpened = true;
        }
        const hasRemote = this.environmentService.remoteAuthority !== undefined;
        if (hasRemote && !tunnelOpened) {
            return;
        }
        if (this.extensionHasActivationEvent()) {
            return;
        }
        const activationDisposable = this._register(this.extensionService.onDidRegisterExtensions(() => {
            if (this.extensionHasActivationEvent()) {
                activationDisposable.dispose();
            }
        }));
    }
    async onTunnelClosed(address, reason) {
        const key = makeAddress(address.host, address.port);
        if (this.forwarded.has(key)) {
            this.forwarded.delete(key);
            await this.storeForwarded();
            this._onClosePort.fire(address);
        }
    }
    makeLocalUri(localAddress, attributes) {
        if (localAddress.startsWith('http')) {
            return URI.parse(localAddress);
        }
        const protocol = attributes?.protocol ?? 'http';
        return URI.parse(`${protocol}://${localAddress}`);
    }
    async addStorageKeyPostfix(prefix) {
        const workspace = this.workspaceContextService.getWorkspace();
        const workspaceHash = workspace.configuration ? hash(workspace.configuration.path) : (workspace.folders.length > 0 ? hash(workspace.folders[0].uri.path) : undefined);
        if (workspaceHash === undefined) {
            this.logService.debug('Could not get workspace hash for forwarded ports storage key.');
            return undefined;
        }
        return `${prefix}.${this.environmentService.remoteAuthority}.${workspaceHash}`;
    }
    async getTunnelRestoreStorageKey() {
        return this.addStorageKeyPostfix(TUNNELS_TO_RESTORE);
    }
    async getRestoreExpirationStorageKey() {
        return this.addStorageKeyPostfix(TUNNELS_TO_RESTORE_EXPIRATION);
    }
    async getTunnelRestoreValue() {
        const deprecatedValue = this.storageService.get(TUNNELS_TO_RESTORE, 1);
        if (deprecatedValue) {
            this.storageService.remove(TUNNELS_TO_RESTORE, 1);
            await this.storeForwarded();
            return deprecatedValue;
        }
        const storageKey = await this.getTunnelRestoreStorageKey();
        if (!storageKey) {
            return undefined;
        }
        return this.storageService.get(storageKey, 0);
    }
    async restoreForwarded() {
        this.cleanupExpiredTunnelsForRestore();
        if (this.configurationService.getValue('remote.restoreForwardedPorts')) {
            const tunnelRestoreValue = await this.tunnelRestoreValue;
            if (tunnelRestoreValue && (tunnelRestoreValue !== this.knownPortsRestoreValue)) {
                const tunnels = JSON.parse(tunnelRestoreValue) ?? [];
                this.logService.trace(`ForwardedPorts: (TunnelModel) restoring ports ${tunnels.map(tunnel => tunnel.remotePort).join(', ')}`);
                for (const tunnel of tunnels) {
                    const alreadyForwarded = mapHasAddressLocalhostOrAllInterfaces(this.detected, tunnel.remoteHost, tunnel.remotePort);
                    if ((tunnel.source.source !== TunnelSource.Extension && !alreadyForwarded) || (tunnel.source.source === TunnelSource.Extension && alreadyForwarded)) {
                        await this.doForward({
                            remote: { host: tunnel.remoteHost, port: tunnel.remotePort },
                            local: tunnel.localPort,
                            name: tunnel.name,
                            elevateIfNeeded: true,
                            source: tunnel.source
                        });
                    }
                    else if (tunnel.source.source === TunnelSource.Extension && !alreadyForwarded) {
                        this.unrestoredExtensionTunnels.set(makeAddress(tunnel.remoteHost, tunnel.remotePort), tunnel);
                    }
                }
            }
        }
        this.restoreComplete = true;
        this.onRestoreComplete.fire();
        if (!this.restoreListener) {
            const key = await this.getTunnelRestoreStorageKey();
            this.restoreListener = this._register(new DisposableStore());
            this.restoreListener.add(this.storageService.onDidChangeValue(0, undefined, this.restoreListener)(async (e) => {
                if (e.key === key) {
                    this.tunnelRestoreValue = Promise.resolve(this.storageService.get(key, 0));
                    await this.restoreForwarded();
                }
            }));
        }
    }
    cleanupExpiredTunnelsForRestore() {
        const keys = this.storageService.keys(0, 0).filter(key => key.startsWith(TUNNELS_TO_RESTORE_EXPIRATION));
        for (const key of keys) {
            const expiration = this.storageService.getNumber(key, 0);
            if (expiration && expiration < Date.now()) {
                this.tunnelRestoreValue = Promise.resolve(undefined);
                const storageKey = key.replace(TUNNELS_TO_RESTORE_EXPIRATION, TUNNELS_TO_RESTORE);
                this.storageService.remove(key, 0);
                this.storageService.remove(storageKey, 0);
            }
        }
    }
    async storeForwarded() {
        if (this.configurationService.getValue('remote.restoreForwardedPorts')) {
            const forwarded = Array.from(this.forwarded.values());
            const restorableTunnels = forwarded.map(tunnel => {
                return {
                    remoteHost: tunnel.remoteHost,
                    remotePort: tunnel.remotePort,
                    localPort: tunnel.localPort,
                    name: tunnel.name,
                    localAddress: tunnel.localAddress,
                    localUri: tunnel.localUri,
                    protocol: tunnel.protocol,
                    source: tunnel.source,
                };
            });
            let valueToStore;
            if (forwarded.length > 0) {
                valueToStore = JSON.stringify(restorableTunnels);
            }
            const key = await this.getTunnelRestoreStorageKey();
            const expirationKey = await this.getRestoreExpirationStorageKey();
            if (!valueToStore && key && expirationKey) {
                this.storageService.remove(key, 0);
                this.storageService.remove(expirationKey, 0);
            }
            else if ((valueToStore !== this.knownPortsRestoreValue) && key && expirationKey) {
                this.storageService.store(key, valueToStore, 0, 0);
                this.storageService.store(expirationKey, Date.now() + RESTORE_EXPIRATION_TIME, 0, 0);
            }
            this.knownPortsRestoreValue = valueToStore;
        }
    }
    async showPortMismatchModalIfNeeded(tunnel, expectedLocal, attributes) {
        if (!tunnel.tunnelLocalPort || !attributes?.requireLocalPort) {
            return;
        }
        if (tunnel.tunnelLocalPort === expectedLocal) {
            return;
        }
        const newCooldown = new Date();
        if ((this.mismatchCooldown.getTime() + MISMATCH_LOCAL_PORT_COOLDOWN) > newCooldown.getTime()) {
            return;
        }
        this.mismatchCooldown = newCooldown;
        const mismatchString = nls.localize('remote.localPortMismatch.single', "Local port {0} could not be used for forwarding to remote port {1}.\n\nThis usually happens when there is already another process using local port {0}.\n\nPort number {2} has been used instead.", expectedLocal, tunnel.tunnelRemotePort, tunnel.tunnelLocalPort);
        return this.dialogService.info(mismatchString);
    }
    async forward(tunnelProperties, attributes) {
        if (!this.restoreComplete && this.environmentService.remoteAuthority) {
            await Event.toPromise(this.onRestoreComplete.event);
        }
        return this.doForward(tunnelProperties, attributes);
    }
    async doForward(tunnelProperties, attributes) {
        await this.extensionService.activateByEvent(ACTIVATION_EVENT);
        const existingTunnel = mapHasAddressLocalhostOrAllInterfaces(this.forwarded, tunnelProperties.remote.host, tunnelProperties.remote.port);
        attributes = attributes ??
            ((attributes !== null)
                ? (await this.getAttributes([tunnelProperties.remote]))?.get(tunnelProperties.remote.port)
                : undefined);
        const localPort = (tunnelProperties.local !== undefined) ? tunnelProperties.local : tunnelProperties.remote.port;
        let noTunnelValue;
        if (!existingTunnel) {
            const authority = this.environmentService.remoteAuthority;
            const addressProvider = authority ? {
                getAddress: async () => { return (await this.remoteAuthorityResolverService.resolveAuthority(authority)).authority; }
            } : undefined;
            const key = makeAddress(tunnelProperties.remote.host, tunnelProperties.remote.port);
            this.inProgress.set(key, true);
            tunnelProperties = this.mergeCachedAndUnrestoredProperties(key, tunnelProperties);
            const tunnel = await this.tunnelService.openTunnel(addressProvider, tunnelProperties.remote.host, tunnelProperties.remote.port, undefined, localPort, (!tunnelProperties.elevateIfNeeded) ? attributes?.elevateIfNeeded : tunnelProperties.elevateIfNeeded, tunnelProperties.privacy, attributes?.protocol);
            if (typeof tunnel === 'string') {
                noTunnelValue = tunnel;
            }
            else if (tunnel && tunnel.localAddress) {
                const matchingCandidate = mapHasAddressLocalhostOrAllInterfaces(this._candidates ?? new Map(), tunnelProperties.remote.host, tunnelProperties.remote.port);
                const protocol = (tunnel.protocol ?
                    ((tunnel.protocol === TunnelProtocol.Https) ? TunnelProtocol.Https : TunnelProtocol.Http)
                    : (attributes?.protocol ?? TunnelProtocol.Http));
                const newForward = {
                    remoteHost: tunnel.tunnelRemoteHost,
                    remotePort: tunnel.tunnelRemotePort,
                    localPort: tunnel.tunnelLocalPort,
                    name: attributes?.label ?? tunnelProperties.name,
                    closeable: true,
                    localAddress: tunnel.localAddress,
                    protocol,
                    localUri: await this.makeLocalUri(tunnel.localAddress, attributes),
                    runningProcess: matchingCandidate?.detail,
                    hasRunningProcess: !!matchingCandidate,
                    pid: matchingCandidate?.pid,
                    source: tunnelProperties.source ?? UserTunnelSource,
                    privacy: tunnel.privacy,
                };
                this.forwarded.set(key, newForward);
                this.remoteTunnels.set(key, tunnel);
                this.inProgress.delete(key);
                await this.storeForwarded();
                await this.showPortMismatchModalIfNeeded(tunnel, localPort, attributes);
                this._onForwardPort.fire(newForward);
                return tunnel;
            }
            this.inProgress.delete(key);
        }
        else {
            return this.mergeAttributesIntoExistingTunnel(existingTunnel, tunnelProperties, attributes);
        }
        return noTunnelValue;
    }
    mergeCachedAndUnrestoredProperties(key, tunnelProperties) {
        const map = this.unrestoredExtensionTunnels.has(key) ? this.unrestoredExtensionTunnels : (this.sessionCachedProperties.has(key) ? this.sessionCachedProperties : undefined);
        if (map) {
            const updateProps = map.get(key);
            map.delete(key);
            if (updateProps) {
                tunnelProperties.name = updateProps.name ?? tunnelProperties.name;
                tunnelProperties.local = (('local' in updateProps) ? updateProps.local : (('localPort' in updateProps) ? updateProps.localPort : undefined)) ?? tunnelProperties.local;
                tunnelProperties.privacy = tunnelProperties.privacy;
            }
        }
        return tunnelProperties;
    }
    async mergeAttributesIntoExistingTunnel(existingTunnel, tunnelProperties, attributes) {
        const newName = attributes?.label ?? tunnelProperties.name;
        let MergedAttributeAction;
        (function (MergedAttributeAction) {
            MergedAttributeAction[MergedAttributeAction["None"] = 0] = "None";
            MergedAttributeAction[MergedAttributeAction["Fire"] = 1] = "Fire";
            MergedAttributeAction[MergedAttributeAction["Reopen"] = 2] = "Reopen";
        })(MergedAttributeAction || (MergedAttributeAction = {}));
        let mergedAction = MergedAttributeAction.None;
        if (newName !== existingTunnel.name) {
            existingTunnel.name = newName;
            mergedAction = MergedAttributeAction.Fire;
        }
        if ((attributes?.protocol || (existingTunnel.protocol !== TunnelProtocol.Http)) && (attributes?.protocol !== existingTunnel.protocol)) {
            tunnelProperties.source = existingTunnel.source;
            mergedAction = MergedAttributeAction.Reopen;
        }
        if (tunnelProperties.privacy && (existingTunnel.privacy !== tunnelProperties.privacy)) {
            mergedAction = MergedAttributeAction.Reopen;
        }
        switch (mergedAction) {
            case MergedAttributeAction.Fire: {
                this._onForwardPort.fire();
                break;
            }
            case MergedAttributeAction.Reopen: {
                await this.close(existingTunnel.remoteHost, existingTunnel.remotePort, TunnelCloseReason.User);
                await this.doForward(tunnelProperties, attributes);
            }
        }
        return mapHasAddressLocalhostOrAllInterfaces(this.remoteTunnels, tunnelProperties.remote.host, tunnelProperties.remote.port);
    }
    async name(host, port, name) {
        const existingForwarded = mapHasAddressLocalhostOrAllInterfaces(this.forwarded, host, port);
        const key = makeAddress(host, port);
        if (existingForwarded) {
            existingForwarded.name = name;
            await this.storeForwarded();
            this._onPortName.fire({ host, port });
            return;
        }
        else if (this.detected.has(key)) {
            this.detected.get(key).name = name;
            this._onPortName.fire({ host, port });
        }
    }
    async close(host, port, reason) {
        const key = makeAddress(host, port);
        const oldTunnel = this.forwarded.get(key);
        if ((reason === TunnelCloseReason.AutoForwardEnd) && oldTunnel && (oldTunnel.source.source === TunnelSource.Auto)) {
            this.sessionCachedProperties.set(key, {
                local: oldTunnel.localPort,
                name: oldTunnel.name,
                privacy: oldTunnel.privacy,
            });
        }
        await this.tunnelService.closeTunnel(host, port);
        return this.onTunnelClosed({ host, port }, reason);
    }
    address(host, port) {
        const key = makeAddress(host, port);
        return (this.forwarded.get(key) || this.detected.get(key))?.localAddress;
    }
    get environmentTunnelsSet() {
        return this._environmentTunnelsSet;
    }
    addEnvironmentTunnels(tunnels) {
        if (tunnels) {
            for (const tunnel of tunnels) {
                const matchingCandidate = mapHasAddressLocalhostOrAllInterfaces(this._candidates ?? new Map(), tunnel.remoteAddress.host, tunnel.remoteAddress.port);
                const localAddress = typeof tunnel.localAddress === 'string' ? tunnel.localAddress : makeAddress(tunnel.localAddress.host, tunnel.localAddress.port);
                this.detected.set(makeAddress(tunnel.remoteAddress.host, tunnel.remoteAddress.port), {
                    remoteHost: tunnel.remoteAddress.host,
                    remotePort: tunnel.remoteAddress.port,
                    localAddress: localAddress,
                    protocol: TunnelProtocol.Http,
                    localUri: this.makeLocalUri(localAddress),
                    closeable: false,
                    runningProcess: matchingCandidate?.detail,
                    hasRunningProcess: !!matchingCandidate,
                    pid: matchingCandidate?.pid,
                    privacy: TunnelPrivacyId.ConstantPrivate,
                    source: {
                        source: TunnelSource.Extension,
                        description: nls.localize('tunnel.staticallyForwarded', "Statically Forwarded")
                    }
                });
                this.tunnelService.setEnvironmentTunnel(tunnel.remoteAddress.host, tunnel.remoteAddress.port, localAddress, TunnelPrivacyId.ConstantPrivate, TunnelProtocol.Http);
            }
        }
        this._environmentTunnelsSet = true;
        this._onEnvironmentTunnelsSet.fire();
        this._onForwardPort.fire();
    }
    setCandidateFilter(filter) {
        this._candidateFilter = filter;
    }
    async setCandidates(candidates) {
        let processedCandidates = candidates;
        if (this._candidateFilter) {
            processedCandidates = await this._candidateFilter(candidates);
        }
        const removedCandidates = this.updateInResponseToCandidates(processedCandidates);
        this.logService.trace(`ForwardedPorts: (TunnelModel) removed candidates ${Array.from(removedCandidates.values()).map(candidate => candidate.port).join(', ')}`);
        this._onCandidatesChanged.fire(removedCandidates);
    }
    updateInResponseToCandidates(candidates) {
        const removedCandidates = this._candidates ?? new Map();
        const candidatesMap = new Map();
        this._candidates = candidatesMap;
        candidates.forEach(value => {
            const addressKey = makeAddress(value.host, value.port);
            candidatesMap.set(addressKey, {
                host: value.host,
                port: value.port,
                detail: value.detail,
                pid: value.pid
            });
            if (removedCandidates.has(addressKey)) {
                removedCandidates.delete(addressKey);
            }
            const forwardedValue = mapHasAddressLocalhostOrAllInterfaces(this.forwarded, value.host, value.port);
            if (forwardedValue) {
                forwardedValue.runningProcess = value.detail;
                forwardedValue.hasRunningProcess = true;
                forwardedValue.pid = value.pid;
            }
        });
        removedCandidates.forEach((_value, key) => {
            const parsedAddress = parseAddress(key);
            if (!parsedAddress) {
                return;
            }
            const forwardedValue = mapHasAddressLocalhostOrAllInterfaces(this.forwarded, parsedAddress.host, parsedAddress.port);
            if (forwardedValue) {
                forwardedValue.runningProcess = undefined;
                forwardedValue.hasRunningProcess = false;
                forwardedValue.pid = undefined;
            }
            const detectedValue = mapHasAddressLocalhostOrAllInterfaces(this.detected, parsedAddress.host, parsedAddress.port);
            if (detectedValue) {
                detectedValue.runningProcess = undefined;
                detectedValue.hasRunningProcess = false;
                detectedValue.pid = undefined;
            }
        });
        return removedCandidates;
    }
    get candidates() {
        return this._candidates ? Array.from(this._candidates.values()) : [];
    }
    get candidatesOrUndefined() {
        return this._candidates ? this.candidates : undefined;
    }
    async updateAttributes() {
        const tunnels = Array.from(this.forwarded.values());
        const allAttributes = await this.getAttributes(tunnels.map(tunnel => {
            return { port: tunnel.remotePort, host: tunnel.remoteHost };
        }), false);
        if (!allAttributes) {
            return;
        }
        for (const forwarded of tunnels) {
            const attributes = allAttributes.get(forwarded.remotePort);
            if ((attributes?.protocol || (forwarded.protocol !== TunnelProtocol.Http)) && (attributes?.protocol !== forwarded.protocol)) {
                await this.doForward({
                    remote: { host: forwarded.remoteHost, port: forwarded.remotePort },
                    local: forwarded.localPort,
                    name: forwarded.name,
                    source: forwarded.source
                }, attributes);
            }
            if (!attributes) {
                continue;
            }
            if (attributes.label && attributes.label !== forwarded.name) {
                await this.name(forwarded.remoteHost, forwarded.remotePort, attributes.label);
            }
        }
    }
    async getAttributes(forwardedPorts, checkProviders = true) {
        const matchingCandidates = new Map();
        const pidToPortsMapping = new Map();
        forwardedPorts.forEach(forwardedPort => {
            const matchingCandidate = mapHasAddressLocalhostOrAllInterfaces(this._candidates ?? new Map(), LOCALHOST_ADDRESSES[0], forwardedPort.port) ?? forwardedPort;
            if (matchingCandidate) {
                matchingCandidates.set(forwardedPort.port, matchingCandidate);
                const pid = isCandidatePort(matchingCandidate) ? matchingCandidate.pid : undefined;
                if (!pidToPortsMapping.has(pid)) {
                    pidToPortsMapping.set(pid, []);
                }
                pidToPortsMapping.get(pid)?.push(forwardedPort.port);
            }
        });
        const configAttributes = new Map();
        forwardedPorts.forEach(forwardedPort => {
            const attributes = this.configPortsAttributes.getAttributes(forwardedPort.port, forwardedPort.host, matchingCandidates.get(forwardedPort.port)?.detail);
            if (attributes) {
                configAttributes.set(forwardedPort.port, attributes);
            }
        });
        if ((this.portAttributesProviders.length === 0) || !checkProviders) {
            return (configAttributes.size > 0) ? configAttributes : undefined;
        }
        const allProviderResults = await Promise.all(this.portAttributesProviders.flatMap(provider => {
            return Array.from(pidToPortsMapping.entries()).map(entry => {
                const portGroup = entry[1];
                const matchingCandidate = matchingCandidates.get(portGroup[0]);
                return provider.providePortAttributes(portGroup, matchingCandidate?.pid, matchingCandidate?.detail, CancellationToken.None);
            });
        }));
        const providedAttributes = new Map();
        allProviderResults.forEach(attributes => attributes.forEach(attribute => {
            if (attribute) {
                providedAttributes.set(attribute.port, attribute);
            }
        }));
        if (!configAttributes && !providedAttributes) {
            return undefined;
        }
        const mergedAttributes = new Map();
        forwardedPorts.forEach(forwardedPorts => {
            const config = configAttributes.get(forwardedPorts.port);
            const provider = providedAttributes.get(forwardedPorts.port);
            mergedAttributes.set(forwardedPorts.port, {
                elevateIfNeeded: config?.elevateIfNeeded,
                label: config?.label,
                onAutoForward: config?.onAutoForward ?? PortsAttributes.providedActionToAction(provider?.autoForwardAction),
                requireLocalPort: config?.requireLocalPort,
                protocol: config?.protocol
            });
        });
        return mergedAttributes;
    }
    addAttributesProvider(provider) {
        this.portAttributesProviders.push(provider);
    }
};
__decorate([
    debounce(1000),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TunnelModel.prototype, "storeForwarded", null);
TunnelModel = __decorate([
    __param(0, ITunnelService),
    __param(1, IStorageService),
    __param(2, IConfigurationService),
    __param(3, IWorkbenchEnvironmentService),
    __param(4, IRemoteAuthorityResolverService),
    __param(5, IWorkspaceContextService),
    __param(6, ILogService),
    __param(7, IDialogService),
    __param(8, IExtensionService),
    __param(9, IContextKeyService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], TunnelModel);
export { TunnelModel };
