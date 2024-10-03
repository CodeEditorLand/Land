import { URI } from '../../../../../base/common/uri.js';
import { localize, localize2 } from '../../../../../nls.js';
import { Action2, MenuId, MenuRegistry } from '../../../../../platform/actions/common/actions.js';
import { ContextKeyExpr } from '../../../../../platform/contextkey/common/contextkey.js';
import { getNotebookEditorFromEditorPane, cellRangeToViewCells } from '../notebookBrowser.js';
import { IS_COMPOSITE_NOTEBOOK, NOTEBOOK_EDITOR_EDITABLE, NOTEBOOK_EDITOR_FOCUSED, NOTEBOOK_IS_ACTIVE_EDITOR, NOTEBOOK_KERNEL_COUNT, NOTEBOOK_KERNEL_SOURCE_COUNT } from '../../common/notebookContextKeys.js';
import { isICellRange } from '../../common/notebookRange.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { isEditorCommandsContext } from '../../../../common/editor.js';
import { INotebookEditorService } from '../services/notebookEditorService.js';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
import { isEqual } from '../../../../../base/common/resources.js';
export const SELECT_KERNEL_ID = '_notebook.selectKernel';
export const NOTEBOOK_ACTIONS_CATEGORY = localize2('notebookActions.category', 'Notebook');
export const CELL_TITLE_CELL_GROUP_ID = 'inline/cell';
export const CELL_TITLE_OUTPUT_GROUP_ID = 'inline/output';
export const NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT = 100;
export const NOTEBOOK_OUTPUT_WEBVIEW_ACTION_WEIGHT = 200 + 1;
export function getContextFromActiveEditor(editorService) {
    const editor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
    if (!editor || !editor.hasModel()) {
        return;
    }
    const activeCell = editor.getActiveCell();
    const selectedCells = editor.getSelectionViewModels();
    return {
        cell: activeCell,
        selectedCells,
        notebookEditor: editor
    };
}
function getWidgetFromUri(accessor, uri) {
    const notebookEditorService = accessor.get(INotebookEditorService);
    const widget = notebookEditorService.listNotebookEditors().find(widget => widget.hasModel() && widget.textModel.uri.toString() === uri.toString());
    if (widget && widget.hasModel()) {
        return widget;
    }
    return undefined;
}
export function getContextFromUri(accessor, context) {
    const uri = URI.revive(context);
    if (uri) {
        const widget = getWidgetFromUri(accessor, uri);
        if (widget) {
            return {
                notebookEditor: widget,
            };
        }
    }
    return undefined;
}
export function findTargetCellEditor(context, targetCell) {
    let foundEditor = undefined;
    for (const [, codeEditor] of context.notebookEditor.codeEditors) {
        if (isEqual(codeEditor.getModel()?.uri, targetCell.uri)) {
            foundEditor = codeEditor;
            break;
        }
    }
    return foundEditor;
}
export class NotebookAction extends Action2 {
    constructor(desc) {
        if (desc.f1 !== false) {
            desc.f1 = false;
            const f1Menu = {
                id: MenuId.CommandPalette,
                when: ContextKeyExpr.or(NOTEBOOK_IS_ACTIVE_EDITOR, IS_COMPOSITE_NOTEBOOK)
            };
            if (!desc.menu) {
                desc.menu = [];
            }
            else if (!Array.isArray(desc.menu)) {
                desc.menu = [desc.menu];
            }
            desc.menu = [
                ...desc.menu,
                f1Menu
            ];
        }
        desc.category = NOTEBOOK_ACTIONS_CATEGORY;
        super(desc);
    }
    async run(accessor, context, ...additionalArgs) {
        sendEntryTelemetry(accessor, this.desc.id, context);
        if (!this.isNotebookActionContext(context)) {
            context = this.getEditorContextFromArgsOrActive(accessor, context, ...additionalArgs);
            if (!context) {
                return;
            }
        }
        return this.runWithContext(accessor, context);
    }
    isNotebookActionContext(context) {
        return !!context && !!context.notebookEditor;
    }
    getEditorContextFromArgsOrActive(accessor, context, ...additionalArgs) {
        return getContextFromActiveEditor(accessor.get(IEditorService));
    }
}
export class NotebookMultiCellAction extends Action2 {
    constructor(desc) {
        if (desc.f1 !== false) {
            desc.f1 = false;
            const f1Menu = {
                id: MenuId.CommandPalette,
                when: NOTEBOOK_IS_ACTIVE_EDITOR
            };
            if (!desc.menu) {
                desc.menu = [];
            }
            else if (!Array.isArray(desc.menu)) {
                desc.menu = [desc.menu];
            }
            desc.menu = [
                ...desc.menu,
                f1Menu
            ];
        }
        desc.category = NOTEBOOK_ACTIONS_CATEGORY;
        super(desc);
    }
    parseArgs(accessor, ...args) {
        return undefined;
    }
    async run(accessor, ...additionalArgs) {
        const context = additionalArgs[0];
        sendEntryTelemetry(accessor, this.desc.id, context);
        const isFromCellToolbar = isCellToolbarContext(context);
        if (isFromCellToolbar) {
            return this.runWithContext(accessor, context);
        }
        const parsedArgs = this.parseArgs(accessor, ...additionalArgs);
        if (parsedArgs) {
            return this.runWithContext(accessor, parsedArgs);
        }
        const editor = getEditorFromArgsOrActivePane(accessor);
        if (editor) {
            const selectedCellRange = editor.getSelections().length === 0 ? [editor.getFocus()] : editor.getSelections();
            return this.runWithContext(accessor, {
                ui: false,
                notebookEditor: editor,
                selectedCells: cellRangeToViewCells(editor, selectedCellRange)
            });
        }
    }
}
export class NotebookCellAction extends NotebookAction {
    isCellActionContext(context) {
        return !!context && !!context.notebookEditor && !!context.cell;
    }
    getCellContextFromArgs(accessor, context, ...additionalArgs) {
        return undefined;
    }
    async run(accessor, context, ...additionalArgs) {
        sendEntryTelemetry(accessor, this.desc.id, context);
        if (this.isCellActionContext(context)) {
            return this.runWithContext(accessor, context);
        }
        const contextFromArgs = this.getCellContextFromArgs(accessor, context, ...additionalArgs);
        if (contextFromArgs) {
            return this.runWithContext(accessor, contextFromArgs);
        }
        const activeEditorContext = this.getEditorContextFromArgsOrActive(accessor);
        if (this.isCellActionContext(activeEditorContext)) {
            return this.runWithContext(accessor, activeEditorContext);
        }
    }
}
export const executeNotebookCondition = ContextKeyExpr.or(ContextKeyExpr.greater(NOTEBOOK_KERNEL_COUNT.key, 0), ContextKeyExpr.greater(NOTEBOOK_KERNEL_SOURCE_COUNT.key, 0));
function sendEntryTelemetry(accessor, id, context) {
    if (context) {
        const telemetryService = accessor.get(ITelemetryService);
        if (context.source) {
            telemetryService.publicLog2('workbenchActionExecuted', { id: id, from: context.source });
        }
        else if (URI.isUri(context)) {
            telemetryService.publicLog2('workbenchActionExecuted', { id: id, from: 'cellEditorContextMenu' });
        }
        else if (context && 'from' in context && context.from === 'cellContainer') {
            telemetryService.publicLog2('workbenchActionExecuted', { id: id, from: 'cellContainer' });
        }
        else {
            const from = isCellToolbarContext(context) ? 'cellToolbar' : (isEditorCommandsContext(context) ? 'editorToolbar' : 'other');
            telemetryService.publicLog2('workbenchActionExecuted', { id: id, from: from });
        }
    }
}
function isCellToolbarContext(context) {
    return !!context && !!context.notebookEditor && context.$mid === 13;
}
function isMultiCellArgs(arg) {
    if (arg === undefined) {
        return false;
    }
    const ranges = arg.ranges;
    if (!ranges) {
        return false;
    }
    if (!Array.isArray(ranges) || ranges.some(range => !isICellRange(range))) {
        return false;
    }
    if (arg.document) {
        const uri = URI.revive(arg.document);
        if (!uri) {
            return false;
        }
    }
    return true;
}
export function getEditorFromArgsOrActivePane(accessor, context) {
    const editorFromUri = getContextFromUri(accessor, context)?.notebookEditor;
    if (editorFromUri) {
        return editorFromUri;
    }
    const editor = getNotebookEditorFromEditorPane(accessor.get(IEditorService).activeEditorPane);
    if (!editor || !editor.hasModel()) {
        return;
    }
    return editor;
}
export function parseMultiCellExecutionArgs(accessor, ...args) {
    const firstArg = args[0];
    if (isMultiCellArgs(firstArg)) {
        const editor = getEditorFromArgsOrActivePane(accessor, firstArg.document);
        if (!editor) {
            return;
        }
        const ranges = firstArg.ranges;
        const selectedCells = ranges.map(range => editor.getCellsInRange(range).slice(0)).flat();
        const autoReveal = firstArg.autoReveal;
        return {
            ui: false,
            notebookEditor: editor,
            selectedCells,
            autoReveal
        };
    }
    if (isICellRange(firstArg)) {
        const secondArg = args[1];
        const editor = getEditorFromArgsOrActivePane(accessor, secondArg);
        if (!editor) {
            return;
        }
        return {
            ui: false,
            notebookEditor: editor,
            selectedCells: editor.getCellsInRange(firstArg)
        };
    }
    const context = getContextFromActiveEditor(accessor.get(IEditorService));
    return context ? {
        ui: false,
        notebookEditor: context.notebookEditor,
        selectedCells: context.selectedCells ?? [],
        cell: context.cell
    } : undefined;
}
export const cellExecutionArgs = [
    {
        isOptional: true,
        name: 'options',
        description: 'The cell range options',
        schema: {
            'type': 'object',
            'required': ['ranges'],
            'properties': {
                'ranges': {
                    'type': 'array',
                    items: [
                        {
                            'type': 'object',
                            'required': ['start', 'end'],
                            'properties': {
                                'start': {
                                    'type': 'number'
                                },
                                'end': {
                                    'type': 'number'
                                }
                            }
                        }
                    ]
                },
                'document': {
                    'type': 'object',
                    'description': 'The document uri',
                },
                'autoReveal': {
                    'type': 'boolean',
                    'description': 'Whether the cell should be revealed into view automatically'
                }
            }
        }
    }
];
MenuRegistry.appendMenuItem(MenuId.NotebookCellTitle, {
    submenu: MenuId.NotebookCellInsert,
    title: localize('notebookMenu.insertCell', "Insert Cell"),
    group: "2_insert",
    when: NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true)
});
MenuRegistry.appendMenuItem(MenuId.EditorContext, {
    submenu: MenuId.NotebookCellTitle,
    title: localize('notebookMenu.cellTitle', "Notebook Cell"),
    group: "2_insert",
    when: NOTEBOOK_EDITOR_FOCUSED
});
MenuRegistry.appendMenuItem(MenuId.NotebookCellTitle, {
    title: localize('miShare', "Share"),
    submenu: MenuId.EditorContextShare,
    group: "4_share"
});
