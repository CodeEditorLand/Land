import { ResizableHTMLElement } from '../../../../base/browser/ui/resizable/resizable.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ContentWidgetPositionPreference, ICodeEditor, IContentWidget, IContentWidgetPosition } from '../../../browser/editorBrowser.js';
import { IPosition, Position } from '../../../common/core/position.js';
import * as dom from '../../../../base/browser/dom.js';
export declare abstract class ResizableContentWidget extends Disposable implements IContentWidget {
    protected readonly _editor: ICodeEditor;
    readonly allowEditorOverflow: boolean;
    readonly suppressMouseDown: boolean;
    protected readonly _resizableNode: ResizableHTMLElement;
    protected _contentPosition: IContentWidgetPosition | null;
    private _isResizing;
    constructor(_editor: ICodeEditor, minimumSize?: dom.IDimension);
    get isResizing(): boolean;
    abstract getId(): string;
    getDomNode(): HTMLElement;
    getPosition(): IContentWidgetPosition | null;
    get position(): Position | undefined;
    protected _availableVerticalSpaceAbove(position: IPosition): number | undefined;
    protected _availableVerticalSpaceBelow(position: IPosition): number | undefined;
    protected _findPositionPreference(widgetHeight: number, showAtPosition: IPosition): ContentWidgetPositionPreference | undefined;
    protected _resize(dimension: dom.Dimension): void;
}
