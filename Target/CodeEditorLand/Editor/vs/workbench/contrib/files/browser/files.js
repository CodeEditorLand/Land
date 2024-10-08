/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { URI } from '../../../../base/common/uri.js';
import { IListService } from '../../../../platform/list/browser/listService.js';
import { OpenEditor } from '../common/files.js';
import { EditorResourceAccessor, SideBySideEditor } from '../../../common/editor.js';
import { List } from '../../../../base/browser/ui/list/listWidget.js';
import { ExplorerItem } from '../common/explorerModel.js';
import { coalesce } from '../../../../base/common/arrays.js';
import { AsyncDataTree } from '../../../../base/browser/ui/tree/asyncDataTree.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { isActiveElement } from '../../../../base/browser/dom.js';
export const IExplorerService = createDecorator('explorerService');
function getFocus(listService) {
    const list = listService.lastFocusedList;
    const element = list?.getHTMLElement();
    if (element && isActiveElement(element)) {
        let focus;
        if (list instanceof List) {
            const focused = list.getFocusedElements();
            if (focused.length) {
                focus = focused[0];
            }
        }
        else if (list instanceof AsyncDataTree) {
            const focused = list.getFocus();
            if (focused.length) {
                focus = focused[0];
            }
        }
        return focus;
    }
    return undefined;
}
// Commands can get executed from a command palette, from a context menu or from some list using a keybinding
// To cover all these cases we need to properly compute the resource on which the command is being executed
export function getResourceForCommand(commandArg, editorService, listService) {
    if (URI.isUri(commandArg)) {
        return commandArg;
    }
    const focus = getFocus(listService);
    if (focus instanceof ExplorerItem) {
        return focus.resource;
    }
    else if (focus instanceof OpenEditor) {
        return focus.getResource();
    }
    return EditorResourceAccessor.getOriginalUri(editorService.activeEditor, { supportSideBySide: SideBySideEditor.PRIMARY });
}
export function getMultiSelectedResources(commandArg, listService, editorSerice, editorGroupService, explorerService) {
    const list = listService.lastFocusedList;
    const element = list?.getHTMLElement();
    if (element && isActiveElement(element)) {
        // Explorer
        if (list instanceof AsyncDataTree && list.getFocus().every(item => item instanceof ExplorerItem)) {
            // Explorer
            const context = explorerService.getContext(true, true);
            if (context.length) {
                return context.map(c => c.resource);
            }
        }
        // Open editors view
        if (list instanceof List) {
            const selection = coalesce(list.getSelectedElements().filter(s => s instanceof OpenEditor).map((oe) => oe.getResource()));
            const focusedElements = list.getFocusedElements();
            const focus = focusedElements.length ? focusedElements[0] : undefined;
            let mainUriStr = undefined;
            if (URI.isUri(commandArg)) {
                mainUriStr = commandArg.toString();
            }
            else if (focus instanceof OpenEditor) {
                const focusedResource = focus.getResource();
                mainUriStr = focusedResource ? focusedResource.toString() : undefined;
            }
            // We only respect the selection if it contains the main element.
            const mainIndex = selection.findIndex(s => s.toString() === mainUriStr);
            if (mainIndex !== -1) {
                // Move the main resource to the front of the selection.
                const mainResource = selection[mainIndex];
                selection.splice(mainIndex, 1);
                selection.unshift(mainResource);
                return selection;
            }
        }
    }
    // Check for tabs multiselect
    const activeGroup = editorGroupService.activeGroup;
    const selection = activeGroup.selectedEditors;
    if (selection.length > 1 && URI.isUri(commandArg)) {
        // If the resource is part of the tabs selection, return all selected tabs/resources.
        // It's possible that multiple tabs are selected but the action was applied to a resource that is not part of the selection.
        const mainEditorSelectionIndex = selection.findIndex(e => e.matches({ resource: commandArg }));
        if (mainEditorSelectionIndex !== -1) {
            const mainEditor = selection[mainEditorSelectionIndex];
            selection.splice(mainEditorSelectionIndex, 1);
            selection.unshift(mainEditor);
            return selection.map(editor => EditorResourceAccessor.getOriginalUri(editor)).filter(uri => !!uri);
        }
    }
    const result = getResourceForCommand(commandArg, editorSerice, listService);
    return !!result ? [result] : [];
}
export function getOpenEditorsViewMultiSelection(accessor) {
    const list = accessor.get(IListService).lastFocusedList;
    const element = list?.getHTMLElement();
    if (element && isActiveElement(element)) {
        // Open editors view
        if (list instanceof List) {
            const selection = coalesce(list.getSelectedElements().filter(s => s instanceof OpenEditor));
            const focusedElements = list.getFocusedElements();
            const focus = focusedElements.length ? focusedElements[0] : undefined;
            let mainEditor = undefined;
            if (focus instanceof OpenEditor) {
                mainEditor = focus;
            }
            // We only respect the selection if it contains the main element.
            if (selection.some(s => s === mainEditor)) {
                return selection;
            }
            return mainEditor ? [mainEditor] : undefined;
        }
    }
    return undefined;
}
