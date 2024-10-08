import { Disposable } from '../../../base/common/lifecycle.js';
import { IOpenerService } from '../common/opener.js';
import './link.css';
import { IHoverDelegate } from '../../../base/browser/ui/hover/hoverDelegate.js';
import { IHoverService } from '../../hover/browser/hover.js';
export interface ILinkDescriptor {
    readonly label: string | HTMLElement;
    readonly href: string;
    readonly title?: string;
    readonly tabIndex?: number;
}
export interface ILinkOptions {
    readonly opener?: (href: string) => void;
    readonly hoverDelegate?: IHoverDelegate;
    readonly textLinkForeground?: string;
}
export declare class Link extends Disposable {
    private _link;
    private readonly _hoverService;
    private el;
    private hover?;
    private hoverDelegate;
    private _enabled;
    get enabled(): boolean;
    set enabled(enabled: boolean);
    set link(link: ILinkDescriptor);
    constructor(container: HTMLElement, _link: ILinkDescriptor, options: ILinkOptions | undefined, _hoverService: IHoverService, openerService: IOpenerService);
    private setTooltip;
}
