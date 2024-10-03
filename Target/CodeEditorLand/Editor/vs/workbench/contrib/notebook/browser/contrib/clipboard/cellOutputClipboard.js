import { isTextStreamMime } from '../../../common/notebookCommon.js';
export async function copyCellOutput(mimeType, outputViewModel, clipboardService, logService) {
    const cellOutput = outputViewModel.model;
    const output = mimeType && TEXT_BASED_MIMETYPES.includes(mimeType) ?
        cellOutput.outputs.find(output => output.mime === mimeType) :
        cellOutput.outputs.find(output => TEXT_BASED_MIMETYPES.includes(output.mime));
    mimeType = output?.mime;
    if (!mimeType || !output) {
        return;
    }
    const decoder = new TextDecoder();
    let text = decoder.decode(output.data.buffer);
    if (isTextStreamMime(mimeType)) {
        const cellViewModel = outputViewModel.cellViewModel;
        let index = cellViewModel.outputsViewModels.indexOf(outputViewModel) + 1;
        while (index < cellViewModel.model.outputs.length) {
            const nextCellOutput = cellViewModel.model.outputs[index];
            const nextOutput = nextCellOutput.outputs.find(output => isTextStreamMime(output.mime));
            if (!nextOutput) {
                break;
            }
            text = text + decoder.decode(nextOutput.data.buffer);
            index = index + 1;
        }
    }
    if (mimeType.endsWith('error')) {
        text = text.replace(/\\u001b\[[0-9;]*m/gi, '').replaceAll('\\n', '\n');
    }
    try {
        await clipboardService.writeText(text);
    }
    catch (e) {
        logService.error(`Failed to copy content: ${e}`);
    }
}
export const TEXT_BASED_MIMETYPES = [
    'text/latex',
    'text/html',
    'application/vnd.code.notebook.error',
    'application/vnd.code.notebook.stdout',
    'application/x.notebook.stdout',
    'application/x.notebook.stream',
    'application/vnd.code.notebook.stderr',
    'application/x.notebook.stderr',
    'text/plain',
    'text/markdown',
    'application/json'
];
