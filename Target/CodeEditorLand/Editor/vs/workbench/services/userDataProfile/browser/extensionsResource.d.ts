import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IExtensionGalleryService, IExtensionIdentifier, IExtensionManagementService, IGlobalExtensionEnablementService } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IUserDataProfile, ProfileResourceType } from '../../../../platform/userDataProfile/common/userDataProfile.js';
import { IUserDataProfileStorageService } from '../../../../platform/userDataProfile/common/userDataProfileStorageService.js';
import { ITreeItemCheckboxState, TreeItemCollapsibleState } from '../../../common/views.js';
import { IProfileResource, IProfileResourceChildTreeItem, IProfileResourceInitializer, IProfileResourceTreeItem, IUserDataProfileService } from '../common/userDataProfile.js';
interface IProfileExtension {
    identifier: IExtensionIdentifier;
    displayName?: string;
    preRelease?: boolean;
    applicationScoped?: boolean;
    disabled?: boolean;
    version?: string;
}
export declare class ExtensionsResourceInitializer implements IProfileResourceInitializer {
    private readonly userDataProfileService;
    private readonly extensionManagementService;
    private readonly extensionGalleryService;
    private readonly extensionEnablementService;
    private readonly logService;
    constructor(userDataProfileService: IUserDataProfileService, extensionManagementService: IExtensionManagementService, extensionGalleryService: IExtensionGalleryService, extensionEnablementService: IGlobalExtensionEnablementService, logService: ILogService);
    initialize(content: string): Promise<void>;
}
export declare class ExtensionsResource implements IProfileResource {
    private readonly extensionManagementService;
    private readonly extensionGalleryService;
    private readonly userDataProfileStorageService;
    private readonly instantiationService;
    private readonly logService;
    constructor(extensionManagementService: IExtensionManagementService, extensionGalleryService: IExtensionGalleryService, userDataProfileStorageService: IUserDataProfileStorageService, instantiationService: IInstantiationService, logService: ILogService);
    getContent(profile: IUserDataProfile, exclude?: string[]): Promise<string>;
    toContent(extensions: IProfileExtension[], exclude?: string[]): string;
    apply(content: string, profile: IUserDataProfile, progress?: (message: string) => void, token?: CancellationToken): Promise<void>;
    copy(from: IUserDataProfile, to: IUserDataProfile, disableExtensions: boolean): Promise<void>;
    getLocalExtensions(profile: IUserDataProfile): Promise<IProfileExtension[]>;
    getProfileExtensions(content: string): Promise<IProfileExtension[]>;
    private withProfileScopedServices;
}
export declare abstract class ExtensionsResourceTreeItem implements IProfileResourceTreeItem {
    readonly type = ProfileResourceType.Extensions;
    readonly handle = ProfileResourceType.Extensions;
    readonly label: {
        label: string;
    };
    readonly collapsibleState = TreeItemCollapsibleState.Expanded;
    contextValue: ProfileResourceType;
    checkbox: ITreeItemCheckboxState | undefined;
    protected readonly excludedExtensions: Set<string>;
    getChildren(): Promise<Array<IProfileResourceChildTreeItem & IProfileExtension>>;
    hasContent(): Promise<boolean>;
    abstract isFromDefaultProfile(): boolean;
    abstract getContent(): Promise<string>;
    protected abstract getExtensions(): Promise<IProfileExtension[]>;
}
export declare class ExtensionsResourceExportTreeItem extends ExtensionsResourceTreeItem {
    private readonly profile;
    private readonly instantiationService;
    constructor(profile: IUserDataProfile, instantiationService: IInstantiationService);
    isFromDefaultProfile(): boolean;
    protected getExtensions(): Promise<IProfileExtension[]>;
    getContent(): Promise<string>;
}
export declare class ExtensionsResourceImportTreeItem extends ExtensionsResourceTreeItem {
    private readonly content;
    private readonly instantiationService;
    constructor(content: string, instantiationService: IInstantiationService);
    isFromDefaultProfile(): boolean;
    protected getExtensions(): Promise<IProfileExtension[]>;
    getContent(): Promise<string>;
}
export {};
