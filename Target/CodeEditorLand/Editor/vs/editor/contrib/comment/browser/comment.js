import { KeyChord } from '../../../../base/common/keyCodes.js';
import { EditorAction, registerEditorAction } from '../../../browser/editorExtensions.js';
import { Range } from '../../../common/core/range.js';
import { EditorContextKeys } from '../../../common/editorContextKeys.js';
import { ILanguageConfigurationService } from '../../../common/languages/languageConfigurationRegistry.js';
import { BlockCommentCommand } from './blockCommentCommand.js';
import { LineCommentCommand } from './lineCommentCommand.js';
import * as nls from '../../../../nls.js';
import { MenuId } from '../../../../platform/actions/common/actions.js';
class CommentLineAction extends EditorAction {
    constructor(type, opts) {
        super(opts);
        this._type = type;
    }
    run(accessor, editor) {
        const languageConfigurationService = accessor.get(ILanguageConfigurationService);
        if (!editor.hasModel()) {
            return;
        }
        const model = editor.getModel();
        const commands = [];
        const modelOptions = model.getOptions();
        const commentsOptions = editor.getOption(23);
        const selections = editor.getSelections().map((selection, index) => ({ selection, index, ignoreFirstLine: false }));
        selections.sort((a, b) => Range.compareRangesUsingStarts(a.selection, b.selection));
        let prev = selections[0];
        for (let i = 1; i < selections.length; i++) {
            const curr = selections[i];
            if (prev.selection.endLineNumber === curr.selection.startLineNumber) {
                if (prev.index < curr.index) {
                    curr.ignoreFirstLine = true;
                }
                else {
                    prev.ignoreFirstLine = true;
                    prev = curr;
                }
            }
        }
        for (const selection of selections) {
            commands.push(new LineCommentCommand(languageConfigurationService, selection.selection, modelOptions.indentSize, this._type, commentsOptions.insertSpace, commentsOptions.ignoreEmptyLines, selection.ignoreFirstLine));
        }
        editor.pushUndoStop();
        editor.executeCommands(this.id, commands);
        editor.pushUndoStop();
    }
}
class ToggleCommentLineAction extends CommentLineAction {
    constructor() {
        super(0, {
            id: 'editor.action.commentLine',
            label: nls.localize('comment.line', "Toggle Line Comment"),
            alias: 'Toggle Line Comment',
            precondition: EditorContextKeys.writable,
            kbOpts: {
                kbExpr: EditorContextKeys.editorTextFocus,
                primary: 2048 | 90,
                weight: 100
            },
            menuOpts: {
                menuId: MenuId.MenubarEditMenu,
                group: '5_insert',
                title: nls.localize({ key: 'miToggleLineComment', comment: ['&& denotes a mnemonic'] }, "&&Toggle Line Comment"),
                order: 1
            }
        });
    }
}
class AddLineCommentAction extends CommentLineAction {
    constructor() {
        super(1, {
            id: 'editor.action.addCommentLine',
            label: nls.localize('comment.line.add', "Add Line Comment"),
            alias: 'Add Line Comment',
            precondition: EditorContextKeys.writable,
            kbOpts: {
                kbExpr: EditorContextKeys.editorTextFocus,
                primary: KeyChord(2048 | 41, 2048 | 33),
                weight: 100
            }
        });
    }
}
class RemoveLineCommentAction extends CommentLineAction {
    constructor() {
        super(2, {
            id: 'editor.action.removeCommentLine',
            label: nls.localize('comment.line.remove', "Remove Line Comment"),
            alias: 'Remove Line Comment',
            precondition: EditorContextKeys.writable,
            kbOpts: {
                kbExpr: EditorContextKeys.editorTextFocus,
                primary: KeyChord(2048 | 41, 2048 | 51),
                weight: 100
            }
        });
    }
}
class BlockCommentAction extends EditorAction {
    constructor() {
        super({
            id: 'editor.action.blockComment',
            label: nls.localize('comment.block', "Toggle Block Comment"),
            alias: 'Toggle Block Comment',
            precondition: EditorContextKeys.writable,
            kbOpts: {
                kbExpr: EditorContextKeys.editorTextFocus,
                primary: 1024 | 512 | 31,
                linux: { primary: 2048 | 1024 | 31 },
                weight: 100
            },
            menuOpts: {
                menuId: MenuId.MenubarEditMenu,
                group: '5_insert',
                title: nls.localize({ key: 'miToggleBlockComment', comment: ['&& denotes a mnemonic'] }, "Toggle &&Block Comment"),
                order: 2
            }
        });
    }
    run(accessor, editor) {
        const languageConfigurationService = accessor.get(ILanguageConfigurationService);
        if (!editor.hasModel()) {
            return;
        }
        const commentsOptions = editor.getOption(23);
        const commands = [];
        const selections = editor.getSelections();
        for (const selection of selections) {
            commands.push(new BlockCommentCommand(selection, commentsOptions.insertSpace, languageConfigurationService));
        }
        editor.pushUndoStop();
        editor.executeCommands(this.id, commands);
        editor.pushUndoStop();
    }
}
registerEditorAction(ToggleCommentLineAction);
registerEditorAction(AddLineCommentAction);
registerEditorAction(RemoveLineCommentAction);
registerEditorAction(BlockCommentAction);
