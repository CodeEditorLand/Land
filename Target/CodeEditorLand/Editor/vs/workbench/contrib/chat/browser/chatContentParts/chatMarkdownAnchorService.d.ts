import { Disposable, IDisposable } from '../../../../../base/common/lifecycle.js';
import { InlineAnchorWidget } from '../chatInlineAnchorWidget.js';
export declare const IChatMarkdownAnchorService: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IChatMarkdownAnchorService>;
export interface IChatMarkdownAnchorService {
    readonly _serviceBrand: undefined;
    readonly lastFocusedAnchor: InlineAnchorWidget | undefined;
    register(widget: InlineAnchorWidget): IDisposable;
}
export declare class ChatMarkdownAnchorService extends Disposable implements IChatMarkdownAnchorService {
    readonly _serviceBrand: undefined;
    private _widgets;
    private _lastFocusedWidget;
    get lastFocusedAnchor(): InlineAnchorWidget | undefined;
    private setLastFocusedList;
    register(widget: InlineAnchorWidget): IDisposable;
}
