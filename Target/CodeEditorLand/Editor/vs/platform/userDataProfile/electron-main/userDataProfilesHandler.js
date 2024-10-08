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
import { Disposable } from '../../../base/common/lifecycle.js';
import { ILifecycleMainService, } from '../../lifecycle/electron-main/lifecycleMainService.js';
import { IUserDataProfilesMainService } from './userDataProfile.js';
import { toWorkspaceIdentifier } from '../../workspace/common/workspace.js';
import { RunOnceScheduler } from '../../../base/common/async.js';
import { IWindowsMainService } from '../../windows/electron-main/windows.js';
let UserDataProfilesHandler = class UserDataProfilesHandler extends Disposable {
    constructor(lifecycleMainService, userDataProfilesService, windowsMainService) {
        super();
        this.userDataProfilesService = userDataProfilesService;
        this.windowsMainService = windowsMainService;
        this._register(lifecycleMainService.onWillLoadWindow(e => {
            if (e.reason === 2 /* LoadReason.LOAD */) {
                this.unsetProfileForWorkspace(e.window);
            }
        }));
        this._register(lifecycleMainService.onBeforeCloseWindow(window => this.unsetProfileForWorkspace(window)));
        this._register(new RunOnceScheduler(() => this.cleanUpEmptyWindowAssociations(), 30 * 1000 /* after 30s */)).schedule();
    }
    async unsetProfileForWorkspace(window) {
        const workspace = this.getWorkspace(window);
        const profile = this.userDataProfilesService.getProfileForWorkspace(workspace);
        if (profile?.isTransient) {
            this.userDataProfilesService.unsetWorkspace(workspace, profile.isTransient);
            if (profile.isTransient) {
                await this.userDataProfilesService.cleanUpTransientProfiles();
            }
        }
    }
    getWorkspace(window) {
        return window.openedWorkspace ?? toWorkspaceIdentifier(window.backupPath, window.isExtensionDevelopmentHost);
    }
    cleanUpEmptyWindowAssociations() {
        const associatedEmptyWindows = this.userDataProfilesService.getAssociatedEmptyWindows();
        if (associatedEmptyWindows.length === 0) {
            return;
        }
        const openedWorkspaces = this.windowsMainService.getWindows().map(window => this.getWorkspace(window));
        for (const associatedEmptyWindow of associatedEmptyWindows) {
            if (openedWorkspaces.some(openedWorkspace => openedWorkspace.id === associatedEmptyWindow.id)) {
                continue;
            }
            this.userDataProfilesService.unsetWorkspace(associatedEmptyWindow, false);
        }
    }
};
UserDataProfilesHandler = __decorate([
    __param(0, ILifecycleMainService),
    __param(1, IUserDataProfilesMainService),
    __param(2, IWindowsMainService),
    __metadata("design:paramtypes", [Object, Object, Object])
], UserDataProfilesHandler);
export { UserDataProfilesHandler };
