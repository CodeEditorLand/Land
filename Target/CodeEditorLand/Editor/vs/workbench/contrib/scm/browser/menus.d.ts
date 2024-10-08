import { IAction } from '../../../../base/common/actions.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import './media/scm.css';
import { IMenu, IMenuService } from '../../../../platform/actions/common/actions.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ISCMMenus, ISCMProvider, ISCMRepositoryMenus, ISCMResource, ISCMResourceGroup, ISCMService } from '../common/scm.js';
export declare class SCMTitleMenu implements IDisposable {
    private _actions;
    get actions(): IAction[];
    private _secondaryActions;
    get secondaryActions(): IAction[];
    private readonly _onDidChangeTitle;
    readonly onDidChangeTitle: import("../../../workbench.web.main.internal.js").Event<void>;
    readonly menu: IMenu;
    private readonly disposables;
    constructor(menuService: IMenuService, contextKeyService: IContextKeyService);
    private updateTitleActions;
    dispose(): void;
}
export declare class SCMRepositoryMenus implements ISCMRepositoryMenus, IDisposable {
    private readonly provider;
    private readonly menuService;
    private contextKeyService;
    readonly titleMenu: SCMTitleMenu;
    readonly repositoryMenu: IMenu;
    private readonly resourceGroupMenusItems;
    private _repositoryContextMenu;
    get repositoryContextMenu(): IMenu;
    private readonly disposables;
    constructor(provider: ISCMProvider, contextKeyService: IContextKeyService, instantiationService: IInstantiationService, menuService: IMenuService);
    getResourceGroupMenu(group: ISCMResourceGroup): IMenu;
    getResourceMenu(resource: ISCMResource): IMenu;
    getResourceFolderMenu(group: ISCMResourceGroup): IMenu;
    private getOrCreateResourceGroupMenusItem;
    private onDidChangeResourceGroups;
    dispose(): void;
}
export declare class SCMMenus implements ISCMMenus, IDisposable {
    private instantiationService;
    readonly titleMenu: SCMTitleMenu;
    private readonly disposables;
    private readonly menus;
    constructor(scmService: ISCMService, instantiationService: IInstantiationService);
    private onDidRemoveRepository;
    getRepositoryMenus(provider: ISCMProvider): SCMRepositoryMenus;
    dispose(): void;
}
