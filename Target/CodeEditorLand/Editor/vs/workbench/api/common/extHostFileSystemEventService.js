/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter, AsyncEmitter } from '../../../base/common/event.js';
import { GLOBSTAR, GLOB_SPLIT, parse } from '../../../base/common/glob.js';
import { URI } from '../../../base/common/uri.js';
import { MainContext } from './extHost.protocol.js';
import * as typeConverter from './extHostTypeConverters.js';
import { Disposable, WorkspaceEdit } from './extHostTypes.js';
import { Lazy } from '../../../base/common/lazy.js';
import { rtrim } from '../../../base/common/strings.js';
import { normalizeWatcherPattern } from '../../../platform/files/common/watcher.js';
class FileSystemWatcher {
    get ignoreCreateEvents() {
        return Boolean(this._config & 0b001);
    }
    get ignoreChangeEvents() {
        return Boolean(this._config & 0b010);
    }
    get ignoreDeleteEvents() {
        return Boolean(this._config & 0b100);
    }
    constructor(mainContext, configuration, workspace, extension, dispatcher, globPattern, options) {
        this.session = Math.random();
        this._onDidCreate = new Emitter();
        this._onDidChange = new Emitter();
        this._onDidDelete = new Emitter();
        this._config = 0;
        if (options.ignoreCreateEvents) {
            this._config += 0b001;
        }
        if (options.ignoreChangeEvents) {
            this._config += 0b010;
        }
        if (options.ignoreDeleteEvents) {
            this._config += 0b100;
        }
        const parsedPattern = parse(globPattern);
        // 1.64.x behaviour change: given the new support to watch any folder
        // we start to ignore events outside the workspace when only a string
        // pattern is provided to avoid sending events to extensions that are
        // unexpected.
        // https://github.com/microsoft/vscode/issues/3025
        const excludeOutOfWorkspaceEvents = typeof globPattern === 'string';
        // 1.84.x introduces new proposed API for a watcher to set exclude
        // rules. In these cases, we turn the file watcher into correlation
        // mode and ignore any event that does not match the correlation ID.
        const excludeUncorrelatedEvents = options.correlate;
        const subscription = dispatcher(events => {
            if (typeof events.session === 'number' && events.session !== this.session) {
                return; // ignore events from other file watchers that are in correlation mode
            }
            if (excludeUncorrelatedEvents && typeof events.session === 'undefined') {
                return; // ignore events from other non-correlating file watcher when we are in correlation mode
            }
            if (!options.ignoreCreateEvents) {
                for (const created of events.created) {
                    const uri = URI.revive(created);
                    if (parsedPattern(uri.fsPath) && (!excludeOutOfWorkspaceEvents || workspace.getWorkspaceFolder(uri))) {
                        this._onDidCreate.fire(uri);
                    }
                }
            }
            if (!options.ignoreChangeEvents) {
                for (const changed of events.changed) {
                    const uri = URI.revive(changed);
                    if (parsedPattern(uri.fsPath) && (!excludeOutOfWorkspaceEvents || workspace.getWorkspaceFolder(uri))) {
                        this._onDidChange.fire(uri);
                    }
                }
            }
            if (!options.ignoreDeleteEvents) {
                for (const deleted of events.deleted) {
                    const uri = URI.revive(deleted);
                    if (parsedPattern(uri.fsPath) && (!excludeOutOfWorkspaceEvents || workspace.getWorkspaceFolder(uri))) {
                        this._onDidDelete.fire(uri);
                    }
                }
            }
        });
        this._disposable = Disposable.from(this.ensureWatching(mainContext, workspace, configuration, extension, globPattern, options, options.correlate), this._onDidCreate, this._onDidChange, this._onDidDelete, subscription);
    }
    ensureWatching(mainContext, workspace, configuration, extension, globPattern, options, correlate) {
        const disposable = Disposable.from();
        if (typeof globPattern === 'string') {
            return disposable; // workspace is already watched by default, no need to watch again!
        }
        if (options.ignoreChangeEvents && options.ignoreCreateEvents && options.ignoreDeleteEvents) {
            return disposable; // no need to watch if we ignore all events
        }
        const proxy = mainContext.getProxy(MainContext.MainThreadFileSystemEventService);
        let recursive = false;
        if (globPattern.pattern.includes(GLOBSTAR) || globPattern.pattern.includes(GLOB_SPLIT)) {
            recursive = true; // only watch recursively if pattern indicates the need for it
        }
        const excludes = options.excludes ?? [];
        let includes = undefined;
        let filter;
        // Correlated: adjust filter based on arguments
        if (correlate) {
            if (options.ignoreChangeEvents || options.ignoreCreateEvents || options.ignoreDeleteEvents) {
                filter = 2 /* FileChangeFilter.UPDATED */ | 4 /* FileChangeFilter.ADDED */ | 8 /* FileChangeFilter.DELETED */;
                if (options.ignoreChangeEvents) {
                    filter &= ~2 /* FileChangeFilter.UPDATED */;
                }
                if (options.ignoreCreateEvents) {
                    filter &= ~4 /* FileChangeFilter.ADDED */;
                }
                if (options.ignoreDeleteEvents) {
                    filter &= ~8 /* FileChangeFilter.DELETED */;
                }
            }
        }
        // Uncorrelated: adjust includes and excludes based on settings
        else {
            // Automatically add `files.watcherExclude` patterns when watching
            // recursively to give users a chance to configure exclude rules
            // for reducing the overhead of watching recursively
            if (recursive && excludes.length === 0) {
                const workspaceFolder = workspace.getWorkspaceFolder(URI.revive(globPattern.baseUri));
                const watcherExcludes = configuration.getConfiguration('files', workspaceFolder).get('watcherExclude');
                if (watcherExcludes) {
                    for (const key in watcherExcludes) {
                        if (key && watcherExcludes[key] === true) {
                            excludes.push(key);
                        }
                    }
                }
            }
            // Non-recursive watching inside the workspace will overlap with
            // our standard workspace watchers. To prevent duplicate events,
            // we only want to include events for files that are otherwise
            // excluded via `files.watcherExclude`. As such, we configure
            // to include each configured exclude pattern so that only those
            // events are reported that are otherwise excluded.
            // However, we cannot just use the pattern as is, because a pattern
            // such as `bar` for a exclude, will work to exclude any of
            // `<workspace path>/bar` but will not work as include for files within
            // `bar` unless a suffix of `/**` if added.
            // (https://github.com/microsoft/vscode/issues/148245)
            else if (!recursive) {
                const workspaceFolder = workspace.getWorkspaceFolder(URI.revive(globPattern.baseUri));
                if (workspaceFolder) {
                    const watcherExcludes = configuration.getConfiguration('files', workspaceFolder).get('watcherExclude');
                    if (watcherExcludes) {
                        for (const key in watcherExcludes) {
                            if (key && watcherExcludes[key] === true) {
                                const includePattern = `${rtrim(key, '/')}/${GLOBSTAR}`;
                                if (!includes) {
                                    includes = [];
                                }
                                includes.push(normalizeWatcherPattern(workspaceFolder.uri.fsPath, includePattern));
                            }
                        }
                    }
                    // Still ignore watch request if there are actually no configured
                    // exclude rules, because in that case our default recursive watcher
                    // should be able to take care of all events.
                    if (!includes || includes.length === 0) {
                        return disposable;
                    }
                }
            }
        }
        proxy.$watch(extension.identifier.value, this.session, globPattern.baseUri, { recursive, excludes, includes, filter }, Boolean(correlate));
        return Disposable.from({ dispose: () => proxy.$unwatch(this.session) });
    }
    dispose() {
        this._disposable.dispose();
    }
    get onDidCreate() {
        return this._onDidCreate.event;
    }
    get onDidChange() {
        return this._onDidChange.event;
    }
    get onDidDelete() {
        return this._onDidDelete.event;
    }
}
class LazyRevivedFileSystemEvents {
    constructor(_events) {
        this._events = _events;
        this.session = this._events.session;
        this._created = new Lazy(() => this._events.created.map(URI.revive));
        this._changed = new Lazy(() => this._events.changed.map(URI.revive));
        this._deleted = new Lazy(() => this._events.deleted.map(URI.revive));
    }
    get created() { return this._created.value; }
    get changed() { return this._changed.value; }
    get deleted() { return this._deleted.value; }
}
export class ExtHostFileSystemEventService {
    constructor(_mainContext, _logService, _extHostDocumentsAndEditors) {
        this._mainContext = _mainContext;
        this._logService = _logService;
        this._extHostDocumentsAndEditors = _extHostDocumentsAndEditors;
        this._onFileSystemEvent = new Emitter();
        this._onDidRenameFile = new Emitter();
        this._onDidCreateFile = new Emitter();
        this._onDidDeleteFile = new Emitter();
        this._onWillRenameFile = new AsyncEmitter();
        this._onWillCreateFile = new AsyncEmitter();
        this._onWillDeleteFile = new AsyncEmitter();
        this.onDidRenameFile = this._onDidRenameFile.event;
        this.onDidCreateFile = this._onDidCreateFile.event;
        this.onDidDeleteFile = this._onDidDeleteFile.event;
        //
    }
    //--- file events
    createFileSystemWatcher(workspace, configProvider, extension, globPattern, options) {
        return new FileSystemWatcher(this._mainContext, configProvider, workspace, extension, this._onFileSystemEvent.event, typeConverter.GlobPattern.from(globPattern), options);
    }
    $onFileEvent(events) {
        this._onFileSystemEvent.fire(new LazyRevivedFileSystemEvents(events));
    }
    //--- file operations
    $onDidRunFileOperation(operation, files) {
        switch (operation) {
            case 2 /* FileOperation.MOVE */:
                this._onDidRenameFile.fire(Object.freeze({ files: files.map(f => ({ oldUri: URI.revive(f.source), newUri: URI.revive(f.target) })) }));
                break;
            case 1 /* FileOperation.DELETE */:
                this._onDidDeleteFile.fire(Object.freeze({ files: files.map(f => URI.revive(f.target)) }));
                break;
            case 0 /* FileOperation.CREATE */:
            case 3 /* FileOperation.COPY */:
                this._onDidCreateFile.fire(Object.freeze({ files: files.map(f => URI.revive(f.target)) }));
                break;
            default:
            //ignore, dont send
        }
    }
    getOnWillRenameFileEvent(extension) {
        return this._createWillExecuteEvent(extension, this._onWillRenameFile);
    }
    getOnWillCreateFileEvent(extension) {
        return this._createWillExecuteEvent(extension, this._onWillCreateFile);
    }
    getOnWillDeleteFileEvent(extension) {
        return this._createWillExecuteEvent(extension, this._onWillDeleteFile);
    }
    _createWillExecuteEvent(extension, emitter) {
        return (listener, thisArg, disposables) => {
            const wrappedListener = function wrapped(e) { listener.call(thisArg, e); };
            wrappedListener.extension = extension;
            return emitter.event(wrappedListener, undefined, disposables);
        };
    }
    async $onWillRunFileOperation(operation, files, timeout, token) {
        switch (operation) {
            case 2 /* FileOperation.MOVE */:
                return await this._fireWillEvent(this._onWillRenameFile, { files: files.map(f => ({ oldUri: URI.revive(f.source), newUri: URI.revive(f.target) })) }, timeout, token);
            case 1 /* FileOperation.DELETE */:
                return await this._fireWillEvent(this._onWillDeleteFile, { files: files.map(f => URI.revive(f.target)) }, timeout, token);
            case 0 /* FileOperation.CREATE */:
            case 3 /* FileOperation.COPY */:
                return await this._fireWillEvent(this._onWillCreateFile, { files: files.map(f => URI.revive(f.target)) }, timeout, token);
        }
        return undefined;
    }
    async _fireWillEvent(emitter, data, timeout, token) {
        const extensionNames = new Set();
        const edits = [];
        await emitter.fireAsync(data, token, async (thenable, listener) => {
            // ignore all results except for WorkspaceEdits. Those are stored in an array.
            const now = Date.now();
            const result = await Promise.resolve(thenable);
            if (result instanceof WorkspaceEdit) {
                edits.push([listener.extension, result]);
                extensionNames.add(listener.extension.displayName ?? listener.extension.identifier.value);
            }
            if (Date.now() - now > timeout) {
                this._logService.warn('SLOW file-participant', listener.extension.identifier);
            }
        });
        if (token.isCancellationRequested) {
            return undefined;
        }
        if (edits.length === 0) {
            return undefined;
        }
        // concat all WorkspaceEdits collected via waitUntil-call and send them over to the renderer
        const dto = { edits: [] };
        for (const [, edit] of edits) {
            const { edits } = typeConverter.WorkspaceEdit.from(edit, {
                getTextDocumentVersion: uri => this._extHostDocumentsAndEditors.getDocument(uri)?.version,
                getNotebookDocumentVersion: () => undefined,
            });
            dto.edits = dto.edits.concat(edits);
        }
        return { edit: dto, extensionNames: Array.from(extensionNames) };
    }
}
