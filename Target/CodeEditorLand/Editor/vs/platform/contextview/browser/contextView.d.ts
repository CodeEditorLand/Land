import { IContextMenuDelegate } from '../../../base/browser/contextmenu.js';
import { StandardMouseEvent } from '../../../base/browser/mouseEvent.js';
import { AnchorAlignment, AnchorAxisAlignment, IAnchor, IContextViewProvider } from '../../../base/browser/ui/contextview/contextview.js';
import { IAction } from '../../../base/common/actions.js';
import { Event } from '../../../base/common/event.js';
import { IDisposable } from '../../../base/common/lifecycle.js';
import { IMenuActionOptions, MenuId } from '../../actions/common/actions.js';
import { IContextKeyService } from '../../contextkey/common/contextkey.js';
export declare const IContextViewService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IContextViewService>;
export interface IContextViewService extends IContextViewProvider {
    readonly _serviceBrand: undefined;
    showContextView(delegate: IContextViewDelegate, container?: HTMLElement, shadowRoot?: boolean): IOpenContextView;
    hideContextView(data?: any): void;
    getContextViewElement(): HTMLElement;
    layout(): void;
    anchorAlignment?: AnchorAlignment;
}
export interface IContextViewDelegate {
    canRelayout?: boolean;
    getAnchor(): HTMLElement | StandardMouseEvent | IAnchor;
    render(container: HTMLElement): IDisposable;
    onDOMEvent?(e: any, activeElement: HTMLElement): void;
    onHide?(data?: any): void;
    focus?(): void;
    anchorAlignment?: AnchorAlignment;
    anchorAxisAlignment?: AnchorAxisAlignment;
    layer?: number;
}
export interface IOpenContextView {
    close: () => void;
}
export declare const IContextMenuService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IContextMenuService>;
export interface IContextMenuService {
    readonly _serviceBrand: undefined;
    readonly onDidShowContextMenu: Event<void>;
    readonly onDidHideContextMenu: Event<void>;
    showContextMenu(delegate: IContextMenuDelegate | IContextMenuMenuDelegate): void;
}
export type IContextMenuMenuDelegate = {
    menuId?: MenuId;
    menuActionOptions?: IMenuActionOptions;
    contextKeyService?: IContextKeyService;
    getActions?(): IAction[];
} & Omit<IContextMenuDelegate, 'getActions'>;
