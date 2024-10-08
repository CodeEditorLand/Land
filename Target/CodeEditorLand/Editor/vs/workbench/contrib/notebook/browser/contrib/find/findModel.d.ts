import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { Range } from '../../../../../../editor/common/core/range.js';
import { FindMatch } from '../../../../../../editor/common/model.js';
import { PrefixSumComputer } from '../../../../../../editor/common/model/prefixSumComputer.js';
import { FindReplaceState } from '../../../../../../editor/contrib/find/browser/findState.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { NotebookFindFilters } from './findFilters.js';
import { CellFindMatchWithIndex, CellWebviewFindMatch, ICellViewModel, INotebookEditor } from '../../notebookBrowser.js';
export declare class CellFindMatchModel implements CellFindMatchWithIndex {
    readonly cell: ICellViewModel;
    readonly index: number;
    private _contentMatches;
    private _webviewMatches;
    get length(): number;
    get contentMatches(): FindMatch[];
    get webviewMatches(): CellWebviewFindMatch[];
    constructor(cell: ICellViewModel, index: number, contentMatches: FindMatch[], webviewMatches: CellWebviewFindMatch[]);
    getMatch(index: number): FindMatch | CellWebviewFindMatch | undefined;
}
export declare class FindModel extends Disposable {
    private readonly _notebookEditor;
    private readonly _state;
    private readonly _configurationService;
    private _findMatches;
    protected _findMatchesStarts: PrefixSumComputer | null;
    private _currentMatch;
    private readonly _throttledDelayer;
    private _computePromise;
    private readonly _modelDisposable;
    private _findMatchDecorationModel;
    get findMatches(): CellFindMatchWithIndex[];
    get currentMatch(): number;
    constructor(_notebookEditor: INotebookEditor, _state: FindReplaceState<NotebookFindFilters>, _configurationService: IConfigurationService);
    private _updateCellStates;
    ensureFindMatches(): void;
    getCurrentMatch(): {
        cell: ICellViewModel;
        match: FindMatch | CellWebviewFindMatch;
        isModelMatch: boolean;
    };
    refreshCurrentMatch(focus: {
        cell: ICellViewModel;
        range: Range;
    }): void;
    find(option: {
        previous: boolean;
    } | {
        index: number;
    }): void;
    private revealCellRange;
    private _registerModelListener;
    research(): Promise<void>;
    _research(): Promise<void>;
    private set;
    private _compute;
    private _updateCurrentMatch;
    private _matchesCountBeforeIndex;
    private constructFindMatchesStarts;
    private highlightCurrentFindMatchDecoration;
    clear(): void;
    dispose(): void;
}
