import { Event } from '../../../../base/common/event.js';
import { IPager } from '../../../../base/common/paging.js';
import { IQueryOptions, ILocalExtension, IGalleryExtension, IExtensionIdentifier, InstallOptions, IExtensionInfo, IExtensionQueryOptions, IDeprecationInfo, InstallExtensionResult } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { EnablementState, IExtensionManagementServer, IResourceExtension } from '../../../services/extensionManagement/common/extensionManagement.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { IExtensionManifest, ExtensionType } from '../../../../platform/extensions/common/extensions.js';
import { URI } from '../../../../base/common/uri.js';
import { IView, IViewPaneContainer } from '../../../common/views.js';
import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { IExtensionsStatus as IExtensionRuntimeStatus } from '../../../services/extensions/common/extensions.js';
import { IExtensionEditorOptions } from './extensionsInput.js';
import { MenuId } from '../../../../platform/actions/common/actions.js';
import { ProgressLocation } from '../../../../platform/progress/common/progress.js';
import { Severity } from '../../../../platform/notification/common/notification.js';
export declare const VIEWLET_ID = "workbench.view.extensions";
export interface IExtensionsViewPaneContainer extends IViewPaneContainer {
    readonly searchValue: string | undefined;
    search(text: string): void;
    refresh(): Promise<void>;
}
export interface IWorkspaceRecommendedExtensionsView extends IView {
    installWorkspaceRecommendations(): Promise<void>;
}
export declare const enum ExtensionState {
    Installing = 0,
    Installed = 1,
    Uninstalling = 2,
    Uninstalled = 3
}
export declare const enum ExtensionRuntimeActionType {
    ReloadWindow = "reloadWindow",
    RestartExtensions = "restartExtensions",
    DownloadUpdate = "downloadUpdate",
    ApplyUpdate = "applyUpdate",
    QuitAndInstall = "quitAndInstall"
}
export type ExtensionRuntimeState = {
    action: ExtensionRuntimeActionType;
    reason: string;
};
export interface IExtension {
    readonly type: ExtensionType;
    readonly isBuiltin: boolean;
    readonly isWorkspaceScoped: boolean;
    readonly state: ExtensionState;
    readonly name: string;
    readonly displayName: string;
    readonly identifier: IExtensionIdentifier;
    readonly publisher: string;
    readonly publisherDisplayName: string;
    readonly publisherUrl?: URI;
    readonly publisherDomain?: {
        link: string;
        verified: boolean;
    };
    readonly publisherSponsorLink?: URI;
    readonly pinned: boolean;
    readonly version: string;
    readonly latestVersion: string;
    readonly preRelease: boolean;
    readonly isPreReleaseVersion: boolean;
    readonly hasPreReleaseVersion: boolean;
    readonly hasReleaseVersion: boolean;
    readonly description: string;
    readonly url?: string;
    readonly repository?: string;
    readonly supportUrl?: string;
    readonly iconUrl: string;
    readonly iconUrlFallback: string;
    readonly licenseUrl?: string;
    readonly installCount?: number;
    readonly rating?: number;
    readonly ratingCount?: number;
    readonly outdated: boolean;
    readonly outdatedTargetPlatform: boolean;
    readonly runtimeState: ExtensionRuntimeState | undefined;
    readonly enablementState: EnablementState;
    readonly tags: readonly string[];
    readonly categories: readonly string[];
    readonly dependencies: string[];
    readonly extensionPack: string[];
    readonly telemetryData: any;
    readonly preview: boolean;
    getManifest(token: CancellationToken): Promise<IExtensionManifest | null>;
    hasReadme(): boolean;
    getReadme(token: CancellationToken): Promise<string>;
    hasChangelog(): boolean;
    getChangelog(token: CancellationToken): Promise<string>;
    readonly server?: IExtensionManagementServer;
    readonly local?: ILocalExtension;
    gallery?: IGalleryExtension;
    readonly resourceExtension?: IResourceExtension;
    readonly isMalicious: boolean;
    readonly deprecationInfo?: IDeprecationInfo;
}
export declare const IExtensionsWorkbenchService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtensionsWorkbenchService>;
export interface InstallExtensionOptions extends InstallOptions {
    version?: string;
    justification?: string | {
        reason: string;
        action: string;
    };
    enable?: boolean;
}
export interface IExtensionsNotification {
    readonly message: string;
    readonly severity: Severity;
    readonly extensions: IExtension[];
    dismiss(): void;
}
export interface IExtensionsWorkbenchService {
    readonly _serviceBrand: undefined;
    readonly onChange: Event<IExtension | undefined>;
    readonly onReset: Event<void>;
    readonly preferPreReleases: boolean;
    readonly local: IExtension[];
    readonly installed: IExtension[];
    readonly outdated: IExtension[];
    readonly whenInitialized: Promise<void>;
    queryLocal(server?: IExtensionManagementServer): Promise<IExtension[]>;
    queryGallery(token: CancellationToken): Promise<IPager<IExtension>>;
    queryGallery(options: IQueryOptions, token: CancellationToken): Promise<IPager<IExtension>>;
    getExtensions(extensionInfos: IExtensionInfo[], token: CancellationToken): Promise<IExtension[]>;
    getExtensions(extensionInfos: IExtensionInfo[], options: IExtensionQueryOptions, token: CancellationToken): Promise<IExtension[]>;
    getResourceExtensions(locations: URI[], isWorkspaceScoped: boolean): Promise<IExtension[]>;
    canInstall(extension: IExtension): Promise<boolean>;
    install(id: string, installOptions?: InstallExtensionOptions, progressLocation?: ProgressLocation): Promise<IExtension>;
    install(vsix: URI, installOptions?: InstallExtensionOptions, progressLocation?: ProgressLocation): Promise<IExtension>;
    install(extension: IExtension, installOptions?: InstallExtensionOptions, progressLocation?: ProgressLocation): Promise<IExtension>;
    installInServer(extension: IExtension, server: IExtensionManagementServer): Promise<void>;
    uninstall(extension: IExtension): Promise<void>;
    reinstall(extension: IExtension): Promise<IExtension>;
    togglePreRelease(extension: IExtension): Promise<void>;
    canSetLanguage(extension: IExtension): boolean;
    setLanguage(extension: IExtension): Promise<void>;
    setEnablement(extensions: IExtension | IExtension[], enablementState: EnablementState): Promise<void>;
    isAutoUpdateEnabledFor(extensionOrPublisher: IExtension | string): boolean;
    updateAutoUpdateEnablementFor(extensionOrPublisher: IExtension | string, enable: boolean): Promise<void>;
    shouldRequireConsentToUpdate(extension: IExtension): Promise<string | undefined>;
    updateAutoUpdateForAllExtensions(value: boolean): Promise<void>;
    open(extension: IExtension | string, options?: IExtensionEditorOptions): Promise<void>;
    openSearch(searchValue: string, focus?: boolean): Promise<void>;
    getAutoUpdateValue(): AutoUpdateConfigurationValue;
    checkForUpdates(): Promise<void>;
    getExtensionRuntimeStatus(extension: IExtension): IExtensionRuntimeStatus | undefined;
    updateAll(): Promise<InstallExtensionResult[]>;
    updateRunningExtensions(): Promise<void>;
    readonly onDidChangeExtensionsNotification: Event<IExtensionsNotification | undefined>;
    getExtensionsNotification(): IExtensionsNotification | undefined;
    isExtensionIgnoredToSync(extension: IExtension): boolean;
    toggleExtensionIgnoredToSync(extension: IExtension): Promise<void>;
    toggleApplyExtensionToAllProfiles(extension: IExtension): Promise<void>;
}
export declare const enum ExtensionEditorTab {
    Readme = "readme",
    Features = "features",
    Changelog = "changelog",
    Dependencies = "dependencies",
    ExtensionPack = "extensionPack"
}
export declare const ConfigurationKey = "extensions";
export declare const AutoUpdateConfigurationKey = "extensions.autoUpdate";
export declare const AutoCheckUpdatesConfigurationKey = "extensions.autoCheckUpdates";
export declare const CloseExtensionDetailsOnViewChangeKey = "extensions.closeExtensionDetailsOnViewChange";
export declare const AutoRestartConfigurationKey = "extensions.autoRestart";
export type AutoUpdateConfigurationValue = boolean | 'onlyEnabledExtensions' | 'onlySelectedExtensions';
export interface IExtensionsConfiguration {
    autoUpdate: boolean;
    autoCheckUpdates: boolean;
    ignoreRecommendations: boolean;
    closeExtensionDetailsOnViewChange: boolean;
}
export interface IExtensionContainer extends IDisposable {
    extension: IExtension | null;
    updateWhenCounterExtensionChanges?: boolean;
    update(): void;
}
export declare class ExtensionContainers extends Disposable {
    private readonly containers;
    constructor(containers: IExtensionContainer[], extensionsWorkbenchService: IExtensionsWorkbenchService);
    set extension(extension: IExtension);
    private update;
}
export declare const WORKSPACE_RECOMMENDATIONS_VIEW_ID = "workbench.views.extensions.workspaceRecommendations";
export declare const OUTDATED_EXTENSIONS_VIEW_ID = "workbench.views.extensions.searchOutdated";
export declare const TOGGLE_IGNORE_EXTENSION_ACTION_ID = "workbench.extensions.action.toggleIgnoreExtension";
export declare const SELECT_INSTALL_VSIX_EXTENSION_COMMAND_ID = "workbench.extensions.action.installVSIX";
export declare const INSTALL_EXTENSION_FROM_VSIX_COMMAND_ID = "workbench.extensions.command.installFromVSIX";
export declare const LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID = "workbench.extensions.action.listWorkspaceUnsupportedExtensions";
export declare const HasOutdatedExtensionsContext: RawContextKey<boolean>;
export declare const CONTEXT_HAS_GALLERY: RawContextKey<boolean>;
export declare const THEME_ACTIONS_GROUP = "_theme_";
export declare const INSTALL_ACTIONS_GROUP = "0_install";
export declare const UPDATE_ACTIONS_GROUP = "0_update";
export declare const extensionsSearchActionsMenu: MenuId;
export interface IExtensionArg {
    id: string;
    version: string;
    location: URI | undefined;
}
