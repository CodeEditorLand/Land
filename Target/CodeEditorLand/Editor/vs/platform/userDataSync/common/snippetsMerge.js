/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export function merge(local, remote, base) {
    const localAdded = {};
    const localUpdated = {};
    const localRemoved = new Set();
    if (!remote) {
        return {
            local: { added: localAdded, updated: localUpdated, removed: [...localRemoved.values()] },
            remote: { added: local, updated: {}, removed: [] },
            conflicts: []
        };
    }
    const localToRemote = compare(local, remote);
    if (localToRemote.added.size === 0 && localToRemote.removed.size === 0 && localToRemote.updated.size === 0) {
        // No changes found between local and remote.
        return {
            local: { added: localAdded, updated: localUpdated, removed: [...localRemoved.values()] },
            remote: { added: {}, updated: {}, removed: [] },
            conflicts: []
        };
    }
    const baseToLocal = compare(base, local);
    const baseToRemote = compare(base, remote);
    const remoteAdded = {};
    const remoteUpdated = {};
    const remoteRemoved = new Set();
    const conflicts = new Set();
    // Removed snippets in Local
    for (const key of baseToLocal.removed.values()) {
        // Conflict - Got updated in remote.
        if (baseToRemote.updated.has(key)) {
            // Add to local
            localAdded[key] = remote[key];
        }
        // Remove it in remote
        else {
            remoteRemoved.add(key);
        }
    }
    // Removed snippets in Remote
    for (const key of baseToRemote.removed.values()) {
        if (conflicts.has(key)) {
            continue;
        }
        // Conflict - Got updated in local
        if (baseToLocal.updated.has(key)) {
            conflicts.add(key);
        }
        // Also remove in Local
        else {
            localRemoved.add(key);
        }
    }
    // Updated snippets in Local
    for (const key of baseToLocal.updated.values()) {
        if (conflicts.has(key)) {
            continue;
        }
        // Got updated in remote
        if (baseToRemote.updated.has(key)) {
            // Has different value
            if (localToRemote.updated.has(key)) {
                conflicts.add(key);
            }
        }
        else {
            remoteUpdated[key] = local[key];
        }
    }
    // Updated snippets in Remote
    for (const key of baseToRemote.updated.values()) {
        if (conflicts.has(key)) {
            continue;
        }
        // Got updated in local
        if (baseToLocal.updated.has(key)) {
            // Has different value
            if (localToRemote.updated.has(key)) {
                conflicts.add(key);
            }
        }
        else if (local[key] !== undefined) {
            localUpdated[key] = remote[key];
        }
    }
    // Added snippets in Local
    for (const key of baseToLocal.added.values()) {
        if (conflicts.has(key)) {
            continue;
        }
        // Got added in remote
        if (baseToRemote.added.has(key)) {
            // Has different value
            if (localToRemote.updated.has(key)) {
                conflicts.add(key);
            }
        }
        else {
            remoteAdded[key] = local[key];
        }
    }
    // Added snippets in remote
    for (const key of baseToRemote.added.values()) {
        if (conflicts.has(key)) {
            continue;
        }
        // Got added in local
        if (baseToLocal.added.has(key)) {
            // Has different value
            if (localToRemote.updated.has(key)) {
                conflicts.add(key);
            }
        }
        else {
            localAdded[key] = remote[key];
        }
    }
    return {
        local: { added: localAdded, removed: [...localRemoved.values()], updated: localUpdated },
        remote: { added: remoteAdded, removed: [...remoteRemoved.values()], updated: remoteUpdated },
        conflicts: [...conflicts.values()],
    };
}
function compare(from, to) {
    const fromKeys = from ? Object.keys(from) : [];
    const toKeys = to ? Object.keys(to) : [];
    const added = toKeys.filter(key => !fromKeys.includes(key)).reduce((r, key) => { r.add(key); return r; }, new Set());
    const removed = fromKeys.filter(key => !toKeys.includes(key)).reduce((r, key) => { r.add(key); return r; }, new Set());
    const updated = new Set();
    for (const key of fromKeys) {
        if (removed.has(key)) {
            continue;
        }
        const fromSnippet = from[key];
        const toSnippet = to[key];
        if (fromSnippet !== toSnippet) {
            updated.add(key);
        }
    }
    return { added, removed, updated };
}
export function areSame(a, b) {
    const { added, removed, updated } = compare(a, b);
    return added.size === 0 && removed.size === 0 && updated.size === 0;
}
