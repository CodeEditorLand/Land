/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { ExtensionIdentifier, ExtensionIdentifierMap, ExtensionIdentifierSet } from '../../../../platform/extensions/common/extensions.js';
import { Emitter } from '../../../../base/common/event.js';
import * as path from '../../../../base/common/path.js';
import { Disposable, toDisposable } from '../../../../base/common/lifecycle.js';
import { promiseWithResolvers } from '../../../../base/common/async.js';
export class DeltaExtensionsResult {
    constructor(versionId, removedDueToLooping) {
        this.versionId = versionId;
        this.removedDueToLooping = removedDueToLooping;
    }
}
export class ExtensionDescriptionRegistry {
    static isHostExtension(extensionId, myRegistry, globalRegistry) {
        if (myRegistry.getExtensionDescription(extensionId)) {
            // I have this extension
            return false;
        }
        const extensionDescription = globalRegistry.getExtensionDescription(extensionId);
        if (!extensionDescription) {
            // unknown extension
            return false;
        }
        if ((extensionDescription.main || extensionDescription.browser) && extensionDescription.api === 'none') {
            return true;
        }
        return false;
    }
    constructor(_activationEventsReader, extensionDescriptions) {
        this._activationEventsReader = _activationEventsReader;
        this._onDidChange = new Emitter();
        this.onDidChange = this._onDidChange.event;
        this._versionId = 0;
        this._extensionDescriptions = extensionDescriptions;
        this._initialize();
    }
    _initialize() {
        // Ensure extensions are stored in the order: builtin, user, under development
        this._extensionDescriptions.sort(extensionCmp);
        this._extensionsMap = new ExtensionIdentifierMap();
        this._extensionsArr = [];
        this._activationMap = new Map();
        for (const extensionDescription of this._extensionDescriptions) {
            if (this._extensionsMap.has(extensionDescription.identifier)) {
                // No overwriting allowed!
                console.error('Extension `' + extensionDescription.identifier.value + '` is already registered');
                continue;
            }
            this._extensionsMap.set(extensionDescription.identifier, extensionDescription);
            this._extensionsArr.push(extensionDescription);
            const activationEvents = this._activationEventsReader.readActivationEvents(extensionDescription);
            for (const activationEvent of activationEvents) {
                if (!this._activationMap.has(activationEvent)) {
                    this._activationMap.set(activationEvent, []);
                }
                this._activationMap.get(activationEvent).push(extensionDescription);
            }
        }
    }
    set(extensionDescriptions) {
        this._extensionDescriptions = extensionDescriptions;
        this._initialize();
        this._versionId++;
        this._onDidChange.fire(undefined);
        return {
            versionId: this._versionId
        };
    }
    deltaExtensions(toAdd, toRemove) {
        // It is possible that an extension is removed, only to be added again at a different version
        // so we will first handle removals
        this._extensionDescriptions = removeExtensions(this._extensionDescriptions, toRemove);
        // Then, handle the extensions to add
        this._extensionDescriptions = this._extensionDescriptions.concat(toAdd);
        // Immediately remove looping extensions!
        const looping = ExtensionDescriptionRegistry._findLoopingExtensions(this._extensionDescriptions);
        this._extensionDescriptions = removeExtensions(this._extensionDescriptions, looping.map(ext => ext.identifier));
        this._initialize();
        this._versionId++;
        this._onDidChange.fire(undefined);
        return new DeltaExtensionsResult(this._versionId, looping);
    }
    static _findLoopingExtensions(extensionDescriptions) {
        const G = new class {
            constructor() {
                this._arcs = new Map();
                this._nodesSet = new Set();
                this._nodesArr = [];
            }
            addNode(id) {
                if (!this._nodesSet.has(id)) {
                    this._nodesSet.add(id);
                    this._nodesArr.push(id);
                }
            }
            addArc(from, to) {
                this.addNode(from);
                this.addNode(to);
                if (this._arcs.has(from)) {
                    this._arcs.get(from).push(to);
                }
                else {
                    this._arcs.set(from, [to]);
                }
            }
            getArcs(id) {
                if (this._arcs.has(id)) {
                    return this._arcs.get(id);
                }
                return [];
            }
            hasOnlyGoodArcs(id, good) {
                const dependencies = G.getArcs(id);
                for (let i = 0; i < dependencies.length; i++) {
                    if (!good.has(dependencies[i])) {
                        return false;
                    }
                }
                return true;
            }
            getNodes() {
                return this._nodesArr;
            }
        };
        const descs = new ExtensionIdentifierMap();
        for (const extensionDescription of extensionDescriptions) {
            descs.set(extensionDescription.identifier, extensionDescription);
            if (extensionDescription.extensionDependencies) {
                for (const depId of extensionDescription.extensionDependencies) {
                    G.addArc(ExtensionIdentifier.toKey(extensionDescription.identifier), ExtensionIdentifier.toKey(depId));
                }
            }
        }
        // initialize with all extensions with no dependencies.
        const good = new Set();
        G.getNodes().filter(id => G.getArcs(id).length === 0).forEach(id => good.add(id));
        // all other extensions will be processed below.
        const nodes = G.getNodes().filter(id => !good.has(id));
        let madeProgress;
        do {
            madeProgress = false;
            // find one extension which has only good deps
            for (let i = 0; i < nodes.length; i++) {
                const id = nodes[i];
                if (G.hasOnlyGoodArcs(id, good)) {
                    nodes.splice(i, 1);
                    i--;
                    good.add(id);
                    madeProgress = true;
                }
            }
        } while (madeProgress);
        // The remaining nodes are bad and have loops
        return nodes.map(id => descs.get(id));
    }
    containsActivationEvent(activationEvent) {
        return this._activationMap.has(activationEvent);
    }
    containsExtension(extensionId) {
        return this._extensionsMap.has(extensionId);
    }
    getExtensionDescriptionsForActivationEvent(activationEvent) {
        const extensions = this._activationMap.get(activationEvent);
        return extensions ? extensions.slice(0) : [];
    }
    getAllExtensionDescriptions() {
        return this._extensionsArr.slice(0);
    }
    getSnapshot() {
        return new ExtensionDescriptionRegistrySnapshot(this._versionId, this.getAllExtensionDescriptions());
    }
    getExtensionDescription(extensionId) {
        const extension = this._extensionsMap.get(extensionId);
        return extension ? extension : undefined;
    }
    getExtensionDescriptionByUUID(uuid) {
        for (const extensionDescription of this._extensionsArr) {
            if (extensionDescription.uuid === uuid) {
                return extensionDescription;
            }
        }
        return undefined;
    }
    getExtensionDescriptionByIdOrUUID(extensionId, uuid) {
        return (this.getExtensionDescription(extensionId)
            ?? (uuid ? this.getExtensionDescriptionByUUID(uuid) : undefined));
    }
}
export class ExtensionDescriptionRegistrySnapshot {
    constructor(versionId, extensions) {
        this.versionId = versionId;
        this.extensions = extensions;
    }
}
export class LockableExtensionDescriptionRegistry {
    constructor(activationEventsReader) {
        this._lock = new Lock();
        this._actual = new ExtensionDescriptionRegistry(activationEventsReader, []);
    }
    async acquireLock(customerName) {
        const lock = await this._lock.acquire(customerName);
        return new ExtensionDescriptionRegistryLock(this, lock);
    }
    deltaExtensions(acquiredLock, toAdd, toRemove) {
        if (!acquiredLock.isAcquiredFor(this)) {
            throw new Error('Lock is not held');
        }
        return this._actual.deltaExtensions(toAdd, toRemove);
    }
    containsActivationEvent(activationEvent) {
        return this._actual.containsActivationEvent(activationEvent);
    }
    containsExtension(extensionId) {
        return this._actual.containsExtension(extensionId);
    }
    getExtensionDescriptionsForActivationEvent(activationEvent) {
        return this._actual.getExtensionDescriptionsForActivationEvent(activationEvent);
    }
    getAllExtensionDescriptions() {
        return this._actual.getAllExtensionDescriptions();
    }
    getSnapshot() {
        return this._actual.getSnapshot();
    }
    getExtensionDescription(extensionId) {
        return this._actual.getExtensionDescription(extensionId);
    }
    getExtensionDescriptionByUUID(uuid) {
        return this._actual.getExtensionDescriptionByUUID(uuid);
    }
    getExtensionDescriptionByIdOrUUID(extensionId, uuid) {
        return this._actual.getExtensionDescriptionByIdOrUUID(extensionId, uuid);
    }
}
export class ExtensionDescriptionRegistryLock extends Disposable {
    constructor(_registry, lock) {
        super();
        this._registry = _registry;
        this._isDisposed = false;
        this._register(lock);
    }
    isAcquiredFor(registry) {
        return !this._isDisposed && this._registry === registry;
    }
}
class LockCustomer {
    constructor(name) {
        this.name = name;
        const withResolvers = promiseWithResolvers();
        this.promise = withResolvers.promise;
        this._resolve = withResolvers.resolve;
    }
    resolve(value) {
        this._resolve(value);
    }
}
class Lock {
    constructor() {
        this._pendingCustomers = [];
        this._isLocked = false;
    }
    async acquire(customerName) {
        const customer = new LockCustomer(customerName);
        this._pendingCustomers.push(customer);
        this._advance();
        return customer.promise;
    }
    _advance() {
        if (this._isLocked) {
            // cannot advance yet
            return;
        }
        if (this._pendingCustomers.length === 0) {
            // no more waiting customers
            return;
        }
        const customer = this._pendingCustomers.shift();
        this._isLocked = true;
        let customerHoldsLock = true;
        const logLongRunningCustomerTimeout = setTimeout(() => {
            if (customerHoldsLock) {
                console.warn(`The customer named ${customer.name} has been holding on to the lock for 30s. This might be a problem.`);
            }
        }, 30 * 1000 /* 30 seconds */);
        const releaseLock = () => {
            if (!customerHoldsLock) {
                return;
            }
            clearTimeout(logLongRunningCustomerTimeout);
            customerHoldsLock = false;
            this._isLocked = false;
            this._advance();
        };
        customer.resolve(toDisposable(releaseLock));
    }
}
/**
 * Ensure that:
 * - first are builtin extensions
 * - second are user extensions
 * - third are extensions under development
 *
 * In each bucket, extensions must be sorted alphabetically by their folder name.
 */
function extensionCmp(a, b) {
    const aSortBucket = (a.isBuiltin ? 0 /* SortBucket.Builtin */ : a.isUnderDevelopment ? 2 /* SortBucket.Dev */ : 1 /* SortBucket.User */);
    const bSortBucket = (b.isBuiltin ? 0 /* SortBucket.Builtin */ : b.isUnderDevelopment ? 2 /* SortBucket.Dev */ : 1 /* SortBucket.User */);
    if (aSortBucket !== bSortBucket) {
        return aSortBucket - bSortBucket;
    }
    const aLastSegment = path.posix.basename(a.extensionLocation.path);
    const bLastSegment = path.posix.basename(b.extensionLocation.path);
    if (aLastSegment < bLastSegment) {
        return -1;
    }
    if (aLastSegment > bLastSegment) {
        return 1;
    }
    return 0;
}
function removeExtensions(arr, toRemove) {
    const toRemoveSet = new ExtensionIdentifierSet(toRemove);
    return arr.filter(extension => !toRemoveSet.has(extension.identifier));
}
