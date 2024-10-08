import './margin.css';
import { FastDomNode } from '../../../../base/browser/fastDomNode.js';
import { ViewPart } from '../../view/viewPart.js';
import { RenderingContext, RestrictedRenderingContext } from '../../view/renderingContext.js';
import { ViewContext } from '../../../common/viewModel/viewContext.js';
import * as viewEvents from '../../../common/viewEvents.js';
/**
 * Margin is a vertical strip located on the left of the editor's content area.
 * It is used for various features such as line numbers, folding markers, and
 * decorations that provide additional information about the lines of code.
 */
export declare class Margin extends ViewPart {
    static readonly CLASS_NAME = "glyph-margin";
    static readonly OUTER_CLASS_NAME = "margin";
    private readonly _domNode;
    private _canUseLayerHinting;
    private _contentLeft;
    private _glyphMarginLeft;
    private _glyphMarginWidth;
    private _glyphMarginBackgroundDomNode;
    constructor(context: ViewContext);
    dispose(): void;
    getDomNode(): FastDomNode<HTMLElement>;
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    onScrollChanged(e: viewEvents.ViewScrollChangedEvent): boolean;
    prepareRender(ctx: RenderingContext): void;
    render(ctx: RestrictedRenderingContext): void;
}
