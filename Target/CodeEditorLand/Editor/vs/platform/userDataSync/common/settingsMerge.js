import { distinct } from '../../../base/common/arrays.js';
import { parse, visit } from '../../../base/common/json.js';
import { applyEdits, setProperty, withFormatting } from '../../../base/common/jsonEdit.js';
import { getEOL } from '../../../base/common/jsonFormatter.js';
import * as objects from '../../../base/common/objects.js';
import * as contentUtil from './content.js';
import { getDisallowedIgnoredSettings } from './userDataSync.js';
export function getIgnoredSettings(defaultIgnoredSettings, configurationService, settingsContent) {
    let value = [];
    if (settingsContent) {
        value = getIgnoredSettingsFromContent(settingsContent);
    }
    else {
        value = getIgnoredSettingsFromConfig(configurationService);
    }
    const added = [], removed = [...getDisallowedIgnoredSettings()];
    if (Array.isArray(value)) {
        for (const key of value) {
            if (key.startsWith('-')) {
                removed.push(key.substring(1));
            }
            else {
                added.push(key);
            }
        }
    }
    return distinct([...defaultIgnoredSettings, ...added,].filter(setting => !removed.includes(setting)));
}
function getIgnoredSettingsFromConfig(configurationService) {
    let userValue = configurationService.inspect('settingsSync.ignoredSettings').userValue;
    if (userValue !== undefined) {
        return userValue;
    }
    userValue = configurationService.inspect('sync.ignoredSettings').userValue;
    if (userValue !== undefined) {
        return userValue;
    }
    return configurationService.getValue('settingsSync.ignoredSettings') || [];
}
function getIgnoredSettingsFromContent(settingsContent) {
    const parsed = parse(settingsContent);
    return parsed ? parsed['settingsSync.ignoredSettings'] || parsed['sync.ignoredSettings'] || [] : [];
}
export function removeComments(content, formattingOptions) {
    const source = parse(content) || {};
    let result = '{}';
    for (const key of Object.keys(source)) {
        const edits = setProperty(result, [key], source[key], formattingOptions);
        result = applyEdits(result, edits);
    }
    return result;
}
export function updateIgnoredSettings(targetContent, sourceContent, ignoredSettings, formattingOptions) {
    if (ignoredSettings.length) {
        const sourceTree = parseSettings(sourceContent);
        const source = parse(sourceContent) || {};
        const target = parse(targetContent);
        if (!target) {
            return targetContent;
        }
        const settingsToAdd = [];
        for (const key of ignoredSettings) {
            const sourceValue = source[key];
            const targetValue = target[key];
            if (sourceValue === undefined) {
                targetContent = contentUtil.edit(targetContent, [key], undefined, formattingOptions);
            }
            else if (targetValue !== undefined) {
                targetContent = contentUtil.edit(targetContent, [key], sourceValue, formattingOptions);
            }
            else {
                settingsToAdd.push(findSettingNode(key, sourceTree));
            }
        }
        settingsToAdd.sort((a, b) => a.startOffset - b.startOffset);
        settingsToAdd.forEach(s => targetContent = addSetting(s.setting.key, sourceContent, targetContent, formattingOptions));
    }
    return targetContent;
}
export function merge(originalLocalContent, originalRemoteContent, baseContent, ignoredSettings, resolvedConflicts, formattingOptions) {
    const localContentWithoutIgnoredSettings = updateIgnoredSettings(originalLocalContent, originalRemoteContent, ignoredSettings, formattingOptions);
    const localForwarded = baseContent !== localContentWithoutIgnoredSettings;
    const remoteForwarded = baseContent !== originalRemoteContent;
    if (!localForwarded && !remoteForwarded) {
        return { conflictsSettings: [], localContent: null, remoteContent: null, hasConflicts: false };
    }
    if (localForwarded && !remoteForwarded) {
        return { conflictsSettings: [], localContent: null, remoteContent: localContentWithoutIgnoredSettings, hasConflicts: false };
    }
    if (remoteForwarded && !localForwarded) {
        return { conflictsSettings: [], localContent: updateIgnoredSettings(originalRemoteContent, originalLocalContent, ignoredSettings, formattingOptions), remoteContent: null, hasConflicts: false };
    }
    if (baseContent === null && isEmpty(originalLocalContent)) {
        const localContent = areSame(originalLocalContent, originalRemoteContent, ignoredSettings) ? null : updateIgnoredSettings(originalRemoteContent, originalLocalContent, ignoredSettings, formattingOptions);
        return { conflictsSettings: [], localContent, remoteContent: null, hasConflicts: false };
    }
    let localContent = originalLocalContent;
    let remoteContent = originalRemoteContent;
    const local = parse(originalLocalContent);
    const remote = parse(originalRemoteContent);
    const base = baseContent ? parse(baseContent) : null;
    const ignored = ignoredSettings.reduce((set, key) => { set.add(key); return set; }, new Set());
    const localToRemote = compare(local, remote, ignored);
    const baseToLocal = compare(base, local, ignored);
    const baseToRemote = compare(base, remote, ignored);
    const conflicts = new Map();
    const handledConflicts = new Set();
    const handleConflict = (conflictKey) => {
        handledConflicts.add(conflictKey);
        const resolvedConflict = resolvedConflicts.filter(({ key }) => key === conflictKey)[0];
        if (resolvedConflict) {
            localContent = contentUtil.edit(localContent, [conflictKey], resolvedConflict.value, formattingOptions);
            remoteContent = contentUtil.edit(remoteContent, [conflictKey], resolvedConflict.value, formattingOptions);
        }
        else {
            conflicts.set(conflictKey, { key: conflictKey, localValue: local[conflictKey], remoteValue: remote[conflictKey] });
        }
    };
    for (const key of baseToLocal.removed.values()) {
        if (baseToRemote.updated.has(key)) {
            handleConflict(key);
        }
        else {
            remoteContent = contentUtil.edit(remoteContent, [key], undefined, formattingOptions);
        }
    }
    for (const key of baseToRemote.removed.values()) {
        if (handledConflicts.has(key)) {
            continue;
        }
        if (baseToLocal.updated.has(key)) {
            handleConflict(key);
        }
        else {
            localContent = contentUtil.edit(localContent, [key], undefined, formattingOptions);
        }
    }
    for (const key of baseToLocal.updated.values()) {
        if (handledConflicts.has(key)) {
            continue;
        }
        if (baseToRemote.updated.has(key)) {
            if (localToRemote.updated.has(key)) {
                handleConflict(key);
            }
        }
        else {
            remoteContent = contentUtil.edit(remoteContent, [key], local[key], formattingOptions);
        }
    }
    for (const key of baseToRemote.updated.values()) {
        if (handledConflicts.has(key)) {
            continue;
        }
        if (baseToLocal.updated.has(key)) {
            if (localToRemote.updated.has(key)) {
                handleConflict(key);
            }
        }
        else {
            localContent = contentUtil.edit(localContent, [key], remote[key], formattingOptions);
        }
    }
    for (const key of baseToLocal.added.values()) {
        if (handledConflicts.has(key)) {
            continue;
        }
        if (baseToRemote.added.has(key)) {
            if (localToRemote.updated.has(key)) {
                handleConflict(key);
            }
        }
        else {
            remoteContent = addSetting(key, localContent, remoteContent, formattingOptions);
        }
    }
    for (const key of baseToRemote.added.values()) {
        if (handledConflicts.has(key)) {
            continue;
        }
        if (baseToLocal.added.has(key)) {
            if (localToRemote.updated.has(key)) {
                handleConflict(key);
            }
        }
        else {
            localContent = addSetting(key, remoteContent, localContent, formattingOptions);
        }
    }
    const hasConflicts = conflicts.size > 0 || !areSame(localContent, remoteContent, ignoredSettings);
    const hasLocalChanged = hasConflicts || !areSame(localContent, originalLocalContent, []);
    const hasRemoteChanged = hasConflicts || !areSame(remoteContent, originalRemoteContent, []);
    return { localContent: hasLocalChanged ? localContent : null, remoteContent: hasRemoteChanged ? remoteContent : null, conflictsSettings: [...conflicts.values()], hasConflicts };
}
function areSame(localContent, remoteContent, ignoredSettings) {
    if (localContent === remoteContent) {
        return true;
    }
    const local = parse(localContent);
    const remote = parse(remoteContent);
    const ignored = ignoredSettings.reduce((set, key) => { set.add(key); return set; }, new Set());
    const localTree = parseSettings(localContent).filter(node => !(node.setting && ignored.has(node.setting.key)));
    const remoteTree = parseSettings(remoteContent).filter(node => !(node.setting && ignored.has(node.setting.key)));
    if (localTree.length !== remoteTree.length) {
        return false;
    }
    for (let index = 0; index < localTree.length; index++) {
        const localNode = localTree[index];
        const remoteNode = remoteTree[index];
        if (localNode.setting && remoteNode.setting) {
            if (localNode.setting.key !== remoteNode.setting.key) {
                return false;
            }
            if (!objects.equals(local[localNode.setting.key], remote[localNode.setting.key])) {
                return false;
            }
        }
        else if (!localNode.setting && !remoteNode.setting) {
            if (localNode.value !== remoteNode.value) {
                return false;
            }
        }
        else {
            return false;
        }
    }
    return true;
}
export function isEmpty(content) {
    if (content) {
        const nodes = parseSettings(content);
        return nodes.length === 0;
    }
    return true;
}
function compare(from, to, ignored) {
    const fromKeys = from ? Object.keys(from).filter(key => !ignored.has(key)) : [];
    const toKeys = Object.keys(to).filter(key => !ignored.has(key));
    const added = toKeys.filter(key => !fromKeys.includes(key)).reduce((r, key) => { r.add(key); return r; }, new Set());
    const removed = fromKeys.filter(key => !toKeys.includes(key)).reduce((r, key) => { r.add(key); return r; }, new Set());
    const updated = new Set();
    if (from) {
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
    }
    return { added, removed, updated };
}
export function addSetting(key, sourceContent, targetContent, formattingOptions) {
    const source = parse(sourceContent);
    const sourceTree = parseSettings(sourceContent);
    const targetTree = parseSettings(targetContent);
    const insertLocation = getInsertLocation(key, sourceTree, targetTree);
    return insertAtLocation(targetContent, key, source[key], insertLocation, targetTree, formattingOptions);
}
function getInsertLocation(key, sourceTree, targetTree) {
    const sourceNodeIndex = sourceTree.findIndex(node => node.setting?.key === key);
    const sourcePreviousNode = sourceTree[sourceNodeIndex - 1];
    if (sourcePreviousNode) {
        if (sourcePreviousNode.setting) {
            const targetPreviousSetting = findSettingNode(sourcePreviousNode.setting.key, targetTree);
            if (targetPreviousSetting) {
                return { index: targetTree.indexOf(targetPreviousSetting), insertAfter: true };
            }
        }
        else {
            const sourcePreviousSettingNode = findPreviousSettingNode(sourceNodeIndex, sourceTree);
            if (sourcePreviousSettingNode) {
                const targetPreviousSetting = findSettingNode(sourcePreviousSettingNode.setting.key, targetTree);
                if (targetPreviousSetting) {
                    const targetNextSetting = findNextSettingNode(targetTree.indexOf(targetPreviousSetting), targetTree);
                    const sourceCommentNodes = findNodesBetween(sourceTree, sourcePreviousSettingNode, sourceTree[sourceNodeIndex]);
                    if (targetNextSetting) {
                        const targetCommentNodes = findNodesBetween(targetTree, targetPreviousSetting, targetNextSetting);
                        const targetCommentNode = findLastMatchingTargetCommentNode(sourceCommentNodes, targetCommentNodes);
                        if (targetCommentNode) {
                            return { index: targetTree.indexOf(targetCommentNode), insertAfter: true };
                        }
                        else {
                            return { index: targetTree.indexOf(targetNextSetting), insertAfter: false };
                        }
                    }
                    else {
                        const targetCommentNodes = findNodesBetween(targetTree, targetPreviousSetting, targetTree[targetTree.length - 1]);
                        const targetCommentNode = findLastMatchingTargetCommentNode(sourceCommentNodes, targetCommentNodes);
                        if (targetCommentNode) {
                            return { index: targetTree.indexOf(targetCommentNode), insertAfter: true };
                        }
                        else {
                            return { index: targetTree.length - 1, insertAfter: true };
                        }
                    }
                }
            }
        }
        const sourceNextNode = sourceTree[sourceNodeIndex + 1];
        if (sourceNextNode) {
            if (sourceNextNode.setting) {
                const targetNextSetting = findSettingNode(sourceNextNode.setting.key, targetTree);
                if (targetNextSetting) {
                    return { index: targetTree.indexOf(targetNextSetting), insertAfter: false };
                }
            }
            else {
                const sourceNextSettingNode = findNextSettingNode(sourceNodeIndex, sourceTree);
                if (sourceNextSettingNode) {
                    const targetNextSetting = findSettingNode(sourceNextSettingNode.setting.key, targetTree);
                    if (targetNextSetting) {
                        const targetPreviousSetting = findPreviousSettingNode(targetTree.indexOf(targetNextSetting), targetTree);
                        const sourceCommentNodes = findNodesBetween(sourceTree, sourceTree[sourceNodeIndex], sourceNextSettingNode);
                        if (targetPreviousSetting) {
                            const targetCommentNodes = findNodesBetween(targetTree, targetPreviousSetting, targetNextSetting);
                            const targetCommentNode = findLastMatchingTargetCommentNode(sourceCommentNodes.reverse(), targetCommentNodes.reverse());
                            if (targetCommentNode) {
                                return { index: targetTree.indexOf(targetCommentNode), insertAfter: false };
                            }
                            else {
                                return { index: targetTree.indexOf(targetPreviousSetting), insertAfter: true };
                            }
                        }
                        else {
                            const targetCommentNodes = findNodesBetween(targetTree, targetTree[0], targetNextSetting);
                            const targetCommentNode = findLastMatchingTargetCommentNode(sourceCommentNodes.reverse(), targetCommentNodes.reverse());
                            if (targetCommentNode) {
                                return { index: targetTree.indexOf(targetCommentNode), insertAfter: false };
                            }
                            else {
                                return { index: 0, insertAfter: false };
                            }
                        }
                    }
                }
            }
        }
    }
    return { index: targetTree.length - 1, insertAfter: true };
}
function insertAtLocation(content, key, value, location, tree, formattingOptions) {
    let edits;
    if (location.index === -1) {
        edits = setProperty(content, [key], value, formattingOptions);
    }
    else {
        edits = getEditToInsertAtLocation(content, key, value, location, tree, formattingOptions).map(edit => withFormatting(content, edit, formattingOptions)[0]);
    }
    return applyEdits(content, edits);
}
function getEditToInsertAtLocation(content, key, value, location, tree, formattingOptions) {
    const newProperty = `${JSON.stringify(key)}: ${JSON.stringify(value)}`;
    const eol = getEOL(formattingOptions, content);
    const node = tree[location.index];
    if (location.insertAfter) {
        const edits = [];
        if (node.setting) {
            edits.push({ offset: node.endOffset, length: 0, content: ',' + newProperty });
        }
        else {
            const nextSettingNode = findNextSettingNode(location.index, tree);
            const previousSettingNode = findPreviousSettingNode(location.index, tree);
            const previousSettingCommaOffset = previousSettingNode?.setting?.commaOffset;
            if (previousSettingNode && previousSettingCommaOffset === undefined) {
                edits.push({ offset: previousSettingNode.endOffset, length: 0, content: ',' });
            }
            const isPreviouisSettingIncludesComment = previousSettingCommaOffset !== undefined && previousSettingCommaOffset > node.endOffset;
            edits.push({
                offset: isPreviouisSettingIncludesComment ? previousSettingCommaOffset + 1 : node.endOffset,
                length: 0,
                content: nextSettingNode ? eol + newProperty + ',' : eol + newProperty
            });
        }
        return edits;
    }
    else {
        if (node.setting) {
            return [{ offset: node.startOffset, length: 0, content: newProperty + ',' }];
        }
        const content = (tree[location.index - 1] && !tree[location.index - 1].setting ? eol : '')
            + newProperty
            + (findNextSettingNode(location.index, tree) ? ',' : '')
            + eol;
        return [{ offset: node.startOffset, length: 0, content }];
    }
}
function findSettingNode(key, tree) {
    return tree.filter(node => node.setting?.key === key)[0];
}
function findPreviousSettingNode(index, tree) {
    for (let i = index - 1; i >= 0; i--) {
        if (tree[i].setting) {
            return tree[i];
        }
    }
    return undefined;
}
function findNextSettingNode(index, tree) {
    for (let i = index + 1; i < tree.length; i++) {
        if (tree[i].setting) {
            return tree[i];
        }
    }
    return undefined;
}
function findNodesBetween(nodes, from, till) {
    const fromIndex = nodes.indexOf(from);
    const tillIndex = nodes.indexOf(till);
    return nodes.filter((node, index) => fromIndex < index && index < tillIndex);
}
function findLastMatchingTargetCommentNode(sourceComments, targetComments) {
    if (sourceComments.length && targetComments.length) {
        let index = 0;
        for (; index < targetComments.length && index < sourceComments.length; index++) {
            if (sourceComments[index].value !== targetComments[index].value) {
                return targetComments[index - 1];
            }
        }
        return targetComments[index - 1];
    }
    return undefined;
}
function parseSettings(content) {
    const nodes = [];
    let hierarchyLevel = -1;
    let startOffset;
    let key;
    const visitor = {
        onObjectBegin: (offset) => {
            hierarchyLevel++;
        },
        onObjectProperty: (name, offset, length) => {
            if (hierarchyLevel === 0) {
                startOffset = offset;
                key = name;
            }
        },
        onObjectEnd: (offset, length) => {
            hierarchyLevel--;
            if (hierarchyLevel === 0) {
                nodes.push({
                    startOffset,
                    endOffset: offset + length,
                    value: content.substring(startOffset, offset + length),
                    setting: {
                        key,
                        commaOffset: undefined
                    }
                });
            }
        },
        onArrayBegin: (offset, length) => {
            hierarchyLevel++;
        },
        onArrayEnd: (offset, length) => {
            hierarchyLevel--;
            if (hierarchyLevel === 0) {
                nodes.push({
                    startOffset,
                    endOffset: offset + length,
                    value: content.substring(startOffset, offset + length),
                    setting: {
                        key,
                        commaOffset: undefined
                    }
                });
            }
        },
        onLiteralValue: (value, offset, length) => {
            if (hierarchyLevel === 0) {
                nodes.push({
                    startOffset,
                    endOffset: offset + length,
                    value: content.substring(startOffset, offset + length),
                    setting: {
                        key,
                        commaOffset: undefined
                    }
                });
            }
        },
        onSeparator: (sep, offset, length) => {
            if (hierarchyLevel === 0) {
                if (sep === ',') {
                    let index = nodes.length - 1;
                    for (; index >= 0; index--) {
                        if (nodes[index].setting) {
                            break;
                        }
                    }
                    const node = nodes[index];
                    if (node) {
                        nodes.splice(index, 1, {
                            startOffset: node.startOffset,
                            endOffset: node.endOffset,
                            value: node.value,
                            setting: {
                                key: node.setting.key,
                                commaOffset: offset
                            }
                        });
                    }
                }
            }
        },
        onComment: (offset, length) => {
            if (hierarchyLevel === 0) {
                nodes.push({
                    startOffset: offset,
                    endOffset: offset + length,
                    value: content.substring(offset, offset + length),
                });
            }
        }
    };
    visit(content, visitor);
    return nodes;
}
