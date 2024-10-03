import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
export var CellExecutionUpdateType;
(function (CellExecutionUpdateType) {
    CellExecutionUpdateType[CellExecutionUpdateType["Output"] = 1] = "Output";
    CellExecutionUpdateType[CellExecutionUpdateType["OutputItems"] = 2] = "OutputItems";
    CellExecutionUpdateType[CellExecutionUpdateType["ExecutionState"] = 3] = "ExecutionState";
})(CellExecutionUpdateType || (CellExecutionUpdateType = {}));
export const INotebookExecutionService = createDecorator('INotebookExecutionService');
