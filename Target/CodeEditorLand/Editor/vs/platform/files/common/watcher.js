import { GLOBSTAR, parse } from '../../../base/common/glob.js';
import { Disposable, DisposableStore, MutableDisposable } from '../../../base/common/lifecycle.js';
import { isAbsolute } from '../../../base/common/path.js';
import { isLinux } from '../../../base/common/platform.js';
import { URI } from '../../../base/common/uri.js';
import { isParent } from './files.js';
export function isWatchRequestWithCorrelation(request) {
    return typeof request.correlationId === 'number';
}
export function isRecursiveWatchRequest(request) {
    return request.recursive === true;
}
export class AbstractWatcherClient extends Disposable {
    static { this.MAX_RESTARTS = 5; }
    constructor(onFileChanges, onLogMessage, verboseLogging, options) {
        super();
        this.onFileChanges = onFileChanges;
        this.onLogMessage = onLogMessage;
        this.verboseLogging = verboseLogging;
        this.options = options;
        this.watcherDisposables = this._register(new MutableDisposable());
        this.requests = undefined;
        this.restartCounter = 0;
    }
    init() {
        const disposables = new DisposableStore();
        this.watcherDisposables.value = disposables;
        this.watcher = this.createWatcher(disposables);
        this.watcher.setVerboseLogging(this.verboseLogging);
        disposables.add(this.watcher.onDidChangeFile(changes => this.onFileChanges(changes)));
        disposables.add(this.watcher.onDidLogMessage(msg => this.onLogMessage(msg)));
        disposables.add(this.watcher.onDidError(e => this.onError(e.error, e.request)));
    }
    onError(error, failedRequest) {
        if (this.canRestart(error, failedRequest)) {
            if (this.restartCounter < AbstractWatcherClient.MAX_RESTARTS && this.requests) {
                this.error(`restarting watcher after unexpected error: ${error}`);
                this.restart(this.requests);
            }
            else {
                this.error(`gave up attempting to restart watcher after unexpected error: ${error}`);
            }
        }
        else {
            this.error(error);
        }
    }
    canRestart(error, failedRequest) {
        if (!this.options.restartOnError) {
            return false;
        }
        if (failedRequest) {
            return false;
        }
        if (error.indexOf('No space left on device') !== -1 ||
            error.indexOf('EMFILE') !== -1) {
            return false;
        }
        return true;
    }
    restart(requests) {
        this.restartCounter++;
        this.init();
        this.watch(requests);
    }
    async watch(requests) {
        this.requests = requests;
        await this.watcher?.watch(requests);
    }
    async setVerboseLogging(verboseLogging) {
        this.verboseLogging = verboseLogging;
        await this.watcher?.setVerboseLogging(verboseLogging);
    }
    error(message) {
        this.onLogMessage({ type: 'error', message: `[File Watcher (${this.options.type})] ${message}` });
    }
    trace(message) {
        this.onLogMessage({ type: 'trace', message: `[File Watcher (${this.options.type})] ${message}` });
    }
    dispose() {
        this.watcher = undefined;
        return super.dispose();
    }
}
export class AbstractNonRecursiveWatcherClient extends AbstractWatcherClient {
    constructor(onFileChanges, onLogMessage, verboseLogging) {
        super(onFileChanges, onLogMessage, verboseLogging, { type: 'node.js', restartOnError: false });
    }
}
export class AbstractUniversalWatcherClient extends AbstractWatcherClient {
    constructor(onFileChanges, onLogMessage, verboseLogging) {
        super(onFileChanges, onLogMessage, verboseLogging, { type: 'universal', restartOnError: true });
    }
}
export function reviveFileChanges(changes) {
    return changes.map(change => ({
        type: change.type,
        resource: URI.revive(change.resource),
        cId: change.cId
    }));
}
export function coalesceEvents(changes) {
    const coalescer = new EventCoalescer();
    for (const event of changes) {
        coalescer.processEvent(event);
    }
    return coalescer.coalesce();
}
export function normalizeWatcherPattern(path, pattern) {
    if (typeof pattern === 'string' && !pattern.startsWith(GLOBSTAR) && !isAbsolute(pattern)) {
        return { base: path, pattern };
    }
    return pattern;
}
export function parseWatcherPatterns(path, patterns) {
    const parsedPatterns = [];
    for (const pattern of patterns) {
        parsedPatterns.push(parse(normalizeWatcherPattern(path, pattern)));
    }
    return parsedPatterns;
}
class EventCoalescer {
    constructor() {
        this.coalesced = new Set();
        this.mapPathToChange = new Map();
    }
    toKey(event) {
        if (isLinux) {
            return event.resource.fsPath;
        }
        return event.resource.fsPath.toLowerCase();
    }
    processEvent(event) {
        const existingEvent = this.mapPathToChange.get(this.toKey(event));
        let keepEvent = false;
        if (existingEvent) {
            const currentChangeType = existingEvent.type;
            const newChangeType = event.type;
            if (existingEvent.resource.fsPath !== event.resource.fsPath && (event.type === 2 || event.type === 1)) {
                keepEvent = true;
            }
            else if (currentChangeType === 1 && newChangeType === 2) {
                this.mapPathToChange.delete(this.toKey(event));
                this.coalesced.delete(existingEvent);
            }
            else if (currentChangeType === 2 && newChangeType === 1) {
                existingEvent.type = 0;
            }
            else if (currentChangeType === 1 && newChangeType === 0) { }
            else {
                existingEvent.type = newChangeType;
            }
        }
        else {
            keepEvent = true;
        }
        if (keepEvent) {
            this.coalesced.add(event);
            this.mapPathToChange.set(this.toKey(event), event);
        }
    }
    coalesce() {
        const addOrChangeEvents = [];
        const deletedPaths = [];
        return Array.from(this.coalesced).filter(e => {
            if (e.type !== 2) {
                addOrChangeEvents.push(e);
                return false;
            }
            return true;
        }).sort((e1, e2) => {
            return e1.resource.fsPath.length - e2.resource.fsPath.length;
        }).filter(e => {
            if (deletedPaths.some(deletedPath => isParent(e.resource.fsPath, deletedPath, !isLinux))) {
                return false;
            }
            deletedPaths.push(e.resource.fsPath);
            return true;
        }).concat(addOrChangeEvents);
    }
}
export function isFiltered(event, filter) {
    if (typeof filter === 'number') {
        switch (event.type) {
            case 1:
                return (filter & 4) === 0;
            case 2:
                return (filter & 8) === 0;
            case 0:
                return (filter & 2) === 0;
        }
    }
    return false;
}
export function requestFilterToString(filter) {
    if (typeof filter === 'number') {
        const filters = [];
        if (filter & 4) {
            filters.push('Added');
        }
        if (filter & 8) {
            filters.push('Deleted');
        }
        if (filter & 2) {
            filters.push('Updated');
        }
        if (filters.length === 0) {
            return '<all>';
        }
        return `[${filters.join(', ')}]`;
    }
    return '<none>';
}
