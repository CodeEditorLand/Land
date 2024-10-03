import { Disposable } from '../../../base/common/lifecycle.js';
import { ILifecycleMainService } from '../../lifecycle/electron-main/lifecycleMainService.js';
import { IUserDataProfilesMainService } from './userDataProfile.js';
import { IWindowsMainService } from '../../windows/electron-main/windows.js';
export declare class UserDataProfilesHandler extends Disposable {
    private readonly userDataProfilesService;
    private readonly windowsMainService;
    constructor(lifecycleMainService: ILifecycleMainService, userDataProfilesService: IUserDataProfilesMainService, windowsMainService: IWindowsMainService);
    private unsetProfileForWorkspace;
    private getWorkspace;
    private cleanUpEmptyWindowAssociations;
}
