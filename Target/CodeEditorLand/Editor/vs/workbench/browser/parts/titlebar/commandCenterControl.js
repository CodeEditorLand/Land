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
var CommandCenterCenterViewItem_1;
import { isActiveDocument, reset } from '../../../../base/browser/dom.js';
import { BaseActionViewItem } from '../../../../base/browser/ui/actionbar/actionViewItems.js';
import { getDefaultHoverDelegate } from '../../../../base/browser/ui/hover/hoverDelegateFactory.js';
import { renderIcon } from '../../../../base/browser/ui/iconLabel/iconLabels.js';
import { SubmenuAction } from '../../../../base/common/actions.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { localize } from '../../../../nls.js';
import { createActionViewItem } from '../../../../platform/actions/browser/menuEntryActionViewItem.js';
import { MenuWorkbenchToolBar, WorkbenchToolBar } from '../../../../platform/actions/browser/toolbar.js';
import { MenuId, MenuRegistry, SubmenuItemAction } from '../../../../platform/actions/common/actions.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { WindowTitle } from './windowTitle.js';
import { IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
let CommandCenterControl = class CommandCenterControl {
    constructor(windowTitle, hoverDelegate, instantiationService, quickInputService) {
        this._disposables = new DisposableStore();
        this._onDidChangeVisibility = new Emitter();
        this.onDidChangeVisibility = this._onDidChangeVisibility.event;
        this.element = document.createElement('div');
        this.element.classList.add('command-center');
        const titleToolbar = instantiationService.createInstance(MenuWorkbenchToolBar, this.element, MenuId.CommandCenter, {
            contextMenu: MenuId.TitleBarContext,
            hiddenItemStrategy: -1,
            toolbarOptions: {
                primaryGroup: () => true,
            },
            telemetrySource: 'commandCenter',
            actionViewItemProvider: (action, options) => {
                if (action instanceof SubmenuItemAction && action.item.submenu === MenuId.CommandCenterCenter) {
                    return instantiationService.createInstance(CommandCenterCenterViewItem, action, windowTitle, { ...options, hoverDelegate });
                }
                else {
                    return createActionViewItem(instantiationService, action, { ...options, hoverDelegate });
                }
            }
        });
        this._disposables.add(Event.filter(quickInputService.onShow, () => isActiveDocument(this.element), this._disposables)(this._setVisibility.bind(this, false)));
        this._disposables.add(Event.filter(quickInputService.onHide, () => isActiveDocument(this.element), this._disposables)(this._setVisibility.bind(this, true)));
        this._disposables.add(titleToolbar);
    }
    _setVisibility(show) {
        this.element.classList.toggle('hide', !show);
        this._onDidChangeVisibility.fire();
    }
    dispose() {
        this._disposables.dispose();
    }
};
CommandCenterControl = __decorate([
    __param(2, IInstantiationService),
    __param(3, IQuickInputService),
    __metadata("design:paramtypes", [WindowTitle, Object, Object, Object])
], CommandCenterControl);
export { CommandCenterControl };
let CommandCenterCenterViewItem = class CommandCenterCenterViewItem extends BaseActionViewItem {
    static { CommandCenterCenterViewItem_1 = this; }
    static { this._quickOpenCommandId = 'workbench.action.quickOpenWithModes'; }
    constructor(_submenu, _windowTitle, options, _hoverService, _keybindingService, _instaService, _editorGroupService) {
        super(undefined, _submenu.actions.find(action => action.id === 'workbench.action.quickOpenWithModes') ?? _submenu.actions[0], options);
        this._submenu = _submenu;
        this._windowTitle = _windowTitle;
        this._hoverService = _hoverService;
        this._keybindingService = _keybindingService;
        this._instaService = _instaService;
        this._editorGroupService = _editorGroupService;
        this._hoverDelegate = options.hoverDelegate ?? getDefaultHoverDelegate('mouse');
    }
    render(container) {
        super.render(container);
        container.classList.add('command-center-center');
        container.classList.toggle('multiple', (this._submenu.actions.length > 1));
        const hover = this._store.add(this._hoverService.setupManagedHover(this._hoverDelegate, container, this.getTooltip()));
        this._store.add(this._windowTitle.onDidChange(() => {
            hover.update(this.getTooltip());
        }));
        const groups = [];
        for (const action of this._submenu.actions) {
            if (action instanceof SubmenuAction) {
                groups.push(action.actions);
            }
            else {
                groups.push([action]);
            }
        }
        for (let i = 0; i < groups.length; i++) {
            const group = groups[i];
            const toolbar = this._instaService.createInstance(WorkbenchToolBar, container, {
                hiddenItemStrategy: -1,
                telemetrySource: 'commandCenterCenter',
                actionViewItemProvider: (action, options) => {
                    options = {
                        ...options,
                        hoverDelegate: this._hoverDelegate,
                    };
                    if (action.id !== CommandCenterCenterViewItem_1._quickOpenCommandId) {
                        return createActionViewItem(this._instaService, action, options);
                    }
                    const that = this;
                    return this._instaService.createInstance(class CommandCenterQuickPickItem extends BaseActionViewItem {
                        constructor() {
                            super(undefined, action, options);
                        }
                        render(container) {
                            super.render(container);
                            container.classList.toggle('command-center-quick-pick');
                            container.role = 'button';
                            const action = this.action;
                            const searchIcon = document.createElement('span');
                            searchIcon.ariaHidden = 'true';
                            searchIcon.className = action.class ?? '';
                            searchIcon.classList.add('search-icon');
                            const label = this._getLabel();
                            const labelElement = document.createElement('span');
                            labelElement.classList.add('search-label');
                            labelElement.innerText = label;
                            reset(container, searchIcon, labelElement);
                            const hover = this._store.add(that._hoverService.setupManagedHover(that._hoverDelegate, container, this.getTooltip()));
                            this._store.add(that._windowTitle.onDidChange(() => {
                                hover.update(this.getTooltip());
                                labelElement.innerText = this._getLabel();
                            }));
                            this._store.add(that._editorGroupService.onDidChangeEditorPartOptions(({ newPartOptions, oldPartOptions }) => {
                                if (newPartOptions.showTabs !== oldPartOptions.showTabs) {
                                    hover.update(this.getTooltip());
                                    labelElement.innerText = this._getLabel();
                                }
                            }));
                        }
                        getTooltip() {
                            return that.getTooltip();
                        }
                        _getLabel() {
                            const { prefix, suffix } = that._windowTitle.getTitleDecorations();
                            let label = that._windowTitle.workspaceName;
                            if (that._windowTitle.isCustomTitleFormat()) {
                                label = that._windowTitle.getWindowTitle();
                            }
                            else if (that._editorGroupService.partOptions.showTabs === 'none') {
                                label = that._windowTitle.fileName ?? label;
                            }
                            if (!label) {
                                label = localize('label.dfl', "Search");
                            }
                            if (prefix) {
                                label = localize('label1', "{0} {1}", prefix, label);
                            }
                            if (suffix) {
                                label = localize('label2', "{0} {1}", label, suffix);
                            }
                            return label.replaceAll(/\r\n|\r|\n/g, '\u23CE');
                        }
                    });
                }
            });
            toolbar.setActions(group);
            this._store.add(toolbar);
            if (i < groups.length - 1) {
                const icon = renderIcon(Codicon.circleSmallFilled);
                icon.style.padding = '0 12px';
                icon.style.height = '100%';
                icon.style.opacity = '0.5';
                container.appendChild(icon);
            }
        }
    }
    getTooltip() {
        const kb = this._keybindingService.lookupKeybinding(this.action.id)?.getLabel();
        const title = kb
            ? localize('title', "Search {0} ({1}) \u2014 {2}", this._windowTitle.workspaceName, kb, this._windowTitle.value)
            : localize('title2', "Search {0} \u2014 {1}", this._windowTitle.workspaceName, this._windowTitle.value);
        return title;
    }
};
CommandCenterCenterViewItem = CommandCenterCenterViewItem_1 = __decorate([
    __param(3, IHoverService),
    __param(4, IKeybindingService),
    __param(5, IInstantiationService),
    __param(6, IEditorGroupsService),
    __metadata("design:paramtypes", [SubmenuItemAction,
        WindowTitle, Object, Object, Object, Object, Object])
], CommandCenterCenterViewItem);
MenuRegistry.appendMenuItem(MenuId.CommandCenter, {
    submenu: MenuId.CommandCenterCenter,
    title: localize('title3', "Command Center"),
    icon: Codicon.shield,
    order: 101,
});
