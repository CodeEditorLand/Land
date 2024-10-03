import * as extHostProtocol from '../common/extHost.protocol.js';
import * as notebookCommon from '../../contrib/notebook/common/notebookCommon.js';
import { ICellExecuteUpdate, ICellExecutionComplete } from '../../contrib/notebook/common/notebookExecutionStateService.js';
export declare namespace NotebookDto {
    function toNotebookOutputItemDto(item: notebookCommon.IOutputItemDto): extHostProtocol.NotebookOutputItemDto;
    function toNotebookOutputDto(output: notebookCommon.IOutputDto): extHostProtocol.NotebookOutputDto;
    function toNotebookCellDataDto(cell: notebookCommon.ICellDto2): extHostProtocol.NotebookCellDataDto;
    function toNotebookDataDto(data: notebookCommon.NotebookData): extHostProtocol.NotebookDataDto;
    function fromNotebookOutputItemDto(item: extHostProtocol.NotebookOutputItemDto): notebookCommon.IOutputItemDto;
    function fromNotebookOutputDto(output: extHostProtocol.NotebookOutputDto): notebookCommon.IOutputDto;
    function fromNotebookCellDataDto(cell: extHostProtocol.NotebookCellDataDto): notebookCommon.ICellDto2;
    function fromNotebookDataDto(data: extHostProtocol.NotebookDataDto): notebookCommon.NotebookData;
    function toNotebookCellDto(cell: notebookCommon.ICell): extHostProtocol.NotebookCellDto;
    function fromCellExecuteUpdateDto(data: extHostProtocol.ICellExecuteUpdateDto): ICellExecuteUpdate;
    function fromCellExecuteCompleteDto(data: extHostProtocol.ICellExecutionCompleteDto): ICellExecutionComplete;
    function fromCellEditOperationDto(edit: extHostProtocol.ICellEditOperationDto): notebookCommon.ICellEditOperation;
}
