import { Disposable, IDisposable } from '../../../../../base/common/lifecycle.js';
import { IReader } from '../../../../../base/common/observable.js';
import { CodeEditorWidget } from '../../../../../editor/browser/widget/codeEditor/codeEditorWidget.js';
import { LineRange } from '../model/lineRange.js';
export declare class EditorGutter<T extends IGutterItemInfo = IGutterItemInfo> extends Disposable {
    private readonly _editor;
    private readonly _domNode;
    private readonly itemProvider;
    private readonly scrollTop;
    private readonly isScrollTopZero;
    private readonly modelAttached;
    private readonly editorOnDidChangeViewZones;
    private readonly editorOnDidContentSizeChange;
    private readonly domNodeSizeChanged;
    constructor(_editor: CodeEditorWidget, _domNode: HTMLElement, itemProvider: IGutterItemProvider<T>);
    dispose(): void;
    private readonly views;
    private render;
}
export interface IGutterItemProvider<TItem extends IGutterItemInfo> {
    getIntersectingGutterItems(range: LineRange, reader: IReader): TItem[];
    createView(item: TItem, target: HTMLElement): IGutterItemView<TItem>;
}
export interface IGutterItemInfo {
    id: string;
    range: LineRange;
}
export interface IGutterItemView<T extends IGutterItemInfo> extends IDisposable {
    update(item: T): void;
    layout(top: number, height: number, viewTop: number, viewHeight: number): void;
}
