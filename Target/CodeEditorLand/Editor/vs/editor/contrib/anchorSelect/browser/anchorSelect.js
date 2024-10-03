var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SelectionAnchorController_1;
import { alert } from '../../../../base/browser/ui/aria/aria.js';
import { MarkdownString } from '../../../../base/common/htmlContent.js';
import { KeyChord } from '../../../../base/common/keyCodes.js';
import './anchorSelect.css';
import { EditorAction, registerEditorAction, registerEditorContribution } from '../../../browser/editorExtensions.js';
import { Selection } from '../../../common/core/selection.js';
import { EditorContextKeys } from '../../../common/editorContextKeys.js';
import { localize } from '../../../../nls.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
export const SelectionAnchorSet = new RawContextKey('selectionAnchorSet', false);
let SelectionAnchorController = class SelectionAnchorController {
    static { SelectionAnchorController_1 = this; }
    static { this.ID = 'editor.contrib.selectionAnchorController'; }
    static get(editor) {
        return editor.getContribution(SelectionAnchorController_1.ID);
    }
    constructor(editor, contextKeyService) {
        this.editor = editor;
        this.selectionAnchorSetContextKey = SelectionAnchorSet.bindTo(contextKeyService);
        this.modelChangeListener = editor.onDidChangeModel(() => this.selectionAnchorSetContextKey.reset());
    }
    setSelectionAnchor() {
        if (this.editor.hasModel()) {
            const position = this.editor.getPosition();
            this.editor.changeDecorations((accessor) => {
                if (this.decorationId) {
                    accessor.removeDecoration(this.decorationId);
                }
                this.decorationId = accessor.addDecoration(Selection.fromPositions(position, position), {
                    description: 'selection-anchor',
                    stickiness: 1,
                    hoverMessage: new MarkdownString().appendText(localize('selectionAnchor', "Selection Anchor")),
                    className: 'selection-anchor'
                });
            });
            this.selectionAnchorSetContextKey.set(!!this.decorationId);
            alert(localize('anchorSet', "Anchor set at {0}:{1}", position.lineNumber, position.column));
        }
    }
    goToSelectionAnchor() {
        if (this.editor.hasModel() && this.decorationId) {
            const anchorPosition = this.editor.getModel().getDecorationRange(this.decorationId);
            if (anchorPosition) {
                this.editor.setPosition(anchorPosition.getStartPosition());
            }
        }
    }
    selectFromAnchorToCursor() {
        if (this.editor.hasModel() && this.decorationId) {
            const start = this.editor.getModel().getDecorationRange(this.decorationId);
            if (start) {
                const end = this.editor.getPosition();
                this.editor.setSelection(Selection.fromPositions(start.getStartPosition(), end));
                this.cancelSelectionAnchor();
            }
        }
    }
    cancelSelectionAnchor() {
        if (this.decorationId) {
            const decorationId = this.decorationId;
            this.editor.changeDecorations((accessor) => {
                accessor.removeDecoration(decorationId);
                this.decorationId = undefined;
            });
            this.selectionAnchorSetContextKey.set(false);
        }
    }
    dispose() {
        this.cancelSelectionAnchor();
        this.modelChangeListener.dispose();
    }
};
SelectionAnchorController = SelectionAnchorController_1 = __decorate([
    __param(1, IContextKeyService),
    __metadata("design:paramtypes", [Object, Object])
], SelectionAnchorController);
class SetSelectionAnchor extends EditorAction {
    constructor() {
        super({
            id: 'editor.action.setSelectionAnchor',
            label: localize('setSelectionAnchor', "Set Selection Anchor"),
            alias: 'Set Selection Anchor',
            precondition: undefined,
            kbOpts: {
                kbExpr: EditorContextKeys.editorTextFocus,
                primary: KeyChord(2048 | 41, 2048 | 32),
                weight: 100
            }
        });
    }
    async run(_accessor, editor) {
        SelectionAnchorController.get(editor)?.setSelectionAnchor();
    }
}
class GoToSelectionAnchor extends EditorAction {
    constructor() {
        super({
            id: 'editor.action.goToSelectionAnchor',
            label: localize('goToSelectionAnchor', "Go to Selection Anchor"),
            alias: 'Go to Selection Anchor',
            precondition: SelectionAnchorSet,
        });
    }
    async run(_accessor, editor) {
        SelectionAnchorController.get(editor)?.goToSelectionAnchor();
    }
}
class SelectFromAnchorToCursor extends EditorAction {
    constructor() {
        super({
            id: 'editor.action.selectFromAnchorToCursor',
            label: localize('selectFromAnchorToCursor', "Select from Anchor to Cursor"),
            alias: 'Select from Anchor to Cursor',
            precondition: SelectionAnchorSet,
            kbOpts: {
                kbExpr: EditorContextKeys.editorTextFocus,
                primary: KeyChord(2048 | 41, 2048 | 41),
                weight: 100
            }
        });
    }
    async run(_accessor, editor) {
        SelectionAnchorController.get(editor)?.selectFromAnchorToCursor();
    }
}
class CancelSelectionAnchor extends EditorAction {
    constructor() {
        super({
            id: 'editor.action.cancelSelectionAnchor',
            label: localize('cancelSelectionAnchor', "Cancel Selection Anchor"),
            alias: 'Cancel Selection Anchor',
            precondition: SelectionAnchorSet,
            kbOpts: {
                kbExpr: EditorContextKeys.editorTextFocus,
                primary: 9,
                weight: 100
            }
        });
    }
    async run(_accessor, editor) {
        SelectionAnchorController.get(editor)?.cancelSelectionAnchor();
    }
}
registerEditorContribution(SelectionAnchorController.ID, SelectionAnchorController, 4);
registerEditorAction(SetSelectionAnchor);
registerEditorAction(GoToSelectionAnchor);
registerEditorAction(SelectFromAnchorToCursor);
registerEditorAction(CancelSelectionAnchor);
