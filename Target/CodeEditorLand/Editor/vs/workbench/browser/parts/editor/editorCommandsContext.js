import { getActiveElement } from '../../../../base/browser/dom.js';
import { List } from '../../../../base/browser/ui/list/listWidget.js';
import { URI } from '../../../../base/common/uri.js';
import { isEditorCommandsContext, isEditorIdentifier } from '../../../common/editor.js';
import { isEditorGroup } from '../../../services/editor/common/editorGroupsService.js';
export function resolveCommandsContext(commandArgs, editorService, editorGroupsService, listService) {
    const commandContext = getCommandsContext(commandArgs, editorService, editorGroupsService, listService);
    const preserveFocus = commandContext.length ? commandContext[0].preserveFocus || false : false;
    const resolvedContext = { groupedEditors: [], preserveFocus };
    for (const editorContext of commandContext) {
        const groupAndEditor = getEditorAndGroupFromContext(editorContext, editorGroupsService);
        if (!groupAndEditor) {
            continue;
        }
        const { group, editor } = groupAndEditor;
        let groupContext = undefined;
        for (const targetGroupContext of resolvedContext.groupedEditors) {
            if (targetGroupContext.group.id === group.id) {
                groupContext = targetGroupContext;
                break;
            }
        }
        if (!groupContext) {
            groupContext = { group, editors: [] };
            resolvedContext.groupedEditors.push(groupContext);
        }
        if (editor) {
            groupContext.editors.push(editor);
        }
    }
    return resolvedContext;
}
function getCommandsContext(commandArgs, editorService, editorGroupsService, listService) {
    const list = listService.lastFocusedList;
    let isListAction = list instanceof List && list.getHTMLElement() === getActiveElement();
    let editorContext = getEditorContextFromCommandArgs(commandArgs, isListAction, editorService, editorGroupsService, listService);
    if (!editorContext) {
        const activeGroup = editorGroupsService.activeGroup;
        const activeEditor = activeGroup.activeEditor;
        editorContext = { groupId: activeGroup.id, editorIndex: activeEditor ? activeGroup.getIndexOfEditor(activeEditor) : undefined };
        isListAction = false;
    }
    const multiEditorContext = getMultiSelectContext(editorContext, isListAction, editorService, editorGroupsService, listService);
    return moveCurrentEditorContextToFront(editorContext, multiEditorContext);
}
function moveCurrentEditorContextToFront(editorContext, multiEditorContext) {
    if (multiEditorContext.length <= 1) {
        return multiEditorContext;
    }
    const editorContextIndex = multiEditorContext.findIndex(context => context.groupId === editorContext.groupId &&
        context.editorIndex === editorContext.editorIndex);
    if (editorContextIndex !== -1) {
        multiEditorContext.splice(editorContextIndex, 1);
        multiEditorContext.unshift(editorContext);
    }
    else if (editorContext.editorIndex === undefined) {
        multiEditorContext.unshift(editorContext);
    }
    else {
        throw new Error('Editor context not found in multi editor context');
    }
    return multiEditorContext;
}
function getEditorContextFromCommandArgs(commandArgs, isListAction, editorService, editorGroupsService, listService) {
    const filteredArgs = commandArgs.filter(arg => isEditorCommandsContext(arg) || URI.isUri(arg));
    for (const arg of filteredArgs) {
        if (isEditorCommandsContext(arg)) {
            return arg;
        }
    }
    for (const uri of filteredArgs) {
        const editorIdentifiers = editorService.findEditors(uri);
        if (editorIdentifiers.length) {
            const editorIdentifier = editorIdentifiers[0];
            const group = editorGroupsService.getGroup(editorIdentifier.groupId);
            return { groupId: editorIdentifier.groupId, editorIndex: group?.getIndexOfEditor(editorIdentifier.editor) };
        }
    }
    if (isListAction) {
        const list = listService.lastFocusedList;
        for (const focusedElement of list.getFocusedElements()) {
            if (isGroupOrEditor(focusedElement)) {
                return groupOrEditorToEditorContext(focusedElement, undefined, editorGroupsService);
            }
        }
    }
    return undefined;
}
function getMultiSelectContext(editorContext, isListAction, editorService, editorGroupsService, listService) {
    if (isListAction) {
        const list = listService.lastFocusedList;
        const selection = list.getSelectedElements().filter(isGroupOrEditor);
        if (selection.length > 1) {
            return selection.map(e => groupOrEditorToEditorContext(e, editorContext.preserveFocus, editorGroupsService));
        }
        if (selection.length === 0) {
            return getMultiSelectContext(editorContext, false, editorService, editorGroupsService, listService);
        }
    }
    else {
        const group = editorGroupsService.getGroup(editorContext.groupId);
        const editor = editorContext.editorIndex !== undefined ? group?.getEditorByIndex(editorContext.editorIndex) : group?.activeEditor;
        if (group && editor && group.isSelected(editor)) {
            return group.selectedEditors.map(editor => groupOrEditorToEditorContext({ editor, groupId: group.id }, editorContext.preserveFocus, editorGroupsService));
        }
    }
    return [editorContext];
}
function groupOrEditorToEditorContext(element, preserveFocus, editorGroupsService) {
    if (isEditorGroup(element)) {
        return { groupId: element.id, editorIndex: undefined, preserveFocus };
    }
    const group = editorGroupsService.getGroup(element.groupId);
    return { groupId: element.groupId, editorIndex: group ? group.getIndexOfEditor(element.editor) : -1, preserveFocus };
}
function isGroupOrEditor(element) {
    return isEditorGroup(element) || isEditorIdentifier(element);
}
function getEditorAndGroupFromContext(commandContext, editorGroupsService) {
    const group = editorGroupsService.getGroup(commandContext.groupId);
    if (!group) {
        return undefined;
    }
    if (commandContext.editorIndex === undefined) {
        return { group, editor: undefined };
    }
    const editor = group.getEditorByIndex(commandContext.editorIndex);
    return { group, editor };
}
