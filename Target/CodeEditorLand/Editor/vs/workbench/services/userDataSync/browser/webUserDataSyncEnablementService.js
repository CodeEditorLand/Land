/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IUserDataSyncEnablementService } from '../../../../platform/userDataSync/common/userDataSync.js';
import { UserDataSyncEnablementService } from './userDataSyncEnablementService.js';
export class WebUserDataSyncEnablementService extends UserDataSyncEnablementService {
    constructor() {
        super(...arguments);
        this.enabled = undefined;
    }
    canToggleEnablement() {
        return this.isTrusted() && super.canToggleEnablement();
    }
    isEnabled() {
        if (!this.isTrusted()) {
            return false;
        }
        if (this.enabled === undefined) {
            this.enabled = this.workbenchEnvironmentService.options?.settingsSyncOptions?.enabled;
        }
        if (this.enabled === undefined) {
            this.enabled = super.isEnabled();
        }
        return this.enabled;
    }
    setEnablement(enabled) {
        if (enabled && !this.canToggleEnablement()) {
            return;
        }
        if (this.enabled !== enabled) {
            this.enabled = enabled;
            super.setEnablement(enabled);
        }
    }
    getResourceSyncStateVersion(resource) {
        return resource === "extensions" /* SyncResource.Extensions */ ? this.workbenchEnvironmentService.options?.settingsSyncOptions?.extensionsSyncStateVersion : undefined;
    }
    isTrusted() {
        return !!this.workbenchEnvironmentService.options?.workspaceProvider?.trusted;
    }
}
registerSingleton(IUserDataSyncEnablementService, WebUserDataSyncEnablementService, 1 /* InstantiationType.Delayed */);
