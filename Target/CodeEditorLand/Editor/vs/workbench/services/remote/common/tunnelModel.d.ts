import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { ConfigurationTarget, IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IRemoteAuthorityResolverService, TunnelDescription } from '../../../../platform/remote/common/remoteAuthorityResolver.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { RemoteTunnel, ITunnelService, TunnelProtocol, TunnelPrivacyId, PortAttributesProvider, ProvidedOnAutoForward } from '../../../../platform/tunnel/common/tunnel.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { IExtensionService } from '../../extensions/common/extensions.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
export declare const ACTIVATION_EVENT = "onTunnel";
export declare const forwardedPortsFeaturesEnabled: RawContextKey<boolean>;
export declare const forwardedPortsViewEnabled: RawContextKey<boolean>;
export interface RestorableTunnel {
    remoteHost: string;
    remotePort: number;
    localAddress: string;
    localUri: URI;
    protocol: TunnelProtocol;
    localPort?: number;
    name?: string;
    source: {
        source: TunnelSource;
        description: string;
    };
}
export interface Tunnel {
    remoteHost: string;
    remotePort: number;
    localAddress: string;
    localUri: URI;
    protocol: TunnelProtocol;
    localPort?: number;
    name?: string;
    closeable?: boolean;
    privacy: TunnelPrivacyId | string;
    runningProcess: string | undefined;
    hasRunningProcess?: boolean;
    pid: number | undefined;
    source: {
        source: TunnelSource;
        description: string;
    };
}
export declare function parseAddress(address: string): {
    host: string;
    port: number;
} | undefined;
export declare enum TunnelCloseReason {
    Other = "Other",
    User = "User",
    AutoForwardEnd = "AutoForwardEnd"
}
export declare enum TunnelSource {
    User = 0,
    Auto = 1,
    Extension = 2
}
export declare const UserTunnelSource: {
    source: TunnelSource;
    description: string;
};
export declare const AutoTunnelSource: {
    source: TunnelSource;
    description: string;
};
export declare function mapHasAddress<T>(map: Map<string, T>, host: string, port: number): T | undefined;
export declare function mapHasAddressLocalhostOrAllInterfaces<T>(map: Map<string, T>, host: string, port: number): T | undefined;
export declare function makeAddress(host: string, port: number): string;
export interface TunnelProperties {
    remote: {
        host: string;
        port: number;
    };
    local?: number;
    name?: string;
    source?: {
        source: TunnelSource;
        description: string;
    };
    elevateIfNeeded?: boolean;
    privacy?: string;
}
export interface CandidatePort {
    host: string;
    port: number;
    detail?: string;
    pid?: number;
}
export declare enum OnPortForward {
    Notify = "notify",
    OpenBrowser = "openBrowser",
    OpenBrowserOnce = "openBrowserOnce",
    OpenPreview = "openPreview",
    Silent = "silent",
    Ignore = "ignore"
}
export interface Attributes {
    label: string | undefined;
    onAutoForward: OnPortForward | undefined;
    elevateIfNeeded: boolean | undefined;
    requireLocalPort: boolean | undefined;
    protocol: TunnelProtocol | undefined;
}
export declare function isCandidatePort(candidate: any): candidate is CandidatePort;
export declare class PortsAttributes extends Disposable {
    private readonly configurationService;
    private static SETTING;
    private static DEFAULTS;
    private static RANGE;
    private static HOST_AND_PORT;
    private portsAttributes;
    private defaultPortAttributes;
    private _onDidChangeAttributes;
    readonly onDidChangeAttributes: Event<void>;
    constructor(configurationService: IConfigurationService);
    private updateAttributes;
    getAttributes(port: number, host: string, commandLine?: string): Attributes | undefined;
    private hasStartEnd;
    private hasHostAndPort;
    private findNextIndex;
    private readSetting;
    private sortAttributes;
    private getOtherAttributes;
    static providedActionToAction(providedAction: ProvidedOnAutoForward | undefined): OnPortForward | undefined;
    addAttributes(port: number, attributes: Partial<Attributes>, target: ConfigurationTarget): Promise<void>;
}
export declare class TunnelModel extends Disposable {
    private readonly tunnelService;
    private readonly storageService;
    private readonly configurationService;
    private readonly environmentService;
    private readonly remoteAuthorityResolverService;
    private readonly workspaceContextService;
    private readonly logService;
    private readonly dialogService;
    private readonly extensionService;
    private readonly contextKeyService;
    readonly forwarded: Map<string, Tunnel>;
    private readonly inProgress;
    readonly detected: Map<string, Tunnel>;
    private remoteTunnels;
    private _onForwardPort;
    onForwardPort: Event<Tunnel | void>;
    private _onClosePort;
    onClosePort: Event<{
        host: string;
        port: number;
    }>;
    private _onPortName;
    onPortName: Event<{
        host: string;
        port: number;
    }>;
    private _candidates;
    private _onCandidatesChanged;
    onCandidatesChanged: Event<Map<string, {
        host: string;
        port: number;
    }>>;
    private _candidateFilter;
    private tunnelRestoreValue;
    private _onEnvironmentTunnelsSet;
    onEnvironmentTunnelsSet: Event<void>;
    private _environmentTunnelsSet;
    readonly configPortsAttributes: PortsAttributes;
    private restoreListener;
    private knownPortsRestoreValue;
    private restoreComplete;
    private onRestoreComplete;
    private unrestoredExtensionTunnels;
    private sessionCachedProperties;
    private portAttributesProviders;
    constructor(tunnelService: ITunnelService, storageService: IStorageService, configurationService: IConfigurationService, environmentService: IWorkbenchEnvironmentService, remoteAuthorityResolverService: IRemoteAuthorityResolverService, workspaceContextService: IWorkspaceContextService, logService: ILogService, dialogService: IDialogService, extensionService: IExtensionService, contextKeyService: IContextKeyService);
    private extensionHasActivationEvent;
    private hasCheckedExtensionsOnTunnelOpened;
    private checkExtensionActivationEvents;
    private onTunnelClosed;
    private makeLocalUri;
    private addStorageKeyPostfix;
    private getTunnelRestoreStorageKey;
    private getRestoreExpirationStorageKey;
    private getTunnelRestoreValue;
    restoreForwarded(): Promise<void>;
    private cleanupExpiredTunnelsForRestore;
    private storeForwarded;
    private mismatchCooldown;
    private showPortMismatchModalIfNeeded;
    forward(tunnelProperties: TunnelProperties, attributes?: Attributes | null): Promise<RemoteTunnel | string | undefined>;
    private doForward;
    private mergeCachedAndUnrestoredProperties;
    private mergeAttributesIntoExistingTunnel;
    name(host: string, port: number, name: string): Promise<void>;
    close(host: string, port: number, reason: TunnelCloseReason): Promise<void>;
    address(host: string, port: number): string | undefined;
    get environmentTunnelsSet(): boolean;
    addEnvironmentTunnels(tunnels: TunnelDescription[] | undefined): void;
    setCandidateFilter(filter: ((candidates: CandidatePort[]) => Promise<CandidatePort[]>) | undefined): void;
    setCandidates(candidates: CandidatePort[]): Promise<void>;
    private updateInResponseToCandidates;
    get candidates(): CandidatePort[];
    get candidatesOrUndefined(): CandidatePort[] | undefined;
    private updateAttributes;
    getAttributes(forwardedPorts: {
        host: string;
        port: number;
    }[], checkProviders?: boolean): Promise<Map<number, Attributes> | undefined>;
    addAttributesProvider(provider: PortAttributesProvider): void;
}
