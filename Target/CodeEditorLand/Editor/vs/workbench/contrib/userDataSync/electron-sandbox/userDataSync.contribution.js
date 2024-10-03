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
import { registerWorkbenchContribution2 } from '../../../common/contributions.js';
import { IUserDataSyncUtilService } from '../../../../platform/userDataSync/common/userDataSync.js';
import { ISharedProcessService } from '../../../../platform/ipc/electron-sandbox/services.js';
import { registerAction2, Action2, MenuId } from '../../../../platform/actions/common/actions.js';
import { localize, localize2 } from '../../../../nls.js';
import { IEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';
import { INotificationService, Severity } from '../../../../platform/notification/common/notification.js';
import { CONTEXT_SYNC_STATE, DOWNLOAD_ACTIVITY_ACTION_DESCRIPTOR, IUserDataSyncWorkbenchService, SYNC_TITLE } from '../../../services/userDataSync/common/userDataSync.js';
import { Schemas } from '../../../../base/common/network.js';
import { ProxyChannel } from '../../../../base/parts/ipc/common/ipc.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
let UserDataSyncServicesContribution = class UserDataSyncServicesContribution extends Disposable {
    static { this.ID = 'workbench.contrib.userDataSyncServices'; }
    constructor(userDataSyncUtilService, sharedProcessService) {
        super();
        sharedProcessService.registerChannel('userDataSyncUtil', ProxyChannel.fromService(userDataSyncUtilService, this._store));
    }
};
UserDataSyncServicesContribution = __decorate([
    __param(0, IUserDataSyncUtilService),
    __param(1, ISharedProcessService),
    __metadata("design:paramtypes", [Object, Object])
], UserDataSyncServicesContribution);
registerWorkbenchContribution2(UserDataSyncServicesContribution.ID, UserDataSyncServicesContribution, 1);
registerAction2(class OpenSyncBackupsFolder extends Action2 {
    constructor() {
        super({
            id: 'workbench.userData.actions.openSyncBackupsFolder',
            title: localize2('Open Backup folder', "Open Local Backups Folder"),
            category: SYNC_TITLE,
            menu: {
                id: MenuId.CommandPalette,
                when: CONTEXT_SYNC_STATE.notEqualsTo("uninitialized"),
            }
        });
    }
    async run(accessor) {
        const syncHome = accessor.get(IEnvironmentService).userDataSyncHome;
        const nativeHostService = accessor.get(INativeHostService);
        const fileService = accessor.get(IFileService);
        const notificationService = accessor.get(INotificationService);
        if (await fileService.exists(syncHome)) {
            const folderStat = await fileService.resolve(syncHome);
            const item = folderStat.children && folderStat.children[0] ? folderStat.children[0].resource : syncHome;
            return nativeHostService.showItemInFolder(item.with({ scheme: Schemas.file }).fsPath);
        }
        else {
            notificationService.info(localize('no backups', "Local backups folder does not exist"));
        }
    }
});
registerAction2(class DownloadSyncActivityAction extends Action2 {
    constructor() {
        super(DOWNLOAD_ACTIVITY_ACTION_DESCRIPTOR);
    }
    async run(accessor) {
        const userDataSyncWorkbenchService = accessor.get(IUserDataSyncWorkbenchService);
        const notificationService = accessor.get(INotificationService);
        const hostService = accessor.get(INativeHostService);
        const folder = await userDataSyncWorkbenchService.downloadSyncActivity();
        if (folder) {
            notificationService.prompt(Severity.Info, localize('download sync activity complete', "Successfully downloaded Settings Sync activity."), [{
                    label: localize('open', "Open Folder"),
                    run: () => hostService.showItemInFolder(folder.fsPath)
                }]);
        }
    }
});
