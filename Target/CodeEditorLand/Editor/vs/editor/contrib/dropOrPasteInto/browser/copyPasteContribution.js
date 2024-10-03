import { HierarchicalKind } from '../../../../base/common/hierarchicalKind.js';
import { EditorAction, EditorCommand, registerEditorAction, registerEditorCommand, registerEditorContribution } from '../../../browser/editorExtensions.js';
import { EditorContextKeys } from '../../../common/editorContextKeys.js';
import { registerEditorFeature } from '../../../common/editorFeatures.js';
import { CopyPasteController, changePasteTypeCommandId, pasteWidgetVisibleCtx } from './copyPasteController.js';
import { DefaultPasteProvidersFeature, DefaultTextPasteOrDropEditProvider } from './defaultProviders.js';
import * as nls from '../../../../nls.js';
registerEditorContribution(CopyPasteController.ID, CopyPasteController, 0);
registerEditorFeature(DefaultPasteProvidersFeature);
registerEditorCommand(new class extends EditorCommand {
    constructor() {
        super({
            id: changePasteTypeCommandId,
            precondition: pasteWidgetVisibleCtx,
            kbOpts: {
                weight: 100,
                primary: 2048 | 89,
            }
        });
    }
    runEditorCommand(_accessor, editor) {
        return CopyPasteController.get(editor)?.changePasteType();
    }
});
registerEditorCommand(new class extends EditorCommand {
    constructor() {
        super({
            id: 'editor.hidePasteWidget',
            precondition: pasteWidgetVisibleCtx,
            kbOpts: {
                weight: 100,
                primary: 9,
            }
        });
    }
    runEditorCommand(_accessor, editor) {
        CopyPasteController.get(editor)?.clearWidgets();
    }
});
registerEditorAction(class PasteAsAction extends EditorAction {
    static { this.argsSchema = {
        type: 'object',
        properties: {
            kind: {
                type: 'string',
                description: nls.localize('pasteAs.kind', "The kind of the paste edit to try applying. If not provided or there are multiple edits for this kind, the editor will show a picker."),
            }
        },
    }; }
    constructor() {
        super({
            id: 'editor.action.pasteAs',
            label: nls.localize('pasteAs', "Paste As..."),
            alias: 'Paste As...',
            precondition: EditorContextKeys.writable,
            metadata: {
                description: 'Paste as',
                args: [{
                        name: 'args',
                        schema: PasteAsAction.argsSchema
                    }]
            }
        });
    }
    run(_accessor, editor, args) {
        let kind = typeof args?.kind === 'string' ? args.kind : undefined;
        if (!kind && args) {
            kind = typeof args.id === 'string' ? args.id : undefined;
        }
        return CopyPasteController.get(editor)?.pasteAs(kind ? new HierarchicalKind(kind) : undefined);
    }
});
registerEditorAction(class extends EditorAction {
    constructor() {
        super({
            id: 'editor.action.pasteAsText',
            label: nls.localize('pasteAsText', "Paste as Text"),
            alias: 'Paste as Text',
            precondition: EditorContextKeys.writable,
        });
    }
    run(_accessor, editor) {
        return CopyPasteController.get(editor)?.pasteAs({ providerId: DefaultTextPasteOrDropEditProvider.id });
    }
});
