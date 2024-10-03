import { StandardMouseEvent } from './mouseEvent.js';
import { IActionViewItemOptions } from './ui/actionbar/actionViewItems.js';
import { IActionViewItem } from './ui/actionbar/actionbar.js';
import { AnchorAlignment, AnchorAxisAlignment, IAnchor } from './ui/contextview/contextview.js';
import { IAction, IActionRunner } from '../common/actions.js';
import { ResolvedKeybinding } from '../common/keybindings.js';
import { OmitOptional } from '../common/types.js';
export interface IContextMenuEvent {
    readonly shiftKey?: boolean;
    readonly ctrlKey?: boolean;
    readonly altKey?: boolean;
    readonly metaKey?: boolean;
}
type ContextMenuLocation = OmitOptional<IAnchor> & {
    getModifierState?: never;
};
export interface IContextMenuDelegate {
    getAnchor(): HTMLElement | StandardMouseEvent | ContextMenuLocation;
    getActions(): readonly IAction[];
    getCheckedActionsRepresentation?(action: IAction): 'radio' | 'checkbox';
    getActionViewItem?(action: IAction, options: IActionViewItemOptions): IActionViewItem | undefined;
    getActionsContext?(event?: IContextMenuEvent): unknown;
    getKeyBinding?(action: IAction): ResolvedKeybinding | undefined;
    getMenuClassName?(): string;
    onHide?(didCancel: boolean): void;
    actionRunner?: IActionRunner;
    skipTelemetry?: boolean;
    autoSelectFirstItem?: boolean;
    anchorAlignment?: AnchorAlignment;
    anchorAxisAlignment?: AnchorAxisAlignment;
    domForShadowRoot?: HTMLElement;
}
export interface IContextMenuProvider {
    showContextMenu(delegate: IContextMenuDelegate): void;
}
export {};
