import { IStringDictionary } from '../../../../base/common/collections.js';
import { URI } from '../../../../base/common/uri.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { IUserDataProfile, ProfileResourceType } from '../../../../platform/userDataProfile/common/userDataProfile.js';
import { IUserDataProfileStorageService } from '../../../../platform/userDataProfile/common/userDataProfileStorageService.js';
import { ITreeItemCheckboxState, TreeItemCollapsibleState } from '../../../common/views.js';
import { IProfileResource, IProfileResourceChildTreeItem, IProfileResourceInitializer, IProfileResourceTreeItem } from '../common/userDataProfile.js';
interface IGlobalState {
    storage: IStringDictionary<string>;
}
export declare class GlobalStateResourceInitializer implements IProfileResourceInitializer {
    private readonly storageService;
    constructor(storageService: IStorageService);
    initialize(content: string): Promise<void>;
}
export declare class GlobalStateResource implements IProfileResource {
    private readonly storageService;
    private readonly userDataProfileStorageService;
    private readonly logService;
    constructor(storageService: IStorageService, userDataProfileStorageService: IUserDataProfileStorageService, logService: ILogService);
    getContent(profile: IUserDataProfile): Promise<string>;
    apply(content: string, profile: IUserDataProfile): Promise<void>;
    getGlobalState(profile: IUserDataProfile): Promise<IGlobalState>;
    private writeGlobalState;
}
export declare abstract class GlobalStateResourceTreeItem implements IProfileResourceTreeItem {
    private readonly resource;
    private readonly uriIdentityService;
    readonly type = ProfileResourceType.GlobalState;
    readonly handle = ProfileResourceType.GlobalState;
    readonly label: {
        label: string;
    };
    readonly collapsibleState = TreeItemCollapsibleState.Collapsed;
    checkbox: ITreeItemCheckboxState | undefined;
    constructor(resource: URI, uriIdentityService: IUriIdentityService);
    getChildren(): Promise<IProfileResourceChildTreeItem[]>;
    abstract getContent(): Promise<string>;
    abstract isFromDefaultProfile(): boolean;
}
export declare class GlobalStateResourceExportTreeItem extends GlobalStateResourceTreeItem {
    private readonly profile;
    private readonly instantiationService;
    constructor(profile: IUserDataProfile, resource: URI, uriIdentityService: IUriIdentityService, instantiationService: IInstantiationService);
    hasContent(): Promise<boolean>;
    getContent(): Promise<string>;
    isFromDefaultProfile(): boolean;
}
export declare class GlobalStateResourceImportTreeItem extends GlobalStateResourceTreeItem {
    private readonly content;
    constructor(content: string, resource: URI, uriIdentityService: IUriIdentityService);
    getContent(): Promise<string>;
    isFromDefaultProfile(): boolean;
}
export {};
