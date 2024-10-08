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
var RepositoryRenderer_1;
import './media/scm.css';
import { DisposableStore, combinedDisposable } from '../../../../base/common/lifecycle.js';
import { autorun } from '../../../../base/common/observable.js';
import { append, $ } from '../../../../base/browser/dom.js';
import { ISCMViewService } from '../common/scm.js';
import { CountBadge } from '../../../../base/browser/ui/countBadge/countBadge.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { ActionRunner } from '../../../../base/common/actions.js';
import { connectPrimaryMenu, getRepositoryResourceCount, isSCMRepository, StatusBarAction } from './util.js';
import { defaultCountBadgeStyles } from '../../../../platform/theme/browser/defaultStyles.js';
import { WorkbenchToolBar } from '../../../../platform/actions/browser/toolbar.js';
import { IMenuService, MenuId, MenuItemAction } from '../../../../platform/actions/common/actions.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { getDefaultHoverDelegate } from '../../../../base/browser/ui/hover/hoverDelegateFactory.js';
export class RepositoryActionRunner extends ActionRunner {
    constructor(getSelectedRepositories) {
        super();
        this.getSelectedRepositories = getSelectedRepositories;
    }
    async runAction(action, context) {
        if (!(action instanceof MenuItemAction)) {
            return super.runAction(action, context);
        }
        const selection = this.getSelectedRepositories().map(r => r.provider);
        const actionContext = selection.some(s => s === context) ? selection : [context];
        await action.run(...actionContext);
    }
}
let RepositoryRenderer = class RepositoryRenderer {
    static { RepositoryRenderer_1 = this; }
    static { this.TEMPLATE_ID = 'repository'; }
    get templateId() { return RepositoryRenderer_1.TEMPLATE_ID; }
    constructor(toolbarMenuId, actionViewItemProvider, commandService, contextKeyService, contextMenuService, hoverService, keybindingService, menuService, scmViewService, telemetryService) {
        this.toolbarMenuId = toolbarMenuId;
        this.actionViewItemProvider = actionViewItemProvider;
        this.commandService = commandService;
        this.contextKeyService = contextKeyService;
        this.contextMenuService = contextMenuService;
        this.hoverService = hoverService;
        this.keybindingService = keybindingService;
        this.menuService = menuService;
        this.scmViewService = scmViewService;
        this.telemetryService = telemetryService;
    }
    renderTemplate(container) {
        // hack
        if (container.classList.contains('monaco-tl-contents')) {
            container.parentElement.parentElement.querySelector('.monaco-tl-twistie').classList.add('force-twistie');
        }
        const provider = append(container, $('.scm-provider'));
        const label = append(provider, $('.label'));
        const labelCustomHover = this.hoverService.setupManagedHover(getDefaultHoverDelegate('mouse'), label, '', {});
        const name = append(label, $('span.name'));
        const description = append(label, $('span.description'));
        const actions = append(provider, $('.actions'));
        const toolBar = new WorkbenchToolBar(actions, { actionViewItemProvider: this.actionViewItemProvider, resetMenu: this.toolbarMenuId }, this.menuService, this.contextKeyService, this.contextMenuService, this.keybindingService, this.commandService, this.telemetryService);
        const countContainer = append(provider, $('.count'));
        const count = new CountBadge(countContainer, {}, defaultCountBadgeStyles);
        const visibilityDisposable = toolBar.onDidChangeDropdownVisibility(e => provider.classList.toggle('active', e));
        const templateDisposable = combinedDisposable(labelCustomHover, visibilityDisposable, toolBar);
        return { label, labelCustomHover, name, description, countContainer, count, toolBar, elementDisposables: new DisposableStore(), templateDisposable };
    }
    renderElement(arg, index, templateData, height) {
        const repository = isSCMRepository(arg) ? arg : arg.element;
        templateData.name.textContent = repository.provider.name;
        if (repository.provider.rootUri) {
            templateData.labelCustomHover.update(`${repository.provider.label}: ${repository.provider.rootUri.fsPath}`);
            templateData.description.textContent = repository.provider.label;
        }
        else {
            templateData.labelCustomHover.update(repository.provider.label);
            templateData.description.textContent = '';
        }
        let statusPrimaryActions = [];
        let menuPrimaryActions = [];
        let menuSecondaryActions = [];
        const updateToolbar = () => {
            templateData.toolBar.setActions([...statusPrimaryActions, ...menuPrimaryActions], menuSecondaryActions);
        };
        templateData.elementDisposables.add(autorun(reader => {
            const commands = repository.provider.statusBarCommands.read(reader) ?? [];
            statusPrimaryActions = commands.map(c => new StatusBarAction(c, this.commandService));
            updateToolbar();
        }));
        templateData.elementDisposables.add(autorun(reader => {
            const count = repository.provider.count.read(reader) ?? getRepositoryResourceCount(repository.provider);
            templateData.countContainer.setAttribute('data-count', String(count));
            templateData.count.setCount(count);
        }));
        const repositoryMenus = this.scmViewService.menus.getRepositoryMenus(repository.provider);
        const menu = this.toolbarMenuId === MenuId.SCMTitle ? repositoryMenus.titleMenu.menu : repositoryMenus.repositoryMenu;
        templateData.elementDisposables.add(connectPrimaryMenu(menu, (primary, secondary) => {
            menuPrimaryActions = primary;
            menuSecondaryActions = secondary;
            updateToolbar();
        }));
        templateData.toolBar.context = repository.provider;
    }
    renderCompressedElements() {
        throw new Error('Should never happen since node is incompressible');
    }
    disposeElement(group, index, template) {
        template.elementDisposables.clear();
    }
    disposeTemplate(templateData) {
        templateData.elementDisposables.dispose();
        templateData.templateDisposable.dispose();
    }
};
RepositoryRenderer = RepositoryRenderer_1 = __decorate([
    __param(2, ICommandService),
    __param(3, IContextKeyService),
    __param(4, IContextMenuService),
    __param(5, IHoverService),
    __param(6, IKeybindingService),
    __param(7, IMenuService),
    __param(8, ISCMViewService),
    __param(9, ITelemetryService),
    __metadata("design:paramtypes", [MenuId, Function, Object, Object, Object, Object, Object, Object, Object, Object])
], RepositoryRenderer);
export { RepositoryRenderer };
