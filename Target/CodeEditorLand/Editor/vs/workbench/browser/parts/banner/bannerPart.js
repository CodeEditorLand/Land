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
import './media/bannerpart.css';
import { localize2 } from '../../../../nls.js';
import { $, addDisposableListener, append, asCSSUrl, clearNode, EventType, isHTMLElement } from '../../../../base/browser/dom.js';
import { ActionBar } from '../../../../base/browser/ui/actionbar/actionbar.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { Part } from '../../part.js';
import { IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.js';
import { Action } from '../../../../base/common/actions.js';
import { Link } from '../../../../platform/opener/browser/link.js';
import { Emitter } from '../../../../base/common/event.js';
import { IBannerService } from '../../../services/banner/browser/bannerService.js';
import { MarkdownRenderer } from '../../../../editor/browser/widget/markdownRenderer/browser/markdownRenderer.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { KeybindingsRegistry } from '../../../../platform/keybinding/common/keybindingsRegistry.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { URI } from '../../../../base/common/uri.js';
import { widgetClose } from '../../../../platform/theme/common/iconRegistry.js';
import { BannerFocused } from '../../../common/contextkeys.js';
let BannerPart = class BannerPart extends Part {
    get minimumHeight() {
        return this.visible ? this.height : 0;
    }
    get maximumHeight() {
        return this.visible ? this.height : 0;
    }
    get onDidChange() { return this._onDidChangeSize.event; }
    constructor(themeService, layoutService, storageService, contextKeyService, instantiationService) {
        super("workbench.parts.banner", { hasTitle: false }, themeService, storageService, layoutService);
        this.contextKeyService = contextKeyService;
        this.instantiationService = instantiationService;
        this.height = 26;
        this.minimumWidth = 0;
        this.maximumWidth = Number.POSITIVE_INFINITY;
        this._onDidChangeSize = this._register(new Emitter());
        this.visible = false;
        this.focusedActionIndex = -1;
        this.markdownRenderer = this.instantiationService.createInstance(MarkdownRenderer, {});
    }
    createContentArea(parent) {
        this.element = parent;
        this.element.tabIndex = 0;
        this._register(addDisposableListener(this.element, EventType.FOCUS, () => {
            if (this.focusedActionIndex !== -1) {
                this.focusActionLink();
            }
        }));
        const scopedContextKeyService = this._register(this.contextKeyService.createScoped(this.element));
        BannerFocused.bindTo(scopedContextKeyService).set(true);
        return this.element;
    }
    close(item) {
        this.setVisibility(false);
        clearNode(this.element);
        if (typeof item.onClose === 'function') {
            item.onClose();
        }
        this.item = undefined;
    }
    focusActionLink() {
        const length = this.item?.actions?.length ?? 0;
        if (this.focusedActionIndex < length) {
            const actionLink = this.messageActionsContainer?.children[this.focusedActionIndex];
            if (isHTMLElement(actionLink)) {
                this.actionBar?.setFocusable(false);
                actionLink.focus();
            }
        }
        else {
            this.actionBar?.focus(0);
        }
    }
    getAriaLabel(item) {
        if (item.ariaLabel) {
            return item.ariaLabel;
        }
        if (typeof item.message === 'string') {
            return item.message;
        }
        return undefined;
    }
    getBannerMessage(message) {
        if (typeof message === 'string') {
            const element = $('span');
            element.innerText = message;
            return element;
        }
        return this.markdownRenderer.render(message).element;
    }
    setVisibility(visible) {
        if (visible !== this.visible) {
            this.visible = visible;
            this.focusedActionIndex = -1;
            this.layoutService.setPartHidden(!visible, "workbench.parts.banner");
            this._onDidChangeSize.fire(undefined);
        }
    }
    focus() {
        this.focusedActionIndex = -1;
        this.element.focus();
    }
    focusNextAction() {
        const length = this.item?.actions?.length ?? 0;
        this.focusedActionIndex = this.focusedActionIndex < length ? this.focusedActionIndex + 1 : 0;
        this.focusActionLink();
    }
    focusPreviousAction() {
        const length = this.item?.actions?.length ?? 0;
        this.focusedActionIndex = this.focusedActionIndex > 0 ? this.focusedActionIndex - 1 : length;
        this.focusActionLink();
    }
    hide(id) {
        if (this.item?.id !== id) {
            return;
        }
        this.setVisibility(false);
    }
    show(item) {
        if (item.id === this.item?.id) {
            this.setVisibility(true);
            return;
        }
        clearNode(this.element);
        const ariaLabel = this.getAriaLabel(item);
        if (ariaLabel) {
            this.element.setAttribute('aria-label', ariaLabel);
        }
        const iconContainer = append(this.element, $('div.icon-container'));
        iconContainer.setAttribute('aria-hidden', 'true');
        if (ThemeIcon.isThemeIcon(item.icon)) {
            iconContainer.appendChild($(`div${ThemeIcon.asCSSSelector(item.icon)}`));
        }
        else {
            iconContainer.classList.add('custom-icon');
            if (URI.isUri(item.icon)) {
                iconContainer.style.backgroundImage = asCSSUrl(item.icon);
            }
        }
        const messageContainer = append(this.element, $('div.message-container'));
        messageContainer.setAttribute('aria-hidden', 'true');
        messageContainer.appendChild(this.getBannerMessage(item.message));
        this.messageActionsContainer = append(this.element, $('div.message-actions-container'));
        if (item.actions) {
            for (const action of item.actions) {
                this._register(this.instantiationService.createInstance(Link, this.messageActionsContainer, { ...action, tabIndex: -1 }, {}));
            }
        }
        const actionBarContainer = append(this.element, $('div.action-container'));
        this.actionBar = this._register(new ActionBar(actionBarContainer));
        const label = item.closeLabel ?? 'Close Banner';
        const closeAction = this._register(new Action('banner.close', label, ThemeIcon.asClassName(widgetClose), true, () => this.close(item)));
        this.actionBar.push(closeAction, { icon: true, label: false });
        this.actionBar.setFocusable(false);
        this.setVisibility(true);
        this.item = item;
    }
    toJSON() {
        return {
            type: "workbench.parts.banner"
        };
    }
};
BannerPart = __decorate([
    __param(0, IThemeService),
    __param(1, IWorkbenchLayoutService),
    __param(2, IStorageService),
    __param(3, IContextKeyService),
    __param(4, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], BannerPart);
export { BannerPart };
registerSingleton(IBannerService, BannerPart, 0);
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'workbench.banner.focusBanner',
    weight: 200,
    primary: 9,
    when: BannerFocused,
    handler: (accessor) => {
        const bannerService = accessor.get(IBannerService);
        bannerService.focus();
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'workbench.banner.focusNextAction',
    weight: 200,
    primary: 17,
    secondary: [18],
    when: BannerFocused,
    handler: (accessor) => {
        const bannerService = accessor.get(IBannerService);
        bannerService.focusNextAction();
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'workbench.banner.focusPreviousAction',
    weight: 200,
    primary: 15,
    secondary: [16],
    when: BannerFocused,
    handler: (accessor) => {
        const bannerService = accessor.get(IBannerService);
        bannerService.focusPreviousAction();
    }
});
class FocusBannerAction extends Action2 {
    static { this.ID = 'workbench.action.focusBanner'; }
    static { this.LABEL = localize2('focusBanner', "Focus Banner"); }
    constructor() {
        super({
            id: FocusBannerAction.ID,
            title: FocusBannerAction.LABEL,
            category: Categories.View,
            f1: true
        });
    }
    async run(accessor) {
        const layoutService = accessor.get(IWorkbenchLayoutService);
        layoutService.focusPart("workbench.parts.banner");
    }
}
registerAction2(FocusBannerAction);
