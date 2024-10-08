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
import { Delayer } from '../../../../base/common/async.js';
import * as DOM from '../../../../base/browser/dom.js';
import { IContextViewService } from '../../../../platform/contextview/browser/contextView.js';
import { toDisposable } from '../../../../base/common/lifecycle.js';
import { badgeBackground, badgeForeground, contrastBorder, asCssVariable } from '../../../../platform/theme/common/colorRegistry.js';
import { localize } from '../../../../nls.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ContextScopedHistoryInputBox } from '../../../../platform/history/browser/contextScopedHistoryWidget.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { showHistoryKeybindingHint } from '../../../../platform/history/browser/historyWidgetKeybindingHint.js';
import { MenuId, MenuRegistry, SubmenuItemAction } from '../../../../platform/actions/common/actions.js';
import { MenuWorkbenchToolBar } from '../../../../platform/actions/browser/toolbar.js';
import { SubmenuEntryActionViewItem } from '../../../../platform/actions/browser/menuEntryActionViewItem.js';
import { Widget } from '../../../../base/browser/ui/widget.js';
import { Emitter } from '../../../../base/common/event.js';
import { defaultInputBoxStyles } from '../../../../platform/theme/browser/defaultStyles.js';
const viewFilterMenu = new MenuId('menu.view.filter');
export const viewFilterSubmenu = new MenuId('submenu.view.filter');
MenuRegistry.appendMenuItem(viewFilterMenu, {
    submenu: viewFilterSubmenu,
    title: localize('more filters', "More Filters..."),
    group: 'navigation',
    icon: Codicon.filter,
});
class MoreFiltersActionViewItem extends SubmenuEntryActionViewItem {
    constructor() {
        super(...arguments);
        this._checked = false;
    }
    set checked(checked) {
        if (this._checked !== checked) {
            this._checked = checked;
            this.updateChecked();
        }
    }
    updateChecked() {
        if (this.element) {
            this.element.classList.toggle('checked', this._checked);
        }
    }
    render(container) {
        super.render(container);
        this.updateChecked();
    }
}
let FilterWidget = class FilterWidget extends Widget {
    get onDidFocus() { return this.focusTracker.onDidFocus; }
    get onDidBlur() { return this.focusTracker.onDidBlur; }
    constructor(options, instantiationService, contextViewService, contextKeyService, keybindingService) {
        super();
        this.options = options;
        this.instantiationService = instantiationService;
        this.contextViewService = contextViewService;
        this.keybindingService = keybindingService;
        this._onDidChangeFilterText = this._register(new Emitter());
        this.onDidChangeFilterText = this._onDidChangeFilterText.event;
        this.isMoreFiltersChecked = false;
        this.delayedFilterUpdate = new Delayer(400);
        this._register(toDisposable(() => this.delayedFilterUpdate.cancel()));
        if (options.focusContextKey) {
            this.focusContextKey = new RawContextKey(options.focusContextKey, false).bindTo(contextKeyService);
        }
        this.element = DOM.$('.viewpane-filter');
        [this.filterInputBox, this.focusTracker] = this.createInput(this.element);
        this._register(this.filterInputBox);
        this._register(this.focusTracker);
        const controlsContainer = DOM.append(this.element, DOM.$('.viewpane-filter-controls'));
        this.filterBadge = this.createBadge(controlsContainer);
        this.toolbar = this._register(this.createToolBar(controlsContainer));
        this.adjustInputBox();
    }
    hasFocus() {
        return this.filterInputBox.hasFocus();
    }
    focus() {
        this.filterInputBox.focus();
    }
    blur() {
        this.filterInputBox.blur();
    }
    updateBadge(message) {
        this.filterBadge.classList.toggle('hidden', !message);
        this.filterBadge.textContent = message || '';
        this.adjustInputBox();
    }
    setFilterText(filterText) {
        this.filterInputBox.value = filterText;
    }
    getFilterText() {
        return this.filterInputBox.value;
    }
    getHistory() {
        return this.filterInputBox.getHistory();
    }
    layout(width) {
        this.element.parentElement?.classList.toggle('grow', width > 700);
        this.element.classList.toggle('small', width < 400);
        this.adjustInputBox();
        this.lastWidth = width;
    }
    relayout() {
        if (this.lastWidth) {
            this.layout(this.lastWidth);
        }
    }
    checkMoreFilters(checked) {
        this.isMoreFiltersChecked = checked;
        if (this.moreFiltersActionViewItem) {
            this.moreFiltersActionViewItem.checked = checked;
        }
    }
    createInput(container) {
        const inputBox = this._register(this.instantiationService.createInstance(ContextScopedHistoryInputBox, container, this.contextViewService, {
            placeholder: this.options.placeholder,
            ariaLabel: this.options.ariaLabel,
            history: this.options.history || [],
            showHistoryHint: () => showHistoryKeybindingHint(this.keybindingService),
            inputBoxStyles: defaultInputBoxStyles
        }));
        if (this.options.text) {
            inputBox.value = this.options.text;
        }
        this._register(inputBox.onDidChange(filter => this.delayedFilterUpdate.trigger(() => this.onDidInputChange(inputBox))));
        this._register(DOM.addStandardDisposableListener(inputBox.inputElement, DOM.EventType.KEY_DOWN, (e) => this.onInputKeyDown(e, inputBox)));
        this._register(DOM.addStandardDisposableListener(container, DOM.EventType.KEY_DOWN, this.handleKeyboardEvent));
        this._register(DOM.addStandardDisposableListener(container, DOM.EventType.KEY_UP, this.handleKeyboardEvent));
        this._register(DOM.addStandardDisposableListener(inputBox.inputElement, DOM.EventType.CLICK, (e) => {
            e.stopPropagation();
            e.preventDefault();
        }));
        const focusTracker = this._register(DOM.trackFocus(inputBox.inputElement));
        if (this.focusContextKey) {
            this._register(focusTracker.onDidFocus(() => this.focusContextKey.set(true)));
            this._register(focusTracker.onDidBlur(() => this.focusContextKey.set(false)));
            this._register(toDisposable(() => this.focusContextKey.reset()));
        }
        return [inputBox, focusTracker];
    }
    createBadge(container) {
        const filterBadge = DOM.append(container, DOM.$('.viewpane-filter-badge.hidden'));
        filterBadge.style.backgroundColor = asCssVariable(badgeBackground);
        filterBadge.style.color = asCssVariable(badgeForeground);
        filterBadge.style.border = `1px solid ${asCssVariable(contrastBorder)}`;
        return filterBadge;
    }
    createToolBar(container) {
        return this.instantiationService.createInstance(MenuWorkbenchToolBar, container, viewFilterMenu, {
            hiddenItemStrategy: -1 /* HiddenItemStrategy.NoHide */,
            actionViewItemProvider: (action, options) => {
                if (action instanceof SubmenuItemAction && action.item.submenu.id === viewFilterSubmenu.id) {
                    this.moreFiltersActionViewItem = this.instantiationService.createInstance(MoreFiltersActionViewItem, action, options);
                    this.moreFiltersActionViewItem.checked = this.isMoreFiltersChecked;
                    return this.moreFiltersActionViewItem;
                }
                return undefined;
            }
        });
    }
    onDidInputChange(inputbox) {
        inputbox.addToHistory();
        this._onDidChangeFilterText.fire(inputbox.value);
    }
    adjustInputBox() {
        this.filterInputBox.inputElement.style.paddingRight = this.element.classList.contains('small') || this.filterBadge.classList.contains('hidden') ? '25px' : '150px';
    }
    // Action toolbar is swallowing some keys for action items which should not be for an input box
    handleKeyboardEvent(event) {
        if (event.equals(10 /* KeyCode.Space */)
            || event.equals(15 /* KeyCode.LeftArrow */)
            || event.equals(17 /* KeyCode.RightArrow */)
            || event.equals(14 /* KeyCode.Home */)
            || event.equals(13 /* KeyCode.End */)) {
            event.stopPropagation();
        }
    }
    onInputKeyDown(event, filterInputBox) {
        let handled = false;
        if (event.equals(2 /* KeyCode.Tab */) && !this.toolbar.isEmpty()) {
            this.toolbar.focus();
            handled = true;
        }
        if (handled) {
            event.stopPropagation();
            event.preventDefault();
        }
    }
};
FilterWidget = __decorate([
    __param(1, IInstantiationService),
    __param(2, IContextViewService),
    __param(3, IContextKeyService),
    __param(4, IKeybindingService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], FilterWidget);
export { FilterWidget };
