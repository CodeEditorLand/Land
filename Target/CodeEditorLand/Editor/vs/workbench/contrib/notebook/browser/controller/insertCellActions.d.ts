import { IAction2Options } from '../../../../../platform/actions/common/actions.js';
import { ServicesAccessor } from '../../../../../platform/instantiation/common/instantiation.js';
import { INotebookActionContext, NotebookAction } from './coreActions.js';
import { CellViewModel } from '../viewModel/notebookViewModelImpl.js';
import { CellKind } from '../../common/notebookCommon.js';
export declare function insertNewCell(accessor: ServicesAccessor, context: INotebookActionContext, kind: CellKind, direction: 'above' | 'below', focusEditor: boolean): CellViewModel | null;
export declare abstract class InsertCellCommand extends NotebookAction {
    private kind;
    private direction;
    private focusEditor;
    constructor(desc: Readonly<IAction2Options>, kind: CellKind, direction: 'above' | 'below', focusEditor: boolean);
    runWithContext(accessor: ServicesAccessor, context: INotebookActionContext): Promise<void>;
}
