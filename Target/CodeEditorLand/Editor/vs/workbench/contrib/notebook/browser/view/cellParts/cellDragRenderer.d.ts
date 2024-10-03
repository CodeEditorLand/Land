import { ICodeEditor } from '../../../../../../editor/browser/editorBrowser.js';
import { BaseCellRenderTemplate } from '../notebookRenderingCommon.js';
export declare class CodeCellDragImageRenderer {
    getDragImage(templateData: BaseCellRenderTemplate, editor: ICodeEditor, type: 'code' | 'markdown'): HTMLElement;
    private getDragImageImpl;
}
