/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
import { IMenuService, MenuId } from '../../../../platform/actions/common/actions.js';
import { createAndFillInContextMenuActions } from '../../../../platform/actions/browser/menuEntryActionViewItem.js';
let CommentMenus = class CommentMenus {
    constructor(menuService) {
        this.menuService = menuService;
    }
    getCommentThreadTitleActions(contextKeyService) {
        return this.getMenu(MenuId.CommentThreadTitle, contextKeyService);
    }
    getCommentThreadActions(contextKeyService) {
        return this.getMenu(MenuId.CommentThreadActions, contextKeyService);
    }
    getCommentEditorActions(contextKeyService) {
        return this.getMenu(MenuId.CommentEditorActions, contextKeyService);
    }
    getCommentThreadAdditionalActions(contextKeyService) {
        return this.getMenu(MenuId.CommentThreadAdditionalActions, contextKeyService);
    }
    getCommentTitleActions(comment, contextKeyService) {
        return this.getMenu(MenuId.CommentTitle, contextKeyService);
    }
    getCommentActions(comment, contextKeyService) {
        return this.getMenu(MenuId.CommentActions, contextKeyService);
    }
    getCommentThreadTitleContextActions(contextKeyService) {
        return this.getMenu(MenuId.CommentThreadTitleContext, contextKeyService);
    }
    getMenu(menuId, contextKeyService) {
        const menu = this.menuService.createMenu(menuId, contextKeyService);
        const primary = [];
        const secondary = [];
        const result = { primary, secondary };
        createAndFillInContextMenuActions(menu, { shouldForwardArgs: true }, result, 'inline');
        return menu;
    }
    dispose() {
    }
};
CommentMenus = __decorate([
    __param(0, IMenuService),
    __metadata("design:paramtypes", [Object])
], CommentMenus);
export { CommentMenus };
