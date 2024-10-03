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
        if (list instanceof AsyncDataTree && list.getFocus().every(item => item instanceof ExplorerItem)) {
            const context = explorerService.getContext(true, true);
            if (context.length) {
                return context.map(c => c.resource);
            }
        }
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
            const mainIndex = selection.findIndex(s => s.toString() === mainUriStr);
            if (mainIndex !== -1) {
                const mainResource = selection[mainIndex];
                selection.splice(mainIndex, 1);
                selection.unshift(mainResource);
                return selection;
            }
        }
    }
    const activeGroup = editorGroupService.activeGroup;
    const selection = activeGroup.selectedEditors;
    if (selection.length > 1 && URI.isUri(commandArg)) {
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
        if (list instanceof List) {
            const selection = coalesce(list.getSelectedElements().filter(s => s instanceof OpenEditor));
            const focusedElements = list.getFocusedElements();
            const focus = focusedElements.length ? focusedElements[0] : undefined;
            let mainEditor = undefined;
            if (focus instanceof OpenEditor) {
                mainEditor = focus;
            }
            if (selection.some(s => s === mainEditor)) {
                return selection;
            }
            return mainEditor ? [mainEditor] : undefined;
        }
    }
    return undefined;
}
