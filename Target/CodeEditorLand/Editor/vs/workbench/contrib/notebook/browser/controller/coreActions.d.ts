import { UriComponents } from '../../../../../base/common/uri.js';
import { Action2, IAction2Options } from '../../../../../platform/actions/common/actions.js';
import { ServicesAccessor } from '../../../../../platform/instantiation/common/instantiation.js';
import { KeybindingWeight } from '../../../../../platform/keybinding/common/keybindingsRegistry.js';
import { IActiveNotebookEditor, ICellViewModel, ICellOutputViewModel } from '../notebookBrowser.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { TypeConstraint } from '../../../../../base/common/types.js';
import { IJSONSchema } from '../../../../../base/common/jsonSchema.js';
import { ICodeEditor } from '../../../../../editor/browser/editorBrowser.js';
export declare const SELECT_KERNEL_ID = "_notebook.selectKernel";
export declare const NOTEBOOK_ACTIONS_CATEGORY: import("../../../../../nls.js").ILocalizedString;
export declare const CELL_TITLE_CELL_GROUP_ID = "inline/cell";
export declare const CELL_TITLE_OUTPUT_GROUP_ID = "inline/output";
export declare const NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT = KeybindingWeight.EditorContrib;
export declare const NOTEBOOK_OUTPUT_WEBVIEW_ACTION_WEIGHT: number;
export declare const enum CellToolbarOrder {
    EditCell = 0,
    ExecuteAboveCells = 1,
    ExecuteCellAndBelow = 2,
    SaveCell = 3,
    SplitCell = 4,
    ClearCellOutput = 5
}
export declare const enum CellOverflowToolbarGroups {
    Copy = "1_copy",
    Insert = "2_insert",
    Edit = "3_edit",
    Share = "4_share"
}
export interface INotebookActionContext {
    readonly cell?: ICellViewModel;
    readonly notebookEditor: IActiveNotebookEditor;
    readonly ui?: boolean;
    readonly selectedCells?: readonly ICellViewModel[];
    readonly autoReveal?: boolean;
}
export interface INotebookCellToolbarActionContext extends INotebookActionContext {
    readonly ui: true;
    readonly cell: ICellViewModel;
}
export interface INotebookCommandContext extends INotebookActionContext {
    readonly ui: false;
    readonly selectedCells: readonly ICellViewModel[];
}
export interface INotebookCellActionContext extends INotebookActionContext {
    cell: ICellViewModel;
}
export interface INotebookOutputActionContext extends INotebookCellActionContext {
    outputViewModel: ICellOutputViewModel;
}
export declare function getContextFromActiveEditor(editorService: IEditorService): INotebookActionContext | undefined;
export declare function getContextFromUri(accessor: ServicesAccessor, context?: any): {
    notebookEditor: IActiveNotebookEditor;
} | undefined;
export declare function findTargetCellEditor(context: INotebookCellActionContext, targetCell: ICellViewModel): ICodeEditor | undefined;
export declare abstract class NotebookAction extends Action2 {
    constructor(desc: IAction2Options);
    run(accessor: ServicesAccessor, context?: any, ...additionalArgs: any[]): Promise<void>;
    abstract runWithContext(accessor: ServicesAccessor, context: INotebookActionContext): Promise<void>;
    private isNotebookActionContext;
    getEditorContextFromArgsOrActive(accessor: ServicesAccessor, context?: any, ...additionalArgs: any[]): INotebookActionContext | undefined;
}
export declare abstract class NotebookMultiCellAction extends Action2 {
    constructor(desc: IAction2Options);
    parseArgs(accessor: ServicesAccessor, ...args: any[]): INotebookCommandContext | undefined;
    abstract runWithContext(accessor: ServicesAccessor, context: INotebookCommandContext | INotebookCellToolbarActionContext): Promise<void>;
    run(accessor: ServicesAccessor, ...additionalArgs: any[]): Promise<void>;
}
export declare abstract class NotebookCellAction<T = INotebookCellActionContext> extends NotebookAction {
    protected isCellActionContext(context?: unknown): context is INotebookCellActionContext;
    protected getCellContextFromArgs(accessor: ServicesAccessor, context?: T, ...additionalArgs: any[]): INotebookCellActionContext | undefined;
    run(accessor: ServicesAccessor, context?: INotebookCellActionContext, ...additionalArgs: any[]): Promise<void>;
    abstract runWithContext(accessor: ServicesAccessor, context: INotebookCellActionContext): Promise<void>;
}
export declare const executeNotebookCondition: import("../../../../../platform/contextkey/common/contextkey.js").ContextKeyExpression | undefined;
export declare function getEditorFromArgsOrActivePane(accessor: ServicesAccessor, context?: UriComponents): IActiveNotebookEditor | undefined;
export declare function parseMultiCellExecutionArgs(accessor: ServicesAccessor, ...args: any[]): INotebookCommandContext | undefined;
export declare const cellExecutionArgs: ReadonlyArray<{
    readonly name: string;
    readonly isOptional?: boolean;
    readonly description?: string;
    readonly constraint?: TypeConstraint;
    readonly schema?: IJSONSchema;
}>;
