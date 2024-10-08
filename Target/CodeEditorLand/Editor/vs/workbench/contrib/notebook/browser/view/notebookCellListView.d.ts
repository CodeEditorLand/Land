import { IRange } from '../../../../../base/common/range.js';
import { ListView } from '../../../../../base/browser/ui/list/listView.js';
import { IItem, IRangeMap } from '../../../../../base/browser/ui/list/rangeMap.js';
import { ConstantTimePrefixSumComputer } from '../../../../../editor/common/model/prefixSumComputer.js';
export interface IWhitespace {
    id: string;
    /**
     * To insert whitespace before the first item, use afterPosition 0.
     * In other cases, afterPosition is 1-based.
     */
    afterPosition: number;
    size: number;
    priority: number;
}
export declare class NotebookCellsLayout implements IRangeMap {
    private _items;
    private _whitespace;
    protected _prefixSumComputer: ConstantTimePrefixSumComputer;
    private _size;
    private _paddingTop;
    get paddingTop(): number;
    set paddingTop(paddingTop: number);
    get count(): number;
    /**
     * Returns the sum of the sizes of all items in the range map.
     */
    get size(): number;
    constructor(topPadding?: number);
    getWhitespaces(): IWhitespace[];
    restoreWhitespace(items: IWhitespace[]): void;
    /**
     */
    splice(index: number, deleteCount: number, items?: IItem[] | undefined): void;
    insertWhitespace(id: string, afterPosition: number, size: number): void;
    changeOneWhitespace(id: string, afterPosition: number, size: number): void;
    removeWhitespace(id: string): void;
    /**
     * find position of whitespace
     * @param id: id of the whitespace
     * @returns: position in the list view
     */
    getWhitespacePosition(id: string): number;
    indexAt(position: number): number;
    indexAfter(position: number): number;
    positionAt(index: number): number;
}
export declare class NotebookCellListView<T> extends ListView<T> {
    private _lastWhitespaceId;
    private _renderingStack;
    get inRenderingTransaction(): boolean;
    get notebookRangeMap(): NotebookCellsLayout;
    protected render(previousRenderRange: IRange, renderTop: number, renderHeight: number, renderLeft: number | undefined, scrollWidth: number | undefined, updateItemsInDOM?: boolean): void;
    protected _rerender(renderTop: number, renderHeight: number, inSmoothScrolling?: boolean | undefined): void;
    protected createRangeMap(paddingTop: number): IRangeMap;
    insertWhitespace(afterPosition: number, size: number): string;
    changeOneWhitespace(id: string, newAfterPosition: number, newSize: number): void;
    removeWhitespace(id: string): void;
    getWhitespacePosition(id: string): number;
}
