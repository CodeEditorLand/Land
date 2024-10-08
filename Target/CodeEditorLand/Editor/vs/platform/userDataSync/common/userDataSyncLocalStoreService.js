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
import { Promises } from '../../../base/common/async.js';
import { VSBuffer } from '../../../base/common/buffer.js';
import { toLocalISOString } from '../../../base/common/date.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { joinPath } from '../../../base/common/resources.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
import { IFileService, toFileOperationResult } from '../../files/common/files.js';
import { IUserDataProfilesService } from '../../userDataProfile/common/userDataProfile.js';
import { ALL_SYNC_RESOURCES, IUserDataSyncLogService } from './userDataSync.js';
let UserDataSyncLocalStoreService = class UserDataSyncLocalStoreService extends Disposable {
    constructor(environmentService, fileService, configurationService, logService, userDataProfilesService) {
        super();
        this.environmentService = environmentService;
        this.fileService = fileService;
        this.configurationService = configurationService;
        this.logService = logService;
        this.userDataProfilesService = userDataProfilesService;
        this.cleanUp();
    }
    async cleanUp() {
        for (const profile of this.userDataProfilesService.profiles) {
            for (const resource of ALL_SYNC_RESOURCES) {
                try {
                    await this.cleanUpBackup(this.getResourceBackupHome(resource, profile.isDefault ? undefined : profile.id));
                }
                catch (error) {
                    this.logService.error(error);
                }
            }
        }
        let stat;
        try {
            stat = await this.fileService.resolve(this.environmentService.userDataSyncHome);
        }
        catch (error) {
            if (toFileOperationResult(error) !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                this.logService.error(error);
            }
            return;
        }
        if (stat.children) {
            for (const child of stat.children) {
                if (child.isDirectory && !ALL_SYNC_RESOURCES.includes(child.name) && !this.userDataProfilesService.profiles.some(profile => profile.id === child.name)) {
                    try {
                        this.logService.info('Deleting non existing profile from backup', child.resource.path);
                        await this.fileService.del(child.resource, { recursive: true });
                    }
                    catch (error) {
                        this.logService.error(error);
                    }
                }
            }
        }
    }
    async getAllResourceRefs(resource, collection, root) {
        const folder = this.getResourceBackupHome(resource, collection, root);
        try {
            const stat = await this.fileService.resolve(folder);
            if (stat.children) {
                const all = stat.children.filter(stat => stat.isFile && !stat.name.startsWith('lastSync')).sort().reverse();
                return all.map(stat => ({
                    ref: stat.name,
                    created: this.getCreationTime(stat)
                }));
            }
        }
        catch (error) {
            if (toFileOperationResult(error) !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                throw error;
            }
        }
        return [];
    }
    async resolveResourceContent(resourceKey, ref, collection, root) {
        const folder = this.getResourceBackupHome(resourceKey, collection, root);
        const file = joinPath(folder, ref);
        try {
            const content = await this.fileService.readFile(file);
            return content.value.toString();
        }
        catch (error) {
            this.logService.error(error);
            return null;
        }
    }
    async writeResource(resourceKey, content, cTime, collection, root) {
        const folder = this.getResourceBackupHome(resourceKey, collection, root);
        const resource = joinPath(folder, `${toLocalISOString(cTime).replace(/-|:|\.\d+Z$/g, '')}.json`);
        try {
            await this.fileService.writeFile(resource, VSBuffer.fromString(content));
        }
        catch (e) {
            this.logService.error(e);
        }
    }
    getResourceBackupHome(resource, collection, root = this.environmentService.userDataSyncHome) {
        return joinPath(root, ...(collection ? [collection, resource] : [resource]));
    }
    async cleanUpBackup(folder) {
        try {
            try {
                if (!(await this.fileService.exists(folder))) {
                    return;
                }
            }
            catch (e) {
                return;
            }
            const stat = await this.fileService.resolve(folder);
            if (stat.children) {
                const all = stat.children.filter(stat => stat.isFile && /^\d{8}T\d{6}(\.json)?$/.test(stat.name)).sort();
                const backUpMaxAge = 1000 * 60 * 60 * 24 * (this.configurationService.getValue('sync.localBackupDuration') || 30 /* Default 30 days */);
                let toDelete = all.filter(stat => Date.now() - this.getCreationTime(stat) > backUpMaxAge);
                const remaining = all.length - toDelete.length;
                if (remaining < 10) {
                    toDelete = toDelete.slice(10 - remaining);
                }
                await Promises.settled(toDelete.map(async (stat) => {
                    this.logService.info('Deleting from backup', stat.resource.path);
                    await this.fileService.del(stat.resource);
                }));
            }
        }
        catch (e) {
            this.logService.error(e);
        }
    }
    getCreationTime(stat) {
        return new Date(parseInt(stat.name.substring(0, 4)), parseInt(stat.name.substring(4, 6)) - 1, parseInt(stat.name.substring(6, 8)), parseInt(stat.name.substring(9, 11)), parseInt(stat.name.substring(11, 13)), parseInt(stat.name.substring(13, 15))).getTime();
    }
};
UserDataSyncLocalStoreService = __decorate([
    __param(0, IEnvironmentService),
    __param(1, IFileService),
    __param(2, IConfigurationService),
    __param(3, IUserDataSyncLogService),
    __param(4, IUserDataProfilesService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], UserDataSyncLocalStoreService);
export { UserDataSyncLocalStoreService };
