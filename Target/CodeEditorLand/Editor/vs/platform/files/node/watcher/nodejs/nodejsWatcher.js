import { Event } from '../../../../../base/common/event.js';
import { patternsEquals } from '../../../../../base/common/glob.js';
import { BaseWatcher } from '../baseWatcher.js';
import { isLinux } from '../../../../../base/common/platform.js';
import { NodeJSFileWatcherLibrary } from './nodejsWatcherLib.js';
import { isEqual } from '../../../../../base/common/extpath.js';
export class NodeJSWatcher extends BaseWatcher {
    constructor(recursiveWatcher) {
        super();
        this.recursiveWatcher = recursiveWatcher;
        this.onDidError = Event.None;
        this.watchers = new Set();
    }
    async doWatch(requests) {
        requests = this.removeDuplicateRequests(requests);
        const requestsToStart = [];
        const watchersToStop = new Set(Array.from(this.watchers));
        for (const request of requests) {
            const watcher = this.findWatcher(request);
            if (watcher && patternsEquals(watcher.request.excludes, request.excludes) && patternsEquals(watcher.request.includes, request.includes)) {
                watchersToStop.delete(watcher);
            }
            else {
                requestsToStart.push(request);
            }
        }
        if (requestsToStart.length) {
            this.trace(`Request to start watching: ${requestsToStart.map(request => this.requestToString(request)).join(',')}`);
        }
        if (watchersToStop.size) {
            this.trace(`Request to stop watching: ${Array.from(watchersToStop).map(watcher => this.requestToString(watcher.request)).join(',')}`);
        }
        for (const watcher of watchersToStop) {
            this.stopWatching(watcher);
        }
        for (const request of requestsToStart) {
            this.startWatching(request);
        }
    }
    findWatcher(request) {
        for (const watcher of this.watchers) {
            if (typeof request.correlationId === 'number' || typeof watcher.request.correlationId === 'number') {
                if (watcher.request.correlationId === request.correlationId) {
                    return watcher;
                }
            }
            else {
                if (isEqual(watcher.request.path, request.path, !isLinux)) {
                    return watcher;
                }
            }
        }
        return undefined;
    }
    startWatching(request) {
        const instance = new NodeJSFileWatcherLibrary(request, this.recursiveWatcher, changes => this._onDidChangeFile.fire(changes), () => this._onDidWatchFail.fire(request), msg => this._onDidLogMessage.fire(msg), this.verboseLogging);
        const watcher = { request, instance };
        this.watchers.add(watcher);
    }
    async stop() {
        await super.stop();
        for (const watcher of this.watchers) {
            this.stopWatching(watcher);
        }
    }
    stopWatching(watcher) {
        this.trace(`stopping file watcher`, watcher);
        this.watchers.delete(watcher);
        watcher.instance.dispose();
    }
    removeDuplicateRequests(requests) {
        const mapCorrelationtoRequests = new Map();
        for (const request of requests) {
            const path = isLinux ? request.path : request.path.toLowerCase();
            let requestsForCorrelation = mapCorrelationtoRequests.get(request.correlationId);
            if (!requestsForCorrelation) {
                requestsForCorrelation = new Map();
                mapCorrelationtoRequests.set(request.correlationId, requestsForCorrelation);
            }
            if (requestsForCorrelation.has(path)) {
                this.trace(`ignoring a request for watching who's path is already watched: ${this.requestToString(request)}`);
            }
            requestsForCorrelation.set(path, request);
        }
        return Array.from(mapCorrelationtoRequests.values()).map(requests => Array.from(requests.values())).flat();
    }
    async setVerboseLogging(enabled) {
        super.setVerboseLogging(enabled);
        for (const watcher of this.watchers) {
            watcher.instance.setVerboseLogging(enabled);
        }
    }
    trace(message, watcher) {
        if (this.verboseLogging) {
            this._onDidLogMessage.fire({ type: 'trace', message: this.toMessage(message, watcher) });
        }
    }
    warn(message) {
        this._onDidLogMessage.fire({ type: 'warn', message: this.toMessage(message) });
    }
    toMessage(message, watcher) {
        return watcher ? `[File Watcher (node.js)] ${message} (${this.requestToString(watcher.request)})` : `[File Watcher (node.js)] ${message}`;
    }
}
