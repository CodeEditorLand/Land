import { registerEditorCommand } from '../../../browser/editorExtensions.js';
import { WordPartOperations } from '../../../common/cursor/cursorWordOperations.js';
import { Range } from '../../../common/core/range.js';
import { EditorContextKeys } from '../../../common/editorContextKeys.js';
import { DeleteWordCommand, MoveWordCommand } from '../../wordOperations/browser/wordOperations.js';
import { CommandsRegistry } from '../../../../platform/commands/common/commands.js';
export class DeleteWordPartLeft extends DeleteWordCommand {
    constructor() {
        super({
            whitespaceHeuristics: true,
            wordNavigationType: 0,
            id: 'deleteWordPartLeft',
            precondition: EditorContextKeys.writable,
            kbOpts: {
                kbExpr: EditorContextKeys.textInputFocus,
                primary: 0,
                mac: { primary: 256 | 512 | 1 },
                weight: 100
            }
        });
    }
    _delete(ctx, wordNavigationType) {
        const r = WordPartOperations.deleteWordPartLeft(ctx);
        if (r) {
            return r;
        }
        return new Range(1, 1, 1, 1);
    }
}
export class DeleteWordPartRight extends DeleteWordCommand {
    constructor() {
        super({
            whitespaceHeuristics: true,
            wordNavigationType: 2,
            id: 'deleteWordPartRight',
            precondition: EditorContextKeys.writable,
            kbOpts: {
                kbExpr: EditorContextKeys.textInputFocus,
                primary: 0,
                mac: { primary: 256 | 512 | 20 },
                weight: 100
            }
        });
    }
    _delete(ctx, wordNavigationType) {
        const r = WordPartOperations.deleteWordPartRight(ctx);
        if (r) {
            return r;
        }
        const lineCount = ctx.model.getLineCount();
        const maxColumn = ctx.model.getLineMaxColumn(lineCount);
        return new Range(lineCount, maxColumn, lineCount, maxColumn);
    }
}
export class WordPartLeftCommand extends MoveWordCommand {
    _move(wordSeparators, model, position, wordNavigationType, hasMulticursor) {
        return WordPartOperations.moveWordPartLeft(wordSeparators, model, position, hasMulticursor);
    }
}
export class CursorWordPartLeft extends WordPartLeftCommand {
    constructor() {
        super({
            inSelectionMode: false,
            wordNavigationType: 0,
            id: 'cursorWordPartLeft',
            precondition: undefined,
            kbOpts: {
                kbExpr: EditorContextKeys.textInputFocus,
                primary: 0,
                mac: { primary: 256 | 512 | 15 },
                weight: 100
            }
        });
    }
}
CommandsRegistry.registerCommandAlias('cursorWordPartStartLeft', 'cursorWordPartLeft');
export class CursorWordPartLeftSelect extends WordPartLeftCommand {
    constructor() {
        super({
            inSelectionMode: true,
            wordNavigationType: 0,
            id: 'cursorWordPartLeftSelect',
            precondition: undefined,
            kbOpts: {
                kbExpr: EditorContextKeys.textInputFocus,
                primary: 0,
                mac: { primary: 256 | 512 | 1024 | 15 },
                weight: 100
            }
        });
    }
}
CommandsRegistry.registerCommandAlias('cursorWordPartStartLeftSelect', 'cursorWordPartLeftSelect');
export class WordPartRightCommand extends MoveWordCommand {
    _move(wordSeparators, model, position, wordNavigationType, hasMulticursor) {
        return WordPartOperations.moveWordPartRight(wordSeparators, model, position);
    }
}
export class CursorWordPartRight extends WordPartRightCommand {
    constructor() {
        super({
            inSelectionMode: false,
            wordNavigationType: 2,
            id: 'cursorWordPartRight',
            precondition: undefined,
            kbOpts: {
                kbExpr: EditorContextKeys.textInputFocus,
                primary: 0,
                mac: { primary: 256 | 512 | 17 },
                weight: 100
            }
        });
    }
}
export class CursorWordPartRightSelect extends WordPartRightCommand {
    constructor() {
        super({
            inSelectionMode: true,
            wordNavigationType: 2,
            id: 'cursorWordPartRightSelect',
            precondition: undefined,
            kbOpts: {
                kbExpr: EditorContextKeys.textInputFocus,
                primary: 0,
                mac: { primary: 256 | 512 | 1024 | 17 },
                weight: 100
            }
        });
    }
}
registerEditorCommand(new DeleteWordPartLeft());
registerEditorCommand(new DeleteWordPartRight());
registerEditorCommand(new CursorWordPartLeft());
registerEditorCommand(new CursorWordPartLeftSelect());
registerEditorCommand(new CursorWordPartRight());
registerEditorCommand(new CursorWordPartRightSelect());
