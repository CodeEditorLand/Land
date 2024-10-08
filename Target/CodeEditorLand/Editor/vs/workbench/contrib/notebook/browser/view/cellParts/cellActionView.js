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
import * as DOM from '../../../../../../base/browser/dom.js';
import * as types from '../../../../../../base/common/types.js';
import { EventType as TouchEventType } from '../../../../../../base/browser/touch.js';
import { getDefaultHoverDelegate } from '../../../../../../base/browser/ui/hover/hoverDelegateFactory.js';
import { renderLabelWithIcons } from '../../../../../../base/browser/ui/iconLabel/iconLabels.js';
import { ThemeIcon } from '../../../../../../base/common/themables.js';
import { MenuEntryActionViewItem, SubmenuEntryActionViewItem } from '../../../../../../platform/actions/browser/menuEntryActionViewItem.js';
import { MenuItemAction, SubmenuItemAction } from '../../../../../../platform/actions/common/actions.js';
import { IContextMenuService } from '../../../../../../platform/contextview/browser/contextView.js';
import { IKeybindingService } from '../../../../../../platform/keybinding/common/keybinding.js';
import { IThemeService } from '../../../../../../platform/theme/common/themeService.js';
import { IHoverService } from '../../../../../../platform/hover/browser/hover.js';
export class CodiconActionViewItem extends MenuEntryActionViewItem {
    updateLabel() {
        if (this.options.label && this.label) {
            DOM.reset(this.label, ...renderLabelWithIcons(this._commandAction.label ?? ''));
        }
    }
}
export class ActionViewWithLabel extends MenuEntryActionViewItem {
    render(container) {
        super.render(container);
        container.classList.add('notebook-action-view-item');
        this._actionLabel = document.createElement('a');
        container.appendChild(this._actionLabel);
        this.updateLabel();
    }
    updateLabel() {
        if (this._actionLabel) {
            this._actionLabel.classList.add('notebook-label');
            this._actionLabel.innerText = this._action.label;
        }
    }
}
let UnifiedSubmenuActionView = class UnifiedSubmenuActionView extends SubmenuEntryActionViewItem {
    constructor(action, options, renderLabel, subActionProvider, subActionViewItemProvider, _keybindingService, _contextMenuService, _themeService, _hoverService) {
        super(action, { ...options, hoverDelegate: options?.hoverDelegate ?? getDefaultHoverDelegate('element') }, _keybindingService, _contextMenuService, _themeService);
        this.renderLabel = renderLabel;
        this.subActionProvider = subActionProvider;
        this.subActionViewItemProvider = subActionViewItemProvider;
        this._hoverService = _hoverService;
    }
    render(container) {
        super.render(container);
        container.classList.add('notebook-action-view-item');
        container.classList.add('notebook-action-view-item-unified');
        this._actionLabel = document.createElement('a');
        container.appendChild(this._actionLabel);
        this._hover = this._register(this._hoverService.setupManagedHover(this.options.hoverDelegate ?? getDefaultHoverDelegate('element'), this._actionLabel, ''));
        this.updateLabel();
        for (const event of [DOM.EventType.CLICK, DOM.EventType.MOUSE_DOWN, TouchEventType.Tap]) {
            this._register(DOM.addDisposableListener(container, event, e => this.onClick(e, true)));
        }
    }
    onClick(event, preserveFocus = false) {
        DOM.EventHelper.stop(event, true);
        const context = types.isUndefinedOrNull(this._context) ? this.options?.useEventAsContext ? event : { preserveFocus } : this._context;
        this.actionRunner.run(this._primaryAction ?? this._action, context);
    }
    updateLabel() {
        const actions = this.subActionProvider.getActions();
        if (this._actionLabel) {
            const primaryAction = actions[0];
            this._primaryAction = primaryAction;
            if (primaryAction && primaryAction instanceof MenuItemAction) {
                const element = this.element;
                if (element && primaryAction.item.icon && ThemeIcon.isThemeIcon(primaryAction.item.icon)) {
                    const iconClasses = ThemeIcon.asClassNameArray(primaryAction.item.icon);
                    // remove all classes started with 'codicon-'
                    element.classList.forEach((cl) => {
                        if (cl.startsWith('codicon-')) {
                            element.classList.remove(cl);
                        }
                    });
                    element.classList.add(...iconClasses);
                }
                if (this.renderLabel) {
                    this._actionLabel.classList.add('notebook-label');
                    this._actionLabel.innerText = this._action.label;
                    this._hover?.update(primaryAction.tooltip.length ? primaryAction.tooltip : primaryAction.label);
                }
            }
            else {
                if (this.renderLabel) {
                    this._actionLabel.classList.add('notebook-label');
                    this._actionLabel.innerText = this._action.label;
                    this._hover?.update(this._action.tooltip.length ? this._action.tooltip : this._action.label);
                }
            }
        }
    }
};
UnifiedSubmenuActionView = __decorate([
    __param(5, IKeybindingService),
    __param(6, IContextMenuService),
    __param(7, IThemeService),
    __param(8, IHoverService),
    __metadata("design:paramtypes", [SubmenuItemAction, Object, Boolean, Object, Object, Object, Object, Object, Object])
], UnifiedSubmenuActionView);
export { UnifiedSubmenuActionView };
