import { IKeybindingService } from '../../../../../../platform/keybinding/common/keybinding.js';
import { INotebookEditor } from '../../notebookBrowser.js';
import { CellContentPart } from '../cellPart.js';
export declare class CollapsedCellOutput extends CellContentPart {
    private readonly notebookEditor;
    constructor(notebookEditor: INotebookEditor, cellOutputCollapseContainer: HTMLElement, keybindingService: IKeybindingService);
    private expand;
}
