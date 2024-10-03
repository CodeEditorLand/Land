import { CancellationToken } from '../../../base/common/cancellation.js';
import { Event } from '../../../base/common/event.js';
import { IDisposable, Disposable } from '../../../base/common/lifecycle.js';
import { OperatingSystem } from '../../../base/common/platform.js';
import { URI } from '../../../base/common/uri.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { ILogService } from '../../log/common/log.js';
import { IAddressProvider } from '../../remote/common/remoteAgentConnection.js';
import { TunnelPrivacy } from '../../remote/common/remoteAuthorityResolver.js';
export declare const ITunnelService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<ITunnelService>;
export declare const ISharedTunnelsService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<ISharedTunnelsService>;
export interface RemoteTunnel {
    readonly tunnelRemotePort: number;
    readonly tunnelRemoteHost: string;
    readonly tunnelLocalPort?: number;
    readonly localAddress: string;
    readonly privacy: string;
    readonly protocol?: string;
    dispose(silent?: boolean): Promise<void>;
}
export interface TunnelOptions {
    remoteAddress: {
        port: number;
        host: string;
    };
    localAddressPort?: number;
    label?: string;
    public?: boolean;
    privacy?: string;
    protocol?: string;
}
export declare enum TunnelProtocol {
    Http = "http",
    Https = "https"
}
export declare enum TunnelPrivacyId {
    ConstantPrivate = "constantPrivate",
    Private = "private",
    Public = "public"
}
export interface TunnelCreationOptions {
    elevationRequired?: boolean;
}
export interface TunnelProviderFeatures {
    elevation: boolean;
    public?: boolean;
    privacyOptions: TunnelPrivacy[];
    protocol: boolean;
}
export interface ITunnelProvider {
    forwardPort(tunnelOptions: TunnelOptions, tunnelCreationOptions: TunnelCreationOptions): Promise<RemoteTunnel | string | undefined> | undefined;
}
export declare function isTunnelProvider(addressOrTunnelProvider: IAddressProvider | ITunnelProvider): addressOrTunnelProvider is ITunnelProvider;
export declare enum ProvidedOnAutoForward {
    Notify = 1,
    OpenBrowser = 2,
    OpenPreview = 3,
    Silent = 4,
    Ignore = 5,
    OpenBrowserOnce = 6
}
export interface ProvidedPortAttributes {
    port: number;
    autoForwardAction: ProvidedOnAutoForward;
}
export interface PortAttributesProvider {
    providePortAttributes(ports: number[], pid: number | undefined, commandLine: string | undefined, token: CancellationToken): Promise<ProvidedPortAttributes[]>;
}
export interface ITunnel {
    remoteAddress: {
        port: number;
        host: string;
    };
    localAddress: string;
    public?: boolean;
    privacy?: string;
    protocol?: string;
    onDidDispose: Event<void>;
    dispose(): Promise<void> | void;
}
export interface ISharedTunnelsService {
    readonly _serviceBrand: undefined;
    openTunnel(authority: string, addressProvider: IAddressProvider | undefined, remoteHost: string | undefined, remotePort: number, localHost: string, localPort?: number, elevateIfNeeded?: boolean, privacy?: string, protocol?: string): Promise<RemoteTunnel | string | undefined> | undefined;
}
export interface ITunnelService {
    readonly _serviceBrand: undefined;
    readonly tunnels: Promise<readonly RemoteTunnel[]>;
    readonly canChangePrivacy: boolean;
    readonly privacyOptions: TunnelPrivacy[];
    readonly onTunnelOpened: Event<RemoteTunnel>;
    readonly onTunnelClosed: Event<{
        host: string;
        port: number;
    }>;
    readonly canElevate: boolean;
    readonly canChangeProtocol: boolean;
    readonly hasTunnelProvider: boolean;
    readonly onAddedTunnelProvider: Event<void>;
    canTunnel(uri: URI): boolean;
    openTunnel(addressProvider: IAddressProvider | undefined, remoteHost: string | undefined, remotePort: number, localHost?: string, localPort?: number, elevateIfNeeded?: boolean, privacy?: string, protocol?: string): Promise<RemoteTunnel | string | undefined> | undefined;
    getExistingTunnel(remoteHost: string, remotePort: number): Promise<RemoteTunnel | string | undefined>;
    setEnvironmentTunnel(remoteHost: string, remotePort: number, localAddress: string, privacy: string, protocol: string): void;
    closeTunnel(remoteHost: string, remotePort: number): Promise<void>;
    setTunnelProvider(provider: ITunnelProvider | undefined): IDisposable;
    setTunnelFeatures(features: TunnelProviderFeatures): void;
    isPortPrivileged(port: number): boolean;
}
export declare function extractLocalHostUriMetaDataForPortMapping(uri: URI): {
    address: string;
    port: number;
} | undefined;
export declare function extractQueryLocalHostUriMetaDataForPortMapping(uri: URI): {
    address: string;
    port: number;
} | undefined;
export declare const LOCALHOST_ADDRESSES: string[];
export declare function isLocalhost(host: string): boolean;
export declare const ALL_INTERFACES_ADDRESSES: string[];
export declare function isAllInterfaces(host: string): boolean;
export declare function isPortPrivileged(port: number, host: string, os: OperatingSystem, osRelease: string): boolean;
export declare class DisposableTunnel {
    readonly remoteAddress: {
        port: number;
        host: string;
    };
    readonly localAddress: {
        port: number;
        host: string;
    } | string;
    private readonly _dispose;
    private _onDispose;
    onDidDispose: Event<void>;
    constructor(remoteAddress: {
        port: number;
        host: string;
    }, localAddress: {
        port: number;
        host: string;
    } | string, _dispose: () => Promise<void>);
    dispose(): Promise<void>;
}
export declare abstract class AbstractTunnelService extends Disposable implements ITunnelService {
    protected readonly logService: ILogService;
    protected readonly configurationService: IConfigurationService;
    readonly _serviceBrand: undefined;
    private _onTunnelOpened;
    onTunnelOpened: Event<RemoteTunnel>;
    private _onTunnelClosed;
    onTunnelClosed: Event<{
        host: string;
        port: number;
    }>;
    private _onAddedTunnelProvider;
    onAddedTunnelProvider: Event<void>;
    protected readonly _tunnels: Map<string, Map<number, {
        refcount: number;
        readonly value: Promise<RemoteTunnel | string | undefined>;
    }>>;
    protected _tunnelProvider: ITunnelProvider | undefined;
    protected _canElevate: boolean;
    private _canChangeProtocol;
    private _privacyOptions;
    private _factoryInProgress;
    constructor(logService: ILogService, configurationService: IConfigurationService);
    get hasTunnelProvider(): boolean;
    protected get defaultTunnelHost(): string;
    setTunnelProvider(provider: ITunnelProvider | undefined): IDisposable;
    setTunnelFeatures(features: TunnelProviderFeatures): void;
    get canChangeProtocol(): boolean;
    get canElevate(): boolean;
    get canChangePrivacy(): boolean;
    get privacyOptions(): TunnelPrivacy[];
    get tunnels(): Promise<readonly RemoteTunnel[]>;
    private getTunnels;
    dispose(): Promise<void>;
    setEnvironmentTunnel(remoteHost: string, remotePort: number, localAddress: string, privacy: string, protocol: string): void;
    getExistingTunnel(remoteHost: string, remotePort: number): Promise<RemoteTunnel | string | undefined>;
    openTunnel(addressProvider: IAddressProvider | undefined, remoteHost: string | undefined, remotePort: number, localHost?: string, localPort?: number, elevateIfNeeded?: boolean, privacy?: string, protocol?: string): Promise<RemoteTunnel | string | undefined> | undefined;
    private makeTunnel;
    private tryDisposeTunnel;
    closeTunnel(remoteHost: string, remotePort: number): Promise<void>;
    protected addTunnelToMap(remoteHost: string, remotePort: number, tunnel: Promise<RemoteTunnel | string | undefined>): void;
    private removeEmptyOrErrorTunnelFromMap;
    protected getTunnelFromMap(remoteHost: string, remotePort: number): {
        refcount: number;
        readonly value: Promise<RemoteTunnel | string | undefined>;
    } | undefined;
    canTunnel(uri: URI): boolean;
    abstract isPortPrivileged(port: number): boolean;
    protected abstract retainOrCreateTunnel(addressProvider: IAddressProvider | ITunnelProvider, remoteHost: string, remotePort: number, localHost: string, localPort: number | undefined, elevateIfNeeded: boolean, privacy?: string, protocol?: string): Promise<RemoteTunnel | string | undefined> | undefined;
    protected createWithProvider(tunnelProvider: ITunnelProvider, remoteHost: string, remotePort: number, localPort: number | undefined, elevateIfNeeded: boolean, privacy?: string, protocol?: string): Promise<RemoteTunnel | string | undefined> | undefined;
}
