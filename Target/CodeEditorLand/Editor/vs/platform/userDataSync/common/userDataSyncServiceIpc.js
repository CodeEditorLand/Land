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
import { Emitter } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { IUserDataProfilesService, reviveProfile } from '../../userDataProfile/common/userDataProfile.js';
import { UserDataSyncError } from './userDataSync.js';
function reviewSyncResource(syncResource, userDataProfilesService) {
    return { ...syncResource, profile: reviveProfile(syncResource.profile, userDataProfilesService.profilesHome.scheme) };
}
function reviewSyncResourceHandle(syncResourceHandle) {
    return { created: syncResourceHandle.created, uri: URI.revive(syncResourceHandle.uri) };
}
export class UserDataSyncServiceChannel {
    constructor(service, userDataProfilesService, logService) {
        this.service = service;
        this.userDataProfilesService = userDataProfilesService;
        this.logService = logService;
        this.manualSyncTasks = new Map();
        this.onManualSynchronizeResources = new Emitter();
    }
    listen(_, event) {
        switch (event) {
            // sync
            case 'onDidChangeStatus': return this.service.onDidChangeStatus;
            case 'onDidChangeConflicts': return this.service.onDidChangeConflicts;
            case 'onDidChangeLocal': return this.service.onDidChangeLocal;
            case 'onDidChangeLastSyncTime': return this.service.onDidChangeLastSyncTime;
            case 'onSyncErrors': return this.service.onSyncErrors;
            case 'onDidResetLocal': return this.service.onDidResetLocal;
            case 'onDidResetRemote': return this.service.onDidResetRemote;
            // manual sync
            case 'manualSync/onSynchronizeResources': return this.onManualSynchronizeResources.event;
        }
        throw new Error(`[UserDataSyncServiceChannel] Event not found: ${event}`);
    }
    async call(context, command, args) {
        try {
            const result = await this._call(context, command, args);
            return result;
        }
        catch (e) {
            this.logService.error(e);
            throw e;
        }
    }
    async _call(context, command, args) {
        switch (command) {
            // sync
            case '_getInitialData': return Promise.resolve([this.service.status, this.service.conflicts, this.service.lastSyncTime]);
            case 'reset': return this.service.reset();
            case 'resetRemote': return this.service.resetRemote();
            case 'resetLocal': return this.service.resetLocal();
            case 'hasPreviouslySynced': return this.service.hasPreviouslySynced();
            case 'hasLocalData': return this.service.hasLocalData();
            case 'resolveContent': return this.service.resolveContent(URI.revive(args[0]));
            case 'accept': return this.service.accept(reviewSyncResource(args[0], this.userDataProfilesService), URI.revive(args[1]), args[2], args[3]);
            case 'replace': return this.service.replace(reviewSyncResourceHandle(args[0]));
            case 'cleanUpRemoteData': return this.service.cleanUpRemoteData();
            case 'getRemoteActivityData': return this.service.saveRemoteActivityData(URI.revive(args[0]));
            case 'extractActivityData': return this.service.extractActivityData(URI.revive(args[0]), URI.revive(args[1]));
            case 'createManualSyncTask': return this.createManualSyncTask();
        }
        // manual sync
        if (command.startsWith('manualSync/')) {
            const manualSyncTaskCommand = command.substring('manualSync/'.length);
            const manualSyncTaskId = args[0];
            const manualSyncTask = this.getManualSyncTask(manualSyncTaskId);
            args = args.slice(1);
            switch (manualSyncTaskCommand) {
                case 'merge': return manualSyncTask.merge();
                case 'apply': return manualSyncTask.apply().then(() => this.manualSyncTasks.delete(this.createKey(manualSyncTask.id)));
                case 'stop': return manualSyncTask.stop().finally(() => this.manualSyncTasks.delete(this.createKey(manualSyncTask.id)));
            }
        }
        throw new Error('Invalid call');
    }
    getManualSyncTask(manualSyncTaskId) {
        const manualSyncTask = this.manualSyncTasks.get(this.createKey(manualSyncTaskId));
        if (!manualSyncTask) {
            throw new Error(`Manual sync taks not found: ${manualSyncTaskId}`);
        }
        return manualSyncTask;
    }
    async createManualSyncTask() {
        const manualSyncTask = await this.service.createManualSyncTask();
        this.manualSyncTasks.set(this.createKey(manualSyncTask.id), manualSyncTask);
        return manualSyncTask.id;
    }
    createKey(manualSyncTaskId) { return `manualSyncTask-${manualSyncTaskId}`; }
}
let UserDataSyncServiceChannelClient = class UserDataSyncServiceChannelClient extends Disposable {
    get status() { return this._status; }
    get onDidChangeLocal() { return this.channel.listen('onDidChangeLocal'); }
    get conflicts() { return this._conflicts; }
    get lastSyncTime() { return this._lastSyncTime; }
    get onDidResetLocal() { return this.channel.listen('onDidResetLocal'); }
    get onDidResetRemote() { return this.channel.listen('onDidResetRemote'); }
    constructor(userDataSyncChannel, userDataProfilesService) {
        super();
        this.userDataProfilesService = userDataProfilesService;
        this._status = "uninitialized" /* SyncStatus.Uninitialized */;
        this._onDidChangeStatus = this._register(new Emitter());
        this.onDidChangeStatus = this._onDidChangeStatus.event;
        this._conflicts = [];
        this._onDidChangeConflicts = this._register(new Emitter());
        this.onDidChangeConflicts = this._onDidChangeConflicts.event;
        this._lastSyncTime = undefined;
        this._onDidChangeLastSyncTime = this._register(new Emitter());
        this.onDidChangeLastSyncTime = this._onDidChangeLastSyncTime.event;
        this._onSyncErrors = this._register(new Emitter());
        this.onSyncErrors = this._onSyncErrors.event;
        this.channel = {
            call(command, arg, cancellationToken) {
                return userDataSyncChannel.call(command, arg, cancellationToken)
                    .then(null, error => { throw UserDataSyncError.toUserDataSyncError(error); });
            },
            listen(event, arg) {
                return userDataSyncChannel.listen(event, arg);
            }
        };
        this.channel.call('_getInitialData').then(([status, conflicts, lastSyncTime]) => {
            this.updateStatus(status);
            this.updateConflicts(conflicts);
            if (lastSyncTime) {
                this.updateLastSyncTime(lastSyncTime);
            }
            this._register(this.channel.listen('onDidChangeStatus')(status => this.updateStatus(status)));
            this._register(this.channel.listen('onDidChangeLastSyncTime')(lastSyncTime => this.updateLastSyncTime(lastSyncTime)));
        });
        this._register(this.channel.listen('onDidChangeConflicts')(conflicts => this.updateConflicts(conflicts)));
        this._register(this.channel.listen('onSyncErrors')(errors => this._onSyncErrors.fire(errors.map(syncError => ({ ...syncError, error: UserDataSyncError.toUserDataSyncError(syncError.error) })))));
    }
    createSyncTask() {
        throw new Error('not supported');
    }
    async createManualSyncTask() {
        const id = await this.channel.call('createManualSyncTask');
        const that = this;
        const manualSyncTaskChannelClient = new ManualSyncTaskChannelClient(id, {
            async call(command, arg, cancellationToken) {
                return that.channel.call(`manualSync/${command}`, [id, ...(Array.isArray(arg) ? arg : [arg])], cancellationToken);
            },
            listen() {
                throw new Error('not supported');
            }
        });
        return manualSyncTaskChannelClient;
    }
    reset() {
        return this.channel.call('reset');
    }
    resetRemote() {
        return this.channel.call('resetRemote');
    }
    resetLocal() {
        return this.channel.call('resetLocal');
    }
    hasPreviouslySynced() {
        return this.channel.call('hasPreviouslySynced');
    }
    hasLocalData() {
        return this.channel.call('hasLocalData');
    }
    accept(syncResource, resource, content, apply) {
        return this.channel.call('accept', [syncResource, resource, content, apply]);
    }
    resolveContent(resource) {
        return this.channel.call('resolveContent', [resource]);
    }
    cleanUpRemoteData() {
        return this.channel.call('cleanUpRemoteData');
    }
    replace(syncResourceHandle) {
        return this.channel.call('replace', [syncResourceHandle]);
    }
    saveRemoteActivityData(location) {
        return this.channel.call('getRemoteActivityData', [location]);
    }
    extractActivityData(activityDataResource, location) {
        return this.channel.call('extractActivityData', [activityDataResource, location]);
    }
    async updateStatus(status) {
        this._status = status;
        this._onDidChangeStatus.fire(status);
    }
    async updateConflicts(conflicts) {
        // Revive URIs
        this._conflicts = conflicts.map(syncConflict => ({
            syncResource: syncConflict.syncResource,
            profile: reviveProfile(syncConflict.profile, this.userDataProfilesService.profilesHome.scheme),
            conflicts: syncConflict.conflicts.map(r => ({
                ...r,
                baseResource: URI.revive(r.baseResource),
                localResource: URI.revive(r.localResource),
                remoteResource: URI.revive(r.remoteResource),
                previewResource: URI.revive(r.previewResource),
            }))
        }));
        this._onDidChangeConflicts.fire(this._conflicts);
    }
    updateLastSyncTime(lastSyncTime) {
        if (this._lastSyncTime !== lastSyncTime) {
            this._lastSyncTime = lastSyncTime;
            this._onDidChangeLastSyncTime.fire(lastSyncTime);
        }
    }
};
UserDataSyncServiceChannelClient = __decorate([
    __param(1, IUserDataProfilesService),
    __metadata("design:paramtypes", [Object, Object])
], UserDataSyncServiceChannelClient);
export { UserDataSyncServiceChannelClient };
class ManualSyncTaskChannelClient extends Disposable {
    constructor(id, channel) {
        super();
        this.id = id;
        this.channel = channel;
    }
    async merge() {
        return this.channel.call('merge');
    }
    async apply() {
        return this.channel.call('apply');
    }
    stop() {
        return this.channel.call('stop');
    }
    dispose() {
        this.channel.call('dispose');
        super.dispose();
    }
}
