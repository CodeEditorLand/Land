import { FastDomNode } from '../../../base/browser/fastDomNode.js';
import { StringBuilder } from '../../common/core/stringBuilder.js';
import * as viewEvents from '../../common/viewEvents.js';
import { ViewportData } from '../../common/viewLayout/viewLinesViewportData.js';
export interface IVisibleLine extends ILine {
    getDomNode(): HTMLElement | null;
    setDomNode(domNode: HTMLElement): void;
    renderLine(lineNumber: number, deltaTop: number, lineHeight: number, viewportData: ViewportData, sb: StringBuilder): boolean;
    layoutLine(lineNumber: number, deltaTop: number, lineHeight: number): void;
}
export interface ILine {
    onContentChanged(): void;
    onTokensChanged(): void;
}
export interface ILineFactory<T extends ILine> {
    createLine(): T;
}
export declare class RenderedLinesCollection<T extends ILine> {
    private readonly _lineFactory;
    private _lines;
    private _rendLineNumberStart;
    constructor(_lineFactory: ILineFactory<T>);
    flush(): void;
    _set(rendLineNumberStart: number, lines: T[]): void;
    _get(): {
        rendLineNumberStart: number;
        lines: T[];
    };
    getStartLineNumber(): number;
    getEndLineNumber(): number;
    getCount(): number;
    getLine(lineNumber: number): T;
    onLinesDeleted(deleteFromLineNumber: number, deleteToLineNumber: number): T[] | null;
    onLinesChanged(changeFromLineNumber: number, changeCount: number): boolean;
    onLinesInserted(insertFromLineNumber: number, insertToLineNumber: number): T[] | null;
    onTokensChanged(ranges: {
        fromLineNumber: number;
        toLineNumber: number;
    }[]): boolean;
}
export declare class VisibleLinesCollection<T extends IVisibleLine> {
    private readonly _lineFactory;
    readonly domNode: FastDomNode<HTMLElement>;
    private readonly _linesCollection;
    constructor(_lineFactory: ILineFactory<T>);
    private _createDomNode;
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    onFlushed(e: viewEvents.ViewFlushedEvent): boolean;
    onLinesChanged(e: viewEvents.ViewLinesChangedEvent): boolean;
    onLinesDeleted(e: viewEvents.ViewLinesDeletedEvent): boolean;
    onLinesInserted(e: viewEvents.ViewLinesInsertedEvent): boolean;
    onScrollChanged(e: viewEvents.ViewScrollChangedEvent): boolean;
    onTokensChanged(e: viewEvents.ViewTokensChangedEvent): boolean;
    onZonesChanged(e: viewEvents.ViewZonesChangedEvent): boolean;
    getStartLineNumber(): number;
    getEndLineNumber(): number;
    getVisibleLine(lineNumber: number): T;
    renderLines(viewportData: ViewportData): void;
}
