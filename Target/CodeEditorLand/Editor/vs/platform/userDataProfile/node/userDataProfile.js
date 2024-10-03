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
var UserDataProfilesReadonlyService_1, UserDataProfilesService_1;
import { URI } from '../../../base/common/uri.js';
import { INativeEnvironmentService } from '../../environment/common/environment.js';
import { IFileService } from '../../files/common/files.js';
import { ILogService } from '../../log/common/log.js';
import { IStateReadService, IStateService } from '../../state/node/state.js';
import { IUriIdentityService } from '../../uriIdentity/common/uriIdentity.js';
import { UserDataProfilesService as BaseUserDataProfilesService } from '../common/userDataProfile.js';
import { isString } from '../../../base/common/types.js';
import { StateService } from '../../state/node/stateService.js';
let UserDataProfilesReadonlyService = class UserDataProfilesReadonlyService extends BaseUserDataProfilesService {
    static { UserDataProfilesReadonlyService_1 = this; }
    static { this.PROFILE_ASSOCIATIONS_MIGRATION_KEY = 'profileAssociationsMigration'; }
    constructor(stateReadonlyService, uriIdentityService, nativeEnvironmentService, fileService, logService) {
        super(nativeEnvironmentService, fileService, uriIdentityService, logService);
        this.stateReadonlyService = stateReadonlyService;
        this.nativeEnvironmentService = nativeEnvironmentService;
    }
    getStoredProfiles() {
        const storedProfilesState = this.stateReadonlyService.getItem(UserDataProfilesReadonlyService_1.PROFILES_KEY, []);
        return storedProfilesState.map(p => ({ ...p, location: isString(p.location) ? this.uriIdentityService.extUri.joinPath(this.profilesHome, p.location) : URI.revive(p.location) }));
    }
    getStoredProfileAssociations() {
        const associations = this.stateReadonlyService.getItem(UserDataProfilesReadonlyService_1.PROFILE_ASSOCIATIONS_KEY, {});
        const migrated = this.stateReadonlyService.getItem(UserDataProfilesReadonlyService_1.PROFILE_ASSOCIATIONS_MIGRATION_KEY, false);
        return migrated ? associations : this.migrateStoredProfileAssociations(associations);
    }
    getDefaultProfileExtensionsLocation() {
        return this.uriIdentityService.extUri.joinPath(URI.file(this.nativeEnvironmentService.extensionsPath).with({ scheme: this.profilesHome.scheme }), 'extensions.json');
    }
};
UserDataProfilesReadonlyService = UserDataProfilesReadonlyService_1 = __decorate([
    __param(0, IStateReadService),
    __param(1, IUriIdentityService),
    __param(2, INativeEnvironmentService),
    __param(3, IFileService),
    __param(4, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], UserDataProfilesReadonlyService);
export { UserDataProfilesReadonlyService };
let UserDataProfilesService = UserDataProfilesService_1 = class UserDataProfilesService extends UserDataProfilesReadonlyService {
    constructor(stateService, uriIdentityService, environmentService, fileService, logService) {
        super(stateService, uriIdentityService, environmentService, fileService, logService);
        this.stateService = stateService;
    }
    saveStoredProfiles(storedProfiles) {
        if (storedProfiles.length) {
            this.stateService.setItem(UserDataProfilesService_1.PROFILES_KEY, storedProfiles.map(profile => ({ ...profile, location: this.uriIdentityService.extUri.basename(profile.location) })));
        }
        else {
            this.stateService.removeItem(UserDataProfilesService_1.PROFILES_KEY);
        }
    }
    getStoredProfiles() {
        const storedProfiles = super.getStoredProfiles();
        if (!this.stateService.getItem('userDataProfilesMigration', false)) {
            this.saveStoredProfiles(storedProfiles);
            this.stateService.setItem('userDataProfilesMigration', true);
        }
        return storedProfiles;
    }
    saveStoredProfileAssociations(storedProfileAssociations) {
        if (storedProfileAssociations.emptyWindows || storedProfileAssociations.workspaces) {
            this.stateService.setItem(UserDataProfilesService_1.PROFILE_ASSOCIATIONS_KEY, storedProfileAssociations);
        }
        else {
            this.stateService.removeItem(UserDataProfilesService_1.PROFILE_ASSOCIATIONS_KEY);
        }
    }
    getStoredProfileAssociations() {
        const oldKey = 'workspaceAndProfileInfo';
        const storedWorkspaceInfos = this.stateService.getItem(oldKey, undefined);
        if (storedWorkspaceInfos) {
            this.stateService.removeItem(oldKey);
            const workspaces = storedWorkspaceInfos.reduce((result, { workspace, profile }) => {
                result[URI.revive(workspace).toString()] = URI.revive(profile).toString();
                return result;
            }, {});
            this.stateService.setItem(UserDataProfilesService_1.PROFILE_ASSOCIATIONS_KEY, { workspaces });
        }
        const associations = super.getStoredProfileAssociations();
        if (!this.stateService.getItem(UserDataProfilesService_1.PROFILE_ASSOCIATIONS_MIGRATION_KEY, false)) {
            this.saveStoredProfileAssociations(associations);
            this.stateService.setItem(UserDataProfilesService_1.PROFILE_ASSOCIATIONS_MIGRATION_KEY, true);
        }
        return associations;
    }
};
UserDataProfilesService = UserDataProfilesService_1 = __decorate([
    __param(0, IStateService),
    __param(1, IUriIdentityService),
    __param(2, INativeEnvironmentService),
    __param(3, IFileService),
    __param(4, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], UserDataProfilesService);
export { UserDataProfilesService };
let ServerUserDataProfilesService = class ServerUserDataProfilesService extends UserDataProfilesService {
    constructor(uriIdentityService, environmentService, fileService, logService) {
        super(new StateService(0, environmentService, logService, fileService), uriIdentityService, environmentService, fileService, logService);
    }
    async init() {
        await this.stateService.init();
        return super.init();
    }
};
ServerUserDataProfilesService = __decorate([
    __param(0, IUriIdentityService),
    __param(1, INativeEnvironmentService),
    __param(2, IFileService),
    __param(3, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], ServerUserDataProfilesService);
export { ServerUserDataProfilesService };
