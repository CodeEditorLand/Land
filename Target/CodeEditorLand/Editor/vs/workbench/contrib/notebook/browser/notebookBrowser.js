import { NOTEBOOK_EDITOR_ID } from '../common/notebookCommon.js';
import { isCompositeNotebookEditorInput } from '../common/notebookEditorInput.js';
import { cellRangesToIndexes, reduceCellRanges } from '../common/notebookRange.js';
export const EXPAND_CELL_INPUT_COMMAND_ID = 'notebook.cell.expandCellInput';
export const EXECUTE_CELL_COMMAND_ID = 'notebook.cell.execute';
export const DETECT_CELL_LANGUAGE = 'notebook.cell.detectLanguage';
export const CHANGE_CELL_LANGUAGE = 'notebook.cell.changeLanguage';
export const QUIT_EDIT_CELL_COMMAND_ID = 'notebook.cell.quitEdit';
export const EXPAND_CELL_OUTPUT_COMMAND_ID = 'notebook.cell.expandCellOutput';
export const IPYNB_VIEW_TYPE = 'jupyter-notebook';
export const JUPYTER_EXTENSION_ID = 'ms-toolsai.jupyter';
export const KERNEL_EXTENSIONS = new Map([
    [IPYNB_VIEW_TYPE, JUPYTER_EXTENSION_ID],
]);
export const KERNEL_RECOMMENDATIONS = new Map();
KERNEL_RECOMMENDATIONS.set(IPYNB_VIEW_TYPE, new Map());
KERNEL_RECOMMENDATIONS.get(IPYNB_VIEW_TYPE)?.set('python', {
    extensionIds: [
        'ms-python.python',
        JUPYTER_EXTENSION_ID
    ],
    displayName: 'Python + Jupyter',
});
export var ScrollToRevealBehavior;
(function (ScrollToRevealBehavior) {
    ScrollToRevealBehavior[ScrollToRevealBehavior["fullCell"] = 0] = "fullCell";
    ScrollToRevealBehavior[ScrollToRevealBehavior["firstLine"] = 1] = "firstLine";
})(ScrollToRevealBehavior || (ScrollToRevealBehavior = {}));
export var CellLayoutState;
(function (CellLayoutState) {
    CellLayoutState[CellLayoutState["Uninitialized"] = 0] = "Uninitialized";
    CellLayoutState[CellLayoutState["Estimated"] = 1] = "Estimated";
    CellLayoutState[CellLayoutState["FromCache"] = 2] = "FromCache";
    CellLayoutState[CellLayoutState["Measured"] = 3] = "Measured";
})(CellLayoutState || (CellLayoutState = {}));
export var CellLayoutContext;
(function (CellLayoutContext) {
    CellLayoutContext[CellLayoutContext["Fold"] = 0] = "Fold";
})(CellLayoutContext || (CellLayoutContext = {}));
export var NotebookOverviewRulerLane;
(function (NotebookOverviewRulerLane) {
    NotebookOverviewRulerLane[NotebookOverviewRulerLane["Left"] = 1] = "Left";
    NotebookOverviewRulerLane[NotebookOverviewRulerLane["Center"] = 2] = "Center";
    NotebookOverviewRulerLane[NotebookOverviewRulerLane["Right"] = 4] = "Right";
    NotebookOverviewRulerLane[NotebookOverviewRulerLane["Full"] = 7] = "Full";
})(NotebookOverviewRulerLane || (NotebookOverviewRulerLane = {}));
export var CellRevealRangeType;
(function (CellRevealRangeType) {
    CellRevealRangeType[CellRevealRangeType["Default"] = 1] = "Default";
    CellRevealRangeType[CellRevealRangeType["Center"] = 2] = "Center";
    CellRevealRangeType[CellRevealRangeType["CenterIfOutsideViewport"] = 3] = "CenterIfOutsideViewport";
})(CellRevealRangeType || (CellRevealRangeType = {}));
export var CellEditState;
(function (CellEditState) {
    CellEditState[CellEditState["Preview"] = 0] = "Preview";
    CellEditState[CellEditState["Editing"] = 1] = "Editing";
})(CellEditState || (CellEditState = {}));
export var CellFocusMode;
(function (CellFocusMode) {
    CellFocusMode[CellFocusMode["Container"] = 0] = "Container";
    CellFocusMode[CellFocusMode["Editor"] = 1] = "Editor";
    CellFocusMode[CellFocusMode["Output"] = 2] = "Output";
    CellFocusMode[CellFocusMode["ChatInput"] = 3] = "ChatInput";
})(CellFocusMode || (CellFocusMode = {}));
export var CursorAtBoundary;
(function (CursorAtBoundary) {
    CursorAtBoundary[CursorAtBoundary["None"] = 0] = "None";
    CursorAtBoundary[CursorAtBoundary["Top"] = 1] = "Top";
    CursorAtBoundary[CursorAtBoundary["Bottom"] = 2] = "Bottom";
    CursorAtBoundary[CursorAtBoundary["Both"] = 3] = "Both";
})(CursorAtBoundary || (CursorAtBoundary = {}));
export var CursorAtLineBoundary;
(function (CursorAtLineBoundary) {
    CursorAtLineBoundary[CursorAtLineBoundary["None"] = 0] = "None";
    CursorAtLineBoundary[CursorAtLineBoundary["Start"] = 1] = "Start";
    CursorAtLineBoundary[CursorAtLineBoundary["End"] = 2] = "End";
    CursorAtLineBoundary[CursorAtLineBoundary["Both"] = 3] = "Both";
})(CursorAtLineBoundary || (CursorAtLineBoundary = {}));
export function getNotebookEditorFromEditorPane(editorPane) {
    if (!editorPane) {
        return;
    }
    if (editorPane.getId() === NOTEBOOK_EDITOR_ID) {
        return editorPane.getControl();
    }
    const input = editorPane.input;
    const isCompositeNotebook = input && isCompositeNotebookEditorInput(input);
    if (isCompositeNotebook) {
        return editorPane.getControl()?.notebookEditor;
    }
    return undefined;
}
export function expandCellRangesWithHiddenCells(editor, ranges) {
    const indexes = cellRangesToIndexes(ranges);
    const modelRanges = [];
    indexes.forEach(index => {
        const viewCell = editor.cellAt(index);
        if (!viewCell) {
            return;
        }
        const viewIndex = editor.getViewIndexByModelIndex(index);
        if (viewIndex < 0) {
            return;
        }
        const nextViewIndex = viewIndex + 1;
        const range = editor.getCellRangeFromViewRange(viewIndex, nextViewIndex);
        if (range) {
            modelRanges.push(range);
        }
    });
    return reduceCellRanges(modelRanges);
}
export function cellRangeToViewCells(editor, ranges) {
    const cells = [];
    reduceCellRanges(ranges).forEach(range => {
        cells.push(...editor.getCellsInRange(range));
    });
    return cells;
}
