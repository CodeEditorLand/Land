import { IAction } from '../../../../base/common/actions.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { IMenu } from '../../../../platform/actions/common/actions.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
export declare class CommentFormActions implements IDisposable {
    private readonly keybindingService;
    private readonly contextKeyService;
    private readonly contextMenuService;
    private container;
    private actionHandler;
    private readonly maxActions?;
    private readonly supportDropdowns?;
    private _buttonElements;
    private readonly _toDispose;
    private _actions;
    constructor(keybindingService: IKeybindingService, contextKeyService: IContextKeyService, contextMenuService: IContextMenuService, container: HTMLElement, actionHandler: (action: IAction) => void, maxActions?: number | undefined, supportDropdowns?: boolean | undefined);
    setActions(menu: IMenu, hasOnlySecondaryActions?: boolean): void;
    triggerDefaultAction(): void;
    dispose(): void;
}
