import { watchFile, unwatchFile } from 'fs';
import { Disposable, DisposableMap, DisposableStore, toDisposable } from '../../../../base/common/lifecycle.js';
import { isWatchRequestWithCorrelation, requestFilterToString } from '../../common/watcher.js';
import { Emitter } from '../../../../base/common/event.js';
import { URI } from '../../../../base/common/uri.js';
import { DeferredPromise, ThrottledDelayer } from '../../../../base/common/async.js';
import { hash } from '../../../../base/common/hash.js';
import { onUnexpectedError } from '../../../../base/common/errors.js';
export class BaseWatcher extends Disposable {
    constructor() {
        super();
        this._onDidChangeFile = this._register(new Emitter());
        this.onDidChangeFile = this._onDidChangeFile.event;
        this._onDidLogMessage = this._register(new Emitter());
        this.onDidLogMessage = this._onDidLogMessage.event;
        this._onDidWatchFail = this._register(new Emitter());
        this.onDidWatchFail = this._onDidWatchFail.event;
        this.correlatedWatchRequests = new Map();
        this.nonCorrelatedWatchRequests = new Map();
        this.suspendedWatchRequests = this._register(new DisposableMap());
        this.suspendedWatchRequestsWithPolling = new Set();
        this.updateWatchersDelayer = this._register(new ThrottledDelayer(this.getUpdateWatchersDelay()));
        this.suspendedWatchRequestPollingInterval = 5007;
        this.joinWatch = new DeferredPromise();
        this.verboseLogging = false;
        this._register(this.onDidWatchFail(request => this.suspendWatchRequest({
            id: this.computeId(request),
            correlationId: this.isCorrelated(request) ? request.correlationId : undefined,
            path: request.path
        })));
    }
    isCorrelated(request) {
        return isWatchRequestWithCorrelation(request);
    }
    computeId(request) {
        if (this.isCorrelated(request)) {
            return request.correlationId;
        }
        else {
            return hash(request);
        }
    }
    async watch(requests) {
        if (!this.joinWatch.isSettled) {
            this.joinWatch.complete();
        }
        this.joinWatch = new DeferredPromise();
        try {
            this.correlatedWatchRequests.clear();
            this.nonCorrelatedWatchRequests.clear();
            for (const request of requests) {
                if (this.isCorrelated(request)) {
                    this.correlatedWatchRequests.set(request.correlationId, request);
                }
                else {
                    this.nonCorrelatedWatchRequests.set(this.computeId(request), request);
                }
            }
            for (const [id] of this.suspendedWatchRequests) {
                if (!this.nonCorrelatedWatchRequests.has(id) && !this.correlatedWatchRequests.has(id)) {
                    this.suspendedWatchRequests.deleteAndDispose(id);
                    this.suspendedWatchRequestsWithPolling.delete(id);
                }
            }
            return await this.updateWatchers(false);
        }
        finally {
            this.joinWatch.complete();
        }
    }
    updateWatchers(delayed) {
        const nonSuspendedRequests = [];
        for (const [id, request] of [...this.nonCorrelatedWatchRequests, ...this.correlatedWatchRequests]) {
            if (!this.suspendedWatchRequests.has(id)) {
                nonSuspendedRequests.push(request);
            }
        }
        return this.updateWatchersDelayer.trigger(() => this.doWatch(nonSuspendedRequests), delayed ? this.getUpdateWatchersDelay() : 0).catch(error => onUnexpectedError(error));
    }
    getUpdateWatchersDelay() {
        return 800;
    }
    isSuspended(request) {
        const id = this.computeId(request);
        return this.suspendedWatchRequestsWithPolling.has(id) ? 'polling' : this.suspendedWatchRequests.has(id);
    }
    async suspendWatchRequest(request) {
        if (this.suspendedWatchRequests.has(request.id)) {
            return;
        }
        const disposables = new DisposableStore();
        this.suspendedWatchRequests.set(request.id, disposables);
        await this.joinWatch.p;
        if (disposables.isDisposed) {
            return;
        }
        this.monitorSuspendedWatchRequest(request, disposables);
        this.updateWatchers(true);
    }
    resumeWatchRequest(request) {
        this.suspendedWatchRequests.deleteAndDispose(request.id);
        this.suspendedWatchRequestsWithPolling.delete(request.id);
        this.updateWatchers(false);
    }
    monitorSuspendedWatchRequest(request, disposables) {
        if (this.doMonitorWithExistingWatcher(request, disposables)) {
            this.trace(`reusing an existing recursive watcher to monitor ${request.path}`);
            this.suspendedWatchRequestsWithPolling.delete(request.id);
        }
        else {
            this.doMonitorWithNodeJS(request, disposables);
            this.suspendedWatchRequestsWithPolling.add(request.id);
        }
    }
    doMonitorWithExistingWatcher(request, disposables) {
        const subscription = this.recursiveWatcher?.subscribe(request.path, (error, change) => {
            if (disposables.isDisposed) {
                return;
            }
            if (error) {
                this.monitorSuspendedWatchRequest(request, disposables);
            }
            else if (change?.type === 1) {
                this.onMonitoredPathAdded(request);
            }
        });
        if (subscription) {
            disposables.add(subscription);
            return true;
        }
        return false;
    }
    doMonitorWithNodeJS(request, disposables) {
        let pathNotFound = false;
        const watchFileCallback = (curr, prev) => {
            if (disposables.isDisposed) {
                return;
            }
            const currentPathNotFound = this.isPathNotFound(curr);
            const previousPathNotFound = this.isPathNotFound(prev);
            const oldPathNotFound = pathNotFound;
            pathNotFound = currentPathNotFound;
            if (!currentPathNotFound && (previousPathNotFound || oldPathNotFound)) {
                this.onMonitoredPathAdded(request);
            }
        };
        this.trace(`starting fs.watchFile() on ${request.path} (correlationId: ${request.correlationId})`);
        try {
            watchFile(request.path, { persistent: false, interval: this.suspendedWatchRequestPollingInterval }, watchFileCallback);
        }
        catch (error) {
            this.warn(`fs.watchFile() failed with error ${error} on path ${request.path} (correlationId: ${request.correlationId})`);
        }
        disposables.add(toDisposable(() => {
            this.trace(`stopping fs.watchFile() on ${request.path} (correlationId: ${request.correlationId})`);
            try {
                unwatchFile(request.path, watchFileCallback);
            }
            catch (error) {
                this.warn(`fs.unwatchFile() failed with error ${error} on path ${request.path} (correlationId: ${request.correlationId})`);
            }
        }));
    }
    onMonitoredPathAdded(request) {
        this.trace(`detected ${request.path} exists again, resuming watcher (correlationId: ${request.correlationId})`);
        const event = { resource: URI.file(request.path), type: 1, cId: request.correlationId };
        this._onDidChangeFile.fire([event]);
        this.traceEvent(event, request);
        this.resumeWatchRequest(request);
    }
    isPathNotFound(stats) {
        return stats.ctimeMs === 0 && stats.ino === 0;
    }
    async stop() {
        this.suspendedWatchRequests.clearAndDisposeAll();
        this.suspendedWatchRequestsWithPolling.clear();
    }
    traceEvent(event, request) {
        if (this.verboseLogging) {
            const traceMsg = ` >> normalized ${event.type === 1 ? '[ADDED]' : event.type === 2 ? '[DELETED]' : '[CHANGED]'} ${event.resource.fsPath}`;
            this.traceWithCorrelation(traceMsg, request);
        }
    }
    traceWithCorrelation(message, request) {
        if (this.verboseLogging) {
            this.trace(`${message}${typeof request.correlationId === 'number' ? ` <${request.correlationId}> ` : ``}`);
        }
    }
    requestToString(request) {
        return `${request.path} (excludes: ${request.excludes.length > 0 ? request.excludes : '<none>'}, includes: ${request.includes && request.includes.length > 0 ? JSON.stringify(request.includes) : '<all>'}, filter: ${requestFilterToString(request.filter)}, correlationId: ${typeof request.correlationId === 'number' ? request.correlationId : '<none>'})`;
    }
    async setVerboseLogging(enabled) {
        this.verboseLogging = enabled;
    }
}
