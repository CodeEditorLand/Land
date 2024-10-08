/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
import { IWorkingCopyBackupService } from '../common/workingCopyBackup.js';
import { IFilesConfigurationService } from '../../filesConfiguration/common/filesConfigurationService.js';
import { IWorkingCopyService } from '../common/workingCopyService.js';
import { ILifecycleService } from '../../lifecycle/common/lifecycle.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { WorkingCopyBackupTracker } from '../common/workingCopyBackupTracker.js';
import { IWorkingCopyEditorService } from '../common/workingCopyEditorService.js';
import { IEditorService } from '../../editor/common/editorService.js';
import { IEditorGroupsService } from '../../editor/common/editorGroupsService.js';
let BrowserWorkingCopyBackupTracker = class BrowserWorkingCopyBackupTracker extends WorkingCopyBackupTracker {
    static { this.ID = 'workbench.contrib.browserWorkingCopyBackupTracker'; }
    constructor(workingCopyBackupService, filesConfigurationService, workingCopyService, lifecycleService, logService, workingCopyEditorService, editorService, editorGroupService) {
        super(workingCopyBackupService, workingCopyService, logService, lifecycleService, filesConfigurationService, workingCopyEditorService, editorService, editorGroupService);
    }
    onFinalBeforeShutdown(reason) {
        // Web: we cannot perform long running in the shutdown phase
        // As such we need to check sync if there are any modified working
        // copies that have not been backed up yet and then prevent the
        // shutdown if that is the case.
        const modifiedWorkingCopies = this.workingCopyService.modifiedWorkingCopies;
        if (!modifiedWorkingCopies.length) {
            return false; // nothing modified: no veto
        }
        if (!this.filesConfigurationService.isHotExitEnabled) {
            return true; // modified without backup: veto
        }
        for (const modifiedWorkingCopy of modifiedWorkingCopies) {
            if (!this.workingCopyBackupService.hasBackupSync(modifiedWorkingCopy, this.getContentVersion(modifiedWorkingCopy))) {
                this.logService.warn('Unload veto: pending backups');
                return true; // modified without backup: veto
            }
        }
        return false; // modified and backed up: no veto
    }
};
BrowserWorkingCopyBackupTracker = __decorate([
    __param(0, IWorkingCopyBackupService),
    __param(1, IFilesConfigurationService),
    __param(2, IWorkingCopyService),
    __param(3, ILifecycleService),
    __param(4, ILogService),
    __param(5, IWorkingCopyEditorService),
    __param(6, IEditorService),
    __param(7, IEditorGroupsService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object])
], BrowserWorkingCopyBackupTracker);
export { BrowserWorkingCopyBackupTracker };
