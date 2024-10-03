import { Promises, RunOnceScheduler, runWhenGlobalIdle } from '../../../base/common/async.js';
import { Emitter, Event, PauseableEmitter } from '../../../base/common/event.js';
import { Disposable, dispose, MutableDisposable } from '../../../base/common/lifecycle.js';
import { mark } from '../../../base/common/performance.js';
import { isUndefinedOrNull } from '../../../base/common/types.js';
import { InMemoryStorageDatabase, Storage, StorageHint } from '../../../base/parts/storage/common/storage.js';
import { createDecorator } from '../../instantiation/common/instantiation.js';
import { isUserDataProfile } from '../../userDataProfile/common/userDataProfile.js';
export const IS_NEW_KEY = '__$__isNewStorageMarker';
export const TARGET_KEY = '__$__targetStorageMarker';
export const IStorageService = createDecorator('storageService');
export var WillSaveStateReason;
(function (WillSaveStateReason) {
    WillSaveStateReason[WillSaveStateReason["NONE"] = 0] = "NONE";
    WillSaveStateReason[WillSaveStateReason["SHUTDOWN"] = 1] = "SHUTDOWN";
})(WillSaveStateReason || (WillSaveStateReason = {}));
export function loadKeyTargets(storage) {
    const keysRaw = storage.get(TARGET_KEY);
    if (keysRaw) {
        try {
            return JSON.parse(keysRaw);
        }
        catch (error) {
        }
    }
    return Object.create(null);
}
export class AbstractStorageService extends Disposable {
    static { this.DEFAULT_FLUSH_INTERVAL = 60 * 1000; }
    constructor(options = { flushInterval: AbstractStorageService.DEFAULT_FLUSH_INTERVAL }) {
        super();
        this.options = options;
        this._onDidChangeValue = this._register(new PauseableEmitter());
        this._onDidChangeTarget = this._register(new PauseableEmitter());
        this.onDidChangeTarget = this._onDidChangeTarget.event;
        this._onWillSaveState = this._register(new Emitter());
        this.onWillSaveState = this._onWillSaveState.event;
        this.flushWhenIdleScheduler = this._register(new RunOnceScheduler(() => this.doFlushWhenIdle(), this.options.flushInterval));
        this.runFlushWhenIdle = this._register(new MutableDisposable());
        this._workspaceKeyTargets = undefined;
        this._profileKeyTargets = undefined;
        this._applicationKeyTargets = undefined;
    }
    onDidChangeValue(scope, key, disposable) {
        return Event.filter(this._onDidChangeValue.event, e => e.scope === scope && (key === undefined || e.key === key), disposable);
    }
    doFlushWhenIdle() {
        this.runFlushWhenIdle.value = runWhenGlobalIdle(() => {
            if (this.shouldFlushWhenIdle()) {
                this.flush();
            }
            this.flushWhenIdleScheduler.schedule();
        });
    }
    shouldFlushWhenIdle() {
        return true;
    }
    stopFlushWhenIdle() {
        dispose([this.runFlushWhenIdle, this.flushWhenIdleScheduler]);
    }
    initialize() {
        if (!this.initializationPromise) {
            this.initializationPromise = (async () => {
                mark('code/willInitStorage');
                try {
                    await this.doInitialize();
                }
                finally {
                    mark('code/didInitStorage');
                }
                this.flushWhenIdleScheduler.schedule();
            })();
        }
        return this.initializationPromise;
    }
    emitDidChangeValue(scope, event) {
        const { key, external } = event;
        if (key === TARGET_KEY) {
            switch (scope) {
                case -1:
                    this._applicationKeyTargets = undefined;
                    break;
                case 0:
                    this._profileKeyTargets = undefined;
                    break;
                case 1:
                    this._workspaceKeyTargets = undefined;
                    break;
            }
            this._onDidChangeTarget.fire({ scope });
        }
        else {
            this._onDidChangeValue.fire({ scope, key, target: this.getKeyTargets(scope)[key], external });
        }
    }
    emitWillSaveState(reason) {
        this._onWillSaveState.fire({ reason });
    }
    get(key, scope, fallbackValue) {
        return this.getStorage(scope)?.get(key, fallbackValue);
    }
    getBoolean(key, scope, fallbackValue) {
        return this.getStorage(scope)?.getBoolean(key, fallbackValue);
    }
    getNumber(key, scope, fallbackValue) {
        return this.getStorage(scope)?.getNumber(key, fallbackValue);
    }
    getObject(key, scope, fallbackValue) {
        return this.getStorage(scope)?.getObject(key, fallbackValue);
    }
    storeAll(entries, external) {
        this.withPausedEmitters(() => {
            for (const entry of entries) {
                this.store(entry.key, entry.value, entry.scope, entry.target, external);
            }
        });
    }
    store(key, value, scope, target, external = false) {
        if (isUndefinedOrNull(value)) {
            this.remove(key, scope, external);
            return;
        }
        this.withPausedEmitters(() => {
            this.updateKeyTarget(key, scope, target);
            this.getStorage(scope)?.set(key, value, external);
        });
    }
    remove(key, scope, external = false) {
        this.withPausedEmitters(() => {
            this.updateKeyTarget(key, scope, undefined);
            this.getStorage(scope)?.delete(key, external);
        });
    }
    withPausedEmitters(fn) {
        this._onDidChangeValue.pause();
        this._onDidChangeTarget.pause();
        try {
            fn();
        }
        finally {
            this._onDidChangeValue.resume();
            this._onDidChangeTarget.resume();
        }
    }
    keys(scope, target) {
        const keys = [];
        const keyTargets = this.getKeyTargets(scope);
        for (const key of Object.keys(keyTargets)) {
            const keyTarget = keyTargets[key];
            if (keyTarget === target) {
                keys.push(key);
            }
        }
        return keys;
    }
    updateKeyTarget(key, scope, target, external = false) {
        const keyTargets = this.getKeyTargets(scope);
        if (typeof target === 'number') {
            if (keyTargets[key] !== target) {
                keyTargets[key] = target;
                this.getStorage(scope)?.set(TARGET_KEY, JSON.stringify(keyTargets), external);
            }
        }
        else {
            if (typeof keyTargets[key] === 'number') {
                delete keyTargets[key];
                this.getStorage(scope)?.set(TARGET_KEY, JSON.stringify(keyTargets), external);
            }
        }
    }
    get workspaceKeyTargets() {
        if (!this._workspaceKeyTargets) {
            this._workspaceKeyTargets = this.loadKeyTargets(1);
        }
        return this._workspaceKeyTargets;
    }
    get profileKeyTargets() {
        if (!this._profileKeyTargets) {
            this._profileKeyTargets = this.loadKeyTargets(0);
        }
        return this._profileKeyTargets;
    }
    get applicationKeyTargets() {
        if (!this._applicationKeyTargets) {
            this._applicationKeyTargets = this.loadKeyTargets(-1);
        }
        return this._applicationKeyTargets;
    }
    getKeyTargets(scope) {
        switch (scope) {
            case -1:
                return this.applicationKeyTargets;
            case 0:
                return this.profileKeyTargets;
            default:
                return this.workspaceKeyTargets;
        }
    }
    loadKeyTargets(scope) {
        const storage = this.getStorage(scope);
        return storage ? loadKeyTargets(storage) : Object.create(null);
    }
    isNew(scope) {
        return this.getBoolean(IS_NEW_KEY, scope) === true;
    }
    async flush(reason = WillSaveStateReason.NONE) {
        this._onWillSaveState.fire({ reason });
        const applicationStorage = this.getStorage(-1);
        const profileStorage = this.getStorage(0);
        const workspaceStorage = this.getStorage(1);
        switch (reason) {
            case WillSaveStateReason.NONE:
                await Promises.settled([
                    applicationStorage?.whenFlushed() ?? Promise.resolve(),
                    profileStorage?.whenFlushed() ?? Promise.resolve(),
                    workspaceStorage?.whenFlushed() ?? Promise.resolve()
                ]);
                break;
            case WillSaveStateReason.SHUTDOWN:
                await Promises.settled([
                    applicationStorage?.flush(0) ?? Promise.resolve(),
                    profileStorage?.flush(0) ?? Promise.resolve(),
                    workspaceStorage?.flush(0) ?? Promise.resolve()
                ]);
                break;
        }
    }
    async log() {
        const applicationItems = this.getStorage(-1)?.items ?? new Map();
        const profileItems = this.getStorage(0)?.items ?? new Map();
        const workspaceItems = this.getStorage(1)?.items ?? new Map();
        return logStorage(applicationItems, profileItems, workspaceItems, this.getLogDetails(-1) ?? '', this.getLogDetails(0) ?? '', this.getLogDetails(1) ?? '');
    }
    async optimize(scope) {
        await this.flush();
        return this.getStorage(scope)?.optimize();
    }
    async switch(to, preserveData) {
        this.emitWillSaveState(WillSaveStateReason.NONE);
        if (isUserDataProfile(to)) {
            return this.switchToProfile(to, preserveData);
        }
        return this.switchToWorkspace(to, preserveData);
    }
    canSwitchProfile(from, to) {
        if (from.id === to.id) {
            return false;
        }
        if (isProfileUsingDefaultStorage(to) && isProfileUsingDefaultStorage(from)) {
            return false;
        }
        return true;
    }
    switchData(oldStorage, newStorage, scope) {
        this.withPausedEmitters(() => {
            const handledkeys = new Set();
            for (const [key, oldValue] of oldStorage) {
                handledkeys.add(key);
                const newValue = newStorage.get(key);
                if (newValue !== oldValue) {
                    this.emitDidChangeValue(scope, { key, external: true });
                }
            }
            for (const [key] of newStorage.items) {
                if (!handledkeys.has(key)) {
                    this.emitDidChangeValue(scope, { key, external: true });
                }
            }
        });
    }
}
export function isProfileUsingDefaultStorage(profile) {
    return profile.isDefault || !!profile.useDefaultFlags?.globalState;
}
export class InMemoryStorageService extends AbstractStorageService {
    constructor() {
        super();
        this.applicationStorage = this._register(new Storage(new InMemoryStorageDatabase(), { hint: StorageHint.STORAGE_IN_MEMORY }));
        this.profileStorage = this._register(new Storage(new InMemoryStorageDatabase(), { hint: StorageHint.STORAGE_IN_MEMORY }));
        this.workspaceStorage = this._register(new Storage(new InMemoryStorageDatabase(), { hint: StorageHint.STORAGE_IN_MEMORY }));
        this._register(this.workspaceStorage.onDidChangeStorage(e => this.emitDidChangeValue(1, e)));
        this._register(this.profileStorage.onDidChangeStorage(e => this.emitDidChangeValue(0, e)));
        this._register(this.applicationStorage.onDidChangeStorage(e => this.emitDidChangeValue(-1, e)));
    }
    getStorage(scope) {
        switch (scope) {
            case -1:
                return this.applicationStorage;
            case 0:
                return this.profileStorage;
            default:
                return this.workspaceStorage;
        }
    }
    getLogDetails(scope) {
        switch (scope) {
            case -1:
                return 'inMemory (application)';
            case 0:
                return 'inMemory (profile)';
            default:
                return 'inMemory (workspace)';
        }
    }
    async doInitialize() { }
    async switchToProfile() {
    }
    async switchToWorkspace() {
    }
    shouldFlushWhenIdle() {
        return false;
    }
    hasScope(scope) {
        return false;
    }
}
export async function logStorage(application, profile, workspace, applicationPath, profilePath, workspacePath) {
    const safeParse = (value) => {
        try {
            return JSON.parse(value);
        }
        catch (error) {
            return value;
        }
    };
    const applicationItems = new Map();
    const applicationItemsParsed = new Map();
    application.forEach((value, key) => {
        applicationItems.set(key, value);
        applicationItemsParsed.set(key, safeParse(value));
    });
    const profileItems = new Map();
    const profileItemsParsed = new Map();
    profile.forEach((value, key) => {
        profileItems.set(key, value);
        profileItemsParsed.set(key, safeParse(value));
    });
    const workspaceItems = new Map();
    const workspaceItemsParsed = new Map();
    workspace.forEach((value, key) => {
        workspaceItems.set(key, value);
        workspaceItemsParsed.set(key, safeParse(value));
    });
    if (applicationPath !== profilePath) {
        console.group(`Storage: Application (path: ${applicationPath})`);
    }
    else {
        console.group(`Storage: Application & Profile (path: ${applicationPath}, default profile)`);
    }
    const applicationValues = [];
    applicationItems.forEach((value, key) => {
        applicationValues.push({ key, value });
    });
    console.table(applicationValues);
    console.groupEnd();
    console.log(applicationItemsParsed);
    if (applicationPath !== profilePath) {
        console.group(`Storage: Profile (path: ${profilePath}, profile specific)`);
        const profileValues = [];
        profileItems.forEach((value, key) => {
            profileValues.push({ key, value });
        });
        console.table(profileValues);
        console.groupEnd();
        console.log(profileItemsParsed);
    }
    console.group(`Storage: Workspace (path: ${workspacePath})`);
    const workspaceValues = [];
    workspaceItems.forEach((value, key) => {
        workspaceValues.push({ key, value });
    });
    console.table(workspaceValues);
    console.groupEnd();
    console.log(workspaceItemsParsed);
}
