import { ResourceSet } from '../../../../base/common/map.js';
import { URI } from '../../../../base/common/uri.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { IUserDataProfile, ProfileResourceType } from '../../../../platform/userDataProfile/common/userDataProfile.js';
import { ITreeItemCheckboxState, TreeItemCollapsibleState } from '../../../common/views.js';
import { IProfileResource, IProfileResourceChildTreeItem, IProfileResourceInitializer, IProfileResourceTreeItem, IUserDataProfileService } from '../common/userDataProfile.js';
export declare class SnippetsResourceInitializer implements IProfileResourceInitializer {
    private readonly userDataProfileService;
    private readonly fileService;
    private readonly uriIdentityService;
    constructor(userDataProfileService: IUserDataProfileService, fileService: IFileService, uriIdentityService: IUriIdentityService);
    initialize(content: string): Promise<void>;
}
export declare class SnippetsResource implements IProfileResource {
    private readonly fileService;
    private readonly uriIdentityService;
    constructor(fileService: IFileService, uriIdentityService: IUriIdentityService);
    getContent(profile: IUserDataProfile, excluded?: ResourceSet): Promise<string>;
    apply(content: string, profile: IUserDataProfile): Promise<void>;
    private getSnippets;
    getSnippetsResources(profile: IUserDataProfile, excluded?: ResourceSet): Promise<URI[]>;
}
export declare class SnippetsResourceTreeItem implements IProfileResourceTreeItem {
    private readonly profile;
    private readonly instantiationService;
    private readonly uriIdentityService;
    readonly type = ProfileResourceType.Snippets;
    readonly handle: string;
    readonly label: {
        label: string;
    };
    readonly collapsibleState = TreeItemCollapsibleState.Collapsed;
    checkbox: ITreeItemCheckboxState | undefined;
    private readonly excludedSnippets;
    constructor(profile: IUserDataProfile, instantiationService: IInstantiationService, uriIdentityService: IUriIdentityService);
    getChildren(): Promise<IProfileResourceChildTreeItem[] | undefined>;
    hasContent(): Promise<boolean>;
    getContent(): Promise<string>;
    isFromDefaultProfile(): boolean;
}
