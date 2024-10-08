import { Event } from '../../../../base/common/event.js';
import { IPagedModel } from '../../../../base/common/paging.js';
import { IQueryOptions as IGalleryQueryOptions, SortBy as GallerySortBy } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { IExtensionManagementServer, IExtensionManagementServerService, IWorkbenchExtensionManagementService, IWorkbenchExtensionEnablementService } from '../../../services/extensionManagement/common/extensionManagement.js';
import { IExtensionRecommendationsService } from '../../../services/extensionRecommendations/common/extensionRecommendations.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IExtension, IExtensionsWorkbenchService, IWorkspaceRecommendedExtensionsView } from '../common/extensions.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IViewletViewOptions } from '../../../browser/parts/views/viewsViewlet.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { ViewPane } from '../../../browser/parts/views/viewPane.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IViewDescriptorService } from '../../../common/views.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IPreferencesService } from '../../../services/preferences/common/preferences.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IExtensionManifestPropertiesService } from '../../../services/extensions/common/extensionManifestPropertiesService.js';
import { IWorkspaceTrustManagementService } from '../../../../platform/workspace/common/workspaceTrust.js';
import { IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IExtensionFeaturesManagementService } from '../../../services/extensionManagement/common/extensionFeatures.js';
import { URI } from '../../../../base/common/uri.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
export declare const NONE_CATEGORY = "none";
export interface ExtensionsListViewOptions {
    server?: IExtensionManagementServer;
    flexibleHeight?: boolean;
    onDidChangeTitle?: Event<string>;
    hideBadge?: boolean;
}
declare const enum LocalSortBy {
    UpdateDate = "UpdateDate"
}
type SortBy = LocalSortBy | GallerySortBy;
type IQueryOptions = Omit<IGalleryQueryOptions, 'sortBy'> & {
    sortBy?: SortBy;
};
export declare class ExtensionsListView extends ViewPane {
    protected readonly options: ExtensionsListViewOptions;
    protected notificationService: INotificationService;
    private readonly extensionService;
    protected extensionsWorkbenchService: IExtensionsWorkbenchService;
    protected extensionRecommendationsService: IExtensionRecommendationsService;
    protected contextService: IWorkspaceContextService;
    protected readonly extensionManagementServerService: IExtensionManagementServerService;
    private readonly extensionManifestPropertiesService;
    protected readonly extensionManagementService: IWorkbenchExtensionManagementService;
    protected readonly workspaceService: IWorkspaceContextService;
    protected readonly productService: IProductService;
    private readonly preferencesService;
    private readonly storageService;
    private readonly workspaceTrustManagementService;
    private readonly extensionEnablementService;
    private readonly layoutService;
    private readonly extensionFeaturesManagementService;
    protected readonly uriIdentityService: IUriIdentityService;
    private readonly logService;
    private static RECENT_UPDATE_DURATION;
    private bodyTemplate;
    private badge;
    private list;
    private queryRequest;
    private queryResult;
    private readonly contextMenuActionRunner;
    constructor(options: ExtensionsListViewOptions, viewletViewOptions: IViewletViewOptions, notificationService: INotificationService, keybindingService: IKeybindingService, contextMenuService: IContextMenuService, instantiationService: IInstantiationService, themeService: IThemeService, extensionService: IExtensionService, extensionsWorkbenchService: IExtensionsWorkbenchService, extensionRecommendationsService: IExtensionRecommendationsService, telemetryService: ITelemetryService, hoverService: IHoverService, configurationService: IConfigurationService, contextService: IWorkspaceContextService, extensionManagementServerService: IExtensionManagementServerService, extensionManifestPropertiesService: IExtensionManifestPropertiesService, extensionManagementService: IWorkbenchExtensionManagementService, workspaceService: IWorkspaceContextService, productService: IProductService, contextKeyService: IContextKeyService, viewDescriptorService: IViewDescriptorService, openerService: IOpenerService, preferencesService: IPreferencesService, storageService: IStorageService, workspaceTrustManagementService: IWorkspaceTrustManagementService, extensionEnablementService: IWorkbenchExtensionEnablementService, layoutService: IWorkbenchLayoutService, extensionFeaturesManagementService: IExtensionFeaturesManagementService, uriIdentityService: IUriIdentityService, logService: ILogService);
    protected registerActions(): void;
    protected renderHeader(container: HTMLElement): void;
    protected renderBody(container: HTMLElement): void;
    protected layoutBody(height: number, width: number): void;
    show(query: string, refresh?: boolean): Promise<IPagedModel<IExtension>>;
    count(): number;
    protected showEmptyModel(): Promise<IPagedModel<IExtension>>;
    private onContextMenu;
    private query;
    private queryByIds;
    private queryLocal;
    private filterLocal;
    private filterBuiltinExtensions;
    private filterExtensionByCategory;
    private parseCategories;
    private filterInstalledExtensions;
    private filterOutdatedExtensions;
    private filterDisabledExtensions;
    private filterEnabledExtensions;
    private filterWorkspaceUnsupportedExtensions;
    private filterDeprecatedExtensions;
    private filterRecentlyUpdatedExtensions;
    private filterExtensionsByFeature;
    private mergeAddedExtensions;
    private queryGallery;
    private sortExtensions;
    private isRecommendationsQuery;
    private queryRecommendations;
    protected getInstallableRecommendations(recommendations: Array<string | URI>, options: IQueryOptions, token: CancellationToken): Promise<IExtension[]>;
    protected getWorkspaceRecommendations(): Promise<Array<string | URI>>;
    private getWorkspaceRecommendationsModel;
    private getKeymapRecommendationsModel;
    private getLanguageRecommendationsModel;
    private getRemoteRecommendationsModel;
    private getExeRecommendationsModel;
    private getOtherRecommendationsModel;
    private getOtherRecommendations;
    private getAllRecommendationsModel;
    private searchRecommendations;
    private setModel;
    private updateModel;
    private updateBody;
    private isOfflineError;
    protected updateSize(): void;
    private openExtension;
    private onError;
    private getPagedModel;
    dispose(): void;
    static isLocalExtensionsQuery(query: string, sortBy?: string): boolean;
    static isSearchBuiltInExtensionsQuery(query: string): boolean;
    static isBuiltInExtensionsQuery(query: string): boolean;
    static isBuiltInGroupExtensionsQuery(query: string): boolean;
    static isSearchWorkspaceUnsupportedExtensionsQuery(query: string): boolean;
    static isInstalledExtensionsQuery(query: string): boolean;
    static isSearchInstalledExtensionsQuery(query: string): boolean;
    static isOutdatedExtensionsQuery(query: string): boolean;
    static isEnabledExtensionsQuery(query: string): boolean;
    static isDisabledExtensionsQuery(query: string): boolean;
    static isSearchDeprecatedExtensionsQuery(query: string): boolean;
    static isRecommendedExtensionsQuery(query: string): boolean;
    static isSearchRecommendedExtensionsQuery(query: string): boolean;
    static isWorkspaceRecommendedExtensionsQuery(query: string): boolean;
    static isExeRecommendedExtensionsQuery(query: string): boolean;
    static isRemoteRecommendedExtensionsQuery(query: string): boolean;
    static isKeymapsRecommendedExtensionsQuery(query: string): boolean;
    static isLanguageRecommendedExtensionsQuery(query: string): boolean;
    static isSortInstalledExtensionsQuery(query: string, sortBy?: string): boolean;
    static isSearchPopularQuery(query: string): boolean;
    static isSearchRecentlyPublishedQuery(query: string): boolean;
    static isSearchRecentlyUpdatedQuery(query: string): boolean;
    static isSearchExtensionUpdatesQuery(query: string): boolean;
    static isSortUpdateDateQuery(query: string): boolean;
    static isFeatureExtensionsQuery(query: string): boolean;
    focus(): void;
}
export declare class DefaultPopularExtensionsView extends ExtensionsListView {
    show(): Promise<IPagedModel<IExtension>>;
}
export declare class ServerInstalledExtensionsView extends ExtensionsListView {
    show(query: string): Promise<IPagedModel<IExtension>>;
}
export declare class EnabledExtensionsView extends ExtensionsListView {
    show(query: string): Promise<IPagedModel<IExtension>>;
}
export declare class DisabledExtensionsView extends ExtensionsListView {
    show(query: string): Promise<IPagedModel<IExtension>>;
}
export declare class OutdatedExtensionsView extends ExtensionsListView {
    show(query: string): Promise<IPagedModel<IExtension>>;
    protected updateSize(): void;
}
export declare class RecentlyUpdatedExtensionsView extends ExtensionsListView {
    show(query: string): Promise<IPagedModel<IExtension>>;
}
export interface StaticQueryExtensionsViewOptions extends ExtensionsListViewOptions {
    readonly query: string;
}
export declare class StaticQueryExtensionsView extends ExtensionsListView {
    protected readonly options: StaticQueryExtensionsViewOptions;
    constructor(options: StaticQueryExtensionsViewOptions, viewletViewOptions: IViewletViewOptions, notificationService: INotificationService, keybindingService: IKeybindingService, contextMenuService: IContextMenuService, instantiationService: IInstantiationService, themeService: IThemeService, extensionService: IExtensionService, extensionsWorkbenchService: IExtensionsWorkbenchService, extensionRecommendationsService: IExtensionRecommendationsService, telemetryService: ITelemetryService, hoverService: IHoverService, configurationService: IConfigurationService, contextService: IWorkspaceContextService, extensionManagementServerService: IExtensionManagementServerService, extensionManifestPropertiesService: IExtensionManifestPropertiesService, extensionManagementService: IWorkbenchExtensionManagementService, workspaceService: IWorkspaceContextService, productService: IProductService, contextKeyService: IContextKeyService, viewDescriptorService: IViewDescriptorService, openerService: IOpenerService, preferencesService: IPreferencesService, storageService: IStorageService, workspaceTrustManagementService: IWorkspaceTrustManagementService, extensionEnablementService: IWorkbenchExtensionEnablementService, layoutService: IWorkbenchLayoutService, extensionFeaturesManagementService: IExtensionFeaturesManagementService, uriIdentityService: IUriIdentityService, logService: ILogService);
    show(): Promise<IPagedModel<IExtension>>;
}
export declare class UntrustedWorkspaceUnsupportedExtensionsView extends ExtensionsListView {
    show(query: string): Promise<IPagedModel<IExtension>>;
}
export declare class UntrustedWorkspacePartiallySupportedExtensionsView extends ExtensionsListView {
    show(query: string): Promise<IPagedModel<IExtension>>;
}
export declare class VirtualWorkspaceUnsupportedExtensionsView extends ExtensionsListView {
    show(query: string): Promise<IPagedModel<IExtension>>;
}
export declare class VirtualWorkspacePartiallySupportedExtensionsView extends ExtensionsListView {
    show(query: string): Promise<IPagedModel<IExtension>>;
}
export declare class DeprecatedExtensionsView extends ExtensionsListView {
    show(query: string): Promise<IPagedModel<IExtension>>;
}
export declare class SearchMarketplaceExtensionsView extends ExtensionsListView {
    private readonly reportSearchFinishedDelayer;
    private searchWaitPromise;
    show(query: string): Promise<IPagedModel<IExtension>>;
    private reportSearchFinished;
}
export declare class DefaultRecommendedExtensionsView extends ExtensionsListView {
    private readonly recommendedExtensionsQuery;
    protected renderBody(container: HTMLElement): void;
    show(query: string): Promise<IPagedModel<IExtension>>;
}
export declare class RecommendedExtensionsView extends ExtensionsListView {
    private readonly recommendedExtensionsQuery;
    protected renderBody(container: HTMLElement): void;
    show(query: string): Promise<IPagedModel<IExtension>>;
}
export declare class WorkspaceRecommendedExtensionsView extends ExtensionsListView implements IWorkspaceRecommendedExtensionsView {
    private readonly recommendedExtensionsQuery;
    protected renderBody(container: HTMLElement): void;
    show(query: string): Promise<IPagedModel<IExtension>>;
    private getInstallableWorkspaceRecommendations;
    installWorkspaceRecommendations(): Promise<void>;
}
export declare function getAriaLabelForExtension(extension: IExtension | null): string;
export {};
