import { RemoteStorageService } from '../../../../platform/storage/common/storageService.js';
export class NativeWorkbenchStorageService extends RemoteStorageService {
    constructor(workspace, userDataProfileService, userDataProfilesService, mainProcessService, environmentService) {
        super(workspace, { currentProfile: userDataProfileService.currentProfile, defaultProfile: userDataProfilesService.defaultProfile }, mainProcessService, environmentService);
        this.userDataProfileService = userDataProfileService;
        this.registerListeners();
    }
    registerListeners() {
        this._register(this.userDataProfileService.onDidChangeCurrentProfile(e => e.join(this.switchToProfile(e.profile))));
    }
}
