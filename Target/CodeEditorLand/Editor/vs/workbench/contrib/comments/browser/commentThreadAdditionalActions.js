var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import * as dom from '../../../../base/browser/dom.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import * as languages from '../../../../editor/common/languages.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { CommentFormActions } from './commentFormActions.js';
import { CommentMenus } from './commentMenus.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
let CommentThreadAdditionalActions = class CommentThreadAdditionalActions extends Disposable {
    constructor(container, _commentThread, _contextKeyService, _commentMenus, _actionRunDelegate, _keybindingService, _contextMenuService) {
        super();
        this._commentThread = _commentThread;
        this._contextKeyService = _contextKeyService;
        this._commentMenus = _commentMenus;
        this._actionRunDelegate = _actionRunDelegate;
        this._keybindingService = _keybindingService;
        this._contextMenuService = _contextMenuService;
        this._container = dom.append(container, dom.$('.comment-additional-actions'));
        dom.append(this._container, dom.$('.section-separator'));
        this._buttonBar = dom.append(this._container, dom.$('.button-bar'));
        this._createAdditionalActions(this._buttonBar);
    }
    _showMenu() {
        this._container?.classList.remove('hidden');
    }
    _hideMenu() {
        this._container?.classList.add('hidden');
    }
    _enableDisableMenu(menu) {
        const groups = menu.getActions({ shouldForwardArgs: true });
        for (const group of groups) {
            const [, actions] = group;
            for (const action of actions) {
                if (action.enabled) {
                    this._showMenu();
                    return;
                }
                for (const subAction of action.actions ?? []) {
                    if (subAction.enabled) {
                        this._showMenu();
                        return;
                    }
                }
            }
        }
        this._hideMenu();
    }
    _createAdditionalActions(container) {
        const menu = this._commentMenus.getCommentThreadAdditionalActions(this._contextKeyService);
        this._register(menu);
        this._register(menu.onDidChange(() => {
            this._commentFormActions.setActions(menu, true);
            this._enableDisableMenu(menu);
        }));
        this._commentFormActions = new CommentFormActions(this._keybindingService, this._contextKeyService, this._contextMenuService, container, async (action) => {
            this._actionRunDelegate?.();
            action.run({
                thread: this._commentThread,
                $mid: 8
            });
        }, 4, true);
        this._register(this._commentFormActions);
        this._commentFormActions.setActions(menu, true);
        this._enableDisableMenu(menu);
    }
};
CommentThreadAdditionalActions = __decorate([
    __param(5, IKeybindingService),
    __param(6, IContextMenuService),
    __metadata("design:paramtypes", [HTMLElement, Object, Object, CommentMenus, Object, Object, Object])
], CommentThreadAdditionalActions);
export { CommentThreadAdditionalActions };
