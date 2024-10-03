import './media/editorHoverWrapper.css';
import { IHoverAction } from '../../../../../base/browser/ui/hover/hover.js';
import { IKeybindingService } from '../../../../../platform/keybinding/common/keybinding.js';
export declare class ChatEditorHoverWrapper {
    private readonly keybindingService;
    readonly domNode: HTMLElement;
    constructor(hoverContentElement: HTMLElement, actions: IHoverAction[] | undefined, keybindingService: IKeybindingService);
}
