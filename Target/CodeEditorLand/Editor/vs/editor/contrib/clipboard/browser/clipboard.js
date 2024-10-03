import * as browser from '../../../../base/browser/browser.js';
import { getActiveDocument } from '../../../../base/browser/dom.js';
import * as platform from '../../../../base/common/platform.js';
import * as nls from '../../../../nls.js';
import { MenuId, MenuRegistry } from '../../../../platform/actions/common/actions.js';
import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { CopyOptions, InMemoryClipboardMetadataManager } from '../../../browser/controller/editContext/clipboardUtils.js';
import { EditorAction, MultiCommand, registerEditorAction } from '../../../browser/editorExtensions.js';
import { ICodeEditorService } from '../../../browser/services/codeEditorService.js';
import { EditorContextKeys } from '../../../common/editorContextKeys.js';
import { CopyPasteController } from '../../dropOrPasteInto/browser/copyPasteController.js';
const CLIPBOARD_CONTEXT_MENU_GROUP = '9_cutcopypaste';
const supportsCut = (platform.isNative || document.queryCommandSupported('cut'));
const supportsCopy = (platform.isNative || document.queryCommandSupported('copy'));
const supportsPaste = (typeof navigator.clipboard === 'undefined' || browser.isFirefox) ? document.queryCommandSupported('paste') : true;
function registerCommand(command) {
    command.register();
    return command;
}
export const CutAction = supportsCut ? registerCommand(new MultiCommand({
    id: 'editor.action.clipboardCutAction',
    precondition: undefined,
    kbOpts: (platform.isNative ? {
        primary: 2048 | 54,
        win: { primary: 2048 | 54, secondary: [1024 | 20] },
        weight: 100
    } : undefined),
    menuOpts: [{
            menuId: MenuId.MenubarEditMenu,
            group: '2_ccp',
            title: nls.localize({ key: 'miCut', comment: ['&& denotes a mnemonic'] }, "Cu&&t"),
            order: 1
        }, {
            menuId: MenuId.EditorContext,
            group: CLIPBOARD_CONTEXT_MENU_GROUP,
            title: nls.localize('actions.clipboard.cutLabel', "Cut"),
            when: EditorContextKeys.writable,
            order: 1,
        }, {
            menuId: MenuId.CommandPalette,
            group: '',
            title: nls.localize('actions.clipboard.cutLabel', "Cut"),
            order: 1
        }, {
            menuId: MenuId.SimpleEditorContext,
            group: CLIPBOARD_CONTEXT_MENU_GROUP,
            title: nls.localize('actions.clipboard.cutLabel', "Cut"),
            when: EditorContextKeys.writable,
            order: 1,
        }]
})) : undefined;
export const CopyAction = supportsCopy ? registerCommand(new MultiCommand({
    id: 'editor.action.clipboardCopyAction',
    precondition: undefined,
    kbOpts: (platform.isNative ? {
        primary: 2048 | 33,
        win: { primary: 2048 | 33, secondary: [2048 | 19] },
        weight: 100
    } : undefined),
    menuOpts: [{
            menuId: MenuId.MenubarEditMenu,
            group: '2_ccp',
            title: nls.localize({ key: 'miCopy', comment: ['&& denotes a mnemonic'] }, "&&Copy"),
            order: 2
        }, {
            menuId: MenuId.EditorContext,
            group: CLIPBOARD_CONTEXT_MENU_GROUP,
            title: nls.localize('actions.clipboard.copyLabel', "Copy"),
            order: 2,
        }, {
            menuId: MenuId.CommandPalette,
            group: '',
            title: nls.localize('actions.clipboard.copyLabel', "Copy"),
            order: 1
        }, {
            menuId: MenuId.SimpleEditorContext,
            group: CLIPBOARD_CONTEXT_MENU_GROUP,
            title: nls.localize('actions.clipboard.copyLabel', "Copy"),
            order: 2,
        }]
})) : undefined;
MenuRegistry.appendMenuItem(MenuId.MenubarEditMenu, { submenu: MenuId.MenubarCopy, title: nls.localize2('copy as', "Copy As"), group: '2_ccp', order: 3 });
MenuRegistry.appendMenuItem(MenuId.EditorContext, { submenu: MenuId.EditorContextCopy, title: nls.localize2('copy as', "Copy As"), group: CLIPBOARD_CONTEXT_MENU_GROUP, order: 3 });
MenuRegistry.appendMenuItem(MenuId.EditorContext, { submenu: MenuId.EditorContextShare, title: nls.localize2('share', "Share"), group: '11_share', order: -1, when: ContextKeyExpr.and(ContextKeyExpr.notEquals('resourceScheme', 'output'), EditorContextKeys.editorTextFocus) });
MenuRegistry.appendMenuItem(MenuId.ExplorerContext, { submenu: MenuId.ExplorerContextShare, title: nls.localize2('share', "Share"), group: '11_share', order: -1 });
export const PasteAction = supportsPaste ? registerCommand(new MultiCommand({
    id: 'editor.action.clipboardPasteAction',
    precondition: undefined,
    kbOpts: (platform.isNative ? {
        primary: 2048 | 52,
        win: { primary: 2048 | 52, secondary: [1024 | 19] },
        linux: { primary: 2048 | 52, secondary: [1024 | 19] },
        weight: 100
    } : undefined),
    menuOpts: [{
            menuId: MenuId.MenubarEditMenu,
            group: '2_ccp',
            title: nls.localize({ key: 'miPaste', comment: ['&& denotes a mnemonic'] }, "&&Paste"),
            order: 4
        }, {
            menuId: MenuId.EditorContext,
            group: CLIPBOARD_CONTEXT_MENU_GROUP,
            title: nls.localize('actions.clipboard.pasteLabel', "Paste"),
            when: EditorContextKeys.writable,
            order: 4,
        }, {
            menuId: MenuId.CommandPalette,
            group: '',
            title: nls.localize('actions.clipboard.pasteLabel', "Paste"),
            order: 1
        }, {
            menuId: MenuId.SimpleEditorContext,
            group: CLIPBOARD_CONTEXT_MENU_GROUP,
            title: nls.localize('actions.clipboard.pasteLabel', "Paste"),
            when: EditorContextKeys.writable,
            order: 4,
        }]
})) : undefined;
class ExecCommandCopyWithSyntaxHighlightingAction extends EditorAction {
    constructor() {
        super({
            id: 'editor.action.clipboardCopyWithSyntaxHighlightingAction',
            label: nls.localize('actions.clipboard.copyWithSyntaxHighlightingLabel', "Copy With Syntax Highlighting"),
            alias: 'Copy With Syntax Highlighting',
            precondition: undefined,
            kbOpts: {
                kbExpr: EditorContextKeys.textInputFocus,
                primary: 0,
                weight: 100
            }
        });
    }
    run(accessor, editor) {
        if (!editor.hasModel()) {
            return;
        }
        const emptySelectionClipboard = editor.getOption(38);
        if (!emptySelectionClipboard && editor.getSelection().isEmpty()) {
            return;
        }
        CopyOptions.forceCopyWithSyntaxHighlighting = true;
        editor.focus();
        editor.getContainerDomNode().ownerDocument.execCommand('copy');
        CopyOptions.forceCopyWithSyntaxHighlighting = false;
    }
}
function registerExecCommandImpl(target, browserCommand) {
    if (!target) {
        return;
    }
    target.addImplementation(10000, 'code-editor', (accessor, args) => {
        const focusedEditor = accessor.get(ICodeEditorService).getFocusedCodeEditor();
        if (focusedEditor && focusedEditor.hasTextFocus()) {
            const emptySelectionClipboard = focusedEditor.getOption(38);
            const selection = focusedEditor.getSelection();
            if (selection && selection.isEmpty() && !emptySelectionClipboard) {
                return true;
            }
            if (focusedEditor.getOption(37) && browserCommand === 'cut') {
                focusedEditor.getContainerDomNode().ownerDocument.execCommand('copy');
                focusedEditor.trigger(undefined, "cut", undefined);
            }
            else {
                focusedEditor.getContainerDomNode().ownerDocument.execCommand(browserCommand);
            }
            return true;
        }
        return false;
    });
    target.addImplementation(0, 'generic-dom', (accessor, args) => {
        getActiveDocument().execCommand(browserCommand);
        return true;
    });
}
registerExecCommandImpl(CutAction, 'cut');
registerExecCommandImpl(CopyAction, 'copy');
if (PasteAction) {
    PasteAction.addImplementation(10000, 'code-editor', (accessor, args) => {
        const codeEditorService = accessor.get(ICodeEditorService);
        const clipboardService = accessor.get(IClipboardService);
        const focusedEditor = codeEditorService.getFocusedCodeEditor();
        if (focusedEditor && focusedEditor.hasTextFocus()) {
            const canDoDocumentExecCommand = !focusedEditor.getOption(37);
            const result = canDoDocumentExecCommand && focusedEditor.getContainerDomNode().ownerDocument.execCommand('paste');
            if (result) {
                return CopyPasteController.get(focusedEditor)?.finishedPaste() ?? Promise.resolve();
            }
            else if (platform.isWeb || !canDoDocumentExecCommand) {
                return (async () => {
                    const clipboardText = await clipboardService.readText();
                    if (clipboardText !== '') {
                        const metadata = InMemoryClipboardMetadataManager.INSTANCE.get(clipboardText);
                        let pasteOnNewLine = false;
                        let multicursorText = null;
                        let mode = null;
                        if (metadata) {
                            pasteOnNewLine = (focusedEditor.getOption(38) && !!metadata.isFromEmptySelection);
                            multicursorText = (typeof metadata.multicursorText !== 'undefined' ? metadata.multicursorText : null);
                            mode = metadata.mode;
                        }
                        focusedEditor.trigger('keyboard', "paste", {
                            text: clipboardText,
                            pasteOnNewLine,
                            multicursorText,
                            mode
                        });
                    }
                })();
            }
            return true;
        }
        return false;
    });
    PasteAction.addImplementation(0, 'generic-dom', (accessor, args) => {
        getActiveDocument().execCommand('paste');
        return true;
    });
}
if (supportsCopy) {
    registerEditorAction(ExecCommandCopyWithSyntaxHighlightingAction);
}
