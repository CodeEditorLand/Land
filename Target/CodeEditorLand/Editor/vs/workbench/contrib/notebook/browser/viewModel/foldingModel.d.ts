import { Event } from '../../../../../base/common/event.js';
import { IDisposable } from '../../../../../base/common/lifecycle.js';
import { FoldingRegion, FoldingRegions } from '../../../../../editor/contrib/folding/browser/foldingRanges.js';
import { INotebookViewModel } from '../notebookBrowser.js';
import { ICellRange } from '../../common/notebookRange.js';
type RegionFilter = (r: FoldingRegion) => boolean;
type RegionFilterWithLevel = (r: FoldingRegion, level: number) => boolean;
export declare class FoldingModel implements IDisposable {
    private _viewModel;
    private readonly _viewModelStore;
    private _regions;
    get regions(): FoldingRegions;
    private readonly _onDidFoldingRegionChanges;
    readonly onDidFoldingRegionChanged: Event<void>;
    private _foldingRangeDecorationIds;
    constructor();
    dispose(): void;
    detachViewModel(): void;
    attachViewModel(model: INotebookViewModel): void;
    getRegionAtLine(lineNumber: number): FoldingRegion | null;
    getRegionsInside(region: FoldingRegion | null, filter?: RegionFilter | RegionFilterWithLevel): FoldingRegion[];
    getAllRegionsAtLine(lineNumber: number, filter?: (r: FoldingRegion, level: number) => boolean): FoldingRegion[];
    setCollapsed(index: number, newState: boolean): void;
    recompute(): void;
    getMemento(): ICellRange[];
    applyMemento(state: ICellRange[]): boolean;
}
export declare function updateFoldingStateAtIndex(foldingModel: FoldingModel, index: number, collapsed: boolean): void;
export declare function getMarkdownHeadersInCell(cellContent: string): Iterable<{
    readonly depth: number;
    readonly text: string;
}>;
export {};
