import { equals } from '../../../base/common/objects.js';
export function merge(local, remote, lastSync, ignored) {
    const localResult = { added: [], removed: [], updated: [] };
    let remoteResult = { added: [], removed: [], updated: [] };
    if (!remote) {
        const added = local.filter(({ id }) => !ignored.includes(id));
        if (added.length) {
            remoteResult.added = added;
        }
        else {
            remoteResult = null;
        }
        return {
            local: localResult,
            remote: remoteResult
        };
    }
    const localToRemote = compare(local, remote, ignored);
    if (localToRemote.added.length > 0 || localToRemote.removed.length > 0 || localToRemote.updated.length > 0) {
        const baseToLocal = compare(lastSync, local, ignored);
        const baseToRemote = compare(lastSync, remote, ignored);
        for (const id of baseToRemote.removed) {
            const e = local.find(profile => profile.id === id);
            if (e) {
                localResult.removed.push(e);
            }
        }
        for (const id of baseToRemote.added) {
            const remoteProfile = remote.find(profile => profile.id === id);
            if (baseToLocal.added.includes(id)) {
                if (localToRemote.updated.includes(id)) {
                    localResult.updated.push(remoteProfile);
                }
            }
            else {
                localResult.added.push(remoteProfile);
            }
        }
        for (const id of baseToRemote.updated) {
            localResult.updated.push(remote.find(profile => profile.id === id));
        }
        for (const id of baseToLocal.added) {
            if (!baseToRemote.added.includes(id)) {
                remoteResult.added.push(local.find(profile => profile.id === id));
            }
        }
        for (const id of baseToLocal.updated) {
            if (baseToRemote.removed.includes(id)) {
                continue;
            }
            if (!baseToRemote.updated.includes(id)) {
                remoteResult.updated.push(local.find(profile => profile.id === id));
            }
        }
        for (const id of baseToLocal.removed) {
            const removedProfile = remote.find(profile => profile.id === id);
            if (removedProfile) {
                remoteResult.removed.push(removedProfile);
            }
        }
    }
    if (remoteResult.added.length === 0 && remoteResult.removed.length === 0 && remoteResult.updated.length === 0) {
        remoteResult = null;
    }
    return { local: localResult, remote: remoteResult };
}
function compare(from, to, ignoredProfiles) {
    from = from ? from.filter(({ id }) => !ignoredProfiles.includes(id)) : [];
    to = to.filter(({ id }) => !ignoredProfiles.includes(id));
    const fromKeys = from.map(({ id }) => id);
    const toKeys = to.map(({ id }) => id);
    const added = toKeys.filter(key => !fromKeys.includes(key));
    const removed = fromKeys.filter(key => !toKeys.includes(key));
    const updated = [];
    for (const { id, name, shortName, icon, useDefaultFlags } of from) {
        if (removed.includes(id)) {
            continue;
        }
        const toProfile = to.find(p => p.id === id);
        if (!toProfile
            || toProfile.name !== name
            || toProfile.shortName !== shortName
            || toProfile.icon !== icon
            || !equals(toProfile.useDefaultFlags, useDefaultFlags)) {
            updated.push(id);
        }
    }
    return { added, removed, updated };
}
