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
import * as DOM from '../../../../base/browser/dom.js';
import { getDefaultHoverDelegate } from '../../../../base/browser/ui/hover/hoverDelegateFactory.js';
import { DefaultStyleController } from '../../../../base/browser/ui/list/listWidget.js';
import { RenderIndentGuides } from '../../../../base/browser/ui/tree/abstractTree.js';
import { Iterable } from '../../../../base/common/iterator.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { localize } from '../../../../nls.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IListService, WorkbenchObjectTree } from '../../../../platform/list/browser/listService.js';
import { getListStyles } from '../../../../platform/theme/browser/defaultStyles.js';
import { editorBackground, focusBorder } from '../../../../platform/theme/common/colorRegistry.js';
import { SettingsTreeFilter } from './settingsTree.js';
import { SettingsTreeGroupElement, SettingsTreeSettingElement } from './settingsTreeModels.js';
import { settingsHeaderForeground, settingsHeaderHoverForeground } from '../common/settingsEditorColorRegistry.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
const $ = DOM.$;
let TOCTreeModel = class TOCTreeModel {
    constructor(_viewState, environmentService) {
        this._viewState = _viewState;
        this.environmentService = environmentService;
        this._currentSearchModel = null;
    }
    get settingsTreeRoot() {
        return this._settingsTreeRoot;
    }
    set settingsTreeRoot(value) {
        this._settingsTreeRoot = value;
        this.update();
    }
    get currentSearchModel() {
        return this._currentSearchModel;
    }
    set currentSearchModel(model) {
        this._currentSearchModel = model;
        this.update();
    }
    get children() {
        return this._settingsTreeRoot.children;
    }
    update() {
        if (this._settingsTreeRoot) {
            this.updateGroupCount(this._settingsTreeRoot);
        }
    }
    updateGroupCount(group) {
        group.children.forEach(child => {
            if (child instanceof SettingsTreeGroupElement) {
                this.updateGroupCount(child);
            }
        });
        const childCount = group.children
            .filter(child => child instanceof SettingsTreeGroupElement)
            .reduce((acc, cur) => acc + cur.count, 0);
        group.count = childCount + this.getGroupCount(group);
    }
    getGroupCount(group) {
        return group.children.filter(child => {
            if (!(child instanceof SettingsTreeSettingElement)) {
                return false;
            }
            if (this._currentSearchModel && !this._currentSearchModel.root.containsSetting(child.setting.key)) {
                return false;
            }
            const isRemote = !!this.environmentService.remoteAuthority;
            return child.matchesScope(this._viewState.settingsTarget, isRemote) &&
                child.matchesAllTags(this._viewState.tagFilters) &&
                child.matchesAnyFeature(this._viewState.featureFilters) &&
                child.matchesAnyExtension(this._viewState.extensionFilters) &&
                child.matchesAnyId(this._viewState.idFilters);
        }).length;
    }
};
TOCTreeModel = __decorate([
    __param(1, IWorkbenchEnvironmentService),
    __metadata("design:paramtypes", [Object, Object])
], TOCTreeModel);
export { TOCTreeModel };
const TOC_ENTRY_TEMPLATE_ID = 'settings.toc.entry';
export class TOCRenderer {
    constructor(_hoverService) {
        this._hoverService = _hoverService;
        this.templateId = TOC_ENTRY_TEMPLATE_ID;
    }
    renderTemplate(container) {
        return {
            labelElement: DOM.append(container, $('.settings-toc-entry')),
            countElement: DOM.append(container, $('.settings-toc-count')),
            elementDisposables: new DisposableStore()
        };
    }
    renderElement(node, index, template) {
        template.elementDisposables.clear();
        const element = node.element;
        const count = element.count;
        const label = element.label;
        template.labelElement.textContent = label;
        template.elementDisposables.add(this._hoverService.setupManagedHover(getDefaultHoverDelegate('mouse'), template.labelElement, label));
        if (count) {
            template.countElement.textContent = ` (${count})`;
        }
        else {
            template.countElement.textContent = '';
        }
    }
    disposeTemplate(templateData) {
        templateData.elementDisposables.dispose();
    }
}
class TOCTreeDelegate {
    getTemplateId(element) {
        return TOC_ENTRY_TEMPLATE_ID;
    }
    getHeight(element) {
        return 22;
    }
}
export function createTOCIterator(model, tree) {
    const groupChildren = model.children.filter(c => c instanceof SettingsTreeGroupElement);
    return Iterable.map(groupChildren, g => {
        const hasGroupChildren = g.children.some(c => c instanceof SettingsTreeGroupElement);
        return {
            element: g,
            collapsed: undefined,
            collapsible: hasGroupChildren,
            children: g instanceof SettingsTreeGroupElement ?
                createTOCIterator(g, tree) :
                undefined
        };
    });
}
class SettingsAccessibilityProvider {
    getWidgetAriaLabel() {
        return localize({
            key: 'settingsTOC',
            comment: ['A label for the table of contents for the full settings list']
        }, "Settings Table of Contents");
    }
    getAriaLabel(element) {
        if (!element) {
            return '';
        }
        if (element instanceof SettingsTreeGroupElement) {
            return localize('groupRowAriaLabel', "{0}, group", element.label);
        }
        return '';
    }
    getAriaLevel(element) {
        let i = 1;
        while (element instanceof SettingsTreeGroupElement && element.parent) {
            i++;
            element = element.parent;
        }
        return i;
    }
}
let TOCTree = class TOCTree extends WorkbenchObjectTree {
    constructor(container, viewState, contextKeyService, listService, configurationService, hoverService, instantiationService) {
        const filter = instantiationService.createInstance(SettingsTreeFilter, viewState);
        const options = {
            filter,
            multipleSelectionSupport: false,
            identityProvider: {
                getId(e) {
                    return e.id;
                }
            },
            styleController: id => new DefaultStyleController(DOM.createStyleSheet(container), id),
            accessibilityProvider: instantiationService.createInstance(SettingsAccessibilityProvider),
            collapseByDefault: true,
            horizontalScrolling: false,
            hideTwistiesOfChildlessElements: true,
            renderIndentGuides: RenderIndentGuides.None
        };
        super('SettingsTOC', container, new TOCTreeDelegate(), [new TOCRenderer(hoverService)], options, instantiationService, contextKeyService, listService, configurationService);
        this.style(getListStyles({
            listBackground: editorBackground,
            listFocusOutline: focusBorder,
            listActiveSelectionBackground: editorBackground,
            listActiveSelectionForeground: settingsHeaderForeground,
            listFocusAndSelectionBackground: editorBackground,
            listFocusAndSelectionForeground: settingsHeaderForeground,
            listFocusBackground: editorBackground,
            listFocusForeground: settingsHeaderHoverForeground,
            listHoverForeground: settingsHeaderHoverForeground,
            listHoverBackground: editorBackground,
            listInactiveSelectionBackground: editorBackground,
            listInactiveSelectionForeground: settingsHeaderForeground,
            listInactiveFocusBackground: editorBackground,
            listInactiveFocusOutline: editorBackground,
            treeIndentGuidesStroke: undefined,
            treeInactiveIndentGuidesStroke: undefined
        }));
    }
};
TOCTree = __decorate([
    __param(2, IContextKeyService),
    __param(3, IListService),
    __param(4, IConfigurationService),
    __param(5, IHoverService),
    __param(6, IInstantiationService),
    __metadata("design:paramtypes", [HTMLElement, Object, Object, Object, Object, Object, Object])
], TOCTree);
export { TOCTree };
