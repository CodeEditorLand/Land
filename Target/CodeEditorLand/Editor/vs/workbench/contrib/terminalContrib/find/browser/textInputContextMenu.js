import { getActiveWindow, isHTMLInputElement, isHTMLTextAreaElement } from '../../../../../base/browser/dom.js';
import { StandardMouseEvent } from '../../../../../base/browser/mouseEvent.js';
import { Action, Separator } from '../../../../../base/common/actions.js';
import { isNative } from '../../../../../base/common/platform.js';
import { localize } from '../../../../../nls.js';
export function openContextMenu(targetWindow, event, clipboardService, contextMenuService) {
    const standardEvent = new StandardMouseEvent(targetWindow, event);
    const actions = [];
    actions.push(new Action('undo', localize('undo', "Undo"), undefined, true, async () => getActiveWindow().document.execCommand('undo')), new Action('redo', localize('redo', "Redo"), undefined, true, async () => getActiveWindow().document.execCommand('redo')), new Separator(), new Action('editor.action.clipboardCutAction', localize('cut', "Cut"), undefined, true, async () => getActiveWindow().document.execCommand('cut')), new Action('editor.action.clipboardCopyAction', localize('copy', "Copy"), undefined, true, async () => getActiveWindow().document.execCommand('copy')), new Action('editor.action.clipboardPasteAction', localize('paste', "Paste"), undefined, true, async (element) => {
        if (isNative) {
            getActiveWindow().document.execCommand('paste');
        }
        else {
            const clipboardText = await clipboardService.readText();
            if (isHTMLTextAreaElement(element) ||
                isHTMLInputElement(element)) {
                const selectionStart = element.selectionStart || 0;
                const selectionEnd = element.selectionEnd || 0;
                element.value = `${element.value.substring(0, selectionStart)}${clipboardText}${element.value.substring(selectionEnd, element.value.length)}`;
                element.selectionStart = selectionStart + clipboardText.length;
                element.selectionEnd = element.selectionStart;
            }
        }
    }), new Separator(), new Action('editor.action.selectAll', localize('selectAll', "Select All"), undefined, true, async () => getActiveWindow().document.execCommand('selectAll')));
    contextMenuService.showContextMenu({
        getAnchor: () => standardEvent,
        getActions: () => actions,
        getActionsContext: () => event.target,
    });
}
