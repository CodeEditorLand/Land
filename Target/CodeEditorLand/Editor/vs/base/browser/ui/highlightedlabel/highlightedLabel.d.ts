import { IHoverDelegate } from '../hover/hoverDelegate.js';
import { Disposable } from '../../../common/lifecycle.js';
export interface IHighlight {
    start: number;
    end: number;
    readonly extraClasses?: readonly string[];
}
export interface IHighlightedLabelOptions {
    readonly supportIcons?: boolean;
    readonly hoverDelegate?: IHoverDelegate;
}
export declare class HighlightedLabel extends Disposable {
    private readonly options?;
    private readonly domNode;
    private text;
    private title;
    private highlights;
    private supportIcons;
    private didEverRender;
    private customHover;
    constructor(container: HTMLElement, options?: IHighlightedLabelOptions | undefined);
    get element(): HTMLElement;
    set(text: string | undefined, highlights?: readonly IHighlight[], title?: string, escapeNewLines?: boolean): void;
    private render;
    static escapeNewLines(text: string, highlights: readonly IHighlight[]): string;
}
