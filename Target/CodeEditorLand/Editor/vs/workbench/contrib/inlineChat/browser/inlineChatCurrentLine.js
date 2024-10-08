/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
import { DisposableStore, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { localize, localize2 } from '../../../../nls.js';
import { ContextKeyExpr, IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { IChatAgentService } from '../../chat/common/chatAgents.js';
import { InlineChatController } from './inlineChatController.js';
import { CTX_INLINE_CHAT_HAS_AGENT, CTX_INLINE_CHAT_VISIBLE } from '../common/inlineChat.js';
import { EditorAction2 } from '../../../../editor/browser/editorExtensions.js';
import { EditOperation } from '../../../../editor/common/core/editOperation.js';
import { Range } from '../../../../editor/common/core/range.js';
import { Position } from '../../../../editor/common/core/position.js';
import { AbstractInlineChatAction } from './inlineChatActions.js';
import { EditorContextKeys } from '../../../../editor/common/editorContextKeys.js';
export const CTX_INLINE_CHAT_EXPANSION = new RawContextKey('inlineChatExpansion', false, localize('inlineChatExpansion', "Whether the inline chat expansion is enabled when at the end of a just-typed line"));
let InlineChatExansionContextKey = class InlineChatExansionContextKey {
    static { this.Id = 'editor.inlineChatExpansion'; }
    constructor(editor, contextKeyService, chatAgentService) {
        this._store = new DisposableStore();
        this._editorListener = this._store.add(new MutableDisposable());
        this._ctxInlineChatExpansion = CTX_INLINE_CHAT_EXPANSION.bindTo(contextKeyService);
        const update = () => {
            if (editor.hasModel() && chatAgentService.getAgents().length > 0) {
                this._install(editor);
            }
            else {
                this._uninstall();
            }
        };
        this._store.add(chatAgentService.onDidChangeAgents(update));
        this._store.add(editor.onDidChangeModel(update));
        update();
    }
    dispose() {
        this._ctxInlineChatExpansion.reset();
        this._store.dispose();
    }
    _install(editor) {
        const store = new DisposableStore();
        this._editorListener.value = store;
        const model = editor.getModel();
        const lastChangeEnds = [];
        store.add(editor.onDidChangeCursorPosition(e => {
            let enabled = false;
            if (e.reason === 0 /* CursorChangeReason.NotSet */) {
                const position = editor.getPosition();
                const positionOffset = model.getOffsetAt(position);
                const lineLength = model.getLineLength(position.lineNumber);
                const firstNonWhitespace = model.getLineFirstNonWhitespaceColumn(position.lineNumber);
                if (firstNonWhitespace !== 0 && position.column > lineLength && lastChangeEnds.includes(positionOffset)) {
                    enabled = true;
                }
            }
            lastChangeEnds.length = 0;
            this._ctxInlineChatExpansion.set(enabled);
        }));
        store.add(editor.onDidChangeModelContent(e => {
            lastChangeEnds.length = 0;
            for (const change of e.changes) {
                const changeEnd = change.rangeOffset + change.text.length;
                lastChangeEnds.push(changeEnd);
            }
            queueMicrotask(() => {
                if (lastChangeEnds.length > 0) {
                    // this is a signal that onDidChangeCursorPosition didn't run which means some outside change
                    // which means we should disable the context key
                    this._ctxInlineChatExpansion.set(false);
                }
            });
        }));
    }
    _uninstall() {
        this._editorListener.clear();
    }
};
InlineChatExansionContextKey = __decorate([
    __param(1, IContextKeyService),
    __param(2, IChatAgentService),
    __metadata("design:paramtypes", [Object, Object, Object])
], InlineChatExansionContextKey);
export { InlineChatExansionContextKey };
export class InlineChatExpandLineAction extends EditorAction2 {
    constructor() {
        super({
            id: 'inlineChat.startWithCurrentLine',
            category: AbstractInlineChatAction.category,
            title: localize2('startWithCurrentLine', "Start in Editor with Current Line"),
            f1: true,
            precondition: ContextKeyExpr.and(CTX_INLINE_CHAT_VISIBLE.negate(), CTX_INLINE_CHAT_HAS_AGENT, EditorContextKeys.writable),
            // keybinding: {
            // 	when: CTX_INLINE_CHAT_EXPANSION,
            // 	weight: KeybindingWeight.EditorContrib,
            // 	primary: KeyCode.Tab
            // }
        });
    }
    async runEditorCommand(_accessor, editor) {
        const ctrl = InlineChatController.get(editor);
        if (!ctrl || !editor.hasModel()) {
            return;
        }
        const model = editor.getModel();
        const lineNumber = editor.getSelection().positionLineNumber;
        const lineContent = model.getLineContent(lineNumber);
        const startColumn = model.getLineFirstNonWhitespaceColumn(lineNumber);
        const endColumn = model.getLineMaxColumn(lineNumber);
        // clear the line
        let undoEdits = [];
        model.pushEditOperations(null, [EditOperation.replace(new Range(lineNumber, startColumn, lineNumber, endColumn), '')], (edits) => {
            undoEdits = edits;
            return null;
        });
        let lastState;
        const d = ctrl.onDidEnterState(e => lastState = e);
        try {
            // trigger chat
            await ctrl.run({
                autoSend: true,
                message: lineContent.trim(),
                position: new Position(lineNumber, startColumn)
            });
        }
        finally {
            d.dispose();
        }
        if (lastState === "CANCEL" /* State.CANCEL */) {
            model.pushEditOperations(null, undoEdits, () => null);
        }
    }
}
