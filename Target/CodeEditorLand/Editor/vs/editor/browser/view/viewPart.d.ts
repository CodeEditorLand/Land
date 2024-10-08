import { FastDomNode } from '../../../base/browser/fastDomNode.js';
import { RenderingContext, RestrictedRenderingContext } from './renderingContext.js';
import { ViewContext } from '../../common/viewModel/viewContext.js';
import { ViewEventHandler } from '../../common/viewEventHandler.js';
export declare abstract class ViewPart extends ViewEventHandler {
    _context: ViewContext;
    constructor(context: ViewContext);
    dispose(): void;
    abstract prepareRender(ctx: RenderingContext): void;
    abstract render(ctx: RestrictedRenderingContext): void;
}
export declare const enum PartFingerprint {
    None = 0,
    ContentWidgets = 1,
    OverflowingContentWidgets = 2,
    OverflowGuard = 3,
    OverlayWidgets = 4,
    OverflowingOverlayWidgets = 5,
    ScrollableElement = 6,
    TextArea = 7,
    ViewLines = 8,
    Minimap = 9
}
export declare class PartFingerprints {
    static write(target: Element | FastDomNode<HTMLElement>, partId: PartFingerprint): void;
    static read(target: Element): PartFingerprint;
    static collect(child: Element | null, stopAt: Element): Uint8Array;
}
