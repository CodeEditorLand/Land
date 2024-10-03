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
import { Action } from '../../../../base/common/actions.js';
import * as nls from '../../../../nls.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';
import { INativeWorkbenchEnvironmentService } from '../../../services/environment/electron-sandbox/environmentService.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { joinPath } from '../../../../base/common/resources.js';
import { Schemas } from '../../../../base/common/network.js';
let OpenLogsFolderAction = class OpenLogsFolderAction extends Action {
    static { this.ID = 'workbench.action.openLogsFolder'; }
    static { this.TITLE = nls.localize2('openLogsFolder', "Open Logs Folder"); }
    constructor(id, label, environmentService, nativeHostService) {
        super(id, label);
        this.environmentService = environmentService;
        this.nativeHostService = nativeHostService;
    }
    run() {
        return this.nativeHostService.showItemInFolder(joinPath(this.environmentService.logsHome, 'main.log').with({ scheme: Schemas.file }).fsPath);
    }
};
OpenLogsFolderAction = __decorate([
    __param(2, INativeWorkbenchEnvironmentService),
    __param(3, INativeHostService),
    __metadata("design:paramtypes", [String, String, Object, Object])
], OpenLogsFolderAction);
export { OpenLogsFolderAction };
let OpenExtensionLogsFolderAction = class OpenExtensionLogsFolderAction extends Action {
    static { this.ID = 'workbench.action.openExtensionLogsFolder'; }
    static { this.TITLE = nls.localize2('openExtensionLogsFolder', "Open Extension Logs Folder"); }
    constructor(id, label, environmentSerice, fileService, nativeHostService) {
        super(id, label);
        this.environmentSerice = environmentSerice;
        this.fileService = fileService;
        this.nativeHostService = nativeHostService;
    }
    async run() {
        const folderStat = await this.fileService.resolve(this.environmentSerice.extHostLogsPath);
        if (folderStat.children && folderStat.children[0]) {
            return this.nativeHostService.showItemInFolder(folderStat.children[0].resource.with({ scheme: Schemas.file }).fsPath);
        }
    }
};
OpenExtensionLogsFolderAction = __decorate([
    __param(2, INativeWorkbenchEnvironmentService),
    __param(3, IFileService),
    __param(4, INativeHostService),
    __metadata("design:paramtypes", [String, String, Object, Object, Object])
], OpenExtensionLogsFolderAction);
export { OpenExtensionLogsFolderAction };
