import { ThemeIcon } from '../../../../../base/common/themables.js';
import { IMarkerService, MarkerSeverity } from '../../../../../platform/markers/common/markers.js';
import { ICellViewModel } from '../notebookBrowser.js';
import { IRange } from '../../../../../editor/common/core/range.js';
import { SymbolKind } from '../../../../../editor/common/languages.js';
export interface IOutlineMarkerInfo {
    readonly count: number;
    readonly topSev: MarkerSeverity;
}
export declare class OutlineEntry {
    readonly index: number;
    readonly level: number;
    readonly cell: ICellViewModel;
    readonly label: string;
    readonly isExecuting: boolean;
    readonly isPaused: boolean;
    readonly range?: IRange | undefined;
    readonly symbolKind?: SymbolKind | undefined;
    private _children;
    private _parent;
    private _markerInfo;
    get icon(): ThemeIcon;
    constructor(index: number, level: number, cell: ICellViewModel, label: string, isExecuting: boolean, isPaused: boolean, range?: IRange | undefined, symbolKind?: SymbolKind | undefined);
    addChild(entry: OutlineEntry): void;
    get parent(): OutlineEntry | undefined;
    get children(): Iterable<OutlineEntry>;
    get markerInfo(): IOutlineMarkerInfo | undefined;
    get position(): {
        startLineNumber: number;
        startColumn: number;
    } | undefined;
    updateMarkers(markerService: IMarkerService): void;
    clearMarkers(): void;
    find(cell: ICellViewModel, parents: OutlineEntry[]): OutlineEntry | undefined;
    asFlatList(bucket: OutlineEntry[]): void;
}
