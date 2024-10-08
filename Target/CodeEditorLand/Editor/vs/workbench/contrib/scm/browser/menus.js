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
import { equals } from '../../../../base/common/arrays.js';
import { Emitter } from '../../../../base/common/event.js';
import { DisposableStore, dispose } from '../../../../base/common/lifecycle.js';
import './media/scm.css';
import { localize } from '../../../../nls.js';
import { createAndFillInActionBarActions } from '../../../../platform/actions/browser/menuEntryActionViewItem.js';
import { IMenuService, MenuId, MenuRegistry } from '../../../../platform/actions/common/actions.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ServiceCollection } from '../../../../platform/instantiation/common/serviceCollection.js';
import { ISCMService } from '../common/scm.js';
function actionEquals(a, b) {
    return a.id === b.id;
}
const repositoryMenuDisposables = new DisposableStore();
MenuRegistry.onDidChangeMenu(e => {
    if (e.has(MenuId.SCMTitle)) {
        repositoryMenuDisposables.clear();
        for (const menuItem of MenuRegistry.getMenuItems(MenuId.SCMTitle)) {
            repositoryMenuDisposables.add(MenuRegistry.appendMenuItem(MenuId.SCMSourceControlInline, menuItem));
        }
    }
});
let SCMTitleMenu = class SCMTitleMenu {
    get actions() { return this._actions; }
    get secondaryActions() { return this._secondaryActions; }
    constructor(menuService, contextKeyService) {
        this._actions = [];
        this._secondaryActions = [];
        this._onDidChangeTitle = new Emitter();
        this.onDidChangeTitle = this._onDidChangeTitle.event;
        this.disposables = new DisposableStore();
        this.menu = menuService.createMenu(MenuId.SCMTitle, contextKeyService);
        this.disposables.add(this.menu);
        this.menu.onDidChange(this.updateTitleActions, this, this.disposables);
        this.updateTitleActions();
    }
    updateTitleActions() {
        const primary = [];
        const secondary = [];
        createAndFillInActionBarActions(this.menu, { shouldForwardArgs: true }, { primary, secondary });
        if (equals(primary, this._actions, actionEquals) && equals(secondary, this._secondaryActions, actionEquals)) {
            return;
        }
        this._actions = primary;
        this._secondaryActions = secondary;
        this._onDidChangeTitle.fire();
    }
    dispose() {
        this.disposables.dispose();
    }
};
SCMTitleMenu = __decorate([
    __param(0, IMenuService),
    __param(1, IContextKeyService),
    __metadata("design:paramtypes", [Object, Object])
], SCMTitleMenu);
export { SCMTitleMenu };
class SCMMenusItem {
    get resourceGroupMenu() {
        if (!this._resourceGroupMenu) {
            this._resourceGroupMenu = this.menuService.createMenu(MenuId.SCMResourceGroupContext, this.contextKeyService);
        }
        return this._resourceGroupMenu;
    }
    get resourceFolderMenu() {
        if (!this._resourceFolderMenu) {
            this._resourceFolderMenu = this.menuService.createMenu(MenuId.SCMResourceFolderContext, this.contextKeyService);
        }
        return this._resourceFolderMenu;
    }
    constructor(contextKeyService, menuService) {
        this.contextKeyService = contextKeyService;
        this.menuService = menuService;
    }
    getResourceMenu(resource) {
        if (typeof resource.contextValue === 'undefined') {
            if (!this.genericResourceMenu) {
                this.genericResourceMenu = this.menuService.createMenu(MenuId.SCMResourceContext, this.contextKeyService);
            }
            return this.genericResourceMenu;
        }
        if (!this.contextualResourceMenus) {
            this.contextualResourceMenus = new Map();
        }
        let item = this.contextualResourceMenus.get(resource.contextValue);
        if (!item) {
            const contextKeyService = this.contextKeyService.createOverlay([['scmResourceState', resource.contextValue]]);
            const menu = this.menuService.createMenu(MenuId.SCMResourceContext, contextKeyService);
            item = {
                menu, dispose() {
                    menu.dispose();
                }
            };
            this.contextualResourceMenus.set(resource.contextValue, item);
        }
        return item.menu;
    }
    dispose() {
        this._resourceGroupMenu?.dispose();
        this._resourceFolderMenu?.dispose();
        this.genericResourceMenu?.dispose();
        if (this.contextualResourceMenus) {
            dispose(this.contextualResourceMenus.values());
            this.contextualResourceMenus.clear();
            this.contextualResourceMenus = undefined;
        }
    }
}
let SCMRepositoryMenus = class SCMRepositoryMenus {
    get repositoryContextMenu() {
        if (!this._repositoryContextMenu) {
            this._repositoryContextMenu = this.menuService.createMenu(MenuId.SCMSourceControl, this.contextKeyService);
            this.disposables.add(this._repositoryContextMenu);
        }
        return this._repositoryContextMenu;
    }
    constructor(provider, contextKeyService, instantiationService, menuService) {
        this.provider = provider;
        this.menuService = menuService;
        this.resourceGroupMenusItems = new Map();
        this.disposables = new DisposableStore();
        this.contextKeyService = contextKeyService.createOverlay([
            ['scmProvider', provider.contextValue],
            ['scmProviderRootUri', provider.rootUri?.toString()],
            ['scmProviderHasRootUri', !!provider.rootUri],
        ]);
        const serviceCollection = new ServiceCollection([IContextKeyService, this.contextKeyService]);
        instantiationService = instantiationService.createChild(serviceCollection, this.disposables);
        this.titleMenu = instantiationService.createInstance(SCMTitleMenu);
        this.disposables.add(this.titleMenu);
        this.repositoryMenu = menuService.createMenu(MenuId.SCMSourceControlInline, this.contextKeyService);
        this.disposables.add(this.repositoryMenu);
        provider.onDidChangeResourceGroups(this.onDidChangeResourceGroups, this, this.disposables);
        this.onDidChangeResourceGroups();
    }
    getResourceGroupMenu(group) {
        return this.getOrCreateResourceGroupMenusItem(group).resourceGroupMenu;
    }
    getResourceMenu(resource) {
        return this.getOrCreateResourceGroupMenusItem(resource.resourceGroup).getResourceMenu(resource);
    }
    getResourceFolderMenu(group) {
        return this.getOrCreateResourceGroupMenusItem(group).resourceFolderMenu;
    }
    getOrCreateResourceGroupMenusItem(group) {
        let result = this.resourceGroupMenusItems.get(group);
        if (!result) {
            const contextKeyService = this.contextKeyService.createOverlay([
                ['scmResourceGroup', group.id],
                ['multiDiffEditorEnableViewChanges', group.multiDiffEditorEnableViewChanges],
            ]);
            result = new SCMMenusItem(contextKeyService, this.menuService);
            this.resourceGroupMenusItems.set(group, result);
        }
        return result;
    }
    onDidChangeResourceGroups() {
        for (const resourceGroup of this.resourceGroupMenusItems.keys()) {
            if (!this.provider.groups.includes(resourceGroup)) {
                this.resourceGroupMenusItems.get(resourceGroup)?.dispose();
                this.resourceGroupMenusItems.delete(resourceGroup);
            }
        }
    }
    dispose() {
        this.disposables.dispose();
        this.resourceGroupMenusItems.forEach(item => item.dispose());
    }
};
SCMRepositoryMenus = __decorate([
    __param(1, IContextKeyService),
    __param(2, IInstantiationService),
    __param(3, IMenuService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], SCMRepositoryMenus);
export { SCMRepositoryMenus };
let SCMMenus = class SCMMenus {
    constructor(scmService, instantiationService) {
        this.instantiationService = instantiationService;
        this.disposables = new DisposableStore();
        this.menus = new Map();
        this.titleMenu = instantiationService.createInstance(SCMTitleMenu);
        scmService.onDidRemoveRepository(this.onDidRemoveRepository, this, this.disposables);
    }
    onDidRemoveRepository(repository) {
        const menus = this.menus.get(repository.provider);
        menus?.dispose();
        this.menus.delete(repository.provider);
    }
    getRepositoryMenus(provider) {
        let result = this.menus.get(provider);
        if (!result) {
            const menus = this.instantiationService.createInstance(SCMRepositoryMenus, provider);
            const dispose = () => {
                menus.dispose();
                this.menus.delete(provider);
            };
            result = { menus, dispose };
            this.menus.set(provider, result);
        }
        return result.menus;
    }
    dispose() {
        this.disposables.dispose();
    }
};
SCMMenus = __decorate([
    __param(0, ISCMService),
    __param(1, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object])
], SCMMenus);
export { SCMMenus };
MenuRegistry.appendMenuItem(MenuId.SCMResourceContext, {
    title: localize('miShare', "Share"),
    submenu: MenuId.SCMResourceContextShare,
    group: '45_share',
    order: 3,
});
