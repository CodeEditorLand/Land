import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { Range } from '../../../../../../editor/common/core/range.js';
import { CellFindMatchWithIndex, ICellModelDecorations, ICellViewModel, INotebookEditor } from '../../notebookBrowser.js';
export declare class FindMatchDecorationModel extends Disposable {
    private readonly _notebookEditor;
    private readonly ownerID;
    private _allMatchesDecorations;
    private _currentMatchCellDecorations;
    private _allMatchesCellDecorations;
    private _currentMatchDecorations;
    constructor(_notebookEditor: INotebookEditor, ownerID: string);
    get currentMatchDecorations(): {
        kind: "input";
        decorations: ICellModelDecorations[];
    } | {
        kind: "output";
        index: number;
    } | null;
    private clearDecorations;
    highlightCurrentFindMatchDecorationInCell(cell: ICellViewModel, cellRange: Range): Promise<number | null>;
    highlightCurrentFindMatchDecorationInWebview(cell: ICellViewModel, index: number): Promise<number | null>;
    clearCurrentFindMatchDecoration(): void;
    setAllFindMatchesDecorations(cellFindMatches: CellFindMatchWithIndex[]): void;
    stopWebviewFind(): void;
    dispose(): void;
}
