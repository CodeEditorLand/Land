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
var InPlaceReplaceController_1;
import { createCancelablePromise, timeout } from '../../../../base/common/async.js';
import { onUnexpectedError } from '../../../../base/common/errors.js';
import { EditorState } from '../../editorState/browser/editorState.js';
import { EditorAction, registerEditorAction, registerEditorContribution } from '../../../browser/editorExtensions.js';
import { Range } from '../../../common/core/range.js';
import { Selection } from '../../../common/core/selection.js';
import { EditorContextKeys } from '../../../common/editorContextKeys.js';
import { ModelDecorationOptions } from '../../../common/model/textModel.js';
import { IEditorWorkerService } from '../../../common/services/editorWorker.js';
import * as nls from '../../../../nls.js';
import { InPlaceReplaceCommand } from './inPlaceReplaceCommand.js';
import './inPlaceReplace.css';
let InPlaceReplaceController = class InPlaceReplaceController {
    static { InPlaceReplaceController_1 = this; }
    static { this.ID = 'editor.contrib.inPlaceReplaceController'; }
    static get(editor) {
        return editor.getContribution(InPlaceReplaceController_1.ID);
    }
    static { this.DECORATION = ModelDecorationOptions.register({
        description: 'in-place-replace',
        className: 'valueSetReplacement'
    }); }
    constructor(editor, editorWorkerService) {
        this.editor = editor;
        this.editorWorkerService = editorWorkerService;
        this.decorations = this.editor.createDecorationsCollection();
    }
    dispose() {
    }
    run(source, up) {
        this.currentRequest?.cancel();
        const editorSelection = this.editor.getSelection();
        const model = this.editor.getModel();
        if (!model || !editorSelection) {
            return undefined;
        }
        let selection = editorSelection;
        if (selection.startLineNumber !== selection.endLineNumber) {
            return undefined;
        }
        const state = new EditorState(this.editor, 1 | 4);
        const modelURI = model.uri;
        if (!this.editorWorkerService.canNavigateValueSet(modelURI)) {
            return Promise.resolve(undefined);
        }
        this.currentRequest = createCancelablePromise(token => this.editorWorkerService.navigateValueSet(modelURI, selection, up));
        return this.currentRequest.then(result => {
            if (!result || !result.range || !result.value) {
                return;
            }
            if (!state.validate(this.editor)) {
                return;
            }
            const editRange = Range.lift(result.range);
            let highlightRange = result.range;
            const diff = result.value.length - (selection.endColumn - selection.startColumn);
            highlightRange = {
                startLineNumber: highlightRange.startLineNumber,
                startColumn: highlightRange.startColumn,
                endLineNumber: highlightRange.endLineNumber,
                endColumn: highlightRange.startColumn + result.value.length
            };
            if (diff > 1) {
                selection = new Selection(selection.startLineNumber, selection.startColumn, selection.endLineNumber, selection.endColumn + diff - 1);
            }
            const command = new InPlaceReplaceCommand(editRange, selection, result.value);
            this.editor.pushUndoStop();
            this.editor.executeCommand(source, command);
            this.editor.pushUndoStop();
            this.decorations.set([{
                    range: highlightRange,
                    options: InPlaceReplaceController_1.DECORATION
                }]);
            this.decorationRemover?.cancel();
            this.decorationRemover = timeout(350);
            this.decorationRemover.then(() => this.decorations.clear()).catch(onUnexpectedError);
        }).catch(onUnexpectedError);
    }
};
InPlaceReplaceController = InPlaceReplaceController_1 = __decorate([
    __param(1, IEditorWorkerService),
    __metadata("design:paramtypes", [Object, Object])
], InPlaceReplaceController);
class InPlaceReplaceUp extends EditorAction {
    constructor() {
        super({
            id: 'editor.action.inPlaceReplace.up',
            label: nls.localize('InPlaceReplaceAction.previous.label', "Replace with Previous Value"),
            alias: 'Replace with Previous Value',
            precondition: EditorContextKeys.writable,
            kbOpts: {
                kbExpr: EditorContextKeys.editorTextFocus,
                primary: 2048 | 1024 | 87,
                weight: 100
            }
        });
    }
    run(accessor, editor) {
        const controller = InPlaceReplaceController.get(editor);
        if (!controller) {
            return Promise.resolve(undefined);
        }
        return controller.run(this.id, false);
    }
}
class InPlaceReplaceDown extends EditorAction {
    constructor() {
        super({
            id: 'editor.action.inPlaceReplace.down',
            label: nls.localize('InPlaceReplaceAction.next.label', "Replace with Next Value"),
            alias: 'Replace with Next Value',
            precondition: EditorContextKeys.writable,
            kbOpts: {
                kbExpr: EditorContextKeys.editorTextFocus,
                primary: 2048 | 1024 | 89,
                weight: 100
            }
        });
    }
    run(accessor, editor) {
        const controller = InPlaceReplaceController.get(editor);
        if (!controller) {
            return Promise.resolve(undefined);
        }
        return controller.run(this.id, true);
    }
}
registerEditorContribution(InPlaceReplaceController.ID, InPlaceReplaceController, 4);
registerEditorAction(InPlaceReplaceUp);
registerEditorAction(InPlaceReplaceDown);
