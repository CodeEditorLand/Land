import { CellExecutionUpdateType } from '../../contrib/notebook/common/notebookExecutionService.js';
export var NotebookDto;
(function (NotebookDto) {
    function toNotebookOutputItemDto(item) {
        return {
            mime: item.mime,
            valueBytes: item.data
        };
    }
    NotebookDto.toNotebookOutputItemDto = toNotebookOutputItemDto;
    function toNotebookOutputDto(output) {
        return {
            outputId: output.outputId,
            metadata: output.metadata,
            items: output.outputs.map(toNotebookOutputItemDto)
        };
    }
    NotebookDto.toNotebookOutputDto = toNotebookOutputDto;
    function toNotebookCellDataDto(cell) {
        return {
            cellKind: cell.cellKind,
            language: cell.language,
            mime: cell.mime,
            source: cell.source,
            internalMetadata: cell.internalMetadata,
            metadata: cell.metadata,
            outputs: cell.outputs.map(toNotebookOutputDto)
        };
    }
    NotebookDto.toNotebookCellDataDto = toNotebookCellDataDto;
    function toNotebookDataDto(data) {
        return {
            metadata: data.metadata,
            cells: data.cells.map(toNotebookCellDataDto)
        };
    }
    NotebookDto.toNotebookDataDto = toNotebookDataDto;
    function fromNotebookOutputItemDto(item) {
        return {
            mime: item.mime,
            data: item.valueBytes
        };
    }
    NotebookDto.fromNotebookOutputItemDto = fromNotebookOutputItemDto;
    function fromNotebookOutputDto(output) {
        return {
            outputId: output.outputId,
            metadata: output.metadata,
            outputs: output.items.map(fromNotebookOutputItemDto)
        };
    }
    NotebookDto.fromNotebookOutputDto = fromNotebookOutputDto;
    function fromNotebookCellDataDto(cell) {
        return {
            cellKind: cell.cellKind,
            language: cell.language,
            mime: cell.mime,
            source: cell.source,
            outputs: cell.outputs.map(fromNotebookOutputDto),
            metadata: cell.metadata,
            internalMetadata: cell.internalMetadata
        };
    }
    NotebookDto.fromNotebookCellDataDto = fromNotebookCellDataDto;
    function fromNotebookDataDto(data) {
        return {
            metadata: data.metadata,
            cells: data.cells.map(fromNotebookCellDataDto)
        };
    }
    NotebookDto.fromNotebookDataDto = fromNotebookDataDto;
    function toNotebookCellDto(cell) {
        return {
            handle: cell.handle,
            uri: cell.uri,
            source: cell.textBuffer.getLinesContent(),
            eol: cell.textBuffer.getEOL(),
            language: cell.language,
            cellKind: cell.cellKind,
            outputs: cell.outputs.map(toNotebookOutputDto),
            metadata: cell.metadata,
            internalMetadata: cell.internalMetadata,
        };
    }
    NotebookDto.toNotebookCellDto = toNotebookCellDto;
    function fromCellExecuteUpdateDto(data) {
        if (data.editType === CellExecutionUpdateType.Output) {
            return {
                editType: data.editType,
                cellHandle: data.cellHandle,
                append: data.append,
                outputs: data.outputs.map(fromNotebookOutputDto)
            };
        }
        else if (data.editType === CellExecutionUpdateType.OutputItems) {
            return {
                editType: data.editType,
                append: data.append,
                outputId: data.outputId,
                items: data.items.map(fromNotebookOutputItemDto)
            };
        }
        else {
            return data;
        }
    }
    NotebookDto.fromCellExecuteUpdateDto = fromCellExecuteUpdateDto;
    function fromCellExecuteCompleteDto(data) {
        return data;
    }
    NotebookDto.fromCellExecuteCompleteDto = fromCellExecuteCompleteDto;
    function fromCellEditOperationDto(edit) {
        if (edit.editType === 1) {
            return {
                editType: edit.editType,
                index: edit.index,
                count: edit.count,
                cells: edit.cells.map(fromNotebookCellDataDto)
            };
        }
        else {
            return edit;
        }
    }
    NotebookDto.fromCellEditOperationDto = fromCellEditOperationDto;
})(NotebookDto || (NotebookDto = {}));
