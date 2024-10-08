/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Disposable } from '../../../../base/common/lifecycle.js';
import { isRecursiveWatchRequest } from '../../common/watcher.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { ParcelWatcher } from './parcel/parcelWatcher.js';
import { NodeJSWatcher } from './nodejs/nodejsWatcher.js';
import { Promises } from '../../../../base/common/async.js';
import { computeStats } from './watcherStats.js';
export class UniversalWatcher extends Disposable {
    constructor() {
        super();
        this.recursiveWatcher = this._register(new ParcelWatcher());
        this.nonRecursiveWatcher = this._register(new NodeJSWatcher(this.recursiveWatcher));
        this.onDidChangeFile = Event.any(this.recursiveWatcher.onDidChangeFile, this.nonRecursiveWatcher.onDidChangeFile);
        this.onDidError = Event.any(this.recursiveWatcher.onDidError, this.nonRecursiveWatcher.onDidError);
        this._onDidLogMessage = this._register(new Emitter());
        this.onDidLogMessage = Event.any(this._onDidLogMessage.event, this.recursiveWatcher.onDidLogMessage, this.nonRecursiveWatcher.onDidLogMessage);
        this.requests = [];
        this.failedRecursiveRequests = 0;
        this._register(this.recursiveWatcher.onDidError(e => {
            if (e.request) {
                this.failedRecursiveRequests++;
            }
        }));
    }
    async watch(requests) {
        this.requests = requests;
        this.failedRecursiveRequests = 0;
        // Watch recursively first to give recursive watchers a chance
        // to step in for non-recursive watch requests, thus reducing
        // watcher duplication.
        let error;
        try {
            await this.recursiveWatcher.watch(requests.filter(request => isRecursiveWatchRequest(request)));
        }
        catch (e) {
            error = e;
        }
        try {
            await this.nonRecursiveWatcher.watch(requests.filter(request => !isRecursiveWatchRequest(request)));
        }
        catch (e) {
            if (!error) {
                error = e;
            }
        }
        if (error) {
            throw error;
        }
    }
    async setVerboseLogging(enabled) {
        // Log stats
        if (enabled && this.requests.length > 0) {
            this._onDidLogMessage.fire({ type: 'trace', message: computeStats(this.requests, this.failedRecursiveRequests, this.recursiveWatcher, this.nonRecursiveWatcher) });
        }
        // Forward to watchers
        await Promises.settled([
            this.recursiveWatcher.setVerboseLogging(enabled),
            this.nonRecursiveWatcher.setVerboseLogging(enabled)
        ]);
    }
    async stop() {
        await Promises.settled([
            this.recursiveWatcher.stop(),
            this.nonRecursiveWatcher.stop()
        ]);
    }
}
