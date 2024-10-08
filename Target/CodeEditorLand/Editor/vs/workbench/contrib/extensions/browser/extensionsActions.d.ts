import './media/extensionActions.css';
import { IAction, Action, IActionChangeEvent } from '../../../../base/common/actions.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IExtension, IExtensionsWorkbenchService, IExtensionContainer } from '../common/extensions.js';
import { IExtensionGalleryService, InstallOptions, InstallOperation } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { IWorkbenchExtensionEnablementService, IExtensionManagementServerService, IExtensionManagementServer, IWorkbenchExtensionManagementService } from '../../../services/extensionManagement/common/extensionManagement.js';
import { IExtensionIgnoredRecommendationsService } from '../../../services/extensionRecommendations/common/extensionRecommendations.js';
import { IExtensionManifest } from '../../../../platform/extensions/common/extensions.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { URI } from '../../../../base/common/uri.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { IJSONEditingService } from '../../../services/configuration/common/jsonEditing.js';
import { ITextModelService } from '../../../../editor/common/services/resolverService.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { IWorkbenchThemeService } from '../../../services/themes/common/workbenchThemeService.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { ITextFileService } from '../../../services/textfile/common/textfiles.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IProgressService } from '../../../../platform/progress/common/progress.js';
import { IActionViewItemOptions, ActionViewItem } from '../../../../base/browser/ui/actionbar/actionViewItems.js';
import { IUserDataSyncEnablementService } from '../../../../platform/userDataSync/common/userDataSync.js';
import { IContextMenuProvider } from '../../../../base/browser/contextmenu.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IExtensionManifestPropertiesService } from '../../../services/extensions/common/extensionManifestPropertiesService.js';
import { IWorkspaceTrustEnablementService, IWorkspaceTrustManagementService } from '../../../../platform/workspace/common/workspaceTrust.js';
import { IMarkdownString } from '../../../../base/common/htmlContent.js';
import { IPreferencesService } from '../../../services/preferences/common/preferences.js';
import { ILocaleService } from '../../../services/localization/common/locale.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IExtensionFeaturesManagementService } from '../../../services/extensionManagement/common/extensionFeatures.js';
import { IUpdateService } from '../../../../platform/update/common/update.js';
import { ActionWithDropdownActionViewItem, IActionWithDropdownActionViewItemOptions } from '../../../../base/browser/ui/dropdown/dropdownActionViewItem.js';
export declare class PromptExtensionInstallFailureAction extends Action {
    private readonly extension;
    private readonly options;
    private readonly version;
    private readonly installOperation;
    private readonly error;
    private readonly productService;
    private readonly openerService;
    private readonly notificationService;
    private readonly dialogService;
    private readonly commandService;
    private readonly logService;
    private readonly extensionManagementServerService;
    private readonly instantiationService;
    private readonly galleryService;
    private readonly extensionManifestPropertiesService;
    constructor(extension: IExtension, options: InstallOptions | undefined, version: string, installOperation: InstallOperation, error: Error, productService: IProductService, openerService: IOpenerService, notificationService: INotificationService, dialogService: IDialogService, commandService: ICommandService, logService: ILogService, extensionManagementServerService: IExtensionManagementServerService, instantiationService: IInstantiationService, galleryService: IExtensionGalleryService, extensionManifestPropertiesService: IExtensionManifestPropertiesService);
    run(): Promise<void>;
    private getDownloadUrl;
}
export interface IExtensionActionChangeEvent extends IActionChangeEvent {
    readonly hidden?: boolean;
    readonly menuActions?: IAction[];
}
export declare abstract class ExtensionAction extends Action implements IExtensionContainer {
    protected _onDidChange: Emitter<IExtensionActionChangeEvent>;
    readonly onDidChange: Event<IExtensionActionChangeEvent>;
    static readonly EXTENSION_ACTION_CLASS = "extension-action";
    static readonly TEXT_ACTION_CLASS: string;
    static readonly LABEL_ACTION_CLASS: string;
    static readonly PROMINENT_LABEL_ACTION_CLASS: string;
    static readonly ICON_ACTION_CLASS: string;
    private _extension;
    get extension(): IExtension | null;
    set extension(extension: IExtension | null);
    private _hidden;
    get hidden(): boolean;
    set hidden(hidden: boolean);
    protected _setEnabled(value: boolean): void;
    protected hideOnDisabled: boolean;
    abstract update(): void;
}
export declare class ButtonWithDropDownExtensionAction extends ExtensionAction {
    private readonly actionsGroups;
    private primaryAction;
    readonly menuActionClassNames: string[];
    private _menuActions;
    get menuActions(): IAction[];
    get extension(): IExtension | null;
    set extension(extension: IExtension | null);
    protected readonly extensionActions: ExtensionAction[];
    constructor(id: string, clazz: string, actionsGroups: ExtensionAction[][]);
    update(donotUpdateActions?: boolean): void;
    run(): Promise<void>;
    protected getLabel(action: ExtensionAction): string;
}
export declare class ButtonWithDropdownExtensionActionViewItem extends ActionWithDropdownActionViewItem {
    constructor(action: ButtonWithDropDownExtensionAction, options: IActionViewItemOptions & IActionWithDropdownActionViewItemOptions, contextMenuProvider: IContextMenuProvider);
    render(container: HTMLElement): void;
    protected updateClass(): void;
}
export declare class InstallAction extends ExtensionAction {
    private readonly extensionsWorkbenchService;
    private readonly instantiationService;
    private readonly runtimeExtensionService;
    private readonly workbenchThemeService;
    private readonly labelService;
    private readonly dialogService;
    private readonly preferencesService;
    private readonly telemetryService;
    private readonly contextService;
    static readonly CLASS: string;
    private static readonly HIDE;
    protected _manifest: IExtensionManifest | null;
    set manifest(manifest: IExtensionManifest | null);
    private readonly updateThrottler;
    readonly options: InstallOptions;
    constructor(options: InstallOptions, extensionsWorkbenchService: IExtensionsWorkbenchService, instantiationService: IInstantiationService, runtimeExtensionService: IExtensionService, workbenchThemeService: IWorkbenchThemeService, labelService: ILabelService, dialogService: IDialogService, preferencesService: IPreferencesService, telemetryService: ITelemetryService, contextService: IWorkspaceContextService);
    update(): void;
    protected computeAndUpdateEnablement(): Promise<void>;
    run(): Promise<any>;
    private getThemeAction;
    private install;
    private getRunningExtension;
    protected updateLabel(): void;
    getLabel(primary?: boolean): string;
}
export declare class InstallDropdownAction extends ButtonWithDropDownExtensionAction {
    set manifest(manifest: IExtensionManifest | null);
    constructor(instantiationService: IInstantiationService, extensionsWorkbenchService: IExtensionsWorkbenchService);
    protected getLabel(action: InstallAction): string;
}
export declare class InstallingLabelAction extends ExtensionAction {
    private static readonly LABEL;
    private static readonly CLASS;
    constructor();
    update(): void;
}
export declare abstract class InstallInOtherServerAction extends ExtensionAction {
    private readonly server;
    private readonly canInstallAnyWhere;
    private readonly extensionsWorkbenchService;
    protected readonly extensionManagementServerService: IExtensionManagementServerService;
    private readonly extensionManifestPropertiesService;
    protected static readonly INSTALL_LABEL: string;
    protected static readonly INSTALLING_LABEL: string;
    private static readonly Class;
    private static readonly InstallingClass;
    updateWhenCounterExtensionChanges: boolean;
    constructor(id: string, server: IExtensionManagementServer | null, canInstallAnyWhere: boolean, extensionsWorkbenchService: IExtensionsWorkbenchService, extensionManagementServerService: IExtensionManagementServerService, extensionManifestPropertiesService: IExtensionManifestPropertiesService);
    update(): void;
    protected canInstall(): boolean;
    run(): Promise<void>;
    protected abstract getInstallLabel(): string;
}
export declare class RemoteInstallAction extends InstallInOtherServerAction {
    constructor(canInstallAnyWhere: boolean, extensionsWorkbenchService: IExtensionsWorkbenchService, extensionManagementServerService: IExtensionManagementServerService, extensionManifestPropertiesService: IExtensionManifestPropertiesService);
    protected getInstallLabel(): string;
}
export declare class LocalInstallAction extends InstallInOtherServerAction {
    constructor(extensionsWorkbenchService: IExtensionsWorkbenchService, extensionManagementServerService: IExtensionManagementServerService, extensionManifestPropertiesService: IExtensionManifestPropertiesService);
    protected getInstallLabel(): string;
}
export declare class WebInstallAction extends InstallInOtherServerAction {
    constructor(extensionsWorkbenchService: IExtensionsWorkbenchService, extensionManagementServerService: IExtensionManagementServerService, extensionManifestPropertiesService: IExtensionManifestPropertiesService);
    protected getInstallLabel(): string;
}
export declare class UninstallAction extends ExtensionAction {
    private readonly extensionsWorkbenchService;
    private readonly dialogService;
    static readonly UninstallLabel: string;
    private static readonly UninstallingLabel;
    static readonly UninstallClass: string;
    private static readonly UnInstallingClass;
    constructor(extensionsWorkbenchService: IExtensionsWorkbenchService, dialogService: IDialogService);
    update(): void;
    run(): Promise<any>;
}
export declare class UpdateAction extends ExtensionAction {
    private readonly verbose;
    private readonly extensionsWorkbenchService;
    private readonly dialogService;
    private readonly openerService;
    private readonly instantiationService;
    private static readonly EnabledClass;
    private static readonly DisabledClass;
    private readonly updateThrottler;
    constructor(verbose: boolean, extensionsWorkbenchService: IExtensionsWorkbenchService, dialogService: IDialogService, openerService: IOpenerService, instantiationService: IInstantiationService);
    update(): void;
    private computeAndUpdateEnablement;
    run(): Promise<any>;
    private install;
}
export declare class ToggleAutoUpdateForExtensionAction extends ExtensionAction {
    private readonly extensionsWorkbenchService;
    private readonly extensionEnablementService;
    static readonly ID = "workbench.extensions.action.toggleAutoUpdateForExtension";
    static readonly LABEL: import("../../../../nls.js").ILocalizedString;
    private static readonly EnabledClass;
    private static readonly DisabledClass;
    constructor(extensionsWorkbenchService: IExtensionsWorkbenchService, extensionEnablementService: IWorkbenchExtensionEnablementService, configurationService: IConfigurationService);
    update(): void;
    run(): Promise<any>;
}
export declare class ToggleAutoUpdatesForPublisherAction extends ExtensionAction {
    private readonly extensionsWorkbenchService;
    static readonly ID = "workbench.extensions.action.toggleAutoUpdatesForPublisher";
    static readonly LABEL: string;
    constructor(extensionsWorkbenchService: IExtensionsWorkbenchService);
    update(): void;
    run(): Promise<any>;
}
export declare class MigrateDeprecatedExtensionAction extends ExtensionAction {
    private readonly small;
    private extensionsWorkbenchService;
    private static readonly EnabledClass;
    private static readonly DisabledClass;
    constructor(small: boolean, extensionsWorkbenchService: IExtensionsWorkbenchService);
    update(): void;
    run(): Promise<any>;
}
export declare abstract class DropDownExtensionAction extends ExtensionAction {
    protected instantiationService: IInstantiationService;
    constructor(id: string, label: string, cssClass: string, enabled: boolean, instantiationService: IInstantiationService);
    private _actionViewItem;
    createActionViewItem(options: IActionViewItemOptions): DropDownExtensionActionViewItem;
    run({ actionGroups, disposeActionsOnHide }: {
        actionGroups: IAction[][];
        disposeActionsOnHide: boolean;
    }): Promise<any>;
}
export declare class DropDownExtensionActionViewItem extends ActionViewItem {
    private readonly contextMenuService;
    constructor(action: DropDownExtensionAction, options: IActionViewItemOptions, contextMenuService: IContextMenuService);
    showMenu(menuActionGroups: IAction[][], disposeActionsOnHide: boolean): void;
    private getActions;
}
export declare function getContextMenuActions(extension: IExtension | undefined | null, contextKeyService: IContextKeyService, instantiationService: IInstantiationService): Promise<IAction[][]>;
export declare class ManageExtensionAction extends DropDownExtensionAction {
    private readonly extensionService;
    private readonly contextKeyService;
    static readonly ID = "extensions.manage";
    private static readonly Class;
    private static readonly HideManageExtensionClass;
    constructor(instantiationService: IInstantiationService, extensionService: IExtensionService, contextKeyService: IContextKeyService);
    getActionGroups(): Promise<IAction[][]>;
    run(): Promise<any>;
    update(): void;
}
export declare class ExtensionEditorManageExtensionAction extends DropDownExtensionAction {
    private readonly contextKeyService;
    constructor(contextKeyService: IContextKeyService, instantiationService: IInstantiationService);
    update(): void;
    run(): Promise<any>;
}
export declare class MenuItemExtensionAction extends ExtensionAction {
    private readonly action;
    private readonly extensionsWorkbenchService;
    constructor(action: IAction, extensionsWorkbenchService: IExtensionsWorkbenchService);
    get enabled(): boolean;
    set enabled(value: boolean);
    update(): void;
    run(): Promise<void>;
}
export declare class TogglePreReleaseExtensionAction extends ExtensionAction {
    private readonly extensionsWorkbenchService;
    static readonly ID = "workbench.extensions.action.togglePreRlease";
    static readonly LABEL: string;
    private static readonly EnabledClass;
    private static readonly DisabledClass;
    constructor(extensionsWorkbenchService: IExtensionsWorkbenchService);
    update(): void;
    run(): Promise<any>;
}
export declare class InstallAnotherVersionAction extends ExtensionAction {
    private readonly whenInstalled;
    private readonly extensionsWorkbenchService;
    private readonly extensionManagementService;
    private readonly extensionGalleryService;
    private readonly quickInputService;
    private readonly instantiationService;
    private readonly dialogService;
    static readonly ID = "workbench.extensions.action.install.anotherVersion";
    static readonly LABEL: string;
    constructor(extension: IExtension | null, whenInstalled: boolean, extensionsWorkbenchService: IExtensionsWorkbenchService, extensionManagementService: IWorkbenchExtensionManagementService, extensionGalleryService: IExtensionGalleryService, quickInputService: IQuickInputService, instantiationService: IInstantiationService, dialogService: IDialogService);
    update(): void;
    run(): Promise<any>;
}
export declare class EnableForWorkspaceAction extends ExtensionAction {
    private readonly extensionsWorkbenchService;
    private readonly extensionEnablementService;
    static readonly ID = "extensions.enableForWorkspace";
    static readonly LABEL: string;
    constructor(extensionsWorkbenchService: IExtensionsWorkbenchService, extensionEnablementService: IWorkbenchExtensionEnablementService);
    update(): void;
    run(): Promise<any>;
}
export declare class EnableGloballyAction extends ExtensionAction {
    private readonly extensionsWorkbenchService;
    private readonly extensionEnablementService;
    static readonly ID = "extensions.enableGlobally";
    static readonly LABEL: string;
    constructor(extensionsWorkbenchService: IExtensionsWorkbenchService, extensionEnablementService: IWorkbenchExtensionEnablementService);
    update(): void;
    run(): Promise<any>;
}
export declare class DisableForWorkspaceAction extends ExtensionAction {
    private readonly workspaceContextService;
    private readonly extensionsWorkbenchService;
    private readonly extensionEnablementService;
    private readonly extensionService;
    static readonly ID = "extensions.disableForWorkspace";
    static readonly LABEL: string;
    constructor(workspaceContextService: IWorkspaceContextService, extensionsWorkbenchService: IExtensionsWorkbenchService, extensionEnablementService: IWorkbenchExtensionEnablementService, extensionService: IExtensionService);
    update(): void;
    run(): Promise<any>;
}
export declare class DisableGloballyAction extends ExtensionAction {
    private readonly extensionsWorkbenchService;
    private readonly extensionEnablementService;
    private readonly extensionService;
    static readonly ID = "extensions.disableGlobally";
    static readonly LABEL: string;
    constructor(extensionsWorkbenchService: IExtensionsWorkbenchService, extensionEnablementService: IWorkbenchExtensionEnablementService, extensionService: IExtensionService);
    update(): void;
    run(): Promise<any>;
}
export declare class EnableDropDownAction extends ButtonWithDropDownExtensionAction {
    constructor(instantiationService: IInstantiationService);
}
export declare class DisableDropDownAction extends ButtonWithDropDownExtensionAction {
    constructor(instantiationService: IInstantiationService);
}
export declare class ExtensionRuntimeStateAction extends ExtensionAction {
    private readonly hostService;
    private readonly extensionsWorkbenchService;
    private readonly updateService;
    private readonly extensionService;
    private readonly productService;
    private readonly telemetryService;
    private static readonly EnabledClass;
    private static readonly DisabledClass;
    updateWhenCounterExtensionChanges: boolean;
    constructor(hostService: IHostService, extensionsWorkbenchService: IExtensionsWorkbenchService, updateService: IUpdateService, extensionService: IExtensionService, productService: IProductService, telemetryService: ITelemetryService);
    update(): void;
    run(): Promise<any>;
}
export declare class SetColorThemeAction extends ExtensionAction {
    private readonly workbenchThemeService;
    private readonly quickInputService;
    private readonly extensionEnablementService;
    static readonly ID = "workbench.extensions.action.setColorTheme";
    static readonly TITLE: import("../../../../nls.js").ILocalizedString;
    private static readonly EnabledClass;
    private static readonly DisabledClass;
    constructor(extensionService: IExtensionService, workbenchThemeService: IWorkbenchThemeService, quickInputService: IQuickInputService, extensionEnablementService: IWorkbenchExtensionEnablementService);
    update(): void;
    private computeEnablement;
    run({ showCurrentTheme, ignoreFocusLost }?: {
        showCurrentTheme: boolean;
        ignoreFocusLost: boolean;
    }): Promise<any>;
}
export declare class SetFileIconThemeAction extends ExtensionAction {
    private readonly workbenchThemeService;
    private readonly quickInputService;
    private readonly extensionEnablementService;
    static readonly ID = "workbench.extensions.action.setFileIconTheme";
    static readonly TITLE: import("../../../../nls.js").ILocalizedString;
    private static readonly EnabledClass;
    private static readonly DisabledClass;
    constructor(extensionService: IExtensionService, workbenchThemeService: IWorkbenchThemeService, quickInputService: IQuickInputService, extensionEnablementService: IWorkbenchExtensionEnablementService);
    update(): void;
    private computeEnablement;
    run({ showCurrentTheme, ignoreFocusLost }?: {
        showCurrentTheme: boolean;
        ignoreFocusLost: boolean;
    }): Promise<any>;
}
export declare class SetProductIconThemeAction extends ExtensionAction {
    private readonly workbenchThemeService;
    private readonly quickInputService;
    private readonly extensionEnablementService;
    static readonly ID = "workbench.extensions.action.setProductIconTheme";
    static readonly TITLE: import("../../../../nls.js").ILocalizedString;
    private static readonly EnabledClass;
    private static readonly DisabledClass;
    constructor(extensionService: IExtensionService, workbenchThemeService: IWorkbenchThemeService, quickInputService: IQuickInputService, extensionEnablementService: IWorkbenchExtensionEnablementService);
    update(): void;
    private computeEnablement;
    run({ showCurrentTheme, ignoreFocusLost }?: {
        showCurrentTheme: boolean;
        ignoreFocusLost: boolean;
    }): Promise<any>;
}
export declare class SetLanguageAction extends ExtensionAction {
    private readonly extensionsWorkbenchService;
    static readonly ID = "workbench.extensions.action.setDisplayLanguage";
    static readonly TITLE: import("../../../../nls.js").ILocalizedString;
    private static readonly EnabledClass;
    private static readonly DisabledClass;
    constructor(extensionsWorkbenchService: IExtensionsWorkbenchService);
    update(): void;
    run(): Promise<any>;
}
export declare class ClearLanguageAction extends ExtensionAction {
    private readonly extensionsWorkbenchService;
    private readonly localeService;
    static readonly ID = "workbench.extensions.action.clearLanguage";
    static readonly TITLE: import("../../../../nls.js").ILocalizedString;
    private static readonly EnabledClass;
    private static readonly DisabledClass;
    constructor(extensionsWorkbenchService: IExtensionsWorkbenchService, localeService: ILocaleService);
    update(): void;
    run(): Promise<any>;
}
export declare class ShowRecommendedExtensionAction extends Action {
    private readonly extensionWorkbenchService;
    static readonly ID = "workbench.extensions.action.showRecommendedExtension";
    static readonly LABEL: string;
    private extensionId;
    constructor(extensionId: string, extensionWorkbenchService: IExtensionsWorkbenchService);
    run(): Promise<any>;
}
export declare class InstallRecommendedExtensionAction extends Action {
    private readonly instantiationService;
    private readonly extensionWorkbenchService;
    static readonly ID = "workbench.extensions.action.installRecommendedExtension";
    static readonly LABEL: string;
    private extensionId;
    constructor(extensionId: string, instantiationService: IInstantiationService, extensionWorkbenchService: IExtensionsWorkbenchService);
    run(): Promise<any>;
}
export declare class IgnoreExtensionRecommendationAction extends Action {
    private readonly extension;
    private readonly extensionRecommendationsManagementService;
    static readonly ID = "extensions.ignore";
    private static readonly Class;
    constructor(extension: IExtension, extensionRecommendationsManagementService: IExtensionIgnoredRecommendationsService);
    run(): Promise<any>;
}
export declare class UndoIgnoreExtensionRecommendationAction extends Action {
    private readonly extension;
    private readonly extensionRecommendationsManagementService;
    static readonly ID = "extensions.ignore";
    private static readonly Class;
    constructor(extension: IExtension, extensionRecommendationsManagementService: IExtensionIgnoredRecommendationsService);
    run(): Promise<any>;
}
export declare abstract class AbstractConfigureRecommendedExtensionsAction extends Action {
    protected contextService: IWorkspaceContextService;
    private readonly fileService;
    private readonly textFileService;
    protected editorService: IEditorService;
    private readonly jsonEditingService;
    private readonly textModelResolverService;
    constructor(id: string, label: string, contextService: IWorkspaceContextService, fileService: IFileService, textFileService: ITextFileService, editorService: IEditorService, jsonEditingService: IJSONEditingService, textModelResolverService: ITextModelService);
    protected openExtensionsFile(extensionsFileResource: URI): Promise<any>;
    protected openWorkspaceConfigurationFile(workspaceConfigurationFile: URI): Promise<any>;
    private getOrUpdateWorkspaceConfigurationFile;
    private getSelectionPosition;
    private getOrCreateExtensionsFile;
}
export declare class ConfigureWorkspaceRecommendedExtensionsAction extends AbstractConfigureRecommendedExtensionsAction {
    static readonly ID = "workbench.extensions.action.configureWorkspaceRecommendedExtensions";
    static readonly LABEL: string;
    constructor(id: string, label: string, fileService: IFileService, textFileService: ITextFileService, contextService: IWorkspaceContextService, editorService: IEditorService, jsonEditingService: IJSONEditingService, textModelResolverService: ITextModelService);
    private update;
    run(): Promise<void>;
}
export declare class ConfigureWorkspaceFolderRecommendedExtensionsAction extends AbstractConfigureRecommendedExtensionsAction {
    private readonly commandService;
    static readonly ID = "workbench.extensions.action.configureWorkspaceFolderRecommendedExtensions";
    static readonly LABEL: string;
    constructor(id: string, label: string, fileService: IFileService, textFileService: ITextFileService, contextService: IWorkspaceContextService, editorService: IEditorService, jsonEditingService: IJSONEditingService, textModelResolverService: ITextModelService, commandService: ICommandService);
    run(): Promise<any>;
}
export declare class ExtensionStatusLabelAction extends Action implements IExtensionContainer {
    private readonly extensionService;
    private readonly extensionManagementServerService;
    private readonly extensionEnablementService;
    private static readonly ENABLED_CLASS;
    private static readonly DISABLED_CLASS;
    private initialStatus;
    private status;
    private version;
    private enablementState;
    private _extension;
    get extension(): IExtension | null;
    set extension(extension: IExtension | null);
    constructor(extensionService: IExtensionService, extensionManagementServerService: IExtensionManagementServerService, extensionEnablementService: IWorkbenchExtensionEnablementService);
    update(): void;
    private computeLabel;
    run(): Promise<any>;
}
export declare class ToggleSyncExtensionAction extends DropDownExtensionAction {
    private readonly configurationService;
    private readonly extensionsWorkbenchService;
    private readonly userDataSyncEnablementService;
    private static readonly IGNORED_SYNC_CLASS;
    private static readonly SYNC_CLASS;
    constructor(configurationService: IConfigurationService, extensionsWorkbenchService: IExtensionsWorkbenchService, userDataSyncEnablementService: IUserDataSyncEnablementService, instantiationService: IInstantiationService);
    update(): void;
    run(): Promise<any>;
}
export type ExtensionStatus = {
    readonly message: IMarkdownString;
    readonly icon?: ThemeIcon;
};
export declare class ExtensionStatusAction extends ExtensionAction {
    private readonly extensionManagementServerService;
    private readonly labelService;
    private readonly commandService;
    private readonly workspaceTrustEnablementService;
    private readonly workspaceTrustService;
    private readonly extensionsWorkbenchService;
    private readonly extensionService;
    private readonly extensionManifestPropertiesService;
    private readonly contextService;
    private readonly productService;
    private readonly workbenchExtensionEnablementService;
    private readonly extensionFeaturesManagementService;
    private static readonly CLASS;
    updateWhenCounterExtensionChanges: boolean;
    private _status;
    get status(): ExtensionStatus[];
    private readonly _onDidChangeStatus;
    readonly onDidChangeStatus: Event<void>;
    private readonly updateThrottler;
    constructor(extensionManagementServerService: IExtensionManagementServerService, labelService: ILabelService, commandService: ICommandService, workspaceTrustEnablementService: IWorkspaceTrustEnablementService, workspaceTrustService: IWorkspaceTrustManagementService, extensionsWorkbenchService: IExtensionsWorkbenchService, extensionService: IExtensionService, extensionManifestPropertiesService: IExtensionManifestPropertiesService, contextService: IWorkspaceContextService, productService: IProductService, workbenchExtensionEnablementService: IWorkbenchExtensionEnablementService, extensionFeaturesManagementService: IExtensionFeaturesManagementService);
    update(): void;
    private computeAndUpdateStatus;
    private updateStatus;
    run(): Promise<any>;
}
export declare class ReinstallAction extends Action {
    private readonly extensionsWorkbenchService;
    private readonly extensionManagementServerService;
    private readonly quickInputService;
    private readonly notificationService;
    private readonly hostService;
    private readonly extensionService;
    static readonly ID = "workbench.extensions.action.reinstall";
    static readonly LABEL: string;
    constructor(id: string | undefined, label: string | undefined, extensionsWorkbenchService: IExtensionsWorkbenchService, extensionManagementServerService: IExtensionManagementServerService, quickInputService: IQuickInputService, notificationService: INotificationService, hostService: IHostService, extensionService: IExtensionService);
    get enabled(): boolean;
    run(): Promise<any>;
    private getEntries;
    private reinstallExtension;
}
export declare class InstallSpecificVersionOfExtensionAction extends Action {
    private readonly extensionsWorkbenchService;
    private readonly quickInputService;
    private readonly instantiationService;
    private readonly extensionEnablementService;
    static readonly ID = "workbench.extensions.action.install.specificVersion";
    static readonly LABEL: string;
    constructor(id: string | undefined, label: string | undefined, extensionsWorkbenchService: IExtensionsWorkbenchService, quickInputService: IQuickInputService, instantiationService: IInstantiationService, extensionEnablementService: IWorkbenchExtensionEnablementService);
    get enabled(): boolean;
    run(): Promise<any>;
    private isEnabled;
    private getExtensionEntries;
}
export declare abstract class AbstractInstallExtensionsInServerAction extends Action {
    protected readonly extensionsWorkbenchService: IExtensionsWorkbenchService;
    private readonly quickInputService;
    private readonly notificationService;
    private readonly progressService;
    private extensions;
    constructor(id: string, extensionsWorkbenchService: IExtensionsWorkbenchService, quickInputService: IQuickInputService, notificationService: INotificationService, progressService: IProgressService);
    private updateExtensions;
    private update;
    run(): Promise<void>;
    private queryExtensionsToInstall;
    private selectAndInstallExtensions;
    private onDidAccept;
    protected abstract getQuickPickTitle(): string;
    protected abstract getExtensionsToInstall(local: IExtension[]): IExtension[];
    protected abstract installExtensions(extensions: IExtension[]): Promise<void>;
}
export declare class InstallLocalExtensionsInRemoteAction extends AbstractInstallExtensionsInServerAction {
    private readonly extensionManagementServerService;
    private readonly extensionGalleryService;
    private readonly instantiationService;
    private readonly fileService;
    private readonly logService;
    constructor(extensionsWorkbenchService: IExtensionsWorkbenchService, quickInputService: IQuickInputService, progressService: IProgressService, notificationService: INotificationService, extensionManagementServerService: IExtensionManagementServerService, extensionGalleryService: IExtensionGalleryService, instantiationService: IInstantiationService, fileService: IFileService, logService: ILogService);
    get label(): string;
    protected getQuickPickTitle(): string;
    protected getExtensionsToInstall(local: IExtension[]): IExtension[];
    protected installExtensions(localExtensionsToInstall: IExtension[]): Promise<void>;
}
export declare class InstallRemoteExtensionsInLocalAction extends AbstractInstallExtensionsInServerAction {
    private readonly extensionManagementServerService;
    private readonly extensionGalleryService;
    private readonly fileService;
    private readonly logService;
    constructor(id: string, extensionsWorkbenchService: IExtensionsWorkbenchService, quickInputService: IQuickInputService, progressService: IProgressService, notificationService: INotificationService, extensionManagementServerService: IExtensionManagementServerService, extensionGalleryService: IExtensionGalleryService, fileService: IFileService, logService: ILogService);
    get label(): string;
    protected getQuickPickTitle(): string;
    protected getExtensionsToInstall(local: IExtension[]): IExtension[];
    protected installExtensions(extensions: IExtension[]): Promise<void>;
}
export declare const showExtensionsWithIdsCommandId = "workbench.extensions.action.showExtensionsWithIds";
export declare const extensionButtonProminentBackground: string;
