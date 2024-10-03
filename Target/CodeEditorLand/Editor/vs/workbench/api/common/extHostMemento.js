import { DeferredPromise, RunOnceScheduler } from '../../../base/common/async.js';
export class ExtensionMemento {
    constructor(id, global, storage) {
        this._deferredPromises = new Map();
        this._id = id;
        this._shared = global;
        this._storage = storage;
        this._init = this._storage.initializeExtensionStorage(this._shared, this._id, Object.create(null)).then(value => {
            this._value = value;
            return this;
        });
        this._storageListener = this._storage.onDidChangeStorage(e => {
            if (e.shared === this._shared && e.key === this._id) {
                this._value = e.value;
            }
        });
        this._scheduler = new RunOnceScheduler(() => {
            const records = this._deferredPromises;
            this._deferredPromises = new Map();
            (async () => {
                try {
                    await this._storage.setValue(this._shared, this._id, this._value);
                    for (const value of records.values()) {
                        value.complete();
                    }
                }
                catch (e) {
                    for (const value of records.values()) {
                        value.error(e);
                    }
                }
            })();
        }, 0);
    }
    keys() {
        return Object.entries(this._value ?? {}).filter(([, value]) => value !== undefined).map(([key]) => key);
    }
    get whenReady() {
        return this._init;
    }
    get(key, defaultValue) {
        let value = this._value[key];
        if (typeof value === 'undefined') {
            value = defaultValue;
        }
        return value;
    }
    update(key, value) {
        this._value[key] = value;
        const record = this._deferredPromises.get(key);
        if (record !== undefined) {
            return record.p;
        }
        const promise = new DeferredPromise();
        this._deferredPromises.set(key, promise);
        if (!this._scheduler.isScheduled()) {
            this._scheduler.schedule();
        }
        return promise.p;
    }
    dispose() {
        this._storageListener.dispose();
    }
}
export class ExtensionGlobalMemento extends ExtensionMemento {
    setKeysForSync(keys) {
        this._storage.registerExtensionStorageKeysToSync({ id: this._id, version: this._extension.version }, keys);
    }
    constructor(extensionDescription, storage) {
        super(extensionDescription.identifier.value, true, storage);
        this._extension = extensionDescription;
    }
}
