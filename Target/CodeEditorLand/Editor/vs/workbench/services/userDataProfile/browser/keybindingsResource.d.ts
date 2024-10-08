import { IFileService } from '../../../../platform/files/common/files.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IProfileResource, IProfileResourceChildTreeItem, IProfileResourceInitializer, IProfileResourceTreeItem, IUserDataProfileService } from '../common/userDataProfile.js';
import { Platform } from '../../../../base/common/platform.js';
import { ITreeItemCheckboxState, TreeItemCollapsibleState } from '../../../common/views.js';
import { IUserDataProfile, ProfileResourceType } from '../../../../platform/userDataProfile/common/userDataProfile.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
interface IKeybindingsResourceContent {
    platform: Platform;
    keybindings: string | null;
}
export declare class KeybindingsResourceInitializer implements IProfileResourceInitializer {
    private readonly userDataProfileService;
    private readonly fileService;
    private readonly logService;
    constructor(userDataProfileService: IUserDataProfileService, fileService: IFileService, logService: ILogService);
    initialize(content: string): Promise<void>;
}
export declare class KeybindingsResource implements IProfileResource {
    private readonly fileService;
    private readonly logService;
    constructor(fileService: IFileService, logService: ILogService);
    getContent(profile: IUserDataProfile): Promise<string>;
    getKeybindingsResourceContent(profile: IUserDataProfile): Promise<IKeybindingsResourceContent>;
    apply(content: string, profile: IUserDataProfile): Promise<void>;
    private getKeybindingsContent;
}
export declare class KeybindingsResourceTreeItem implements IProfileResourceTreeItem {
    private readonly profile;
    private readonly uriIdentityService;
    private readonly instantiationService;
    readonly type = ProfileResourceType.Keybindings;
    readonly handle = ProfileResourceType.Keybindings;
    readonly label: {
        label: string;
    };
    readonly collapsibleState = TreeItemCollapsibleState.Expanded;
    checkbox: ITreeItemCheckboxState | undefined;
    constructor(profile: IUserDataProfile, uriIdentityService: IUriIdentityService, instantiationService: IInstantiationService);
    isFromDefaultProfile(): boolean;
    getChildren(): Promise<IProfileResourceChildTreeItem[]>;
    hasContent(): Promise<boolean>;
    getContent(): Promise<string>;
}
export {};
