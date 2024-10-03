import { IEditorService } from '../../../services/editor/common/editorService.js';
import { WalkThroughPart, WALK_THROUGH_FOCUS } from './walkThroughPart.js';
import { EditorContextKeys } from '../../../../editor/common/editorContextKeys.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
export const WalkThroughArrowUp = {
    id: 'workbench.action.interactivePlayground.arrowUp',
    weight: 200,
    when: ContextKeyExpr.and(WALK_THROUGH_FOCUS, EditorContextKeys.editorTextFocus.toNegated()),
    primary: 16,
    handler: accessor => {
        const editorService = accessor.get(IEditorService);
        const activeEditorPane = editorService.activeEditorPane;
        if (activeEditorPane instanceof WalkThroughPart) {
            activeEditorPane.arrowUp();
        }
    }
};
export const WalkThroughArrowDown = {
    id: 'workbench.action.interactivePlayground.arrowDown',
    weight: 200,
    when: ContextKeyExpr.and(WALK_THROUGH_FOCUS, EditorContextKeys.editorTextFocus.toNegated()),
    primary: 18,
    handler: accessor => {
        const editorService = accessor.get(IEditorService);
        const activeEditorPane = editorService.activeEditorPane;
        if (activeEditorPane instanceof WalkThroughPart) {
            activeEditorPane.arrowDown();
        }
    }
};
export const WalkThroughPageUp = {
    id: 'workbench.action.interactivePlayground.pageUp',
    weight: 200,
    when: ContextKeyExpr.and(WALK_THROUGH_FOCUS, EditorContextKeys.editorTextFocus.toNegated()),
    primary: 11,
    handler: accessor => {
        const editorService = accessor.get(IEditorService);
        const activeEditorPane = editorService.activeEditorPane;
        if (activeEditorPane instanceof WalkThroughPart) {
            activeEditorPane.pageUp();
        }
    }
};
export const WalkThroughPageDown = {
    id: 'workbench.action.interactivePlayground.pageDown',
    weight: 200,
    when: ContextKeyExpr.and(WALK_THROUGH_FOCUS, EditorContextKeys.editorTextFocus.toNegated()),
    primary: 12,
    handler: accessor => {
        const editorService = accessor.get(IEditorService);
        const activeEditorPane = editorService.activeEditorPane;
        if (activeEditorPane instanceof WalkThroughPart) {
            activeEditorPane.pageDown();
        }
    }
};
