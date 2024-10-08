/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
export class TerminalCapabilityStore extends Disposable {
    constructor() {
        super(...arguments);
        this._map = new Map();
        this._onDidRemoveCapabilityType = this._register(new Emitter());
        this.onDidRemoveCapabilityType = this._onDidRemoveCapabilityType.event;
        this._onDidAddCapabilityType = this._register(new Emitter());
        this.onDidAddCapabilityType = this._onDidAddCapabilityType.event;
        this._onDidRemoveCapability = this._register(new Emitter());
        this.onDidRemoveCapability = this._onDidRemoveCapability.event;
        this._onDidAddCapability = this._register(new Emitter());
        this.onDidAddCapability = this._onDidAddCapability.event;
    }
    get items() {
        return this._map.keys();
    }
    add(capability, impl) {
        this._map.set(capability, impl);
        this._onDidAddCapabilityType.fire(capability);
        this._onDidAddCapability.fire({ id: capability, capability: impl });
    }
    get(capability) {
        // HACK: This isn't totally safe since the Map key and value are not connected
        return this._map.get(capability);
    }
    remove(capability) {
        const impl = this._map.get(capability);
        if (!impl) {
            return;
        }
        this._map.delete(capability);
        this._onDidRemoveCapabilityType.fire(capability);
        this._onDidAddCapability.fire({ id: capability, capability: impl });
    }
    has(capability) {
        return this._map.has(capability);
    }
}
export class TerminalCapabilityStoreMultiplexer extends Disposable {
    constructor() {
        super(...arguments);
        this._stores = [];
        this._onDidRemoveCapabilityType = this._register(new Emitter());
        this.onDidRemoveCapabilityType = this._onDidRemoveCapabilityType.event;
        this._onDidAddCapabilityType = this._register(new Emitter());
        this.onDidAddCapabilityType = this._onDidAddCapabilityType.event;
        this._onDidRemoveCapability = this._register(new Emitter());
        this.onDidRemoveCapability = this._onDidRemoveCapability.event;
        this._onDidAddCapability = this._register(new Emitter());
        this.onDidAddCapability = this._onDidAddCapability.event;
    }
    get items() {
        return this._items();
    }
    *_items() {
        for (const store of this._stores) {
            for (const c of store.items) {
                yield c;
            }
        }
    }
    has(capability) {
        for (const store of this._stores) {
            for (const c of store.items) {
                if (c === capability) {
                    return true;
                }
            }
        }
        return false;
    }
    get(capability) {
        for (const store of this._stores) {
            const c = store.get(capability);
            if (c) {
                return c;
            }
        }
        return undefined;
    }
    add(store) {
        this._stores.push(store);
        for (const capability of store.items) {
            this._onDidAddCapabilityType.fire(capability);
            this._onDidAddCapability.fire({ id: capability, capability: store.get(capability) });
        }
        this._register(store.onDidAddCapabilityType(e => this._onDidAddCapabilityType.fire(e)));
        this._register(store.onDidAddCapability(e => this._onDidAddCapability.fire(e)));
        this._register(store.onDidRemoveCapabilityType(e => this._onDidRemoveCapabilityType.fire(e)));
        this._register(store.onDidRemoveCapability(e => this._onDidRemoveCapability.fire(e)));
    }
}
