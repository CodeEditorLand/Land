import { IBulkEditService, ResourceTextEdit } from '../../../../../editor/browser/services/bulkEditService.js';
import { localize, localize2 } from '../../../../../nls.js';
import { Action2, MenuId, registerAction2 } from '../../../../../platform/actions/common/actions.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { ContextKeyExpr } from '../../../../../platform/contextkey/common/contextkey.js';
import { ActiveEditorContext } from '../../../../common/contextkeys.js';
import { SideBySideDiffElementViewModel } from './diffElementViewModel.js';
import { NOTEBOOK_DIFF_CELL_IGNORE_WHITESPACE_KEY, NOTEBOOK_DIFF_CELL_INPUT, NOTEBOOK_DIFF_CELL_PROPERTY, NOTEBOOK_DIFF_CELL_PROPERTY_EXPANDED, NOTEBOOK_DIFF_HAS_UNCHANGED_CELLS, NOTEBOOK_DIFF_ITEM_DIFF_STATE, NOTEBOOK_DIFF_ITEM_KIND, NOTEBOOK_DIFF_METADATA, NOTEBOOK_DIFF_UNCHANGED_CELLS_HIDDEN } from './notebookDiffEditorBrowser.js';
import { NotebookTextDiffEditor } from './notebookDiffEditor.js';
import { nextChangeIcon, openAsTextIcon, previousChangeIcon, renderOutputIcon, revertIcon, toggleWhitespace } from '../notebookIcons.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { Registry } from '../../../../../platform/registry/common/platform.js';
import { Extensions as ConfigurationExtensions } from '../../../../../platform/configuration/common/configurationRegistry.js';
import { DEFAULT_EDITOR_ASSOCIATION } from '../../../../common/editor.js';
import { NOTEBOOK_DIFF_EDITOR_ID } from '../../common/notebookCommon.js';
import { ITextResourceConfigurationService } from '../../../../../editor/common/services/textResourceConfiguration.js';
import { NotebookMultiTextDiffEditor } from './notebookMultiDiffEditor.js';
import { Codicon } from '../../../../../base/common/codicons.js';
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'notebook.diff.openFile',
            icon: Codicon.goToFile,
            title: localize2('notebook.diff.openFile', 'Open File'),
            precondition: ContextKeyExpr.or(ActiveEditorContext.isEqualTo(NotebookTextDiffEditor.ID), ActiveEditorContext.isEqualTo(NotebookMultiTextDiffEditor.ID)),
            menu: [{
                    id: MenuId.EditorTitle,
                    group: 'navigation',
                    when: ContextKeyExpr.or(ActiveEditorContext.isEqualTo(NotebookTextDiffEditor.ID), ActiveEditorContext.isEqualTo(NotebookMultiTextDiffEditor.ID)),
                }]
        });
    }
    async run(accessor) {
        const editorService = accessor.get(IEditorService);
        const activeEditor = editorService.activeEditorPane;
        if (!activeEditor) {
            return;
        }
        if (activeEditor instanceof NotebookTextDiffEditor || activeEditor instanceof NotebookMultiTextDiffEditor) {
            const diffEditorInput = activeEditor.input;
            const resource = diffEditorInput.modified.resource;
            await editorService.openEditor({ resource });
        }
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'notebook.diff.cell.toggleCollapseUnchangedRegions',
            title: localize2('notebook.diff.cell.toggleCollapseUnchangedRegions', 'Toggle Collapse Unchanged Regions'),
            icon: Codicon.map,
            toggled: ContextKeyExpr.has('config.diffEditor.hideUnchangedRegions.enabled'),
            precondition: ActiveEditorContext.isEqualTo(NotebookTextDiffEditor.ID),
            menu: {
                id: MenuId.EditorTitle,
                group: 'navigation',
                when: ActiveEditorContext.isEqualTo(NotebookTextDiffEditor.ID),
            },
        });
    }
    run(accessor, ...args) {
        const configurationService = accessor.get(IConfigurationService);
        const newValue = !configurationService.getValue('diffEditor.hideUnchangedRegions.enabled');
        configurationService.updateValue('diffEditor.hideUnchangedRegions.enabled', newValue);
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'notebook.diff.switchToText',
            icon: openAsTextIcon,
            title: localize2('notebook.diff.switchToText', 'Open Text Diff Editor'),
            precondition: ContextKeyExpr.or(ActiveEditorContext.isEqualTo(NotebookTextDiffEditor.ID), ActiveEditorContext.isEqualTo(NotebookMultiTextDiffEditor.ID)),
            menu: [{
                    id: MenuId.EditorTitle,
                    group: 'navigation',
                    when: ContextKeyExpr.or(ActiveEditorContext.isEqualTo(NotebookTextDiffEditor.ID), ActiveEditorContext.isEqualTo(NotebookMultiTextDiffEditor.ID)),
                }]
        });
    }
    async run(accessor) {
        const editorService = accessor.get(IEditorService);
        const activeEditor = editorService.activeEditorPane;
        if (!activeEditor) {
            return;
        }
        if (activeEditor instanceof NotebookTextDiffEditor || activeEditor instanceof NotebookMultiTextDiffEditor) {
            const diffEditorInput = activeEditor.input;
            await editorService.openEditor({
                original: { resource: diffEditorInput.original.resource },
                modified: { resource: diffEditorInput.resource },
                label: diffEditorInput.getName(),
                options: {
                    preserveFocus: false,
                    override: DEFAULT_EDITOR_ASSOCIATION.id
                }
            });
        }
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'notebook.diffEditor.showUnchangedCells',
            title: localize2('showUnchangedCells', 'Show Unchanged Cells'),
            icon: Codicon.unfold,
            precondition: ContextKeyExpr.and(ActiveEditorContext.isEqualTo(NotebookMultiTextDiffEditor.ID), ContextKeyExpr.has(NOTEBOOK_DIFF_HAS_UNCHANGED_CELLS.key)),
            menu: {
                when: ContextKeyExpr.and(ActiveEditorContext.isEqualTo(NotebookMultiTextDiffEditor.ID), ContextKeyExpr.has(NOTEBOOK_DIFF_HAS_UNCHANGED_CELLS.key), ContextKeyExpr.equals(NOTEBOOK_DIFF_UNCHANGED_CELLS_HIDDEN.key, true)),
                id: MenuId.EditorTitle,
                order: 22,
                group: 'navigation',
            },
        });
    }
    run(accessor, ...args) {
        const activeEditor = accessor.get(IEditorService).activeEditorPane;
        if (!activeEditor) {
            return;
        }
        if (activeEditor instanceof NotebookMultiTextDiffEditor) {
            activeEditor.showUnchanged();
        }
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'notebook.diffEditor.hideUnchangedCells',
            title: localize2('hideUnchangedCells', 'Hide Unchanged Cells'),
            icon: Codicon.fold,
            precondition: ContextKeyExpr.and(ActiveEditorContext.isEqualTo(NotebookMultiTextDiffEditor.ID), ContextKeyExpr.has(NOTEBOOK_DIFF_HAS_UNCHANGED_CELLS.key)),
            menu: {
                when: ContextKeyExpr.and(ActiveEditorContext.isEqualTo(NotebookMultiTextDiffEditor.ID), ContextKeyExpr.has(NOTEBOOK_DIFF_HAS_UNCHANGED_CELLS.key), ContextKeyExpr.equals(NOTEBOOK_DIFF_UNCHANGED_CELLS_HIDDEN.key, false)),
                id: MenuId.EditorTitle,
                order: 22,
                group: 'navigation',
            },
        });
    }
    run(accessor, ...args) {
        const activeEditor = accessor.get(IEditorService).activeEditorPane;
        if (!activeEditor) {
            return;
        }
        if (activeEditor instanceof NotebookMultiTextDiffEditor) {
            activeEditor.hideUnchanged();
        }
    }
});
registerAction2(class GoToFileAction extends Action2 {
    constructor() {
        super({
            id: 'notebook.diffEditor.2.goToCell',
            title: localize2('goToCell', 'Go To Cell'),
            icon: Codicon.goToFile,
            menu: {
                when: ContextKeyExpr.and(ActiveEditorContext.isEqualTo(NotebookMultiTextDiffEditor.ID), ContextKeyExpr.equals(NOTEBOOK_DIFF_ITEM_KIND.key, 'Cell'), ContextKeyExpr.notEquals(NOTEBOOK_DIFF_ITEM_DIFF_STATE.key, 'delete')),
                id: MenuId.MultiDiffEditorFileToolbar,
                order: 0,
                group: 'navigation',
            },
        });
    }
    async run(accessor, ...args) {
        const uri = args[0];
        const editorService = accessor.get(IEditorService);
        const activeEditorPane = editorService.activeEditorPane;
        if (!(activeEditorPane instanceof NotebookMultiTextDiffEditor)) {
            return;
        }
        await editorService.openEditor({
            resource: uri,
            options: {
                selectionRevealType: 1,
            },
        });
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'notebook.diff.revertMetadata',
            title: localize('notebook.diff.revertMetadata', "Revert Notebook Metadata"),
            icon: revertIcon,
            f1: false,
            menu: {
                id: MenuId.NotebookDiffDocumentMetadata,
                when: NOTEBOOK_DIFF_METADATA,
            },
            precondition: NOTEBOOK_DIFF_METADATA
        });
    }
    run(accessor, context) {
        if (!context) {
            return;
        }
        const editorService = accessor.get(IEditorService);
        const activeEditorPane = editorService.activeEditorPane;
        if (!(activeEditorPane instanceof NotebookTextDiffEditor)) {
            return;
        }
        context.modifiedDocumentTextModel.applyEdits([{
                editType: 5,
                metadata: context.originalMetadata.metadata,
            }], true, undefined, () => undefined, undefined, true);
    }
});
const revertInput = localize('notebook.diff.cell.revertInput', "Revert Input");
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'notebook.diffEditor.2.cell.revertInput',
            title: revertInput,
            icon: revertIcon,
            menu: {
                when: ContextKeyExpr.and(ActiveEditorContext.isEqualTo(NotebookMultiTextDiffEditor.ID), ContextKeyExpr.equals(NOTEBOOK_DIFF_ITEM_KIND.key, 'Cell'), ContextKeyExpr.equals(NOTEBOOK_DIFF_ITEM_DIFF_STATE.key, 'modified')),
                id: MenuId.MultiDiffEditorFileToolbar,
                order: 2,
                group: 'navigation',
            },
        });
    }
    async run(accessor, ...args) {
        const uri = args[0];
        const editorService = accessor.get(IEditorService);
        const activeEditorPane = editorService.activeEditorPane;
        if (!(activeEditorPane instanceof NotebookMultiTextDiffEditor)) {
            return;
        }
        const item = activeEditorPane.getDiffElementViewModel(uri);
        if (item && item instanceof SideBySideDiffElementViewModel) {
            const modified = item.modified;
            const original = item.original;
            if (!original || !modified) {
                return;
            }
            const bulkEditService = accessor.get(IBulkEditService);
            await bulkEditService.apply([
                new ResourceTextEdit(modified.uri, { range: modified.textModel.getFullModelRange(), text: original.textModel.getValue() }),
            ], { quotableLabel: 'Revert Notebook Cell Content Change' });
        }
    }
});
const revertOutputs = localize('notebook.diff.cell.revertOutputs', "Revert Outputs");
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'notebook.diffEditor.2.cell.revertOutputs',
            title: revertOutputs,
            icon: revertIcon,
            f1: false,
            menu: {
                when: ContextKeyExpr.and(ActiveEditorContext.isEqualTo(NotebookMultiTextDiffEditor.ID), ContextKeyExpr.equals(NOTEBOOK_DIFF_ITEM_KIND.key, 'Output'), ContextKeyExpr.equals(NOTEBOOK_DIFF_ITEM_DIFF_STATE.key, 'modified')),
                id: MenuId.MultiDiffEditorFileToolbar,
                order: 2,
                group: 'navigation',
            },
        });
    }
    async run(accessor, ...args) {
        const uri = args[0];
        const editorService = accessor.get(IEditorService);
        const activeEditorPane = editorService.activeEditorPane;
        if (!(activeEditorPane instanceof NotebookMultiTextDiffEditor)) {
            return;
        }
        const item = activeEditorPane.getDiffElementViewModel(uri);
        if (item && item instanceof SideBySideDiffElementViewModel) {
            const original = item.original;
            const modifiedCellIndex = item.modifiedDocument.cells.findIndex(cell => cell.handle === item.modified.handle);
            if (modifiedCellIndex === -1) {
                return;
            }
            item.mainDocumentTextModel.applyEdits([{
                    editType: 2, index: modifiedCellIndex, outputs: original.outputs
                }], true, undefined, () => undefined, undefined, true);
        }
    }
});
const revertMetadata = localize('notebook.diff.cell.revertMetadata', "Revert Metadata");
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'notebook.diffEditor.2.cell.revertMetadata',
            title: revertMetadata,
            icon: revertIcon,
            f1: false,
            menu: {
                when: ContextKeyExpr.and(ActiveEditorContext.isEqualTo(NotebookMultiTextDiffEditor.ID), ContextKeyExpr.equals(NOTEBOOK_DIFF_ITEM_KIND.key, 'Metadata'), ContextKeyExpr.equals(NOTEBOOK_DIFF_ITEM_DIFF_STATE.key, 'modified')),
                id: MenuId.MultiDiffEditorFileToolbar,
                order: 2,
                group: 'navigation',
            },
        });
    }
    async run(accessor, ...args) {
        const uri = args[0];
        const editorService = accessor.get(IEditorService);
        const activeEditorPane = editorService.activeEditorPane;
        if (!(activeEditorPane instanceof NotebookMultiTextDiffEditor)) {
            return;
        }
        const item = activeEditorPane.getDiffElementViewModel(uri);
        if (item && item instanceof SideBySideDiffElementViewModel) {
            const original = item.original;
            const modifiedCellIndex = item.modifiedDocument.cells.findIndex(cell => cell.handle === item.modified.handle);
            if (modifiedCellIndex === -1) {
                return;
            }
            item.mainDocumentTextModel.applyEdits([{
                    editType: 3, index: modifiedCellIndex, metadata: original.metadata
                }], true, undefined, () => undefined, undefined, true);
        }
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'notebook.diff.cell.revertMetadata',
            title: revertMetadata,
            icon: revertIcon,
            f1: false,
            menu: {
                id: MenuId.NotebookDiffCellMetadataTitle,
                when: NOTEBOOK_DIFF_CELL_PROPERTY
            },
            precondition: NOTEBOOK_DIFF_CELL_PROPERTY
        });
    }
    run(accessor, context) {
        if (!context) {
            return;
        }
        if (!(context instanceof SideBySideDiffElementViewModel)) {
            return;
        }
        const original = context.original;
        const modified = context.modified;
        const modifiedCellIndex = context.mainDocumentTextModel.cells.indexOf(modified.textModel);
        if (modifiedCellIndex === -1) {
            return;
        }
        const rawEdits = [{ editType: 3, index: modifiedCellIndex, metadata: original.metadata }];
        if (context.original.language && context.modified.language !== context.original.language) {
            rawEdits.push({ editType: 4, index: modifiedCellIndex, language: context.original.language });
        }
        context.modifiedDocument.applyEdits(rawEdits, true, undefined, () => undefined, undefined, true);
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'notebook.diff.cell.switchOutputRenderingStyleToText',
            title: localize('notebook.diff.cell.switchOutputRenderingStyleToText', "Switch Output Rendering"),
            icon: renderOutputIcon,
            f1: false,
            menu: {
                id: MenuId.NotebookDiffCellOutputsTitle,
                when: NOTEBOOK_DIFF_CELL_PROPERTY_EXPANDED
            }
        });
    }
    run(accessor, context) {
        if (!context) {
            return;
        }
        context.renderOutput = !context.renderOutput;
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'notebook.diff.cell.revertOutputs',
            title: localize('notebook.diff.cell.revertOutputs', "Revert Outputs"),
            icon: revertIcon,
            f1: false,
            menu: {
                id: MenuId.NotebookDiffCellOutputsTitle,
                when: NOTEBOOK_DIFF_CELL_PROPERTY
            },
            precondition: NOTEBOOK_DIFF_CELL_PROPERTY
        });
    }
    run(accessor, context) {
        if (!context) {
            return;
        }
        if (!(context instanceof SideBySideDiffElementViewModel)) {
            return;
        }
        const original = context.original;
        const modified = context.modified;
        const modifiedCellIndex = context.mainDocumentTextModel.cells.indexOf(modified.textModel);
        if (modifiedCellIndex === -1) {
            return;
        }
        context.mainDocumentTextModel.applyEdits([{
                editType: 2, index: modifiedCellIndex, outputs: original.outputs
            }], true, undefined, () => undefined, undefined, true);
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'notebook.toggle.diff.cell.ignoreTrimWhitespace',
            title: localize('ignoreTrimWhitespace.label', "Show Leading/Trailing Whitespace Differences"),
            icon: toggleWhitespace,
            f1: false,
            menu: {
                id: MenuId.NotebookDiffCellInputTitle,
                when: NOTEBOOK_DIFF_CELL_INPUT,
                order: 1,
            },
            precondition: NOTEBOOK_DIFF_CELL_INPUT,
            toggled: ContextKeyExpr.equals(NOTEBOOK_DIFF_CELL_IGNORE_WHITESPACE_KEY, false),
        });
    }
    run(accessor, context) {
        const cell = context;
        if (!cell?.modified) {
            return;
        }
        const uri = cell.modified.uri;
        const configService = accessor.get(ITextResourceConfigurationService);
        const key = 'diffEditor.ignoreTrimWhitespace';
        const val = configService.getValue(uri, key);
        configService.updateValue(uri, key, !val);
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'notebook.diff.cell.revertInput',
            title: revertInput,
            icon: revertIcon,
            f1: false,
            menu: {
                id: MenuId.NotebookDiffCellInputTitle,
                when: NOTEBOOK_DIFF_CELL_INPUT,
                order: 2
            },
            precondition: NOTEBOOK_DIFF_CELL_INPUT
        });
    }
    run(accessor, context) {
        if (!context) {
            return;
        }
        const original = context.original;
        const modified = context.modified;
        if (!original || !modified) {
            return;
        }
        const bulkEditService = accessor.get(IBulkEditService);
        return bulkEditService.apply([
            new ResourceTextEdit(modified.uri, { range: modified.textModel.getFullModelRange(), text: original.textModel.getValue() }),
        ], { quotableLabel: 'Revert Notebook Cell Content Change' });
    }
});
class ToggleRenderAction extends Action2 {
    constructor(id, title, precondition, toggled, order, toggleOutputs, toggleMetadata) {
        super({
            id: id,
            title,
            precondition: precondition,
            menu: [{
                    id: MenuId.EditorTitle,
                    group: 'notebook',
                    when: precondition,
                    order: order,
                }],
            toggled: toggled
        });
        this.toggleOutputs = toggleOutputs;
        this.toggleMetadata = toggleMetadata;
    }
    async run(accessor) {
        const configurationService = accessor.get(IConfigurationService);
        if (this.toggleOutputs !== undefined) {
            const oldValue = configurationService.getValue('notebook.diff.ignoreOutputs');
            configurationService.updateValue('notebook.diff.ignoreOutputs', !oldValue);
        }
        if (this.toggleMetadata !== undefined) {
            const oldValue = configurationService.getValue('notebook.diff.ignoreMetadata');
            configurationService.updateValue('notebook.diff.ignoreMetadata', !oldValue);
        }
    }
}
registerAction2(class extends ToggleRenderAction {
    constructor() {
        super('notebook.diff.showOutputs', localize2('notebook.diff.showOutputs', 'Show Outputs Differences'), ContextKeyExpr.or(ActiveEditorContext.isEqualTo(NotebookTextDiffEditor.ID), ActiveEditorContext.isEqualTo(NotebookMultiTextDiffEditor.ID)), ContextKeyExpr.notEquals('config.notebook.diff.ignoreOutputs', true), 2, true, undefined);
    }
});
registerAction2(class extends ToggleRenderAction {
    constructor() {
        super('notebook.diff.showMetadata', localize2('notebook.diff.showMetadata', 'Show Metadata Differences'), ContextKeyExpr.or(ActiveEditorContext.isEqualTo(NotebookTextDiffEditor.ID), ActiveEditorContext.isEqualTo(NotebookMultiTextDiffEditor.ID)), ContextKeyExpr.notEquals('config.notebook.diff.ignoreMetadata', true), 1, undefined, true);
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'notebook.diff.action.previous',
            title: localize('notebook.diff.action.previous.title', "Show Previous Change"),
            icon: previousChangeIcon,
            f1: false,
            keybinding: {
                primary: 1024 | 512 | 61,
                weight: 200,
                when: ActiveEditorContext.isEqualTo(NotebookTextDiffEditor.ID)
            },
            menu: {
                id: MenuId.EditorTitle,
                group: 'navigation',
                when: ActiveEditorContext.isEqualTo(NotebookTextDiffEditor.ID)
            }
        });
    }
    run(accessor) {
        const editorService = accessor.get(IEditorService);
        if (editorService.activeEditorPane?.getId() !== NOTEBOOK_DIFF_EDITOR_ID) {
            return;
        }
        const editor = editorService.activeEditorPane.getControl();
        editor?.previousChange();
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'notebook.diff.action.next',
            title: localize('notebook.diff.action.next.title', "Show Next Change"),
            icon: nextChangeIcon,
            f1: false,
            keybinding: {
                primary: 512 | 61,
                weight: 200,
                when: ActiveEditorContext.isEqualTo(NotebookTextDiffEditor.ID)
            },
            menu: {
                id: MenuId.EditorTitle,
                group: 'navigation',
                when: ActiveEditorContext.isEqualTo(NotebookTextDiffEditor.ID)
            }
        });
    }
    run(accessor) {
        const editorService = accessor.get(IEditorService);
        if (editorService.activeEditorPane?.getId() !== NOTEBOOK_DIFF_EDITOR_ID) {
            return;
        }
        const editor = editorService.activeEditorPane.getControl();
        editor?.nextChange();
    }
});
Registry.as(ConfigurationExtensions.Configuration).registerConfiguration({
    id: 'notebook',
    order: 100,
    type: 'object',
    'properties': {
        'notebook.diff.ignoreMetadata': {
            type: 'boolean',
            default: false,
            markdownDescription: localize('notebook.diff.ignoreMetadata', "Hide Metadata Differences")
        },
        'notebook.diff.ignoreOutputs': {
            type: 'boolean',
            default: false,
            markdownDescription: localize('notebook.diff.ignoreOutputs', "Hide Outputs Differences")
        },
    }
});
