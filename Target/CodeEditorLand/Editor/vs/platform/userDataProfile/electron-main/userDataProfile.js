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
import { INativeEnvironmentService } from '../../environment/common/environment.js';
import { IFileService } from '../../files/common/files.js';
import { refineServiceDecorator } from '../../instantiation/common/instantiation.js';
import { ILogService } from '../../log/common/log.js';
import { IUriIdentityService } from '../../uriIdentity/common/uriIdentity.js';
import { IUserDataProfilesService } from '../common/userDataProfile.js';
import { UserDataProfilesService } from '../node/userDataProfile.js';
import { IStateService } from '../../state/node/state.js';
export const IUserDataProfilesMainService = refineServiceDecorator(IUserDataProfilesService);
let UserDataProfilesMainService = class UserDataProfilesMainService extends UserDataProfilesService {
    constructor(stateService, uriIdentityService, environmentService, fileService, logService) {
        super(stateService, uriIdentityService, environmentService, fileService, logService);
    }
    getAssociatedEmptyWindows() {
        const emptyWindows = [];
        for (const id of this.profilesObject.emptyWindows.keys()) {
            emptyWindows.push({ id });
        }
        return emptyWindows;
    }
};
UserDataProfilesMainService = __decorate([
    __param(0, IStateService),
    __param(1, IUriIdentityService),
    __param(2, INativeEnvironmentService),
    __param(3, IFileService),
    __param(4, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], UserDataProfilesMainService);
export { UserDataProfilesMainService };
