var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { VSBuffer } from '../../../../base/common/buffer.js';
import { FileOperationError, IFileService } from '../../../../platform/files/common/files.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IUserDataProfileService } from '../common/userDataProfile.js';
import { platform } from '../../../../base/common/platform.js';
import { TreeItemCollapsibleState } from '../../../common/views.js';
import { API_OPEN_EDITOR_COMMAND_ID } from '../../../browser/parts/editor/editorCommands.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { localize } from '../../../../nls.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
let KeybindingsResourceInitializer = class KeybindingsResourceInitializer {
    constructor(userDataProfileService, fileService, logService) {
        this.userDataProfileService = userDataProfileService;
        this.fileService = fileService;
        this.logService = logService;
    }
    async initialize(content) {
        const keybindingsContent = JSON.parse(content);
        if (keybindingsContent.keybindings === null) {
            this.logService.info(`Initializing Profile: No keybindings to apply...`);
            return;
        }
        await this.fileService.writeFile(this.userDataProfileService.currentProfile.keybindingsResource, VSBuffer.fromString(keybindingsContent.keybindings));
    }
};
KeybindingsResourceInitializer = __decorate([
    __param(0, IUserDataProfileService),
    __param(1, IFileService),
    __param(2, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object])
], KeybindingsResourceInitializer);
export { KeybindingsResourceInitializer };
let KeybindingsResource = class KeybindingsResource {
    constructor(fileService, logService) {
        this.fileService = fileService;
        this.logService = logService;
    }
    async getContent(profile) {
        const keybindingsContent = await this.getKeybindingsResourceContent(profile);
        return JSON.stringify(keybindingsContent);
    }
    async getKeybindingsResourceContent(profile) {
        const keybindings = await this.getKeybindingsContent(profile);
        return { keybindings, platform };
    }
    async apply(content, profile) {
        const keybindingsContent = JSON.parse(content);
        if (keybindingsContent.keybindings === null) {
            this.logService.info(`Importing Profile (${profile.name}): No keybindings to apply...`);
            return;
        }
        await this.fileService.writeFile(profile.keybindingsResource, VSBuffer.fromString(keybindingsContent.keybindings));
    }
    async getKeybindingsContent(profile) {
        try {
            const content = await this.fileService.readFile(profile.keybindingsResource);
            return content.value.toString();
        }
        catch (error) {
            if (error instanceof FileOperationError && error.fileOperationResult === 1) {
                return null;
            }
            else {
                throw error;
            }
        }
    }
};
KeybindingsResource = __decorate([
    __param(0, IFileService),
    __param(1, ILogService),
    __metadata("design:paramtypes", [Object, Object])
], KeybindingsResource);
export { KeybindingsResource };
let KeybindingsResourceTreeItem = class KeybindingsResourceTreeItem {
    constructor(profile, uriIdentityService, instantiationService) {
        this.profile = profile;
        this.uriIdentityService = uriIdentityService;
        this.instantiationService = instantiationService;
        this.type = "keybindings";
        this.handle = "keybindings";
        this.label = { label: localize('keybindings', "Keyboard Shortcuts") };
        this.collapsibleState = TreeItemCollapsibleState.Expanded;
    }
    isFromDefaultProfile() {
        return !this.profile.isDefault && !!this.profile.useDefaultFlags?.keybindings;
    }
    async getChildren() {
        return [{
                handle: this.profile.keybindingsResource.toString(),
                resourceUri: this.profile.keybindingsResource,
                collapsibleState: TreeItemCollapsibleState.None,
                parent: this,
                accessibilityInformation: {
                    label: this.uriIdentityService.extUri.basename(this.profile.settingsResource)
                },
                command: {
                    id: API_OPEN_EDITOR_COMMAND_ID,
                    title: '',
                    arguments: [this.profile.keybindingsResource, undefined, undefined]
                }
            }];
    }
    async hasContent() {
        const keybindingsContent = await this.instantiationService.createInstance(KeybindingsResource).getKeybindingsResourceContent(this.profile);
        return keybindingsContent.keybindings !== null;
    }
    async getContent() {
        return this.instantiationService.createInstance(KeybindingsResource).getContent(this.profile);
    }
};
KeybindingsResourceTreeItem = __decorate([
    __param(1, IUriIdentityService),
    __param(2, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object, Object])
], KeybindingsResourceTreeItem);
export { KeybindingsResourceTreeItem };
