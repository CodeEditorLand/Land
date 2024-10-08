/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as objects from '../../../base/common/objects.js';
import { SYNC_SERVICE_URL_TYPE } from './userDataSync.js';
export function merge(localStorage, remoteStorage, baseStorage, storageKeys, logService) {
    if (!remoteStorage) {
        return { remote: { added: Object.keys(localStorage), removed: [], updated: [], all: Object.keys(localStorage).length > 0 ? localStorage : null }, local: { added: {}, removed: [], updated: {} } };
    }
    const localToRemote = compare(localStorage, remoteStorage);
    if (localToRemote.added.size === 0 && localToRemote.removed.size === 0 && localToRemote.updated.size === 0) {
        // No changes found between local and remote.
        return { remote: { added: [], removed: [], updated: [], all: null }, local: { added: {}, removed: [], updated: {} } };
    }
    const baseToRemote = baseStorage ? compare(baseStorage, remoteStorage) : { added: Object.keys(remoteStorage).reduce((r, k) => { r.add(k); return r; }, new Set()), removed: new Set(), updated: new Set() };
    const baseToLocal = baseStorage ? compare(baseStorage, localStorage) : { added: Object.keys(localStorage).reduce((r, k) => { r.add(k); return r; }, new Set()), removed: new Set(), updated: new Set() };
    const local = { added: {}, removed: [], updated: {} };
    const remote = objects.deepClone(remoteStorage);
    const isFirstTimeSync = !baseStorage;
    // Added in local
    for (const key of baseToLocal.added.values()) {
        // If syncing for first time remote value gets precedence always,
        // except for sync service type key - local value takes precedence for this key
        if (key !== SYNC_SERVICE_URL_TYPE && isFirstTimeSync && baseToRemote.added.has(key)) {
            continue;
        }
        remote[key] = localStorage[key];
    }
    // Updated in local
    for (const key of baseToLocal.updated.values()) {
        remote[key] = localStorage[key];
    }
    // Removed in local
    for (const key of baseToLocal.removed.values()) {
        // Do not remove from remote if key is not registered.
        if (storageKeys.unregistered.includes(key)) {
            continue;
        }
        delete remote[key];
    }
    // Added in remote
    for (const key of baseToRemote.added.values()) {
        const remoteValue = remoteStorage[key];
        if (storageKeys.machine.includes(key)) {
            logService.info(`GlobalState: Skipped adding ${key} in local storage because it is declared as machine scoped.`);
            continue;
        }
        // Skip if the value is also added in local from the time it is last synced
        if (baseStorage && baseToLocal.added.has(key)) {
            continue;
        }
        const localValue = localStorage[key];
        if (localValue && localValue.value === remoteValue.value) {
            continue;
        }
        // Local sync service type value takes precedence if syncing for first time
        if (key === SYNC_SERVICE_URL_TYPE && isFirstTimeSync && baseToLocal.added.has(key)) {
            continue;
        }
        if (localValue) {
            local.updated[key] = remoteValue;
        }
        else {
            local.added[key] = remoteValue;
        }
    }
    // Updated in Remote
    for (const key of baseToRemote.updated.values()) {
        const remoteValue = remoteStorage[key];
        if (storageKeys.machine.includes(key)) {
            logService.info(`GlobalState: Skipped updating ${key} in local storage because it is declared as machine scoped.`);
            continue;
        }
        // Skip if the value is also updated or removed in local
        if (baseToLocal.updated.has(key) || baseToLocal.removed.has(key)) {
            continue;
        }
        const localValue = localStorage[key];
        if (localValue && localValue.value === remoteValue.value) {
            continue;
        }
        local.updated[key] = remoteValue;
    }
    // Removed in remote
    for (const key of baseToRemote.removed.values()) {
        if (storageKeys.machine.includes(key)) {
            logService.trace(`GlobalState: Skipped removing ${key} in local storage because it is declared as machine scoped.`);
            continue;
        }
        // Skip if the value is also updated or removed in local
        if (baseToLocal.updated.has(key) || baseToLocal.removed.has(key)) {
            continue;
        }
        local.removed.push(key);
    }
    const result = compare(remoteStorage, remote);
    return { local, remote: { added: [...result.added], updated: [...result.updated], removed: [...result.removed], all: result.added.size === 0 && result.removed.size === 0 && result.updated.size === 0 ? null : remote } };
}
function compare(from, to) {
    const fromKeys = Object.keys(from);
    const toKeys = Object.keys(to);
    const added = toKeys.filter(key => !fromKeys.includes(key)).reduce((r, key) => { r.add(key); return r; }, new Set());
    const removed = fromKeys.filter(key => !toKeys.includes(key)).reduce((r, key) => { r.add(key); return r; }, new Set());
    const updated = new Set();
    for (const key of fromKeys) {
        if (removed.has(key)) {
            continue;
        }
        const value1 = from[key];
        const value2 = to[key];
        if (!objects.equals(value1, value2)) {
            updated.add(key);
        }
    }
    return { added, removed, updated };
}
