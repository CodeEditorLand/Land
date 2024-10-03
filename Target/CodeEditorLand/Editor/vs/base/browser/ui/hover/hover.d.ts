import type { IHoverDelegate } from './hoverDelegate.js';
import type { HoverPosition } from './hoverWidget.js';
import type { CancellationToken } from '../../../common/cancellation.js';
import type { IMarkdownString } from '../../../common/htmlContent.js';
import type { IDisposable } from '../../../common/lifecycle.js';
export interface IHoverDelegate2 {
    showHover(options: IHoverOptions, focus?: boolean): IHoverWidget | undefined;
    hideHover(): void;
    showAndFocusLastHover(): void;
    setupManagedHover(hoverDelegate: IHoverDelegate, targetElement: HTMLElement, content: IManagedHoverContentOrFactory, options?: IManagedHoverOptions): IManagedHover;
    showManagedHover(targetElement: HTMLElement): void;
}
export interface IHoverWidget extends IDisposable {
    readonly isDisposed: boolean;
}
export interface IHoverOptions {
    content: IMarkdownString | string | HTMLElement;
    target: IHoverTarget | HTMLElement;
    container?: HTMLElement;
    id?: number | string;
    actions?: IHoverAction[];
    additionalClasses?: string[];
    linkHandler?(url: string): void;
    trapFocus?: boolean;
    position?: IHoverPositionOptions;
    persistence?: IHoverPersistenceOptions;
    appearance?: IHoverAppearanceOptions;
}
export interface IHoverPositionOptions {
    hoverPosition?: HoverPosition;
    forcePosition?: boolean;
}
export interface IHoverPersistenceOptions {
    hideOnHover?: boolean;
    hideOnKeyDown?: boolean;
    sticky?: boolean;
}
export interface IHoverAppearanceOptions {
    showPointer?: boolean;
    compact?: boolean;
    showHoverHint?: boolean;
    skipFadeInAnimation?: boolean;
}
export interface IHoverAction {
    label: string;
    commandId: string;
    iconClass?: string;
    run(target: HTMLElement): void;
}
export interface IHoverTarget extends IDisposable {
    readonly targetElements: readonly HTMLElement[];
    readonly x?: number;
    readonly y?: number;
}
export interface IManagedHoverTooltipMarkdownString {
    markdown: IMarkdownString | string | undefined | ((token: CancellationToken) => Promise<IMarkdownString | string | undefined>);
    markdownNotSupportedFallback: string | undefined;
}
export type IManagedHoverContent = string | IManagedHoverTooltipMarkdownString | HTMLElement | undefined;
export type IManagedHoverContentOrFactory = IManagedHoverContent | (() => IManagedHoverContent);
export interface IManagedHoverOptions extends Pick<IHoverOptions, 'actions' | 'linkHandler' | 'trapFocus'> {
    appearance?: Pick<IHoverAppearanceOptions, 'showHoverHint'>;
}
export interface IManagedHover extends IDisposable {
    show(focus?: boolean): void;
    hide(): void;
    update(tooltip: IManagedHoverContent, options?: IManagedHoverOptions): void;
}
