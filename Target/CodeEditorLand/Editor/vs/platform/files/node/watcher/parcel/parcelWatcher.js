/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as parcelWatcher from '@parcel/watcher';
import { statSync, unlinkSync } from 'fs';
import { tmpdir, homedir } from 'os';
import { URI } from '../../../../../base/common/uri.js';
import { DeferredPromise, RunOnceScheduler, RunOnceWorker, ThrottledWorker } from '../../../../../base/common/async.js';
import { CancellationTokenSource } from '../../../../../base/common/cancellation.js';
import { toErrorMessage } from '../../../../../base/common/errorMessage.js';
import { Emitter, Event } from '../../../../../base/common/event.js';
import { randomPath, isEqual, isEqualOrParent } from '../../../../../base/common/extpath.js';
import { GLOBSTAR, patternsEquals } from '../../../../../base/common/glob.js';
import { BaseWatcher } from '../baseWatcher.js';
import { TernarySearchTree } from '../../../../../base/common/ternarySearchTree.js';
import { normalizeNFC } from '../../../../../base/common/normalization.js';
import { normalize, join } from '../../../../../base/common/path.js';
import { isLinux, isMacintosh, isWindows } from '../../../../../base/common/platform.js';
import { realcaseSync, realpathSync } from '../../../../../base/node/extpath.js';
import { coalesceEvents, parseWatcherPatterns, isFiltered } from '../../../common/watcher.js';
import { Disposable, DisposableStore, toDisposable } from '../../../../../base/common/lifecycle.js';
export class ParcelWatcherInstance extends Disposable {
    get failed() { return this.didFail; }
    get stopped() { return this.didStop; }
    constructor(
    /**
     * Signals when the watcher is ready to watch.
     */
    ready, request, 
    /**
     * How often this watcher has been restarted in case of an unexpected
     * shutdown.
     */
    restarts, 
    /**
     * The cancellation token associated with the lifecycle of the watcher.
     */
    token, 
    /**
     * An event aggregator to coalesce events and reduce duplicates.
     */
    worker, stopFn) {
        super();
        this.ready = ready;
        this.request = request;
        this.restarts = restarts;
        this.token = token;
        this.worker = worker;
        this.stopFn = stopFn;
        this._onDidStop = this._register(new Emitter());
        this.onDidStop = this._onDidStop.event;
        this._onDidFail = this._register(new Emitter());
        this.onDidFail = this._onDidFail.event;
        this.didFail = false;
        this.didStop = false;
        this.includes = this.request.includes ? parseWatcherPatterns(this.request.path, this.request.includes) : undefined;
        this.excludes = this.request.excludes ? parseWatcherPatterns(this.request.path, this.request.excludes) : undefined;
        this.subscriptions = new Map();
        this._register(toDisposable(() => this.subscriptions.clear()));
    }
    subscribe(path, callback) {
        path = URI.file(path).fsPath; // make sure to store the path in `fsPath` form to match it with events later
        let subscriptions = this.subscriptions.get(path);
        if (!subscriptions) {
            subscriptions = new Set();
            this.subscriptions.set(path, subscriptions);
        }
        subscriptions.add(callback);
        return toDisposable(() => {
            const subscriptions = this.subscriptions.get(path);
            if (subscriptions) {
                subscriptions.delete(callback);
                if (subscriptions.size === 0) {
                    this.subscriptions.delete(path);
                }
            }
        });
    }
    get subscriptionsCount() {
        return this.subscriptions.size;
    }
    notifyFileChange(path, change) {
        const subscriptions = this.subscriptions.get(path);
        if (subscriptions) {
            for (const subscription of subscriptions) {
                subscription(change);
            }
        }
    }
    notifyWatchFailed() {
        this.didFail = true;
        this._onDidFail.fire();
    }
    include(path) {
        if (!this.includes || this.includes.length === 0) {
            return true; // no specific includes defined, include all
        }
        return this.includes.some(include => include(path));
    }
    exclude(path) {
        return Boolean(this.excludes?.some(exclude => exclude(path)));
    }
    async stop(joinRestart) {
        this.didStop = true;
        try {
            await this.stopFn();
        }
        finally {
            this._onDidStop.fire({ joinRestart });
            this.dispose();
        }
    }
}
export class ParcelWatcher extends BaseWatcher {
    static { this.MAP_PARCEL_WATCHER_ACTION_TO_FILE_CHANGE = new Map([
        ['create', 1 /* FileChangeType.ADDED */],
        ['update', 0 /* FileChangeType.UPDATED */],
        ['delete', 2 /* FileChangeType.DELETED */]
    ]); }
    static { this.PREDEFINED_EXCLUDES = {
        'win32': [],
        'darwin': [
            join(homedir(), 'Library', 'Containers') // Triggers access dialog from macOS 14 (https://github.com/microsoft/vscode/issues/208105)
        ],
        'linux': []
    }; }
    static { this.PARCEL_WATCHER_BACKEND = isWindows ? 'windows' : isLinux ? 'inotify' : 'fs-events'; }
    // A delay for collecting file changes from Parcel
    // before collecting them for coalescing and emitting.
    // Parcel internally uses 50ms as delay, so we use 75ms,
    // to schedule sufficiently after Parcel.
    //
    // Note: since Parcel 2.0.7, the very first event is
    // emitted without delay if no events occured over a
    // duration of 500ms. But we always want to aggregate
    // events to apply our coleasing logic.
    //
    static { this.FILE_CHANGES_HANDLER_DELAY = 75; }
    constructor() {
        super();
        this._onDidError = this._register(new Emitter());
        this.onDidError = this._onDidError.event;
        this.watchers = new Set();
        // Reduce likelyhood of spam from file events via throttling.
        // (https://github.com/microsoft/vscode/issues/124723)
        this.throttledFileChangesEmitter = this._register(new ThrottledWorker({
            maxWorkChunkSize: 500, // only process up to 500 changes at once before...
            throttleDelay: 200, // ...resting for 200ms until we process events again...
            maxBufferedWork: 30000 // ...but never buffering more than 30000 events in memory
        }, events => this._onDidChangeFile.fire(events)));
        this.enospcErrorLogged = false;
        this.registerListeners();
    }
    registerListeners() {
        // Error handling on process
        process.on('uncaughtException', error => this.onUnexpectedError(error));
        process.on('unhandledRejection', error => this.onUnexpectedError(error));
    }
    async doWatch(requests) {
        // Figure out duplicates to remove from the requests
        requests = this.removeDuplicateRequests(requests);
        // Figure out which watchers to start and which to stop
        const requestsToStart = [];
        const watchersToStop = new Set(Array.from(this.watchers));
        for (const request of requests) {
            const watcher = this.findWatcher(request);
            if (watcher && patternsEquals(watcher.request.excludes, request.excludes) && patternsEquals(watcher.request.includes, request.includes) && watcher.request.pollingInterval === request.pollingInterval) {
                watchersToStop.delete(watcher); // keep watcher
            }
            else {
                requestsToStart.push(request); // start watching
            }
        }
        // Logging
        if (requestsToStart.length) {
            this.trace(`Request to start watching: ${requestsToStart.map(request => this.requestToString(request)).join(',')}`);
        }
        if (watchersToStop.size) {
            this.trace(`Request to stop watching: ${Array.from(watchersToStop).map(watcher => this.requestToString(watcher.request)).join(',')}`);
        }
        // Stop watching as instructed
        for (const watcher of watchersToStop) {
            await this.stopWatching(watcher);
        }
        // Start watching as instructed
        for (const request of requestsToStart) {
            if (request.pollingInterval) {
                this.startPolling(request, request.pollingInterval);
            }
            else {
                await this.startWatching(request);
            }
        }
    }
    findWatcher(request) {
        for (const watcher of this.watchers) {
            // Requests or watchers with correlation always match on that
            if (this.isCorrelated(request) || this.isCorrelated(watcher.request)) {
                if (watcher.request.correlationId === request.correlationId) {
                    return watcher;
                }
            }
            // Non-correlated requests or watchers match on path
            else {
                if (isEqual(watcher.request.path, request.path, !isLinux /* ignorecase */)) {
                    return watcher;
                }
            }
        }
        return undefined;
    }
    startPolling(request, pollingInterval, restarts = 0) {
        const cts = new CancellationTokenSource();
        const instance = new DeferredPromise();
        const snapshotFile = randomPath(tmpdir(), 'vscode-watcher-snapshot');
        // Remember as watcher instance
        const watcher = new ParcelWatcherInstance(instance.p, request, restarts, cts.token, new RunOnceWorker(events => this.handleParcelEvents(events, watcher), ParcelWatcher.FILE_CHANGES_HANDLER_DELAY), async () => {
            cts.dispose(true);
            watcher.worker.flush();
            watcher.worker.dispose();
            pollingWatcher.dispose();
            unlinkSync(snapshotFile);
        });
        this.watchers.add(watcher);
        // Path checks for symbolic links / wrong casing
        const { realPath, realPathDiffers, realPathLength } = this.normalizePath(request);
        this.trace(`Started watching: '${realPath}' with polling interval '${pollingInterval}'`);
        let counter = 0;
        const pollingWatcher = new RunOnceScheduler(async () => {
            counter++;
            if (cts.token.isCancellationRequested) {
                return;
            }
            // We already ran before, check for events since
            const parcelWatcherLib = parcelWatcher;
            if (counter > 1) {
                const parcelEvents = await parcelWatcherLib.getEventsSince(realPath, snapshotFile, { ignore: this.addPredefinedExcludes(request.excludes), backend: ParcelWatcher.PARCEL_WATCHER_BACKEND });
                if (cts.token.isCancellationRequested) {
                    return;
                }
                // Handle & emit events
                this.onParcelEvents(parcelEvents, watcher, realPathDiffers, realPathLength);
            }
            // Store a snapshot of files to the snapshot file
            await parcelWatcherLib.writeSnapshot(realPath, snapshotFile, { ignore: this.addPredefinedExcludes(request.excludes), backend: ParcelWatcher.PARCEL_WATCHER_BACKEND });
            // Signal we are ready now when the first snapshot was written
            if (counter === 1) {
                instance.complete();
            }
            if (cts.token.isCancellationRequested) {
                return;
            }
            // Schedule again at the next interval
            pollingWatcher.schedule();
        }, pollingInterval);
        pollingWatcher.schedule(0);
    }
    async startWatching(request, restarts = 0) {
        const cts = new CancellationTokenSource();
        const instance = new DeferredPromise();
        // Remember as watcher instance
        const watcher = new ParcelWatcherInstance(instance.p, request, restarts, cts.token, new RunOnceWorker(events => this.handleParcelEvents(events, watcher), ParcelWatcher.FILE_CHANGES_HANDLER_DELAY), async () => {
            cts.dispose(true);
            watcher.worker.flush();
            watcher.worker.dispose();
            const watcherInstance = await instance.p;
            await watcherInstance?.unsubscribe();
        });
        this.watchers.add(watcher);
        // Path checks for symbolic links / wrong casing
        const { realPath, realPathDiffers, realPathLength } = this.normalizePath(request);
        try {
            const parcelWatcherLib = parcelWatcher;
            const parcelWatcherInstance = await parcelWatcherLib.subscribe(realPath, (error, parcelEvents) => {
                if (watcher.token.isCancellationRequested) {
                    return; // return early when disposed
                }
                // In any case of an error, treat this like a unhandled exception
                // that might require the watcher to restart. We do not really know
                // the state of parcel at this point and as such will try to restart
                // up to our maximum of restarts.
                if (error) {
                    this.onUnexpectedError(error, request);
                }
                // Handle & emit events
                this.onParcelEvents(parcelEvents, watcher, realPathDiffers, realPathLength);
            }, {
                backend: ParcelWatcher.PARCEL_WATCHER_BACKEND,
                ignore: this.addPredefinedExcludes(watcher.request.excludes)
            });
            this.trace(`Started watching: '${realPath}' with backend '${ParcelWatcher.PARCEL_WATCHER_BACKEND}'`);
            instance.complete(parcelWatcherInstance);
        }
        catch (error) {
            this.onUnexpectedError(error, request);
            instance.complete(undefined);
            watcher.notifyWatchFailed();
            this._onDidWatchFail.fire(request);
        }
    }
    addPredefinedExcludes(initialExcludes) {
        const excludes = [...initialExcludes];
        const predefinedExcludes = ParcelWatcher.PREDEFINED_EXCLUDES[process.platform];
        if (Array.isArray(predefinedExcludes)) {
            for (const exclude of predefinedExcludes) {
                if (!excludes.includes(exclude)) {
                    excludes.push(exclude);
                }
            }
        }
        return excludes;
    }
    onParcelEvents(parcelEvents, watcher, realPathDiffers, realPathLength) {
        if (parcelEvents.length === 0) {
            return;
        }
        // Normalize events: handle NFC normalization and symlinks
        // It is important to do this before checking for includes
        // to check on the original path.
        this.normalizeEvents(parcelEvents, watcher.request, realPathDiffers, realPathLength);
        // Check for includes
        const includedEvents = this.handleIncludes(watcher, parcelEvents);
        // Add to event aggregator for later processing
        for (const includedEvent of includedEvents) {
            watcher.worker.work(includedEvent);
        }
    }
    handleIncludes(watcher, parcelEvents) {
        const events = [];
        for (const { path, type: parcelEventType } of parcelEvents) {
            const type = ParcelWatcher.MAP_PARCEL_WATCHER_ACTION_TO_FILE_CHANGE.get(parcelEventType);
            if (this.verboseLogging) {
                this.traceWithCorrelation(`${type === 1 /* FileChangeType.ADDED */ ? '[ADDED]' : type === 2 /* FileChangeType.DELETED */ ? '[DELETED]' : '[CHANGED]'} ${path}`, watcher.request);
            }
            // Apply include filter if any
            if (!watcher.include(path)) {
                if (this.verboseLogging) {
                    this.traceWithCorrelation(` >> ignored (not included) ${path}`, watcher.request);
                }
            }
            else {
                events.push({ type, resource: URI.file(path), cId: watcher.request.correlationId });
            }
        }
        return events;
    }
    handleParcelEvents(parcelEvents, watcher) {
        // Coalesce events: merge events of same kind
        const coalescedEvents = coalesceEvents(parcelEvents);
        // Filter events: check for specific events we want to exclude
        const { events: filteredEvents, rootDeleted } = this.filterEvents(coalescedEvents, watcher);
        // Broadcast to clients
        this.emitEvents(filteredEvents, watcher);
        // Handle root path deletes
        if (rootDeleted) {
            this.onWatchedPathDeleted(watcher);
        }
    }
    emitEvents(events, watcher) {
        if (events.length === 0) {
            return;
        }
        // Broadcast to clients via throttler
        const worked = this.throttledFileChangesEmitter.work(events);
        // Logging
        if (!worked) {
            this.warn(`started ignoring events due to too many file change events at once (incoming: ${events.length}, most recent change: ${events[0].resource.fsPath}). Use 'files.watcherExclude' setting to exclude folders with lots of changing files (e.g. compilation output).`);
        }
        else {
            if (this.throttledFileChangesEmitter.pending > 0) {
                this.trace(`started throttling events due to large amount of file change events at once (pending: ${this.throttledFileChangesEmitter.pending}, most recent change: ${events[0].resource.fsPath}). Use 'files.watcherExclude' setting to exclude folders with lots of changing files (e.g. compilation output).`, watcher);
            }
        }
    }
    normalizePath(request) {
        let realPath = request.path;
        let realPathDiffers = false;
        let realPathLength = request.path.length;
        try {
            // First check for symbolic link
            realPath = realpathSync(request.path);
            // Second check for casing difference
            // Note: this will be a no-op on Linux platforms
            if (request.path === realPath) {
                realPath = realcaseSync(request.path) ?? request.path;
            }
            // Correct watch path as needed
            if (request.path !== realPath) {
                realPathLength = realPath.length;
                realPathDiffers = true;
                this.trace(`correcting a path to watch that seems to be a symbolic link or wrong casing (original: ${request.path}, real: ${realPath})`);
            }
        }
        catch (error) {
            // ignore
        }
        return { realPath, realPathDiffers, realPathLength };
    }
    normalizeEvents(events, request, realPathDiffers, realPathLength) {
        for (const event of events) {
            // Mac uses NFD unicode form on disk, but we want NFC
            if (isMacintosh) {
                event.path = normalizeNFC(event.path);
            }
            // Workaround for https://github.com/parcel-bundler/watcher/issues/68
            // where watching root drive letter adds extra backslashes.
            if (isWindows) {
                if (request.path.length <= 3) { // for ex. c:, C:\
                    event.path = normalize(event.path);
                }
            }
            // Convert paths back to original form in case it differs
            if (realPathDiffers) {
                event.path = request.path + event.path.substr(realPathLength);
            }
        }
    }
    filterEvents(events, watcher) {
        const filteredEvents = [];
        let rootDeleted = false;
        const filter = this.isCorrelated(watcher.request) ? watcher.request.filter : undefined; // filtering is only enabled when correlating because watchers are otherwise potentially reused
        for (const event of events) {
            // Emit to instance subscriptions if any before filtering
            if (watcher.subscriptionsCount > 0) {
                watcher.notifyFileChange(event.resource.fsPath, event);
            }
            // Filtering
            rootDeleted = event.type === 2 /* FileChangeType.DELETED */ && isEqual(event.resource.fsPath, watcher.request.path, !isLinux);
            if (isFiltered(event, filter)) {
                if (this.verboseLogging) {
                    this.traceWithCorrelation(` >> ignored (filtered) ${event.resource.fsPath}`, watcher.request);
                }
                continue;
            }
            // Logging
            this.traceEvent(event, watcher.request);
            filteredEvents.push(event);
        }
        return { events: filteredEvents, rootDeleted };
    }
    onWatchedPathDeleted(watcher) {
        this.warn('Watcher shutdown because watched path got deleted', watcher);
        watcher.notifyWatchFailed();
        this._onDidWatchFail.fire(watcher.request);
    }
    onUnexpectedError(error, request) {
        const msg = toErrorMessage(error);
        // Specially handle ENOSPC errors that can happen when
        // the watcher consumes so many file descriptors that
        // we are running into a limit. We only want to warn
        // once in this case to avoid log spam.
        // See https://github.com/microsoft/vscode/issues/7950
        if (msg.indexOf('No space left on device') !== -1) {
            if (!this.enospcErrorLogged) {
                this.error('Inotify limit reached (ENOSPC)', request);
                this.enospcErrorLogged = true;
            }
        }
        // Any other error is unexpected and we should try to
        // restart the watcher as a result to get into healthy
        // state again if possible and if not attempted too much
        else {
            this.error(`Unexpected error: ${msg} (EUNKNOWN)`, request);
            this._onDidError.fire({ request, error: msg });
        }
    }
    async stop() {
        await super.stop();
        for (const watcher of this.watchers) {
            await this.stopWatching(watcher);
        }
    }
    restartWatching(watcher, delay = 800) {
        // Restart watcher delayed to accomodate for
        // changes on disk that have triggered the
        // need for a restart in the first place.
        const scheduler = new RunOnceScheduler(async () => {
            if (watcher.token.isCancellationRequested) {
                return; // return early when disposed
            }
            const restartPromise = new DeferredPromise();
            try {
                // Await the watcher having stopped, as this is
                // needed to properly re-watch the same path
                await this.stopWatching(watcher, restartPromise.p);
                // Start watcher again counting the restarts
                if (watcher.request.pollingInterval) {
                    this.startPolling(watcher.request, watcher.request.pollingInterval, watcher.restarts + 1);
                }
                else {
                    await this.startWatching(watcher.request, watcher.restarts + 1);
                }
            }
            finally {
                restartPromise.complete();
            }
        }, delay);
        scheduler.schedule();
        watcher.token.onCancellationRequested(() => scheduler.dispose());
    }
    async stopWatching(watcher, joinRestart) {
        this.trace(`stopping file watcher`, watcher);
        this.watchers.delete(watcher);
        try {
            await watcher.stop(joinRestart);
        }
        catch (error) {
            this.error(`Unexpected error stopping watcher: ${toErrorMessage(error)}`, watcher.request);
        }
    }
    removeDuplicateRequests(requests, validatePaths = true) {
        // Sort requests by path length to have shortest first
        // to have a way to prevent children to be watched if
        // parents exist.
        requests.sort((requestA, requestB) => requestA.path.length - requestB.path.length);
        // Ignore requests for the same paths that have the same correlation
        const mapCorrelationtoRequests = new Map();
        for (const request of requests) {
            if (request.excludes.includes(GLOBSTAR)) {
                continue; // path is ignored entirely (via `**` glob exclude)
            }
            const path = isLinux ? request.path : request.path.toLowerCase(); // adjust for case sensitivity
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
        const normalizedRequests = [];
        for (const requestsForCorrelation of mapCorrelationtoRequests.values()) {
            // Only consider requests for watching that are not
            // a child of an existing request path to prevent
            // duplication. In addition, drop any request where
            // everything is excluded (via `**` glob).
            //
            // However, allow explicit requests to watch folders
            // that are symbolic links because the Parcel watcher
            // does not allow to recursively watch symbolic links.
            const requestTrie = TernarySearchTree.forPaths(!isLinux);
            for (const request of requestsForCorrelation.values()) {
                // Check for overlapping requests
                if (requestTrie.findSubstr(request.path)) {
                    try {
                        const realpath = realpathSync(request.path);
                        if (realpath === request.path) {
                            this.trace(`ignoring a request for watching who's parent is already watched: ${this.requestToString(request)}`);
                            continue;
                        }
                    }
                    catch (error) {
                        this.trace(`ignoring a request for watching who's realpath failed to resolve: ${this.requestToString(request)} (error: ${error})`);
                        this._onDidWatchFail.fire(request);
                        continue;
                    }
                }
                // Check for invalid paths
                if (validatePaths && !this.isPathValid(request.path)) {
                    this._onDidWatchFail.fire(request);
                    continue;
                }
                requestTrie.set(request.path, request);
            }
            normalizedRequests.push(...Array.from(requestTrie).map(([, request]) => request));
        }
        return normalizedRequests;
    }
    isPathValid(path) {
        try {
            const stat = statSync(path);
            if (!stat.isDirectory()) {
                this.trace(`ignoring a path for watching that is a file and not a folder: ${path}`);
                return false;
            }
        }
        catch (error) {
            this.trace(`ignoring a path for watching who's stat info failed to resolve: ${path} (error: ${error})`);
            return false;
        }
        return true;
    }
    subscribe(path, callback) {
        for (const watcher of this.watchers) {
            if (watcher.failed) {
                continue; // watcher has already failed
            }
            if (!isEqualOrParent(path, watcher.request.path, !isLinux)) {
                continue; // watcher does not consider this path
            }
            if (watcher.exclude(path) ||
                !watcher.include(path)) {
                continue; // parcel instance does not consider this path
            }
            const disposables = new DisposableStore();
            disposables.add(Event.once(watcher.onDidStop)(async (e) => {
                await e.joinRestart; // if we are restarting, await that so that we can possibly reuse this watcher again
                if (disposables.isDisposed) {
                    return;
                }
                callback(true /* error */);
            }));
            disposables.add(Event.once(watcher.onDidFail)(() => callback(true /* error */)));
            disposables.add(watcher.subscribe(path, change => callback(null, change)));
            return disposables;
        }
        return undefined;
    }
    trace(message, watcher) {
        if (this.verboseLogging) {
            this._onDidLogMessage.fire({ type: 'trace', message: this.toMessage(message, watcher?.request) });
        }
    }
    warn(message, watcher) {
        this._onDidLogMessage.fire({ type: 'warn', message: this.toMessage(message, watcher?.request) });
    }
    error(message, request) {
        this._onDidLogMessage.fire({ type: 'error', message: this.toMessage(message, request) });
    }
    toMessage(message, request) {
        return request ? `[File Watcher] ${message} (path: ${request.path})` : `[File Watcher ('parcel')] ${message}`;
    }
    get recursiveWatcher() { return this; }
}
