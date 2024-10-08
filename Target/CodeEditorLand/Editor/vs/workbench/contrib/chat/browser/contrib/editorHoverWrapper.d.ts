import './media/editorHoverWrapper.css';
import { IHoverAction } from '../../../../../base/browser/ui/hover/hover.js';
import { IKeybindingService } from '../../../../../platform/keybinding/common/keybinding.js';
/**
 * This borrows some of HoverWidget so that a chat editor hover can be rendered in the same way as a workbench hover.
 * Maybe it can be reusable in a generic way.
 */
export declare class ChatEditorHoverWrapper {
    private readonly keybindingService;
    readonly domNode: HTMLElement;
    constructor(hoverContentElement: HTMLElement, actions: IHoverAction[] | undefined, keybindingService: IKeybindingService);
}
