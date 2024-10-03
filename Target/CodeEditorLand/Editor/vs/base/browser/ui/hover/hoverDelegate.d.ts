import type { IHoverWidget, IManagedHoverOptions } from './hover.js';
import { HoverPosition } from './hoverWidget.js';
import { IMarkdownString } from '../../../common/htmlContent.js';
import { IDisposable } from '../../../common/lifecycle.js';
export interface IHoverDelegateTarget extends IDisposable {
    readonly targetElements: readonly HTMLElement[];
    x?: number;
}
export interface IHoverDelegateOptions extends IManagedHoverOptions {
    content: IMarkdownString | string | HTMLElement;
    target: IHoverDelegateTarget | HTMLElement;
    container?: HTMLElement;
    position?: {
        hoverPosition?: HoverPosition;
    };
    appearance?: {
        showPointer?: boolean;
        showHoverHint?: boolean;
        skipFadeInAnimation?: boolean;
    };
}
export interface IHoverDelegate {
    showHover(options: IHoverDelegateOptions, focus?: boolean): IHoverWidget | undefined;
    onDidHideHover?: () => void;
    delay: number;
    placement?: 'mouse' | 'element';
    showNativeHover?: boolean;
}
export interface IScopedHoverDelegate extends IHoverDelegate, IDisposable {
}
