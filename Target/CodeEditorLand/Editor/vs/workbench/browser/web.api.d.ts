import type { PerformanceMark } from '../../base/common/performance.js';
import type { UriComponents, URI } from '../../base/common/uri.js';
import type { IWebSocketFactory } from '../../platform/remote/browser/browserSocketFactory.js';
import type { IURLCallbackProvider } from '../services/url/browser/urlService.js';
import type { LogLevel } from '../../platform/log/common/log.js';
import type { IUpdateProvider } from '../services/update/browser/updateService.js';
import type { Event } from '../../base/common/event.js';
import type { IProductConfiguration } from '../../base/common/product.js';
import type { ISecretStorageProvider } from '../../platform/secrets/common/secrets.js';
import type { TunnelProviderFeatures } from '../../platform/tunnel/common/tunnel.js';
import type { IProgress, IProgressCompositeOptions, IProgressDialogOptions, IProgressNotificationOptions, IProgressOptions, IProgressStep, IProgressWindowOptions } from '../../platform/progress/common/progress.js';
import type { ITextEditorOptions } from '../../platform/editor/common/editor.js';
import type { IFolderToOpen, IWorkspaceToOpen } from '../../platform/window/common/window.js';
import type { EditorGroupLayout } from '../services/editor/common/editorGroupsService.js';
import type { IEmbedderTerminalOptions } from '../services/terminal/common/embedderTerminalService.js';
import type { IAuthenticationProvider } from '../services/authentication/common/authentication.js';
export interface IWorkbench {
    commands: {
        executeCommand(command: string, ...args: any[]): Promise<unknown>;
    };
    logger: {
        log(level: LogLevel, message: string): void;
    };
    env: {
        getUriScheme(): Promise<string>;
        retrievePerformanceMarks(): Promise<[string, readonly PerformanceMark[]][]>;
        openUri(target: URI): Promise<boolean>;
    };
    window: {
        withProgress<R>(options: IProgressOptions | IProgressDialogOptions | IProgressNotificationOptions | IProgressWindowOptions | IProgressCompositeOptions, task: (progress: IProgress<IProgressStep>) => Promise<R>): Promise<R>;
        createTerminal(options: IEmbedderTerminalOptions): Promise<void>;
        showInformationMessage<T extends string>(message: string, ...items: T[]): Promise<T | undefined>;
    };
    workspace: {
        didResolveRemoteAuthority(): Promise<void>;
        openTunnel(tunnelOptions: ITunnelOptions): Promise<ITunnel>;
    };
    shutdown: () => Promise<void>;
}
export interface IWorkbenchConstructionOptions {
    readonly remoteAuthority?: string;
    readonly serverBasePath?: string;
    readonly connectionToken?: string | Promise<string>;
    readonly webviewEndpoint?: string;
    readonly webSocketFactory?: IWebSocketFactory;
    readonly resourceUriProvider?: IResourceUriProvider;
    readonly resolveExternalUri?: IExternalUriResolver;
    readonly tunnelProvider?: ITunnelProvider;
    readonly codeExchangeProxyEndpoints?: {
        [providerId: string]: string;
    };
    readonly editSessionId?: string;
    readonly remoteResourceProvider?: IRemoteResourceProvider;
    readonly workspaceProvider?: IWorkspaceProvider;
    readonly settingsSyncOptions?: ISettingsSyncOptions;
    readonly secretStorageProvider?: ISecretStorageProvider;
    readonly additionalBuiltinExtensions?: readonly (MarketplaceExtension | UriComponents)[];
    readonly enabledExtensions?: readonly ExtensionId[];
    readonly additionalTrustedDomains?: string[];
    readonly enableWorkspaceTrust?: boolean;
    readonly openerAllowedExternalUrlPrefixes?: string[];
    readonly urlCallbackProvider?: IURLCallbackProvider;
    readonly resolveCommonTelemetryProperties?: ICommonTelemetryPropertiesResolver;
    readonly commands?: readonly ICommand[];
    readonly defaultLayout?: IDefaultLayout;
    readonly configurationDefaults?: Record<string, any>;
    readonly profile?: {
        readonly name: string;
        readonly contents?: string | UriComponents;
    };
    readonly profileToPreview?: UriComponents;
    readonly updateProvider?: IUpdateProvider;
    readonly productQualityChangeHandler?: IProductQualityChangeHandler;
    readonly homeIndicator?: IHomeIndicator;
    readonly welcomeBanner?: IWelcomeBanner;
    readonly productConfiguration?: Partial<IProductConfiguration>;
    readonly windowIndicator?: IWindowIndicator;
    readonly initialColorTheme?: IInitialColorTheme;
    readonly welcomeDialog?: IWelcomeDialog;
    readonly messagePorts?: ReadonlyMap<ExtensionId, MessagePort>;
    readonly authenticationProviders?: readonly IAuthenticationProvider[];
    readonly developmentOptions?: IDevelopmentOptions;
}
export type IWorkspace = IWorkspaceToOpen | IFolderToOpen | undefined;
export interface IWorkspaceProvider {
    readonly workspace: IWorkspace;
    readonly payload?: object;
    readonly trusted: boolean | undefined;
    open(workspace: IWorkspace, options?: {
        reuse?: boolean;
        payload?: object;
    }): Promise<boolean>;
}
export interface IResourceUriProvider {
    (uri: URI): URI;
}
export type ExtensionId = string;
export type MarketplaceExtension = ExtensionId | {
    readonly id: ExtensionId;
    preRelease?: boolean;
    migrateStorageFrom?: ExtensionId;
};
export interface ICommonTelemetryPropertiesResolver {
    (): {
        [key: string]: any;
    };
}
export interface IExternalUriResolver {
    (uri: URI): Promise<URI>;
}
export interface IExternalURLOpener {
    openExternal(href: string): boolean | Promise<boolean>;
}
export interface ITunnelProvider {
    tunnelFactory?: ITunnelFactory;
    showPortCandidate?: IShowPortCandidate;
    features?: TunnelProviderFeatures;
}
export interface ITunnelFactory {
    (tunnelOptions: ITunnelOptions, tunnelCreationOptions: TunnelCreationOptions): Promise<ITunnel> | undefined;
}
export interface ITunnelOptions {
    remoteAddress: {
        port: number;
        host: string;
    };
    localAddressPort?: number;
    label?: string;
    privacy?: string;
    protocol?: string;
}
export interface TunnelCreationOptions {
    elevationRequired?: boolean;
}
export interface ITunnel {
    remoteAddress: {
        port: number;
        host: string;
    };
    localAddress: string;
    privacy?: string;
    protocol?: string;
    onDidDispose: Event<void>;
    dispose(): Promise<void> | void;
}
export interface IShowPortCandidate {
    (host: string, port: number, detail: string): Promise<boolean>;
}
export declare enum Menu {
    CommandPalette = 0,
    StatusBarWindowIndicatorMenu = 1
}
export interface ICommand {
    id: string;
    label?: string;
    menu?: Menu | Menu[];
    handler: (...args: any[]) => unknown;
}
export interface IHomeIndicator {
    href: string;
    icon: string;
    title: string;
}
export interface IWelcomeBanner {
    message: string;
    icon?: string | UriComponents;
    actions?: IWelcomeLinkAction[];
}
export interface IWelcomeLinkAction {
    href: string;
    label: string;
    title?: string;
}
export interface IWindowIndicator {
    readonly onDidChange?: Event<void>;
    label: string;
    tooltip: string;
    command?: string;
}
export declare enum ColorScheme {
    DARK = "dark",
    LIGHT = "light",
    HIGH_CONTRAST_LIGHT = "hcLight",
    HIGH_CONTRAST_DARK = "hcDark"
}
export interface IInitialColorTheme {
    readonly themeType: ColorScheme;
    readonly colors?: {
        [colorId: string]: string;
    };
}
export interface IWelcomeDialog {
    id: string;
    title: string;
    buttonText: string;
    buttonCommand: string;
    message: string;
    media: {
        altText: string;
        path: string;
    };
}
export interface IDefaultView {
    readonly id: string;
}
export interface IDefaultEditor {
    readonly viewColumn?: number;
    readonly uri: UriComponents;
    readonly options?: ITextEditorOptions;
    readonly openOnlyIfExists?: boolean;
}
export interface IDefaultLayout {
    readonly views?: IDefaultView[];
    readonly editors?: IDefaultEditor[];
    readonly layout?: {
        readonly editors?: EditorGroupLayout;
    };
    readonly force?: boolean;
}
export interface IProductQualityChangeHandler {
    (newQuality: 'insider' | 'stable'): void;
}
export interface ISettingsSyncOptions {
    readonly enabled: boolean;
    readonly extensionsSyncStateVersion?: string;
    enablementHandler?(enablement: boolean, authenticationProvider: string): void;
    readonly authenticationProvider?: {
        readonly id: string;
        signIn(): Promise<string>;
    };
}
export interface IDevelopmentOptions {
    readonly logLevel?: LogLevel;
    readonly extensionLogLevel?: [string, LogLevel][];
    readonly extensionTestsPath?: UriComponents;
    readonly extensions?: readonly UriComponents[];
    readonly enableSmokeTestDriver?: boolean;
}
export interface IRemoteResourceProvider {
    readonly path: string;
    readonly onDidReceiveRequest: Event<IRemoteResourceRequest>;
}
export interface IRemoteResourceRequest {
    uri: URI;
    respondWith(statusCode: number, body: Uint8Array, headers: Record<string, string>): void;
}
