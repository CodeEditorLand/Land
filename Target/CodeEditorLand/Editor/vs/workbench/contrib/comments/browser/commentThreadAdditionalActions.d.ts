import { Disposable } from '../../../../base/common/lifecycle.js';
import { IRange } from '../../../../editor/common/core/range.js';
import * as languages from '../../../../editor/common/languages.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { CommentMenus } from './commentMenus.js';
import { ICellRange } from '../../notebook/common/notebookRange.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
export declare class CommentThreadAdditionalActions<T extends IRange | ICellRange> extends Disposable {
    private _commentThread;
    private _contextKeyService;
    private _commentMenus;
    private _actionRunDelegate;
    private _keybindingService;
    private _contextMenuService;
    private _container;
    private _buttonBar;
    private _commentFormActions;
    constructor(container: HTMLElement, _commentThread: languages.CommentThread<T>, _contextKeyService: IContextKeyService, _commentMenus: CommentMenus, _actionRunDelegate: (() => void) | null, _keybindingService: IKeybindingService, _contextMenuService: IContextMenuService);
    private _showMenu;
    private _hideMenu;
    private _enableDisableMenu;
    private _createAdditionalActions;
}
