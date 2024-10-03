import { equals } from '../../../base/common/arrays.js';
import { parse } from '../../../base/common/json.js';
import * as objects from '../../../base/common/objects.js';
import { ContextKeyExpr } from '../../contextkey/common/contextkey.js';
import * as contentUtil from './content.js';
function parseKeybindings(content) {
    return parse(content) || [];
}
export async function merge(localContent, remoteContent, baseContent, formattingOptions, userDataSyncUtilService) {
    const local = parseKeybindings(localContent);
    const remote = parseKeybindings(remoteContent);
    const base = baseContent ? parseKeybindings(baseContent) : null;
    const userbindings = [...local, ...remote, ...(base || [])].map(keybinding => keybinding.key);
    const normalizedKeys = await userDataSyncUtilService.resolveUserBindings(userbindings);
    const keybindingsMergeResult = computeMergeResultByKeybinding(local, remote, base, normalizedKeys);
    if (!keybindingsMergeResult.hasLocalForwarded && !keybindingsMergeResult.hasRemoteForwarded) {
        return { mergeContent: localContent, hasChanges: false, hasConflicts: false };
    }
    if (!keybindingsMergeResult.hasLocalForwarded && keybindingsMergeResult.hasRemoteForwarded) {
        return { mergeContent: remoteContent, hasChanges: true, hasConflicts: false };
    }
    if (keybindingsMergeResult.hasLocalForwarded && !keybindingsMergeResult.hasRemoteForwarded) {
        return { mergeContent: localContent, hasChanges: true, hasConflicts: false };
    }
    const localByCommand = byCommand(local);
    const remoteByCommand = byCommand(remote);
    const baseByCommand = base ? byCommand(base) : null;
    const localToRemoteByCommand = compareByCommand(localByCommand, remoteByCommand, normalizedKeys);
    const baseToLocalByCommand = baseByCommand ? compareByCommand(baseByCommand, localByCommand, normalizedKeys) : { added: [...localByCommand.keys()].reduce((r, k) => { r.add(k); return r; }, new Set()), removed: new Set(), updated: new Set() };
    const baseToRemoteByCommand = baseByCommand ? compareByCommand(baseByCommand, remoteByCommand, normalizedKeys) : { added: [...remoteByCommand.keys()].reduce((r, k) => { r.add(k); return r; }, new Set()), removed: new Set(), updated: new Set() };
    const commandsMergeResult = computeMergeResult(localToRemoteByCommand, baseToLocalByCommand, baseToRemoteByCommand);
    let mergeContent = localContent;
    for (const command of commandsMergeResult.removed.values()) {
        if (commandsMergeResult.conflicts.has(command)) {
            continue;
        }
        mergeContent = removeKeybindings(mergeContent, command, formattingOptions);
    }
    for (const command of commandsMergeResult.added.values()) {
        if (commandsMergeResult.conflicts.has(command)) {
            continue;
        }
        const keybindings = remoteByCommand.get(command);
        if (keybindings.some(keybinding => keybinding.command !== `-${command}` && keybindingsMergeResult.conflicts.has(normalizedKeys[keybinding.key]))) {
            commandsMergeResult.conflicts.add(command);
            continue;
        }
        mergeContent = addKeybindings(mergeContent, keybindings, formattingOptions);
    }
    for (const command of commandsMergeResult.updated.values()) {
        if (commandsMergeResult.conflicts.has(command)) {
            continue;
        }
        const keybindings = remoteByCommand.get(command);
        if (keybindings.some(keybinding => keybinding.command !== `-${command}` && keybindingsMergeResult.conflicts.has(normalizedKeys[keybinding.key]))) {
            commandsMergeResult.conflicts.add(command);
            continue;
        }
        mergeContent = updateKeybindings(mergeContent, command, keybindings, formattingOptions);
    }
    return { mergeContent, hasChanges: true, hasConflicts: commandsMergeResult.conflicts.size > 0 };
}
function computeMergeResult(localToRemote, baseToLocal, baseToRemote) {
    const added = new Set();
    const removed = new Set();
    const updated = new Set();
    const conflicts = new Set();
    for (const key of baseToLocal.removed.values()) {
        if (baseToRemote.updated.has(key)) {
            conflicts.add(key);
        }
    }
    for (const key of baseToRemote.removed.values()) {
        if (conflicts.has(key)) {
            continue;
        }
        if (baseToLocal.updated.has(key)) {
            conflicts.add(key);
        }
        else {
            removed.add(key);
        }
    }
    for (const key of baseToLocal.added.values()) {
        if (conflicts.has(key)) {
            continue;
        }
        if (baseToRemote.added.has(key)) {
            if (localToRemote.updated.has(key)) {
                conflicts.add(key);
            }
        }
    }
    for (const key of baseToRemote.added.values()) {
        if (conflicts.has(key)) {
            continue;
        }
        if (baseToLocal.added.has(key)) {
            if (localToRemote.updated.has(key)) {
                conflicts.add(key);
            }
        }
        else {
            added.add(key);
        }
    }
    for (const key of baseToLocal.updated.values()) {
        if (conflicts.has(key)) {
            continue;
        }
        if (baseToRemote.updated.has(key)) {
            if (localToRemote.updated.has(key)) {
                conflicts.add(key);
            }
        }
    }
    for (const key of baseToRemote.updated.values()) {
        if (conflicts.has(key)) {
            continue;
        }
        if (baseToLocal.updated.has(key)) {
            if (localToRemote.updated.has(key)) {
                conflicts.add(key);
            }
        }
        else {
            updated.add(key);
        }
    }
    return { added, removed, updated, conflicts };
}
function computeMergeResultByKeybinding(local, remote, base, normalizedKeys) {
    const empty = new Set();
    const localByKeybinding = byKeybinding(local, normalizedKeys);
    const remoteByKeybinding = byKeybinding(remote, normalizedKeys);
    const baseByKeybinding = base ? byKeybinding(base, normalizedKeys) : null;
    const localToRemoteByKeybinding = compareByKeybinding(localByKeybinding, remoteByKeybinding);
    if (localToRemoteByKeybinding.added.size === 0 && localToRemoteByKeybinding.removed.size === 0 && localToRemoteByKeybinding.updated.size === 0) {
        return { hasLocalForwarded: false, hasRemoteForwarded: false, added: empty, removed: empty, updated: empty, conflicts: empty };
    }
    const baseToLocalByKeybinding = baseByKeybinding ? compareByKeybinding(baseByKeybinding, localByKeybinding) : { added: [...localByKeybinding.keys()].reduce((r, k) => { r.add(k); return r; }, new Set()), removed: new Set(), updated: new Set() };
    if (baseToLocalByKeybinding.added.size === 0 && baseToLocalByKeybinding.removed.size === 0 && baseToLocalByKeybinding.updated.size === 0) {
        return { hasLocalForwarded: false, hasRemoteForwarded: true, added: empty, removed: empty, updated: empty, conflicts: empty };
    }
    const baseToRemoteByKeybinding = baseByKeybinding ? compareByKeybinding(baseByKeybinding, remoteByKeybinding) : { added: [...remoteByKeybinding.keys()].reduce((r, k) => { r.add(k); return r; }, new Set()), removed: new Set(), updated: new Set() };
    if (baseToRemoteByKeybinding.added.size === 0 && baseToRemoteByKeybinding.removed.size === 0 && baseToRemoteByKeybinding.updated.size === 0) {
        return { hasLocalForwarded: true, hasRemoteForwarded: false, added: empty, removed: empty, updated: empty, conflicts: empty };
    }
    const { added, removed, updated, conflicts } = computeMergeResult(localToRemoteByKeybinding, baseToLocalByKeybinding, baseToRemoteByKeybinding);
    return { hasLocalForwarded: true, hasRemoteForwarded: true, added, removed, updated, conflicts };
}
function byKeybinding(keybindings, keys) {
    const map = new Map();
    for (const keybinding of keybindings) {
        const key = keys[keybinding.key];
        let value = map.get(key);
        if (!value) {
            value = [];
            map.set(key, value);
        }
        value.push(keybinding);
    }
    return map;
}
function byCommand(keybindings) {
    const map = new Map();
    for (const keybinding of keybindings) {
        const command = keybinding.command[0] === '-' ? keybinding.command.substring(1) : keybinding.command;
        let value = map.get(command);
        if (!value) {
            value = [];
            map.set(command, value);
        }
        value.push(keybinding);
    }
    return map;
}
function compareByKeybinding(from, to) {
    const fromKeys = [...from.keys()];
    const toKeys = [...to.keys()];
    const added = toKeys.filter(key => !fromKeys.includes(key)).reduce((r, key) => { r.add(key); return r; }, new Set());
    const removed = fromKeys.filter(key => !toKeys.includes(key)).reduce((r, key) => { r.add(key); return r; }, new Set());
    const updated = new Set();
    for (const key of fromKeys) {
        if (removed.has(key)) {
            continue;
        }
        const value1 = from.get(key).map(keybinding => ({ ...keybinding, ...{ key } }));
        const value2 = to.get(key).map(keybinding => ({ ...keybinding, ...{ key } }));
        if (!equals(value1, value2, (a, b) => isSameKeybinding(a, b))) {
            updated.add(key);
        }
    }
    return { added, removed, updated };
}
function compareByCommand(from, to, normalizedKeys) {
    const fromKeys = [...from.keys()];
    const toKeys = [...to.keys()];
    const added = toKeys.filter(key => !fromKeys.includes(key)).reduce((r, key) => { r.add(key); return r; }, new Set());
    const removed = fromKeys.filter(key => !toKeys.includes(key)).reduce((r, key) => { r.add(key); return r; }, new Set());
    const updated = new Set();
    for (const key of fromKeys) {
        if (removed.has(key)) {
            continue;
        }
        const value1 = from.get(key).map(keybinding => ({ ...keybinding, ...{ key: normalizedKeys[keybinding.key] } }));
        const value2 = to.get(key).map(keybinding => ({ ...keybinding, ...{ key: normalizedKeys[keybinding.key] } }));
        if (!areSameKeybindingsWithSameCommand(value1, value2)) {
            updated.add(key);
        }
    }
    return { added, removed, updated };
}
function areSameKeybindingsWithSameCommand(value1, value2) {
    if (!equals(value1.filter(({ command }) => command[0] !== '-'), value2.filter(({ command }) => command[0] !== '-'), (a, b) => isSameKeybinding(a, b))) {
        return false;
    }
    if (!equals(value1.filter(({ command }) => command[0] === '-'), value2.filter(({ command }) => command[0] === '-'), (a, b) => isSameKeybinding(a, b))) {
        return false;
    }
    return true;
}
function isSameKeybinding(a, b) {
    if (a.command !== b.command) {
        return false;
    }
    if (a.key !== b.key) {
        return false;
    }
    const whenA = ContextKeyExpr.deserialize(a.when);
    const whenB = ContextKeyExpr.deserialize(b.when);
    if ((whenA && !whenB) || (!whenA && whenB)) {
        return false;
    }
    if (whenA && whenB && !whenA.equals(whenB)) {
        return false;
    }
    if (!objects.equals(a.args, b.args)) {
        return false;
    }
    return true;
}
function addKeybindings(content, keybindings, formattingOptions) {
    for (const keybinding of keybindings) {
        content = contentUtil.edit(content, [-1], keybinding, formattingOptions);
    }
    return content;
}
function removeKeybindings(content, command, formattingOptions) {
    const keybindings = parseKeybindings(content);
    for (let index = keybindings.length - 1; index >= 0; index--) {
        if (keybindings[index].command === command || keybindings[index].command === `-${command}`) {
            content = contentUtil.edit(content, [index], undefined, formattingOptions);
        }
    }
    return content;
}
function updateKeybindings(content, command, keybindings, formattingOptions) {
    const allKeybindings = parseKeybindings(content);
    const location = allKeybindings.findIndex(keybinding => keybinding.command === command || keybinding.command === `-${command}`);
    for (let index = allKeybindings.length - 1; index >= 0; index--) {
        if (allKeybindings[index].command === command || allKeybindings[index].command === `-${command}`) {
            content = contentUtil.edit(content, [index], undefined, formattingOptions);
        }
    }
    for (let index = keybindings.length - 1; index >= 0; index--) {
        content = contentUtil.edit(content, [location], keybindings[index], formattingOptions);
    }
    return content;
}
