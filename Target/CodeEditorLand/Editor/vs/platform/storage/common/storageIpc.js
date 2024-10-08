/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter, Event } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
class BaseStorageDatabaseClient extends Disposable {
    constructor(channel, profile, workspace) {
        super();
        this.channel = channel;
        this.profile = profile;
        this.workspace = workspace;
    }
    async getItems() {
        const serializableRequest = { profile: this.profile, workspace: this.workspace };
        const items = await this.channel.call('getItems', serializableRequest);
        return new Map(items);
    }
    updateItems(request) {
        const serializableRequest = { profile: this.profile, workspace: this.workspace };
        if (request.insert) {
            serializableRequest.insert = Array.from(request.insert.entries());
        }
        if (request.delete) {
            serializableRequest.delete = Array.from(request.delete.values());
        }
        return this.channel.call('updateItems', serializableRequest);
    }
    optimize() {
        const serializableRequest = { profile: this.profile, workspace: this.workspace };
        return this.channel.call('optimize', serializableRequest);
    }
}
class BaseProfileAwareStorageDatabaseClient extends BaseStorageDatabaseClient {
    constructor(channel, profile) {
        super(channel, profile, undefined);
        this._onDidChangeItemsExternal = this._register(new Emitter());
        this.onDidChangeItemsExternal = this._onDidChangeItemsExternal.event;
        this.registerListeners();
    }
    registerListeners() {
        this._register(this.channel.listen('onDidChangeStorage', { profile: this.profile })((e) => this.onDidChangeStorage(e)));
    }
    onDidChangeStorage(e) {
        if (Array.isArray(e.changed) || Array.isArray(e.deleted)) {
            this._onDidChangeItemsExternal.fire({
                changed: e.changed ? new Map(e.changed) : undefined,
                deleted: e.deleted ? new Set(e.deleted) : undefined
            });
        }
    }
}
export class ApplicationStorageDatabaseClient extends BaseProfileAwareStorageDatabaseClient {
    constructor(channel) {
        super(channel, undefined);
    }
    async close() {
        // The application storage database is shared across all instances so
        // we do not close it from the window. However we dispose the
        // listener for external changes because we no longer interested in it.
        this.dispose();
    }
}
export class ProfileStorageDatabaseClient extends BaseProfileAwareStorageDatabaseClient {
    constructor(channel, profile) {
        super(channel, profile);
    }
    async close() {
        // The profile storage database is shared across all instances of
        // the same profile so we do not close it from the window.
        // However we dispose the listener for external changes because
        // we no longer interested in it.
        this.dispose();
    }
}
export class WorkspaceStorageDatabaseClient extends BaseStorageDatabaseClient {
    constructor(channel, workspace) {
        super(channel, undefined, workspace);
        this.onDidChangeItemsExternal = Event.None; // unsupported for workspace storage because we only ever write from one window
    }
    async close() {
        // The workspace storage database is only used in this instance
        // but we do not need to close it from here, the main process
        // can take care of that.
        this.dispose();
    }
}
export class StorageClient {
    constructor(channel) {
        this.channel = channel;
    }
    isUsed(path) {
        const serializableRequest = { payload: path, profile: undefined, workspace: undefined };
        return this.channel.call('isUsed', serializableRequest);
    }
}
