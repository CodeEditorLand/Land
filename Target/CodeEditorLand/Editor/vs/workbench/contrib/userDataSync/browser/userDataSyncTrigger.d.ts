import { Disposable } from '../../../../base/common/lifecycle.js';
import { IUserDataProfilesService } from '../../../../platform/userDataProfile/common/userDataProfile.js';
import { IUserDataAutoSyncService } from '../../../../platform/userDataSync/common/userDataSync.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IHostService } from '../../../services/host/browser/host.js';
export declare class UserDataSyncTrigger extends Disposable implements IWorkbenchContribution {
    private readonly userDataProfilesService;
    constructor(editorService: IEditorService, userDataProfilesService: IUserDataProfilesService, viewsService: IViewsService, userDataAutoSyncService: IUserDataAutoSyncService, hostService: IHostService);
    private getUserDataEditorInputSource;
}
