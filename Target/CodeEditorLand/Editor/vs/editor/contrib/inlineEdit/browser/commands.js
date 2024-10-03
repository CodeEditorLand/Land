import { EditorAction } from '../../../browser/editorExtensions.js';
import { EditorContextKeys } from '../../../common/editorContextKeys.js';
import { inlineEditAcceptId, inlineEditJumpBackId, inlineEditJumpToId, inlineEditRejectId } from './commandIds.js';
import { InlineEditController } from './inlineEditController.js';
import { MenuId } from '../../../../platform/actions/common/actions.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
export class AcceptInlineEdit extends EditorAction {
    constructor() {
        super({
            id: inlineEditAcceptId,
            label: 'Accept Inline Edit',
            alias: 'Accept Inline Edit',
            precondition: ContextKeyExpr.and(EditorContextKeys.writable, InlineEditController.inlineEditVisibleContext),
            kbOpts: [
                {
                    weight: 100 + 1,
                    primary: 2,
                    kbExpr: ContextKeyExpr.and(EditorContextKeys.writable, InlineEditController.inlineEditVisibleContext, InlineEditController.cursorAtInlineEditContext)
                }
            ],
            menuOpts: [{
                    menuId: MenuId.InlineEditToolbar,
                    title: 'Accept',
                    group: 'primary',
                    order: 1,
                }],
        });
    }
    async run(accessor, editor) {
        const controller = InlineEditController.get(editor);
        await controller?.accept();
    }
}
export class TriggerInlineEdit extends EditorAction {
    constructor() {
        const activeExpr = ContextKeyExpr.and(EditorContextKeys.writable, ContextKeyExpr.not(InlineEditController.inlineEditVisibleKey));
        super({
            id: 'editor.action.inlineEdit.trigger',
            label: 'Trigger Inline Edit',
            alias: 'Trigger Inline Edit',
            precondition: activeExpr,
            kbOpts: {
                weight: 100 + 1,
                primary: 2048 | 512 | 86,
                kbExpr: activeExpr
            },
        });
    }
    async run(accessor, editor) {
        const controller = InlineEditController.get(editor);
        controller?.trigger();
    }
}
export class JumpToInlineEdit extends EditorAction {
    constructor() {
        const activeExpr = ContextKeyExpr.and(EditorContextKeys.writable, InlineEditController.inlineEditVisibleContext, ContextKeyExpr.not(InlineEditController.cursorAtInlineEditKey));
        super({
            id: inlineEditJumpToId,
            label: 'Jump to Inline Edit',
            alias: 'Jump to Inline Edit',
            precondition: activeExpr,
            kbOpts: {
                weight: 100 + 1,
                primary: 2048 | 512 | 86,
                kbExpr: activeExpr
            },
            menuOpts: [{
                    menuId: MenuId.InlineEditToolbar,
                    title: 'Jump To Edit',
                    group: 'primary',
                    order: 3,
                    when: activeExpr
                }],
        });
    }
    async run(accessor, editor) {
        const controller = InlineEditController.get(editor);
        controller?.jumpToCurrent();
    }
}
export class JumpBackInlineEdit extends EditorAction {
    constructor() {
        const activeExpr = ContextKeyExpr.and(EditorContextKeys.writable, InlineEditController.cursorAtInlineEditContext);
        super({
            id: inlineEditJumpBackId,
            label: 'Jump Back from Inline Edit',
            alias: 'Jump Back from Inline Edit',
            precondition: activeExpr,
            kbOpts: {
                weight: 100 + 10,
                primary: 2048 | 512 | 86,
                kbExpr: activeExpr
            },
            menuOpts: [{
                    menuId: MenuId.InlineEditToolbar,
                    title: 'Jump Back',
                    group: 'primary',
                    order: 3,
                    when: activeExpr
                }],
        });
    }
    async run(accessor, editor) {
        const controller = InlineEditController.get(editor);
        controller?.jumpBack();
    }
}
export class RejectInlineEdit extends EditorAction {
    constructor() {
        const activeExpr = ContextKeyExpr.and(EditorContextKeys.writable, InlineEditController.inlineEditVisibleContext);
        super({
            id: inlineEditRejectId,
            label: 'Reject Inline Edit',
            alias: 'Reject Inline Edit',
            precondition: activeExpr,
            kbOpts: {
                weight: 100,
                primary: 9,
                kbExpr: activeExpr
            },
            menuOpts: [{
                    menuId: MenuId.InlineEditToolbar,
                    title: 'Reject',
                    group: 'secondary',
                    order: 2,
                }],
        });
    }
    async run(accessor, editor) {
        const controller = InlineEditController.get(editor);
        await controller?.clear();
    }
}
