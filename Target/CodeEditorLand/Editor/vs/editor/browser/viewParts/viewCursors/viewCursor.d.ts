import { FastDomNode } from '../../../../base/browser/fastDomNode.js';
import { Position } from '../../../common/core/position.js';
import { RenderingContext, RestrictedRenderingContext } from '../../view/renderingContext.js';
import { ViewContext } from '../../../common/viewModel/viewContext.js';
import * as viewEvents from '../../../common/viewEvents.js';
export interface IViewCursorRenderData {
    domNode: HTMLElement;
    position: Position;
    contentLeft: number;
    width: number;
    height: number;
}
export declare enum CursorPlurality {
    Single = 0,
    MultiPrimary = 1,
    MultiSecondary = 2
}
export declare class ViewCursor {
    private readonly _context;
    private readonly _domNode;
    private _cursorStyle;
    private _lineCursorWidth;
    private _lineHeight;
    private _typicalHalfwidthCharacterWidth;
    private _isVisible;
    private _position;
    private _pluralityClass;
    private _lastRenderedContent;
    private _renderData;
    constructor(context: ViewContext, plurality: CursorPlurality);
    getDomNode(): FastDomNode<HTMLElement>;
    getPosition(): Position;
    setPlurality(plurality: CursorPlurality): void;
    show(): void;
    hide(): void;
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    onCursorPositionChanged(position: Position, pauseAnimation: boolean): boolean;
    /**
     * If `this._position` is inside a grapheme, returns the position where the grapheme starts.
     * Also returns the next grapheme.
     */
    private _getGraphemeAwarePosition;
    private _prepareRender;
    private _getTokenClassName;
    prepareRender(ctx: RenderingContext): void;
    render(ctx: RestrictedRenderingContext): IViewCursorRenderData | null;
}
